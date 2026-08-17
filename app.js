import { db }
from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

console.log(
    "Firebase conectado:",
    db
);

/* ==================================================
   VARIÁVEIS GLOBAIS
   ================================================== */

let selectedCategory = "";

let cart = [];

let products = [];

let currentProduct = null;

let currentQuantity = 1;

let isStoreOpen = false;

/* ==================================================
   ELEMENTOS DA PÁGINA
   ================================================== */

const productsContainer =
    document.getElementById("productsContainer");

const storeName =
    document.getElementById("storeName");

const storeHours =
    document.getElementById("storeHours");

const categoriesContainer =
    document.getElementById("categoriesContainer");
	
const storeStatus =
    document.getElementById("storeStatus");
	
const pickupInfo =
    document.getElementById("pickupInfo");
	
const storeLogo =
    document.querySelector(".logo");
	
/* ==================================================
   MODAL PRODUTO
   ================================================== */

const productModal =
    document.getElementById("productModal");

const closeModal =
    document.getElementById("closeModal");

const modalImage =
    document.getElementById("modalImage");

const modalName =
    document.getElementById("modalName");

const modalWeight =
    document.getElementById("modalWeight");

const modalServes =
    document.getElementById("modalServes");

const modalDescription =
    document.getElementById("modalDescription");

const modalQty =
    document.getElementById("modalQty");

const addToCartButton =
    document.getElementById("addToCart");

const increaseQtyButton =
    document.getElementById("increaseQty");

const decreaseQtyButton =
    document.getElementById("decreaseQty");
	
const itemObservation =
    document.getElementById("itemObservation");
	
const pixInfo =
    document.getElementById("pixInfo");

const pixKeyText =
    document.getElementById("pixKeyText");

const pixOwnerText =
    document.getElementById("pixOwnerText");
	
const modalPrice =
    document.getElementById("modalPrice");
	
/* ==================================================
   MODAL CARRINHO
   ================================================== */

const cartButton =
    document.getElementById("cartButton");

const cartCount =
    document.getElementById("cartCount");

const cartModal =
    document.getElementById("cartModal");

const closeCartModal =
    document.getElementById("closeCartModal");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");
	
const customerAddress =
    document.getElementById("customerAddress");

const deliveryType =
    document.getElementById("deliveryType");

const paymentMethod =
    document.getElementById("paymentMethod");

const changeWrapper =
    document.getElementById("changeWrapper");

const changeFor =
    document.getElementById("changeFor");
	
const customerName =
    document.getElementById("customerName");

const customerPhone =
    document.getElementById("customerPhone");

const sendOrderButton =
    document.getElementById("sendOrder");
	
const deliveryFeeInfo =
    document.getElementById("deliveryFeeInfo");


/* ==================================================
   INICIALIZAÇÃO
   ================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * PRIMEIRO:
         * Busca configurações no Firestore.
         */

        await loadStoreConfigFromFirestore();


        /*
         * DEPOIS:
         * Aplica as configurações carregadas.
         */

        applyStoreColors();

        loadStoreInfo();

        updateStoreStatus();

        toggleAddressField();

        togglePaymentFields();


        pixKeyText.textContent =
            CONFIG.pixKey;

        pixOwnerText.textContent =
            CONFIG.pixOwner;


        loadCartFromLocalStorage();


        /*
         * Por último:
         * carrega produtos.
         */

        await loadProductsFromFirestore();

    }
);

/* ===================================================
   CARREGA DADOS DA LOJA
   =================================================== */

function loadStoreInfo() {

    storeName.textContent =
        CONFIG.storeName;

    storeHours.textContent =
        CONFIG.storeHours;
		
	if (CONFIG.logo) {
    storeLogo.src = CONFIG.logo;
}

}

/* ==================================================
   FILTRO DE CATEGORIAS
   ================================================== */

