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

let currentProductComplements = [];

let isStoreOpen = false;

let categories = [];

let paymentMethods = [];

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
	
const productComplements =
    document.getElementById(
        "productComplements"
    );

	
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
		 * Primeiro categorias
		 */

		await loadCategoriesFromFirestore();


		/*
		 * Depois produtos
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

    categoriesContainer.innerHTML =
        "";

    if (categories.length === 0) {
        return;
    }


    /*
     * Se nenhuma categoria estiver
     * selecionada, usa a primeira
     * da ordem definida no admin.
     */

    const selectedExists =
        categories.some(
            category =>
                category.nome ===
                selectedCategory
        );


    if (!selectedExists) {

        selectedCategory =
            categories[0].nome;

    }


    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                category.nome === selectedCategory
                    ? "category-btn active"
                    : "category-btn";

            button.dataset.category =
                category.nome;

            button.textContent =
                category.nome;


            button.addEventListener(
                "click",
                () => {

                    selectedCategory =
                        category.nome;

                    renderCategories();

                    renderProducts();

                }
            );


            categoriesContainer.appendChild(
                button
            );

        }
    );

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

async function openProductModal(
    product
) {

    itemObservation.value =
        "";


    currentProduct =
        product;
		
	currentProductComplements =
    [];

    currentQuantity =
        1;


    modalImage.src =
        product.imagem;


    modalName.textContent =
        product.nome;


    modalPrice.textContent =
        formatCurrency(
            product.preco
        );


    modalDescription.textContent =
        product.descricao;


    modalQty.textContent =
        currentQuantity;


    /*
     * Limpa complementos do produto
     * anteriormente aberto.
     */

    productComplements.innerHTML = `
        <div class="complements-loading">
            Carregando opções...
        </div>
    `;


    productComplements.style.display =
        "block";


    updateAddButtonPrice();


    /*
     * Mostra primeiro o modal.
     * Assim o cliente não precisa
     * esperar o Firestore responder.
     */

    productModal.style.display =
        "block";


    const productId =
        product.id;


    /*
     * Carrega complementos apenas
     * deste produto.
     */

    const complements =
        await loadProductComplements(
            productId
        );


    /*
     * Proteção:
     * se nesse intervalo outro produto
     * tiver sido aberto, não renderiza
     * os dados antigos.
     */

    if (
        currentProduct?.id !==
        productId
    ) {

        return;

    }
	
	currentProductComplements =
    complements;


    renderProductComplements(
        complements
    );
	
}

/* ==================================================
   COMPLEMENTOS DO PRODUTO
   ================================================== */

async function loadProductComplements(
    productId
) {

    try {

        /*
         * Busca os vínculos existentes dentro
         * do produto.
         */

        const associationsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                productId,
                "complementosAssociados"
            );


        const associationsQuery =
            query(
                associationsReference,
                orderBy(
                    "ordem",
                    "asc"
                )
            );


        const associationsSnapshot =
            await getDocs(
                associationsQuery
            );


        const complements =
            [];


        /*
         * Para cada vínculo:
         *
         * 1. busca o complemento global;
         * 2. verifica se está ativo;
         * 3. busca suas opções.
         */

        for (
            const associationDocument
            of associationsSnapshot.docs
        ) {

            const association =
                associationDocument.data();


            if (
                association.ativo === false
            ) {

                continue;

            }


            const complementReference =
                doc(
                    db,
                    "lojas",
                    "da-minha-vo",
                    "complementos",
                    association.complementoId
                );


            const complementSnapshot =
                await getDoc(
                    complementReference
                );


            if (
                !complementSnapshot.exists()
            ) {

                continue;

            }


            const complementData =
                complementSnapshot.data();


            /*
             * Complemento inativo não aparece
             * no cardápio público.
             */

            if (
                complementData.ativo === false
            ) {

                continue;

            }


            /*
             * Busca opções do complemento.
             */

            const optionsReference =
                collection(
                    db,
                    "lojas",
                    "da-minha-vo",
                    "complementos",
                    association.complementoId,
                    "opcoes"
                );


            const optionsQuery =
                query(
                    optionsReference,
                    orderBy(
                        "ordem",
                        "asc"
                    )
                );


            const optionsSnapshot =
                await getDocs(
                    optionsQuery
                );


            const options =
                optionsSnapshot.docs
                    .map(
                        optionDocument => ({

                            id:
                                optionDocument.id,

                            ...optionDocument.data()

                        })
                    )
                    .filter(
                        option =>
                            option.ativo !== false
                    );


            complements.push({

                id:
                    association.complementoId,

                nome:
                    complementData.nome || "",

                tipo:
                    complementData.tipo ||
                    "unica",

                minimo:
                    Number(
                        complementData.minimo ?? 0
                    ),

                maximo:
                    Number(
                        complementData.maximo ?? 1
                    ),

                ordem:
                    Number(
                        association.ordem ?? 0
                    ),

                opcoes:
                    options

            });

        }


        return complements;

    }

    catch (error) {

        console.error(
            "Erro ao carregar complementos do produto:",
            error
        );


        return [];

    }

}