function renderCategories() {

    categoriesContainer.innerHTML = "";

    const categories =
        [...new Set(products.map(product => product.categoria))];

    if (categories.length === 0) return;

    if (!selectedCategory) {
        selectedCategory = categories[0];
    }

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            category === selectedCategory
                ? "category-btn active"
                : "category-btn";

        button.dataset.category =
            category;

        button.textContent =
            category;

        button.addEventListener("click", () => {

            selectedCategory =
                category;

            renderCategories();

            renderProducts();

        });

        categoriesContainer.appendChild(button);

    });

}


/* ==================================================
   RENDERIZA PRODUTOS
   ================================================== */

function renderProducts() {

    productsContainer.innerHTML = "";

    const filteredProducts =
        products.filter(product =>
            product.categoria === selectedCategory
        );

    filteredProducts.forEach(product => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";

        card.innerHTML = `

            <div class="product-info">

                <div class="product-name">
                    ${product.nome}
                </div>

                <div class="product-price">
                    ${formatCurrency(product.preco)}
                </div>

                <div class="product-description">
                    ${product.descricao}
                </div>

            </div>

            <img
                class="product-image"
                src="${product.imagem}"
                alt="${product.nome}"
            >

        `;

        card.addEventListener("click", () => {

             openProductModal(product);

        });

        productsContainer.appendChild(card);

    });

}

/* ==================================================
   ABRIR MODAL PRODUTO
   ================================================== */

function openProductModal(product) {
	
	itemObservation.value = "";

    currentProduct = product;

    currentQuantity = 1;

    modalImage.src =
        product.imagem;

    modalName.textContent =
        product.nome;
		
	modalPrice.textContent =
    `${formatCurrency(product.preco)}`;

    /* modalWeight.textContent =
        product.peso;

    modalServes.textContent =
        product.pessoas; */

    modalDescription.textContent =
        product.descricao;

    modalQty.textContent =
        currentQuantity;

    updateAddButtonPrice();

    productModal.style.display =
        "block";

}

/* ==================================================
   ATUALIZA PREÇO BOTÃO
   ================================================== */

function updateAddButtonPrice() {

    const total =
        currentProduct.preco *
        currentQuantity;

    addToCartButton.textContent =
        `Adicionar • ${formatCurrency(total)}`;

}

/* ==================================================
   FECHAR MODAL
   ================================================== */

closeModal.addEventListener("click", () => {

    productModal.style.display =
        "none";

});

window.addEventListener("click", (event) => {

    if (event.target === productModal) {

        productModal.style.display =
            "none";

    }

});

/* ==================================================
   QUANTIDADE
   ================================================== */

increaseQtyButton.addEventListener("click", () => {

    currentQuantity++;

    modalQty.textContent =
        currentQuantity;

    updateAddButtonPrice();

});

decreaseQtyButton.addEventListener("click", () => {

    if (currentQuantity > 1) {

        currentQuantity--;

        modalQty.textContent =
            currentQuantity;

        updateAddButtonPrice();

    }

});

/* ==================================================
   ADICIONAR AO CARRINHO
   ================================================== */

addToCartButton.addEventListener("click", () => {

    const observation =
        itemObservation.value.trim();

    cart.push({
        id: currentProduct.id,
        nome: currentProduct.nome,
        preco: currentProduct.preco,
        quantidade: currentQuantity,
        observacao: observation
    });

    updateCart();

    productModal.style.display = "none";

});

/* ==================================================
   ATUALIZAR CARRINHO
   ================================================== */

function updateCart() {

    const totalItems =
        cart.reduce((sum, item) => sum + item.quantidade, 0);

    cartCount.textContent =
        totalItems;

    renderCartItems();
	
	saveCartToLocalStorage();

}

/* ==================================================
   RENDERIZAR ITENS DO CARRINHO
   ================================================== */

function renderCartItems() {

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>Seu carrinho está vazio.</p>";

        cartTotal.textContent =
            "R$ 0,00";

        return;

    }

    let total = 0;

    cart.forEach((item, index) => {

        const subtotal =
            item.preco * item.quantidade;

        total += subtotal;

        const div =
            document.createElement("div");

        div.className =
            "cart-item";

        div.innerHTML = `
            <strong>${item.quantidade}x ${item.nome}</strong>
            <br>
            <span>${formatCurrency(subtotal)}</span>
            ${item.observacao ? `<br><small>Obs: ${item.observacao}</small>` : ""}
            <br>
            <button class="remove-cart-item" data-index="${index}">
                Remover
            </button>
        `;

        cartItems.appendChild(div);

    });

    cartTotal.textContent =
        `${formatCurrency(total)}`;

    document
        .querySelectorAll(".remove-cart-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                const index =
                    button.dataset.index;

                cart.splice(index, 1);

                updateCart();

            });

        });

}

/* ==================================================
   ABRIR / FECHAR CARRINHO
   ================================================== */

cartButton.addEventListener("click", () => {

    renderCartItems();
	
	updateSendOrderButtonState();

    cartModal.style.display =
        "block";

});

closeCartModal.addEventListener("click", () => {

    cartModal.style.display =
        "none";

});

window.addEventListener("click", (event) => {

    if (event.target === cartModal) {

        cartModal.style.display =
            "none";

    }

});

function toggleAddressField() {

    if (deliveryType.value === "Entrega") {

        customerAddress.style.display = "block";

        deliveryFeeInfo.style.display = "block";

        pickupInfo.style.display = "none";

        deliveryFeeInfo.textContent =
            `Taxa de entrega: ${formatCurrency(CONFIG.deliveryFee)}`;

    } else {

        customerAddress.style.display = "none";

        customerAddress.value = "";

        deliveryFeeInfo.style.display = "none";

        pickupInfo.style.display = "block";

        pickupInfo.textContent =
            `Retirar em: ${CONFIG.pickupAddress}`;

    }

}

deliveryType.addEventListener("change", toggleAddressField);

function togglePaymentFields() {

    if (paymentMethod.value === "Dinheiro") {

        changeWrapper.style.display = "block";

    } else {

        changeWrapper.style.display = "none";

    }

    if (paymentMethod.value === "PIX") {

        pixInfo.style.display = "block";

    } else {

        pixInfo.style.display = "none";

    }

}

paymentMethod.addEventListener(
    "change",
    togglePaymentFields
);

document
    .querySelectorAll('input[name="needsChange"]')
    .forEach(radio => {
        radio.addEventListener("change", () => {
            changeFor.style.display =
                radio.value === "Sim" && radio.checked ? "block" : "none";
        });
    });
	
/* ==================================================
   ENVIAR PEDIDO PELO WHATSAPP
   ================================================== */