function renderProductComplements(
    complements
) {

    productComplements.innerHTML =
        "";


    if (
        complements.length === 0
    ) {

        productComplements.style.display =
            "none";

        return;

    }


    productComplements.style.display =
        "block";


    complements.forEach(
        complement => {

            const group =
                document.createElement(
                    "div"
                );


            group.className =
                "product-complement-group";


            /*
             * Cabeçalho
             */

            const required =
                complement.minimo > 0;


            let helperText = "";


            if (
                complement.tipo === "unica"
            ) {

                helperText =
                    required
                    ? "Escolha uma opção"
                    : "Escolha uma opção se desejar";

            }


            else if (
                complement.tipo ===
                "multipla"
            ) {

                if (required) {

                    helperText =
                        `Escolha de ${complement.minimo} até ${complement.maximo}`;

                }

                else {

                    helperText =
                        `Escolha até ${complement.maximo}`;

                }

            }


            else if (
                complement.tipo ===
                "quantidade"
            ) {

                if (required) {

                    helperText =
                        `Escolha de ${complement.minimo} até ${complement.maximo} itens`;

                }

                else {

                    helperText =
                        `Escolha até ${complement.maximo} itens`;

                }

            }


            group.innerHTML = `

                <div class="product-complement-header">

                    <div>

                        <h3>
                            ${complement.nome}
                        </h3>

                        <span>
                            ${helperText}
                        </span>

                    </div>


                    ${
                        required
                        ? `
                            <span class="complement-required">
                                Obrigatório
                            </span>
                        `
                        : ""
                    }

                </div>


                <div
                    class="product-complement-options"
                ></div>

            `;


            const optionsContainer =
                group.querySelector(
                    ".product-complement-options"
                );


            /*
             * Escolha única
             */

            if (
                complement.tipo ===
                "unica"
            ) {

                renderSingleChoiceOptions(
                    complement,
                    optionsContainer
                );

            }


            /*
             * Múltipla escolha
             */

            else if (
                complement.tipo ===
                "multipla"
            ) {

                renderMultipleChoiceOptions(
                    complement,
                    optionsContainer
                );

            }


            /*
             * Quantidade
             */

            else if (
                complement.tipo ===
                "quantidade"
            ) {

                renderQuantityOptions(
                    complement,
                    optionsContainer
                );

            }


            productComplements.appendChild(
                group
            );

        }
    );

}

function renderSingleChoiceOptions(
    complement,
    container
) {

    complement.opcoes.forEach(
        option => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "product-complement-option";


            const price =
                Number(
                    option.preco || 0
                );


            label.innerHTML = `

                <div class="complement-option-left">

                    <input
                        type="radio"
						name="complement-${complement.id}"
						value="${option.id}"

						data-complement-id="${complement.id}"
						data-option-id="${option.id}"
						data-option-name="${option.nome}"
						data-option-price="${price}"
                    >

                    <span>
                        ${option.nome}
                    </span>

                </div>


                ${
                    price > 0
                    ? `
                        <strong>
                            + ${formatCurrency(price)}
                        </strong>
                    `
                    : ""
                }

            `;
			
			const radio =
				label.querySelector(
					"input"
				);


			radio.addEventListener(
				"change",
				() => {

					updateAddButtonPrice();

				}
			);


            container.appendChild(
                label
            );

        }
    );

}

function renderMultipleChoiceOptions(
    complement,
    container
) {

    complement.opcoes.forEach(
        option => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "product-complement-option";


            const price =
                Number(
                    option.preco || 0
                );


            label.innerHTML = `

                <div class="complement-option-left">

                    <input
                        type="checkbox"
						class="multiple-complement-option"

						data-complement-id="${complement.id}"
						data-option-id="${option.id}"
						data-option-name="${option.nome}"
						data-option-price="${price}"

						value="${option.id}"
                    >

                    <span>
                        ${option.nome}
                    </span>

                </div>


                ${
                    price > 0
                    ? `
                        <strong>
                            + ${formatCurrency(price)}
                        </strong>
                    `
                    : ""
                }

            `;


            const checkbox =
                label.querySelector(
                    "input"
                );


            /*
             * Impede ultrapassar
             * o máximo configurado.
             */

            checkbox.addEventListener(
                "change",
                () => {

                    const selected =
                        container.querySelectorAll(
                            "input:checked"
                        );


                    if (
                        selected.length >
                        complement.maximo
                    ) {

                        checkbox.checked =
                            false;


                        alert(
                            `Você pode escolher no máximo ${complement.maximo} opção(ões) em "${complement.nome}".`
                        );

                    }
					
					updateAddButtonPrice();

                }
            );


            container.appendChild(
                label
            );

        }
    );

}

function renderQuantityOptions(
    complement,
    container
) {

    complement.opcoes.forEach(
        option => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "product-complement-option quantity-complement-option";


            const price =
                Number(
                    option.preco || 0
                );


            const quantityMax =
                Number(
                    option.quantidadeMaxima ?? 1
                );


            item.innerHTML = `

                <div>

                    <span>
                        ${option.nome}
                    </span>

                    ${
                        price > 0
                        ? `
                            <div class="complement-option-price">
                                + ${formatCurrency(price)}
                            </div>
                        `
                        : ""
                    }

                </div>


                <div
                    class="complement-quantity-selector"

					data-complement-id="${complement.id}"
					data-option-id="${option.id}"
					data-option-name="${option.nome}"
					data-option-price="${price}"
                >

                    <button
                        type="button"
                        class="complement-quantity-minus"
                    >
                        −
                    </button>


                    <span
                        class="complement-quantity-value"
                    >
                        0
                    </span>


                    <button
                        type="button"
                        class="complement-quantity-plus"
                    >
                        +
                    </button>

                </div>

            `;


            const minusButton =
                item.querySelector(
                    ".complement-quantity-minus"
                );


            const plusButton =
                item.querySelector(
                    ".complement-quantity-plus"
                );


            const quantityValue =
                item.querySelector(
                    ".complement-quantity-value"
                );


            let quantity = 0;


            minusButton.addEventListener(
                "click",
                () => {

                    if (
                        quantity > 0
                    ) {

                        quantity--;

                        quantityValue.textContent =
                            quantity;
							
						updateAddButtonPrice();

                    }

                }
            );


            plusButton.addEventListener(
                "click",
                () => {

                    /*
                     * Primeiro verifica
                     * o máximo individual.
                     */

                    if (
                        quantity >=
                        quantityMax
                    ) {

                        alert(
                            `Máximo de ${quantityMax} unidade(s) para "${option.nome}".`
                        );

                        return;

                    }


                    /*
                     * Soma todas as quantidades
                     * deste complemento.
                     */

                    const quantities =
                        [
                            ...container.querySelectorAll(
                                ".complement-quantity-value"
                            )
                        ];


                    const total =
                        quantities.reduce(
                            (
                                sum,
                                element
                            ) =>
                                sum +
                                Number(
                                    element.textContent
                                ),
                            0
                        );


                    if (
                        total >=
                        complement.maximo
                    ) {

                        alert(
                            `Você pode escolher no máximo ${complement.maximo} item(ns) em "${complement.nome}".`
                        );

                        return;

                    }


                    quantity++;

                    quantityValue.textContent =
                        quantity;
						
					updateAddButtonPrice();

                }
            );


            container.appendChild(
                item
            );

        }
    );

}