sendOrderButton.addEventListener("click", () => {
	
	clearAllErrors();
	
	if (!isStoreOpen) {
		alert("A loja está fechada no momento.");
		return;
}

    if (cart.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    if (customerName.value.trim() === "") {
    showFieldError(customerName, "Informe seu nome.");
    return;
}

    if (customerPhone.value.trim() === "") {
    showFieldError(customerPhone, "Informe seu telefone.");
    return;
}

    if (
    deliveryType.value === "Entrega" &&
    customerAddress.value.trim() === ""
) {
    showFieldError(customerAddress, "Informe o endereço para entrega.");
    return;
}

    const total =
        cart.reduce((sum, item) => {
            return sum + item.preco * item.quantidade;
        }, 0);
		
	const deliveryFee =
		deliveryType.value === "Entrega"
			? CONFIG.deliveryFee
			: 0;

	const finalTotal =
		total + deliveryFee;

    let message = "";

    message += ">>> *NOVO PEDIDO* <<<%0A%0A";

    message += `*Cliente:* ${customerName.value.trim()}%0A`;

    message += `*Telefone:* ${customerPhone.value.trim()}%0A%0A`;

    message += `*Entrega ou retirada:* ${deliveryType.value}%0A`;

	if (deliveryType.value === "Entrega") {

		message += `*Endereço:* ${customerAddress.value.trim()}%0A`;

	} else {

		message += `*Retirar em:* ${CONFIG.pickupAddress}%0A`;

	}

    message += `%0A*Forma de pagamento:* ${paymentMethod.value}%0A`;

    if (paymentMethod.value === "PIX") {
        message += `*PIX:* Chave: ${CONFIG.pixKey} | Titular: ${CONFIG.pixOwner}%0A`;
    }

    if (paymentMethod.value === "Dinheiro") {

        const selectedChangeOption =
            document.querySelector('input[name="needsChange"]:checked');

        const needsChange =
            selectedChangeOption
                ? selectedChangeOption.value
                : "Não";

        message += `*Precisa de troco:* ${needsChange}%0A`;

        if (needsChange === "Sim") {

            if (changeFor.value.trim() === "") {
				showFieldError(changeFor, "Informe para quanto precisa de troco.");
				return;
			}

            message += `*Troco para:* ${changeFor.value.trim()}%0A`;

        }

    }

    message += "%0A--------------------%0A";
    message += "*Itens do pedido:*%0A%0A";

    cart.forEach(item => {

        const subtotal =
            item.preco * item.quantidade;

        message += `${item.quantidade}x ${item.nome}%0A`;
        message += `Subtotal: ${formatCurrency(subtotal)}%0A`;

        if (item.observacao) {
            message += `Obs: ${item.observacao}%0A`;
        }

        message += `%0A`;

    });

    message += "--------------------%0A";
    message += `*Subtotal dos itens:* ${formatCurrency(total)}%0A`;

	if (deliveryType.value === "Entrega") {
		message += `*Taxa de entrega:* ${formatCurrency(deliveryFee)}%0A`;
	}

	message += `*TOTAL:* ${formatCurrency(finalTotal)}%0A`;

    const whatsappUrl =
        `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank");

	clearCartFromLocalStorage();

	setTimeout(() => {
		location.reload();
	}, 1000);

});

function formatCurrency(value) {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function showFieldError(field, message) {

    clearFieldError(field);

    field.classList.add("input-error");

    const error =
        document.createElement("div");

    error.className =
        "error-message";

    error.textContent =
        message;

    field.insertAdjacentElement(
        "afterend",
        error
    );

    field.focus();

}

function clearFieldError(field) {

    field.classList.remove("input-error");

    const nextElement =
        field.nextElementSibling;

    if (
        nextElement &&
        nextElement.classList.contains("error-message")
    ) {
        nextElement.remove();
    }

}

function clearAllErrors() {

    document
        .querySelectorAll(".input-error")
        .forEach(field => {
            field.classList.remove("input-error");
        });

    document
        .querySelectorAll(".error-message")
        .forEach(error => {
            error.remove();
        });

}

function saveCartToLocalStorage() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}

function loadCartFromLocalStorage() {

    const savedCart =
        localStorage.getItem("cart");

    if (savedCart) {

        cart = JSON.parse(savedCart);

        updateCart();

    }

}

function clearCartFromLocalStorage() {

    localStorage.removeItem("cart");

}

/* ==================================================
   CARREGA PRODUTOS DO GOOGLE SHEETS
   ================================================== */

function loadProductsFromSheet() {

    return new Promise((resolve, reject) => {

        const script =
            document.createElement("script");

        script.src =
            CONFIG.productsSheetUrl;

        script.onerror = () => {
            reject("Erro ao carregar Google Sheets.");
        };

        document.body.appendChild(script);

        window.handleSheetData = function(data) {

            products = data.table.rows.map(row => {

                return {
                    id: Number(row.c[0]?.v || 0),
                    categoria: row.c[1]?.v || "",
                    nome: row.c[2]?.v || "",
                    descricao: row.c[3]?.v || "",
                    preco: parsePrice(row.c[4]?.v || row.c[4]?.f || 0),
                    imagem: convertGoogleDriveImageUrl(row.c[5]?.v || ""),
                    ativo: row.c[6]?.v || "sim"
                };

            }).filter(product => {
                return product.ativo.toLowerCase() === "sim";
            });
			
			renderCategories();

            renderProducts();

            console.log(`${products.length} produtos carregados`);

            resolve();

        };

    });

}

function parsePrice(value) {

    if (typeof value === "number") {
        return value;
    }

    if (typeof value === "string") {

        value = value
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(".", "")
            .replace(",", ".");

    }

    return Number(value);

}

function parseCSVLine(line) {

    const result = [];

    let current = "";

    let insideQuotes = false;

    for (let char of line) {

        if (char === '"') {

            insideQuotes = !insideQuotes;

        }

        else if (
            char === "," &&
            !insideQuotes
        ) {

            result.push(current);

            current = "";

        }

        else {

            current += char;

        }

    }

    result.push(current);

    return result;

}

function convertGoogleDriveImageUrl(url) {

    if (!url) return "";

    let fileId = "";

    if (url.includes("drive.google.com/file/d/")) {
        fileId = url.split("/d/")[1].split("/")[0];
    }

    if (url.includes("id=")) {
        fileId = url.split("id=")[1].split("&")[0];
    }

    if (!fileId) {
        return url;
    }

    return `https://lh3.googleusercontent.com/d/${fileId}=s500`;

}

function updateStoreStatus() {
	
	if (CONFIG.storeActive === false) {

    isStoreOpen = false;

    storeStatus.textContent =
        "🔴 Loja fechada";

    storeStatus.className =
        "store-status closed";

    return;

}

    const now =
        new Date();

    const day =
        now.getDay();

    const todayHours =
        CONFIG.openingHours[day];

    if (!todayHours) {
		
		isStoreOpen = false;

        storeStatus.textContent =
            "🔴 Fechado agora";

        storeStatus.className =
            "store-status closed";

        return;

    }

    const currentMinutes =
        now.getHours() * 60 + now.getMinutes();

    const openMinutes =
        timeToMinutes(todayHours[0]);

    const closeMinutes =
        timeToMinutes(todayHours[1]);

    if (
        currentMinutes >= openMinutes &&
        currentMinutes <= closeMinutes
    ) {
		
		isStoreOpen = true;

        storeStatus.textContent =
            "🟢 Aberto agora";

        storeStatus.className =
            "store-status open";

    } else {
		
		isStoreOpen = false;

        storeStatus.textContent =
            "🔴 Fechado agora";

        storeStatus.className =
            "store-status closed";

    }

}

function timeToMinutes(time) {

    const [hours, minutes] =
        time.split(":").map(Number);

    return hours * 60 + minutes;

}

function updateSendOrderButtonState() {

    if (!isStoreOpen) {

        sendOrderButton.disabled = true;

        sendOrderButton.textContent =
            "Loja fechada";

        sendOrderButton.classList.add(
            "button-disabled"
        );

    } else {

        sendOrderButton.disabled = false;

        sendOrderButton.textContent =
            "Enviar Pedido pelo WhatsApp";

        sendOrderButton.classList.remove(
            "button-disabled"
        );

    }

}

/* ==================================================
   CARREGA PRODUTOS DO FIRESTORE
   ================================================== */

async function loadProductsFromFirestore() {

    try {

        /*
         * Caminho no Firestore:
         *
         * lojas
         *   └── da-minha-vo
         *        └── produtos
         */

        const productsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "produtos"
            );


        /*
         * Busca os produtos ordenados
         * pelo campo "ordem".
         */

        const productsQuery =
            query(
                productsReference,
                orderBy("ordem", "asc")
            );


        const snapshot =
            await getDocs(productsQuery);


        /*
         * Limpa os produtos carregados anteriormente.
         */

        products = [];


        snapshot.forEach(documentSnapshot => {

            const data =
                documentSnapshot.data();


            /*
             * Produtos com ativo = false
             * não aparecem no cardápio.
             */

            if (data.ativo === false) {
                return;
            }


            /*
             * Converte o documento Firestore
             * para o formato já utilizado
             * pelo seu cardápio.
             */

            products.push({

                id:
                    documentSnapshot.id,

                categoria:
                    data.categoria || "",

                nome:
                    data.nome || "",

                descricao:
                    data.descricao || "",

                preco:
                    Number(data.preco || 0),

                imagem:
                    data.imagemUrl || "",

                ativo:
                    data.ativo !== false,

                ordem:
                    Number(data.ordem || 0)

            });

        });


        /*
         * Atualiza categorias e produtos.
         */

        renderCategories();

        renderProducts();


        console.log(
            `${products.length} produtos carregados do Firestore`
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar produtos do Firestore:",
            error
        );

        productsContainer.innerHTML = `
            <p>
                Não foi possível carregar os produtos.
            </p>
        `;

    }

}

/* ==================================================
   CARREGA CONFIGURAÇÕES DA LOJA DO FIRESTORE
   ================================================== */

async function loadStoreConfigFromFirestore() {

    try {

        /*
         * Documento:
         *
         * lojas
         *   └── da-minha-vo
         */

        const storeReference =
            doc(
                db,
                "lojas",
                "da-minha-vo"
            );

        const snapshot =
            await getDoc(storeReference);


        if (!snapshot.exists()) {

            throw new Error(
                "Documento da loja não encontrado."
            );

        }


        const data =
            snapshot.data();


        /* ==================================================
           TRANSFERE OS DADOS DO FIRESTORE
           PARA O CONFIG JÁ UTILIZADO PELO CARDÁPIO
           ================================================== */

        CONFIG.storeName =
            data.nomeLoja || CONFIG.storeName;

        CONFIG.storeHours =
            data.horarioTexto || CONFIG.storeHours;

        CONFIG.whatsappNumber =
            data.whatsapp || CONFIG.whatsappNumber;

        CONFIG.pixKey =
            data.pixChave || CONFIG.pixKey;

        CONFIG.pixOwner =
            data.pixTitular || CONFIG.pixOwner;

        CONFIG.deliveryFee =
            Number(
                data.taxaEntrega ??
                CONFIG.deliveryFee
            );

        CONFIG.pickupAddress =
            data.enderecoRetirada ||
            CONFIG.pickupAddress;


        /* ==================================================
           CORES
           ================================================== */

        if (!CONFIG.colors) {
            CONFIG.colors = {};
        }

        CONFIG.colors.primary =
            data.corPrimaria ||
            CONFIG.colors.primary;

        CONFIG.colors.secondary =
            data.corSecundaria ||
            CONFIG.colors.secondary;

        CONFIG.colors.text =
            data.corTexto ||
            CONFIG.colors.text;


        /* ==================================================
           LOJA ATIVA
           ================================================== */

        CONFIG.storeActive =
            data.ativo !== false;


        /* ==================================================
           HORÁRIOS
           ================================================== */

        if (data.horarios) {

            CONFIG.openingHours =
                convertFirestoreHours(
                    data.horarios
                );

        }


        console.log(
            "Configurações da loja carregadas do Firestore"
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar configurações da loja:",
            error
        );

    }
	
	CONFIG.logo =
    data.logoUrl ||
    CONFIG.logo;

}

/* ==================================================
   CONVERTE HORÁRIOS DO FIRESTORE
   ================================================== */

function convertFirestoreHours(horarios) {

    const days = {
        0: "domingo",
        1: "segunda",
        2: "terca",
        3: "quarta",
        4: "quinta",
        5: "sexta",
        6: "sabado"
    };

    const result = {};

    for (let day = 0; day <= 6; day++) {

        const dayName =
            days[day];

        const schedule =
            horarios[dayName];


        /*
         * Dia inexistente ou marcado como fechado.
         */

        if (
            !schedule ||
            schedule.fechado === true
        ) {

            result[day] = null;

            continue;

        }


        /*
         * Exemplo:
         * ["09:00", "19:00"]
         */

        result[day] = [
            schedule.abre,
            schedule.fecha
        ];

    }

    return result;

}

/* ==================================================
   APLICA IDENTIDADE VISUAL
   ================================================== */

function applyStoreColors() {

    const root =
        document.documentElement;

    root.style.setProperty(
        "--primary",
        CONFIG.colors.primary
    );

    root.style.setProperty(
        "--secondary",
        CONFIG.colors.secondary
    );

    root.style.setProperty(
        "--text",
        CONFIG.colors.text
    );

}