/* ==================================================
   ATUALIZA PREÇO BOTÃO
   ================================================== */

function updateAddButtonPrice() {

    if (!currentProduct) {
        return;
    }


    const selection =
        getSelectedComplements();


    const unitPrice =
        Number(
            currentProduct.preco || 0
        ) +
        selection.precoComplementos;


    const total =
        unitPrice *
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

addToCartButton.addEventListener(
    "click",
    () => {

        /*
         * Valida complementos obrigatórios.
         */

        if (
            !validateProductComplements()
        ) {

            return;

        }


        const observation =
			itemObservation.value.trim();


		const selection =
			getSelectedComplements();


		const basePrice =
			Number(
				currentProduct.preco || 0
			);


		const unitPrice =
			basePrice +
			selection.precoComplementos;


		cart.push({

			id:
				currentProduct.id,

			nome:
				currentProduct.nome,

			precoBase:
				basePrice,

			complementos:
				selection.complementos,

			precoComplementos:
				selection.precoComplementos,

			precoUnitario:
				unitPrice,

			quantidade:
				currentQuantity,

			observacao:
				observation

		});


        updateCart();


        productModal.style.display =
            "none";

    }
);

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


    cart.forEach(
        (item, index) => {

            const unitPrice =
                Number(
                    item.precoUnitario ??
                    item.preco ??
                    0
                );


            const subtotal =
                unitPrice *
                item.quantidade;


            total += subtotal;


            /*
             * MONTA HTML DOS COMPLEMENTOS
             */

            let complementsHtml =
                "";


            if (
                Array.isArray(
                    item.complementos
                ) &&
                item.complementos.length > 0
            ) {

                complementsHtml += `
                    <div class="cart-item-complements">
                `;


                item.complementos.forEach(
                    complement => {

                        complementsHtml += `
                            <div class="cart-complement-group">

                                <strong>
                                    ${complement.nome}:
                                </strong>

                                <div>
                        `;


                        complement.opcoes.forEach(
                            option => {

                                const quantity =
                                    Number(
                                        option.quantidade ||
                                        1
                                    );


                                const quantityText =
                                    quantity > 1
                                    ? `${quantity}x `
                                    : "";


                                const optionTotal =
                                    Number(
                                        option.preco || 0
                                    ) *
                                    quantity;


                                complementsHtml += `
                                    <div>
                                        ${quantityText}${option.nome}

                                        ${
                                            optionTotal > 0
                                            ? `(+ ${formatCurrency(optionTotal)})`
                                            : ""
                                        }
                                    </div>
                                `;

                            }
                        );


                        complementsHtml += `
                                </div>

                            </div>
                        `;

                    }
                );


                complementsHtml += `
                    </div>
                `;

            }


            /*
             * MONTA ITEM DO CARRINHO
             */

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "cart-item";


            div.innerHTML = `

                <strong>
                    ${item.quantidade}x ${item.nome}
                </strong>


                ${complementsHtml}


                <div class="cart-item-subtotal">
                    ${formatCurrency(subtotal)}
                </div>


                ${
                    item.observacao
                    ? `
                        <small>
                            Obs: ${item.observacao}
                        </small>
                    `
                    : ""
                }


                <br>


                <button
                    class="remove-cart-item"
                    data-index="${index}"
                >
                    Remover
                </button>

            `;


            cartItems.appendChild(
                div
            );

        }
    );


    cartTotal.textContent =
        formatCurrency(total);


    document
        .querySelectorAll(
            ".remove-cart-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        updateCart();

                    }
                );

            }
        );

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
		cart.reduce(
			(sum, item) => {

				const unitPrice =
					Number(
						item.precoUnitario ??
						item.preco ??
						0
					);


				return (
					sum +
					unitPrice *
					item.quantidade
				);

			},
			0
		);
		
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

    cart.forEach(
		item => {

			const unitPrice =
				Number(
					item.precoUnitario ??
					item.preco ??
					0
				);


			const subtotal =
				unitPrice *
				item.quantidade;


			message +=
				`${item.quantidade}x ${item.nome}%0A`;


			/*
			 * Complementos
			 */

			if (
				Array.isArray(
					item.complementos
				)
			) {

				item.complementos.forEach(
					complement => {

						message +=
							`*${complement.nome}:*%0A`;


						complement.opcoes.forEach(
							option => {

								const quantity =
									Number(
										option.quantidade ||
										1
									);


								const quantityText =
									quantity > 1
									? `${quantity}x `
									: "";


								const optionTotal =
									Number(
										option.preco || 0
									) *
									quantity;


								message +=
									`- ${quantityText}${option.nome}`;


								if (
									optionTotal > 0
								) {

									message +=
										` (+ ${formatCurrency(optionTotal)})`;

								}


								message +=
									`%0A`;

							}
						);

					}
				);

			}


			if (
				item.observacao
			) {

				message +=
					`Obs: ${item.observacao}%0A`;

			}


			message +=
				`Subtotal: ${formatCurrency(subtotal)}%0A%0A`;

		}
	);

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
			
		paymentMethods =
			Array.isArray(
				data.formasPagamento
			)
			? [...data.formasPagamento]
			: [
				"PIX",
				"Dinheiro",
				"Débito",
				"Crédito"
			];
			
		renderPaymentMethods();
			
		/* LOGO */
        CONFIG.logo =
            data.logoUrl ||
            CONFIG.logo;


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

async function loadCategoriesFromFirestore() {

    try {

        const categoriesReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "categorias"
            );

        const categoriesQuery =
            query(
                categoriesReference,
                orderBy("ordem", "asc")
            );

        const snapshot =
            await getDocs(
                categoriesQuery
            );

        categories = [];

        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();

                /*
                 * Categorias inativas
                 * não aparecem no cardápio.
                 */

                if (data.ativo === false) {
                    return;
                }

                categories.push({

                    id:
                        documentSnapshot.id,

                    nome:
                        data.nome || "",

                    ordem:
                        Number(data.ordem || 0)

                });

            }
        );

        console.log(
            `${categories.length} categorias carregadas do Firestore`
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar categorias:",
            error
        );

    }

}

function getSelectedComplements() {

    const selections =
        [];


    let totalPrice =
        0;


    currentProductComplements.forEach(
        complement => {

            const selectedOptions =
                [];


            /*
             * ESCOLHA ÚNICA
             */

            if (
                complement.tipo ===
                "unica"
            ) {

                const selected =
                    document.querySelector(
                        `input[name="complement-${complement.id}"]:checked`
                    );


                if (selected) {

                    const price =
                        Number(
                            selected.dataset.optionPrice ||
                            0
                        );


                    selectedOptions.push({

                        id:
                            selected.dataset.optionId,

                        nome:
                            selected.dataset.optionName,

                        preco:
                            price,

                        quantidade:
                            1

                    });


                    totalPrice +=
                        price;

                }

            }


            /*
             * MÚLTIPLA ESCOLHA
             */

            else if (
                complement.tipo ===
                "multipla"
            ) {

                const selected =
                    document.querySelectorAll(
                        `input.multiple-complement-option[data-complement-id="${complement.id}"]:checked`
                    );


                selected.forEach(
                    input => {

                        const price =
                            Number(
                                input.dataset.optionPrice ||
                                0
                            );


                        selectedOptions.push({

                            id:
                                input.dataset.optionId,

                            nome:
                                input.dataset.optionName,

                            preco:
                                price,

                            quantidade:
                                1

                        });


                        totalPrice +=
                            price;

                    }
                );

            }


            /*
             * QUANTIDADE
             */

            else if (
                complement.tipo ===
                "quantidade"
            ) {

                const selectors =
                    document.querySelectorAll(
                        `.complement-quantity-selector[data-complement-id="${complement.id}"]`
                    );


                selectors.forEach(
                    selector => {

                        const quantityElement =
                            selector.querySelector(
                                ".complement-quantity-value"
                            );


                        const quantity =
                            Number(
                                quantityElement
                                    ?.textContent ||
                                0
                            );


                        if (
                            quantity <= 0
                        ) {

                            return;

                        }


                        const price =
                            Number(
                                selector.dataset.optionPrice ||
                                0
                            );


                        selectedOptions.push({

                            id:
                                selector.dataset.optionId,

                            nome:
                                selector.dataset.optionName,

                            preco:
                                price,

                            quantidade:
                                quantity

                        });


                        totalPrice +=
                            price *
                            quantity;

                    }
                );

            }


            /*
             * Só inclui o complemento
             * se alguma opção tiver sido escolhida.
             */

            if (
                selectedOptions.length > 0
            ) {

                selections.push({

                    id:
                        complement.id,

                    nome:
                        complement.nome,

                    tipo:
                        complement.tipo,

                    opcoes:
                        selectedOptions

                });

            }

        }
    );


    return {

        complementos:
            selections,

        precoComplementos:
            totalPrice

    };

}

function validateProductComplements() {

    for (
        const complement
        of currentProductComplements
    ) {

        /*
         * Se mínimo = 0,
         * o grupo é opcional.
         */

        if (
            complement.minimo <= 0
        ) {

            continue;

        }


        let selectedQuantity =
            0;


        /*
         * ESCOLHA ÚNICA
         */

        if (
            complement.tipo ===
            "unica"
        ) {

            const selected =
                document.querySelector(
                    `input[name="complement-${complement.id}"]:checked`
                );


            selectedQuantity =
                selected
                ? 1
                : 0;

        }


        /*
         * MÚLTIPLA ESCOLHA
         */

        else if (
            complement.tipo ===
            "multipla"
        ) {

            selectedQuantity =
                document.querySelectorAll(
                    `input.multiple-complement-option[data-complement-id="${complement.id}"]:checked`
                ).length;

        }


        /*
         * QUANTIDADE
         */

        else if (
            complement.tipo ===
            "quantidade"
        ) {

            const quantities =
                [
                    ...document.querySelectorAll(
                        `.complement-quantity-selector[data-complement-id="${complement.id}"] .complement-quantity-value`
                    )
                ];


            selectedQuantity =
                quantities.reduce(
                    (
                        sum,
                        element
                    ) =>
                        sum +
                        Number(
                            element.textContent ||
                            0
                        ),
                    0
                );

        }


        /*
         * Não atingiu o mínimo.
         */

        if (
            selectedQuantity <
            complement.minimo
        ) {

            alert(
                `Escolha pelo menos ${complement.minimo} opção(ões) em "${complement.nome}".`
            );


            return false;

        }

    }


    return true;

}

function renderPaymentMethods() {

    paymentMethod.innerHTML = "";


    paymentMethods.forEach(
        method => {

            const option =
                document.createElement(
                    "option"
                );


            const normalized =
                method
                    .trim()
                    .toLocaleLowerCase(
                        "pt-BR"
                    );


            if (
                normalized === "pix"
            ) {

                option.value =
                    "PIX";

            }
            else if (
                normalized === "dinheiro"
            ) {

                option.value =
                    "Dinheiro";

            }
            else {

                option.value =
                    method;

            }


            option.textContent =
                method;


            paymentMethod.appendChild(
                option
            );

        }
    );


    togglePaymentFields();

}