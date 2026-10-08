import { firebaseApp, db }
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

import {
    getFunctions,
    httpsCallable
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-functions.js";

console.log(
    "Firebase conectado:",
    db
);

const functions =
    getFunctions(
        firebaseApp,
        "southamerica-east1"
    );

const decreaseStock =
    httpsCallable(
        functions,
        "decreaseStock"
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

let storeCardapioType = "geral";

let pizzariaConfig = {
    ativo: false,
    regraCobrancaSabores: "maior"
};

let pizzariaTypes = [];

let pizzariaFlavors = [];

let currentPizzaType = null;

let currentPizzaFlavorCount = null;

let currentPizzaSelectedFlavors = [];

let currentPizzaBorderComplement = null;

let currentPizzaBorderOption = null;

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

        injectPizzaConfiguratorStyles();

        await loadPizzariaPublicConfig();

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


        const isPizza =
            product.tipoProduto === "pizza";


        let priceHtml;


        if (isPizza) {

            const startingPrice =
                getPizzaStartingPrice(product);


            priceHtml =
                startingPrice !== null

                    ? `A partir de ${formatCurrency(startingPrice)}`

                    : "Consulte a disponibilidade";

        }

        else {

            priceHtml =
                formatCurrency(
                    Number(
                        product.preco || 0
                    )
                );

        }


        const description =
            isPizza && !product.descricao

                ? "Monte sua pizza escolhendo o tipo, os sabores e a borda."

                : product.descricao;


        card.innerHTML = `

            <div class="product-info">

                <div class="product-name">
                    ${escapeHtml(product.nome)}
                </div>

                <div class="product-price">
                    ${priceHtml}
                </div>

                <div class="product-description">
                    ${escapeHtml(description)}
                </div>

            </div>

            <img
                class="product-image"
                src="${product.imagem}"
                alt="${escapeHtml(product.nome)}"
            >

        `;


        card.addEventListener(
            "click",
            () => {

                openProductModal(product);

            }
        );


        productsContainer.appendChild(
            card
        );

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

    resetPizzaState();

    currentQuantity =
        1;


    modalImage.src =
        product.imagem;

    modalName.textContent =
        product.nome;

    modalDescription.textContent =
        product.descricao;

    modalQty.textContent =
        currentQuantity;


    const isPizza =
        product.tipoProduto ===
        "pizza";


    if (isPizza) {

        const startingPrice =
            getPizzaStartingPrice(product);


        modalPrice.textContent =
            startingPrice !== null

                ? `A partir de ${formatCurrency(startingPrice)}`

                : "Consulte a disponibilidade";

    }

    else {

        modalPrice.textContent =
            formatCurrency(
                product.preco
            );

    }


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
     * Carrega os complementos associados
     * apenas deste produto.
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


    if (isPizza) {

        renderPizzaConfigurator(
            product,
            complements
        );

    }

    else {

        currentProductComplements =
            complements;


        renderProductComplements(
            complements
        );

    }

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

                funcaoPizzaria:
                    complementData.funcaoPizzaria || "",

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
    complements,
    targetElement = productComplements
) {

    targetElement.innerHTML =
        "";


    if (
        complements.length === 0
    ) {

        targetElement.style.display =
            "none";

        return;

    }


    targetElement.style.display =
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


            targetElement.appendChild(
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


    if (
        currentProduct.tipoProduto ===
        "pizza"
    ) {

        const validConfiguration =
            isPizzaConfigurationComplete();


        const pizzaPrice =
            calculateCurrentPizzaFlavorPrice();


        const borderPrice =
            Number(
                currentPizzaBorderOption?.preco || 0
            );


        const extrasSelection =
            getSelectedComplements();


        const unitPrice =
            roundMoney(
                pizzaPrice +
                borderPrice +
                extrasSelection.precoComplementos
            );


        const total =
            roundMoney(
                unitPrice *
                currentQuantity
            );


        if (validConfiguration) {

            addToCartButton.textContent =
                `Adicionar • ${formatCurrency(total)}`;

            addToCartButton.disabled =
                false;

            addToCartButton.classList.remove(
                "button-disabled"
            );


            modalPrice.textContent =
                formatCurrency(unitPrice);

        }

        else {

            addToCartButton.textContent =
                "Adicionar";

            addToCartButton.disabled =
                true;

            addToCartButton.classList.add(
                "button-disabled"
            );


            const startingPrice =
                getPizzaStartingPrice(
                    currentProduct
                );


            modalPrice.textContent =
                startingPrice !== null

                    ? `A partir de ${formatCurrency(startingPrice)}`

                    : "Consulte a disponibilidade";

        }


        return;

    }


    const selection =
        getSelectedComplements();


    const unitPrice =
        roundMoney(
            Number(
                currentProduct.preco || 0
            ) +
            selection.precoComplementos
        );


    const total =
        roundMoney(
            unitPrice *
            currentQuantity
        );


    addToCartButton.textContent =
        `Adicionar • ${formatCurrency(total)}`;

    addToCartButton.disabled =
        false;

    addToCartButton.classList.remove(
        "button-disabled"
    );

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

function getCurrentProductStockLimit() {

    if (
        !currentProduct ||
        currentProduct.controlaEstoque !== true
    ) {
        return null;
    }

    const estoque =
        Number(
            currentProduct.estoque ?? 0
        );

    return Math.max(
        0,
        Math.floor(estoque)
    );

}

/* ==================================================
   QUANTIDADE
   ================================================== */

increaseQtyButton.addEventListener(
    "click",
    () => {

        const stockLimit =
            getCurrentProductStockLimit();


        if (
            stockLimit !== null &&
            currentQuantity >= stockLimit
        ) {

            alert(
                `Quantidade disponível atingida.`
            );

            return;

        }


        currentQuantity++;

        modalQty.textContent =
            currentQuantity;

        updateAddButtonPrice();

    }
);

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

        const stockLimit =
            getCurrentProductStockLimit();


        if (
            stockLimit !== null &&
            currentQuantity > stockLimit
        ) {

            alert(
                `Quantidade disponível atingida.`
            );

            return;

        }


        const isPizza =
            currentProduct?.tipoProduto ===
            "pizza";


        if (isPizza) {

            /*
             * Garante que o estado interno dos sabores
             * corresponda às caixas atualmente marcadas
             * no configurador.
             */

            syncPizzaFlavorSelectionFromDOM();


            if (
                !validatePizzaConfiguration()
            ) {

                return;

            }


            if (
                !validateProductComplements()
            ) {

                return;

            }

        }

        else {

            /*
             * Valida complementos obrigatórios
             * do fluxo normal.
             */

            if (
                !validateProductComplements()
            ) {

                return;

            }

        }


        const observation =
            itemObservation.value.trim();


        const extrasSelection =
            getSelectedComplements();


        let itemData;


        if (isPizza) {

            const pizzaFlavorPrice =
                calculateCurrentPizzaFlavorPrice();


            const borderPrice =
                Number(
                    currentPizzaBorderOption?.preco || 0
                );


            const unitPrice =
                roundMoney(
                    pizzaFlavorPrice +
                    borderPrice +
                    extrasSelection.precoComplementos
                );


            const selectedFlavors =
                currentPizzaSelectedFlavors.map(
                    flavor => ({

                        id:
                            flavor.id,

                        nome:
                            flavor.nome,

                        preco:
                            roundMoney(
                                getPizzaFlavorPrice(
                                    flavor,
                                    currentPizzaType.id
                                )
                            )

                    })
                );


            const pizzaComplementsPrice =
                roundMoney(
                    borderPrice +
                    extrasSelection.precoComplementos
                );


            itemData = {

                id:
                    currentProduct.id,

                nome:
                    currentProduct.nome,

                tipoProduto:
                    "pizza",

                tipoPizza: {

                    id:
                        currentPizzaType.id,

                    nome:
                        currentPizzaType.nome

                },

                quantidadeSabores:
                    currentPizzaFlavorCount,

                sabores:
                    selectedFlavors,

                regraCobranca:
                    pizzariaConfig.regraCobrancaSabores,

                valorSabores:
                    roundMoney(
                        pizzaFlavorPrice
                    ),

                borda:
                    currentPizzaBorderOption

                        ? {

                            id:
                                currentPizzaBorderOption.id,

                            nome:
                                currentPizzaBorderOption.nome,

                            preco:
                                roundMoney(
                                    borderPrice
                                )

                        }

                        : null,

                valorBorda:
                    roundMoney(
                        borderPrice
                    ),

                precoBase:
                    roundMoney(
                        pizzaFlavorPrice
                    ),

                complementos:
                    extrasSelection.complementos,

                precoComplementos:
                    pizzaComplementsPrice,

                precoUnitario:
                    roundMoney(
                        unitPrice
                    ),

                quantidade:
                    currentQuantity,

                observacao:
                    observation

            };

        }

        else {

            const basePrice =
                roundMoney(
                    Number(
                        currentProduct.preco ||
                        0
                    )
                );


            const unitPrice =
                roundMoney(
                    basePrice +
                    extrasSelection.precoComplementos
                );


            itemData = {

                id:
                    currentProduct.id,

                nome:
                    currentProduct.nome,

                tipoProduto:
                    "normal",

                precoBase:
                    roundMoney(
                        basePrice
                    ),

                complementos:
                    extrasSelection.complementos,

                precoComplementos:
                    roundMoney(
                        extrasSelection.precoComplementos
                    ),

                precoUnitario:
                    roundMoney(
                        unitPrice
                    ),

                quantidade:
                    currentQuantity,

                observacao:
                    observation

            };

        }


        cart.push(
            itemData
        );


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
                roundMoney(
                    Number(
                        item.precoUnitario ??
                        item.preco ??
                        0
                    )
                );


            const subtotal =
                roundMoney(
                    unitPrice *
                    Number(
                        item.quantidade || 0
                    )
                );


            total =
                roundMoney(
                    total +
                    subtotal
                );


            let detailsHtml =
                "";


            if (
                item.tipoProduto ===
                "pizza"
            ) {

                detailsHtml += `

                    <div class="cart-pizza-details">

                        <div>
                            <strong>Tipo:</strong>
                            ${escapeHtml(
                                item.tipoPizza?.nome || ""
                            )}
                        </div>

                        <div>
                            <strong>Sabores:</strong>
                            ${
                                Array.isArray(item.sabores)
                                ? item.sabores
                                    .map(
                                        flavor =>
                                            escapeHtml(
                                                flavor.nome
                                            )
                                    )
                                    .join(
                                        ", "
                                    )
                                : ""
                            }
                        </div>

                        ${
                            item.borda
                                ? `
                                    <div>
                                        <strong>Borda:</strong>
                                        ${escapeHtml(
                                            item.borda.nome
                                        )}

                                        ${
                                            Number(
                                                item.borda.preco || 0
                                            ) > 0
                                                ? `(+ ${formatCurrency(
                                                    Number(
                                                        item.borda.preco
                                                    )
                                                )})`
                                                : ""
                                        }
                                    </div>
                                `
                                : ""
                        }

                    </div>

                `;

            }


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
                                    ${escapeHtml(
                                        complement.nome
                                    )}:
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
                                    roundMoney(
                                        Number(
                                            option.preco ||
                                            0
                                        ) *
                                        quantity
                                    );


                                complementsHtml += `

                                    <div>

                                        ${quantityText}

                                        ${escapeHtml(
                                            option.nome
                                        )}

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


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "cart-item";


            const displayBasePrice =
                roundMoney(
                    Number(
                        item.precoBase ??
                        item.preco ??
                        0
                    )
                );


            div.innerHTML = `

                <strong>

                    ${Number(
                        item.quantidade || 0
                    )}x

                    ${escapeHtml(
                        item.nome
                    )}

                    — ${formatCurrency(
                        displayBasePrice
                    )}

                </strong>


                ${detailsHtml}


                ${complementsHtml}


                ${
                    item.observacao
                    ? `
                        <small>
                            Obs: ${escapeHtml(
                                item.observacao
                            )}
                        </small>
                    `
                    : ""
                }


                <div class="cart-item-subtotal">

                    ${formatCurrency(
                        subtotal
                    )}

                </div>


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
        formatCurrency(
            total
        );


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
   REGISTRAR PEDIDO E BAIXAR ESTOQUE
   ================================================== */

async function decreaseStockForCart(pedido) {

    /*
     * Agrupa a quantidade solicitada por produto.
     *
     * Isso é importante porque o mesmo produto pode
     * aparecer mais de uma vez no carrinho.
     */

    const requestedQuantities = {};

    cart.forEach(item => {

        const productId =
            item.id;

        const quantity =
            Number(item.quantidade || 0);

        if (!requestedQuantities[productId]) {

            requestedQuantities[productId] =
                0;

        }

        requestedQuantities[productId] +=
            quantity;

    });


    const items =
        Object.entries(
            requestedQuantities
        ).map(
            ([productId, quantity]) => ({
                productId,
                quantity
            })
        );


    /*
     * Nenhum produto no carrinho.
     */

    if (items.length === 0) {

        return {
            success: false,
            error: {
                message:
                    "O carrinho está vazio."
            }
        };

    }


    try {

        /*
         * A Cloud Function faz atomicamente:
         *
         * 1. valida o estoque;
         * 2. baixa o estoque;
         * 3. gera o número do pedido;
         * 4. grava o pedido.
         */

        const result =
            await decreaseStock({

                items,

                pedido

            });


        return {

            success: true,

            data:
                result.data

        };

    }

    catch (error) {

        console.error(
            "Erro ao registrar pedido:",
            error
        );


        return {

            success: false,

            error

        };

    }

}
	
/* ==================================================
   ENVIAR PEDIDO PELO WHATSAPP
   ================================================== */

sendOrderButton.addEventListener(
    "click",
    async () => {
	
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
		roundMoney(
			cart.reduce(
				(sum, item) => {

					const unitPrice =
						roundMoney(
							Number(
								item.precoUnitario ??
								item.preco ??
								0
							)
						);

					const itemSubtotal =
						roundMoney(
							unitPrice *
							Number(
								item.quantidade || 0
							)
						);

					return roundMoney(
						sum +
						itemSubtotal
					);

				},
				0
			)
		);


	const deliveryFee =
		roundMoney(
			deliveryType.value === "Entrega"
				? CONFIG.deliveryFee
				: 0
		);


	const finalTotal =
		roundMoney(
			total +
			deliveryFee
		);

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
				`${item.quantidade}x ${item.nome} — ${formatCurrency(
					Number(
						item.precoBase ??
						item.preco ??
						0
					)
				)}%0A`;


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

    /*
     * Abre uma aba em branco imediatamente.
     *
     * Isso evita que o navegador bloqueie a abertura
     * do WhatsApp enquanto aguardamos a Cloud Function.
     */

    const whatsappWindow =
        window.open(
            "about:blank",
            "_blank"
        );


    if (!whatsappWindow) {

        alert(
            "Não foi possível abrir o WhatsApp. Verifique se o navegador está bloqueando novas abas."
        );

        return;

    }


    /*
     * Monta os dados que serão gravados
     * no pedido.
     */

    const selectedChangeOption =
        document.querySelector(
            'input[name="needsChange"]:checked'
        );


    const needsChange =
        selectedChangeOption
            ? selectedChangeOption.value
            : "Não";


    const pedido = {

        cliente: {

            nome:
                customerName.value.trim(),

            telefone:
                customerPhone.value.trim()

        },


        entrega: {

            tipo:
                deliveryType.value,

            endereco:
                deliveryType.value === "Entrega"
                    ? customerAddress.value.trim()
                    : CONFIG.pickupAddress

        },


        pagamento: {

            forma:
                paymentMethod.value,

            trocoPara:
                paymentMethod.value === "Dinheiro" &&
                needsChange === "Sim"
                    ? changeFor.value.trim()
                    : ""

        },


        itens:
            cart.map(item => ({

                productId:
                    item.id,

                nome:
                    item.nome,

                tipoProduto:
                    item.tipoProduto || "normal",

                ...(item.tipoProduto === "pizza"
                    ? {

                        tipoPizza:
                            item.tipoPizza || null,

                        quantidadeSabores:
                            Number(
                                item.quantidadeSabores || 0
                            ),

                        sabores:
                            Array.isArray(
                                item.sabores
                            )
                                ? item.sabores
                                : [],

                        regraCobranca:
                            item.regraCobranca || null,

                        valorSabores:
                            roundMoney(
                                Number(
                                    item.valorSabores ??
                                    item.precoBase ??
                                    0
                                )
                            ),

                        borda:
                            item.borda || null,

                        valorBorda:
                            roundMoney(
                                Number(
                                    item.valorBorda || 0
                                )
                            )

                    }
                    : {}
                ),

                precoBase:
					roundMoney(
						Number(
							item.precoBase ??
							item.preco ??
							0
						)
					),

                quantidade:
                    Number(
                        item.quantidade || 0
                    ),

                complementos:
                    Array.isArray(
                        item.complementos
                    )
                        ? item.complementos
                        : [],

                precoComplementos:
					roundMoney(
						Number(
							item.precoComplementos || 0
						)
					),

                precoUnitario:
					roundMoney(
						Number(
							item.precoUnitario ??
							item.preco ??
							0
						)
					),

                subtotal:
					roundMoney(
						Number(
							item.precoUnitario ??
							item.preco ??
							0
						) *
						Number(
							item.quantidade || 0
						)
					),

                observacao:
                    item.observacao || ""

            })),


        subtotal:
			roundMoney(total),


		taxaEntrega:
			roundMoney(deliveryFee),


		total:
			roundMoney(finalTotal)

    };


    /*
     * Registra o pedido e baixa o estoque
     * através da Cloud Function.
     */

    const stockResult =
        await decreaseStockForCart(
            pedido
        );


    if (!stockResult.success) {

        whatsappWindow.close();


        const errorMessage =
            stockResult.error?.message || "";


        alert(
            errorMessage ||
            "Não foi possível registrar o pedido. Verifique o estoque e tente novamente."
        );


        return;

    }


    /*
     * Número gerado pelo servidor.
     */

    const pedidoNumero =
        stockResult.data?.pedido?.numero;


    if (!pedidoNumero) {

        whatsappWindow.close();


        alert(
            "O pedido foi processado, mas não foi possível obter o número do pedido. Entre em contato com a loja."
        );


        return;

    }


    /*
     * Agora montamos a mensagem do WhatsApp.
     *
     * O número do pedido é incluído somente
     * depois que o servidor confirmou o registro.
     */

    let whatsappMessage = "";

    whatsappMessage +=
        `>>> *NOVO PEDIDO Nº ${pedidoNumero}* <<<%0A%0A`;


    whatsappMessage +=
        `*Cliente:* ${customerName.value.trim()}%0A`;


    whatsappMessage +=
        `*Telefone:* ${customerPhone.value.trim()}%0A%0A`;


    whatsappMessage +=
        `*Entrega ou retirada:* ${deliveryType.value}%0A`;


    if (
        deliveryType.value === "Entrega"
    ) {

        whatsappMessage +=
            `*Endereço:* ${customerAddress.value.trim()}%0A`;

    }

    else {

        whatsappMessage +=
            `*Retirar em:* ${CONFIG.pickupAddress}%0A`;

    }


    whatsappMessage +=
        `%0A*Forma de pagamento:* ${paymentMethod.value}%0A`;


    if (
        paymentMethod.value === "PIX"
    ) {

        whatsappMessage +=
            `*PIX:* Chave: ${CONFIG.pixKey} | Titular: ${CONFIG.pixOwner}%0A`;

    }


    if (
        paymentMethod.value === "Dinheiro"
    ) {

        whatsappMessage +=
            `*Precisa de troco:* ${needsChange}%0A`;


        if (
            needsChange === "Sim"
        ) {

            whatsappMessage +=
                `*Troco para:* ${changeFor.value.trim()}%0A`;

        }

    }


    whatsappMessage +=
        "%0A--------------------%0A";


    whatsappMessage +=
        "*Itens do pedido:*%0A%0A";


    cart.forEach(
        item => {

            const basePrice =
                roundMoney(
                    Number(
                        item.precoBase ??
                        item.preco ??
                        0
                    )
                );


            const unitPrice =
                roundMoney(
                    Number(
                        item.precoUnitario ??
                        item.preco ??
                        0
                    )
                );


            const subtotal =
                roundMoney(
                    unitPrice *
                    Number(
                        item.quantidade || 0
                    )
                );


            whatsappMessage +=
                `${item.quantidade}x ${escapeWhatsAppText(item.nome)} — ${formatCurrency(basePrice)}%0A`;


            if (
                item.tipoProduto ===
                "pizza"
            ) {

                whatsappMessage +=
                    `*Tipo:* ${escapeWhatsAppText(
                        item.tipoPizza?.nome || ""
                    )}%0A`;


                if (
                    Array.isArray(
                        item.sabores
                    )
                ) {

                    whatsappMessage +=
                        `*Sabores:* ${item.sabores
                            .map(
                                flavor =>
                                    escapeWhatsAppText(
                                        flavor.nome
                                    )
                            )
                            .join(
                                ", "
                            )}%0A`;

                }


                if (
                    item.borda
                ) {

                    const borderPrice =
                        roundMoney(
                            Number(
                                item.borda.preco ||
                                0
                            )
                        );


                    whatsappMessage +=
                        `*Borda:* ${escapeWhatsAppText(
                            item.borda.nome
                        )}`;


                    if (
                        borderPrice > 0
                    ) {

                        whatsappMessage +=
                            ` (+ ${formatCurrency(
                                borderPrice
                            )})`;

                    }


                    whatsappMessage +=
                        `%0A`;

                }

            }


            /*
             * Complementos e adicionais.
             */

            if (
                Array.isArray(
                    item.complementos
                )
            ) {

                item.complementos.forEach(
                    complement => {

                        whatsappMessage +=
                            `*${escapeWhatsAppText(
                                complement.nome
                            )}:*%0A`;


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
                                    roundMoney(
                                        Number(
                                            option.preco ||
                                            0
                                        ) *
                                        quantity
                                    );


                                whatsappMessage +=
                                    `- ${quantityText}${escapeWhatsAppText(
                                        option.nome
                                    )}`;


                                if (
                                    optionTotal > 0
                                ) {

                                    whatsappMessage +=
                                        ` (+ ${formatCurrency(
                                            optionTotal
                                        )})`;

                                }


                                whatsappMessage +=
                                    `%0A`;

                            }
                        );

                    }
                );

            }


            if (
                item.observacao
            ) {

                whatsappMessage +=
                    `Obs: ${escapeWhatsAppText(
                        item.observacao
                    )}%0A`;

            }


            whatsappMessage +=
                `Subtotal: ${formatCurrency(
                    subtotal
                )}%0A%0A`;

        }
    );


    whatsappMessage +=
        "--------------------%0A";


    whatsappMessage +=
        `*Subtotal dos itens:* ${formatCurrency(total)}%0A`;


    if (
        deliveryType.value === "Entrega"
    ) {

        whatsappMessage +=
            `*Taxa de entrega:* ${formatCurrency(deliveryFee)}%0A`;

    }


    whatsappMessage +=
        `*TOTAL:* ${formatCurrency(finalTotal)}%0A`;


    /*
     * Pedido registrado e estoque baixado.
     * Agora envia para o WhatsApp.
     */

    const whatsappUrl =
        `https://wa.me/${CONFIG.whatsappNumber}?text=${whatsappMessage}`;


    whatsappWindow.location.href =
        whatsappUrl;


    clearCartFromLocalStorage();


    setTimeout(
        () => {

            location.reload();

        },
        1000
    );

});

function roundMoney(value) {

    const numericValue =
        Number(value);

    if (!Number.isFinite(numericValue)) {

        return 0;

    }

    return Math.round(
        (numericValue + Number.EPSILON) * 100
    ) / 100;

}

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


            const isPizza =
                data.tipoProduto === "pizza";


            if (
                isPizza &&
                (
                    storeCardapioType !== "pizzaria" ||
                    pizzariaConfig.ativo !== true
                )
            ) {

                return;

            }

			const controlaEstoque =
				data.controlaEstoque === true;

			const estoque =
				Number(data.estoque ?? 0);


			/*
			 * Produtos com controle de estoque
			 * e quantidade zerada não aparecem
			 * no cardápio público.
			 */
			if (
				controlaEstoque &&
				estoque <= 0
			) {
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

                tipoProduto:
                    isPizza
                        ? "pizza"
                        : "normal",

                pizzaria:
                    isPizza && data.pizzaria
                        ? data.pizzaria
                        : {},

                ativo:
					data.ativo !== false,

				controlaEstoque:
					controlaEstoque,

				estoque:
					estoque,

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


        storeCardapioType =
            data.tipoCardapio === "pizzaria"
                ? "pizzaria"
                : "geral";


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

/* ==================================================
   CONFIGURAÇÃO PÚBLICA DA PIZZARIA
   ================================================== */

async function loadPizzariaPublicConfig() {

    pizzariaConfig = {
        ativo: false,
        regraCobrancaSabores: "maior"
    };

    pizzariaTypes = [];

    pizzariaFlavors = [];


    if (
        storeCardapioType !==
        "pizzaria"
    ) {

        return;

    }


    try {

        const configReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "pizzaria",
                "configuracao"
            );


        const configSnapshot =
            await getDoc(
                configReference
            );


        if (
            !configSnapshot.exists()
        ) {

            console.warn(
                "Configuração da pizzaria não encontrada."
            );

            return;

        }


        const configData =
            configSnapshot.data();


        if (
            configData.ativo !== true
        ) {

            return;

        }


        pizzariaConfig = {

            ativo:
                true,

            regraCobrancaSabores:
                configData.regraCobrancaSabores ===
                "media"

                    ? "media"
                    : "maior"

        };


        const typesReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "pizzaria",
                "configuracao",
                "tiposPizza"
            );


        const flavorsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "pizzaria",
                "configuracao",
                "sabores"
            );


        const [
            typesSnapshot,
            flavorsSnapshot
        ] =
            await Promise.all([

                getDocs(
                    query(
                        typesReference,
                        orderBy(
                            "ordem",
                            "asc"
                        )
                    )
                ),

                getDocs(
                    query(
                        flavorsReference,
                        orderBy(
                            "ordem",
                            "asc"
                        )
                    )
                )

            ]);


        typesSnapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                if (
                    data.ativo === false
                ) {

                    return;

                }


                const min =
                    Math.max(
                        1,
                        Number(
                            data.minSabores || 1
                        )
                    );


                const max =
                    Math.max(
                        min,
                        Number(
                            data.maxSabores || min
                        )
                    );


                pizzariaTypes.push({

                    id:
                        documentSnapshot.id,

                    nome:
                        data.nome || "",

                    minSabores:
                        min,

                    maxSabores:
                        max,

                    ativo:
                        true,

                    ordem:
                        Number(
                            data.ordem || 0
                        )

                });

            }
        );


        flavorsSnapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                if (
                    data.ativo === false
                ) {

                    return;

                }


                pizzariaFlavors.push({

                    id:
                        documentSnapshot.id,

                    nome:
                        data.nome || "",

                    descricao:
                        data.descricao || "",

                    precosPorTipo:
                        data.precosPorTipo ||
                        {},

                    ativo:
                        true,

                    ordem:
                        Number(
                            data.ordem || 0
                        )

                });

            }
        );


        console.log(
            `${pizzariaTypes.length} tipos e ${pizzariaFlavors.length} sabores de pizza carregados`
        );

    }

    catch (error) {

        console.error(
            "Erro ao carregar configuração pública da pizzaria:",
            error
        );

        pizzariaConfig = {
            ativo: false,
            regraCobrancaSabores: "maior"
        };

    }

}


/* ==================================================
   ESTADO DO CONFIGURADOR
   ================================================== */

function resetPizzaState() {

    currentPizzaType =
        null;

    currentPizzaFlavorCount =
        null;

    currentPizzaSelectedFlavors =
        [];

    currentPizzaBorderComplement =
        null;

    currentPizzaBorderOption =
        null;

}


/* ==================================================
   TIPOS DISPONÍVEIS
   ================================================== */

function getAvailablePizzaTypes(
    product
) {

    const configuredIds =
        Array.isArray(
            product?.pizzaria?.tiposPizzaIds
        )
            ? product.pizzaria.tiposPizzaIds
            : [];


    return pizzariaTypes.filter(
        type =>

            configuredIds.length ===
            0

            ||

            configuredIds.includes(
                type.id
            )
    );

}


/* ==================================================
   SABORES DISPONÍVEIS
   ================================================== */

function getAvailablePizzaFlavors(
    product,
    typeId
) {

    const configuredIds =
        Array.isArray(
            product?.pizzaria?.saboresIds
        )
            ? product.pizzaria.saboresIds
            : [];


    return pizzariaFlavors.filter(
        flavor => {

            if (
                configuredIds.length > 0 &&
                !configuredIds.includes(
                    flavor.id
                )
            ) {

                return false;

            }


            return (
                getPizzaFlavorPrice(
                    flavor,
                    typeId
                ) > 0
            );

        }
    );

}


/* ==================================================
   PREÇO DO SABOR
   ================================================== */

function getPizzaFlavorPrice(
    flavor,
    typeId
) {

    const value =
        Number(
            flavor?.precosPorTipo?.[typeId] ??
            0
        );


    if (
        !Number.isFinite(value)
    ) {

        return 0;

    }


    return roundMoney(
        value
    );

}


/* ==================================================
   PREÇO INICIAL DA PIZZA
   ================================================== */

function getPizzaStartingPrice(
    product
) {

    if (
        !product ||
        product.tipoProduto !==
            "pizza" ||
        pizzariaConfig.ativo !== true
    ) {

        return null;

    }


    const types =
        getAvailablePizzaTypes(
            product
        );


    let startingPrice =
        null;


    types.forEach(
        type => {

            const min =
                Math.max(
                    1,
                    Number(
                        type.minSabores || 1
                    )
                );


            const flavors =
                getAvailablePizzaFlavors(
                    product,
                    type.id
                );


            if (
                flavors.length <
                min
            ) {

                return;

            }


            const prices =
                flavors
                    .map(
                        flavor =>
                            getPizzaFlavorPrice(
                                flavor,
                                type.id
                            )
                    )
                    .filter(
                        price =>
                            price > 0
                    )
                    .sort(
                        (
                            a,
                            b
                        ) =>
                            a - b
                    );


            if (
                prices.length <
                min
            ) {

                return;

            }


            const selectedPrices =
                prices.slice(
                    0,
                    min
                );


            let value;


            if (
                pizzariaConfig.regraCobrancaSabores ===
                "media"
            ) {

                value =
                    selectedPrices.reduce(
                        (
                            sum,
                            price
                        ) =>
                            sum +
                            price,
                        0
                    ) /
                    selectedPrices.length;

            }

            else {

                value =
                    selectedPrices[
                        selectedPrices.length - 1
                    ];

            }


            value =
                roundMoney(
                    value
                );


            if (
                startingPrice === null ||
                value < startingPrice
            ) {

                startingPrice =
                    value;

            }

        }
    );


    return startingPrice;

}


/* ==================================================
   CONFIGURADOR DE PIZZA
   ================================================== */

function renderPizzaConfigurator(
    product,
    complements
) {

    resetPizzaState();


    const availableTypes =
        getAvailablePizzaTypes(
            product
        );


    const configurator =
        document.createElement(
            "div"
        );


    configurator.className =
        "pizza-configurator";


    configurator.innerHTML = `

        <div
            class="pizza-step"
            data-step="type"
        >

            <div class="pizza-step-header">

                <span class="pizza-step-number">
                    1
                </span>

                <div>

                    <h3>
                        Escolha o tipo da pizza
                    </h3>

                    <p>
                        Selecione o tamanho ou formato desejado.
                    </p>

                </div>

            </div>


            <div
                id="pizzaTypeOptions"
                class="pizza-option-grid"
            ></div>

        </div>


        <div
            id="pizzaBorderStep"
            class="pizza-step pizza-step-hidden"
        >

            <div class="pizza-step-header">

                <span class="pizza-step-number">
                    2
                </span>

                <div>

                    <h3>
                        Escolha a borda
                    </h3>

                    <p>
                        Escolha uma borda recheada ou sem borda.
                    </p>

                </div>

            </div>


            <div
                id="pizzaBorderOptions"
                class="pizza-option-list"
            ></div>

        </div>




        <div
            id="pizzaFlavorsStep"
            class="pizza-step pizza-step-hidden"
        >

            <div class="pizza-step-header">

                <span class="pizza-step-number">
                    3
                </span>

                <div>

                    <h3>
                        Escolha os sabores
                    </h3>

                    <p id="pizzaFlavorsHelper">
                        Selecione os sabores da sua pizza.
                    </p>

                </div>

            </div>


            <div
                id="pizzaFlavorOptions"
                class="pizza-option-list"
            ></div>

        </div>


        <div
            id="pizzaExtrasStep"
            class="pizza-step pizza-step-hidden"
        >

            <div class="pizza-step-header">

                <span class="pizza-step-number">
                    4
                </span>

                <div>

                    <h3>
                        Adicionais
                    </h3>

                    <p>
                        Escolha outros adicionais, se disponíveis.
                    </p>

                </div>

            </div>


            <div
                id="pizzaExtrasOptions"
                class="pizza-extras-container"
            ></div>

        </div>

    `;


    productComplements.innerHTML =
        "";


    productComplements.style.display =
        "block";


    productComplements.appendChild(
        configurator
    );


    const typeOptions =
        configurator.querySelector(
            "#pizzaTypeOptions"
        );



    const borderStep =
        configurator.querySelector(
            "#pizzaBorderStep"
        );


    const borderOptions =
        configurator.querySelector(
            "#pizzaBorderOptions"
        );


    const flavorsStep =
        configurator.querySelector(
            "#pizzaFlavorsStep"
        );


    const flavorOptions =
        configurator.querySelector(
            "#pizzaFlavorOptions"
        );


    const extrasStep =
        configurator.querySelector(
            "#pizzaExtrasStep"
        );


    const extrasOptions =
        configurator.querySelector(
            "#pizzaExtrasOptions"
        );


    if (
        availableTypes.length === 0
    ) {

        typeOptions.innerHTML = `

            <div class="pizza-config-error">

                Nenhum tipo de pizza disponível para este produto.

            </div>

        `;

        updateAddButtonPrice();

        return;

    }


    availableTypes.forEach(
        type => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "pizza-option-card";


            label.innerHTML = `

                <input
                    type="radio"
                    name="pizzaType"
                    value="${type.id}"
                >

                <span>

                    <strong>
                        ${escapeHtml(
                            type.nome
                        )}
                    </strong>

                    <small>
                        ${
                            type.minSabores ===
                            type.maxSabores

                                ? `${type.maxSabores} ${
                                    type.maxSabores === 1
                                        ? "sabor"
                                        : "sabores"
                                }`

                                : `${type.minSabores} a ${type.maxSabores} sabores`
                        }
                    </small>

                </span>

            `;


            const radio =
                label.querySelector(
                    "input"
                );


            radio.addEventListener(
                "change",
                () => {

                    currentPizzaType =
                        availableTypes.find(
                            item =>
                                item.id ===
                                radio.value
                        )
                        ||
                        null;


                    currentPizzaFlavorCount =
                        null;

                    currentPizzaSelectedFlavors =
                        [];

                    currentPizzaBorderOption =
                        null;


                    borderStep.classList.add(
                        "pizza-step-hidden"
                    );

                    flavorsStep.classList.add(
                        "pizza-step-hidden"
                    );

                    extrasStep.classList.add(
                        "pizza-step-hidden"
                    );


                    borderOptions.innerHTML =
                        "";

                    flavorOptions.innerHTML =
                        "";



                    if (
                        currentPizzaBorderComplement
                    ) {

                        renderPizzaBorderStep(
                            borderStep,
                            borderOptions
                        );

                    }

                    else {

                        showPizzaFlavorsAndExtras();

                    }


                    updateAddButtonPrice();

                }
            );


            typeOptions.appendChild(
                label
            );

        }
    );


    /*
     * Um único tipo pode ser selecionado
     * automaticamente.
     */

    if (
        availableTypes.length === 1
    ) {

        const radio =
            typeOptions.querySelector(
                "input"
            );


        if (radio) {

            radio.checked =
                true;


            currentPizzaType =
                availableTypes[0];


            /* A próxima etapa será exibida após a detecção da borda. */

        }

    }


    /*
     * Detecta o complemento de borda.
     *
     * A identificação principal é o campo
     * funcaoPizzaria. O fallback por nome
     * permite compatibilidade com configurações
     * antigas que tenham um complemento chamado
     * "Borda" ou "Bordas".
     */

    currentPizzaBorderComplement =
        complements.find(
            complement =>
                normalizePizzaText(
                    complement.funcaoPizzaria
                ) ===
                "borda"
        )
        ||
        complements.find(
            complement =>
                normalizePizzaText(
                    complement.nome
                ).includes(
                    "borda"
                )
        )
        ||
        null;


    /*
     * Os demais complementos continuam sendo
     * tratados pelo mecanismo genérico existente.
     */

    currentProductComplements =
        complements.filter(
            complement =>
                !currentPizzaBorderComplement
                ||
                complement.id !==
                    currentPizzaBorderComplement.id
        );


    /*
     * A borda é renderizada somente depois da escolha do tipo.
     */

    if (
        availableTypes.length === 1
    ) {

        if (
            currentPizzaBorderComplement
        ) {

            renderPizzaBorderStep(
                borderStep,
                borderOptions
            );

        }

        else {

            showPizzaFlavorsAndExtras();

        }

    }


    renderProductComplements(
        currentProductComplements,
        extrasOptions
    );


    updateAddButtonPrice();

}


/* ==================================================
   QUANTIDADE DE SABORES
   ================================================== */

/* ==================================================
   MOSTRA SABORES E ADICIONAIS
   ================================================== */

function showPizzaFlavorsAndExtras() {

    const flavorsStep =
        productComplements.querySelector(
            "#pizzaFlavorsStep"
        );


    if (
        flavorsStep
    ) {

        flavorsStep.classList.remove(
            "pizza-step-hidden"
        );

    }


    const extrasStep =
        productComplements.querySelector(
            "#pizzaExtrasStep"
        );


    if (
        extrasStep &&
        currentProductComplements.length > 0
    ) {

        extrasStep.classList.remove(
            "pizza-step-hidden"
        );

    }


    renderPizzaFlavors();

    updateAddButtonPrice();

}


/* ==================================================
   BORDA
   ================================================== */

function renderPizzaBorderStep(
    step,
    container
) {

    if (
        !currentPizzaBorderComplement
    ) {

        step.classList.add(
            "pizza-step-hidden"
        );

        return;

    }


    const options =
        Array.isArray(
            currentPizzaBorderComplement.opcoes
        )

            ? currentPizzaBorderComplement.opcoes.filter(
                option =>
                    option.ativo !== false
            )

            : [];


    if (
        options.length === 0
    ) {

        step.classList.add(
            "pizza-step-hidden"
        );

        currentPizzaBorderOption =
            null;

        return;

    }


    step.classList.remove(
        "pizza-step-hidden"
    );


    container.innerHTML =
        "";


    /*
     * "Sem borda" é a opção padrão quando
     * a pizzaria a disponibiliza.
     */

    const defaultOption =
        options.find(
            option =>
                normalizePizzaText(
                    option.nome
                ).includes(
                    "sem borda"
                )
        )
        ||
        null;


    if (
        defaultOption
    ) {

        currentPizzaBorderOption =
            defaultOption;

    }


    options.forEach(
        option => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "pizza-radio-option";


            const price =
                roundMoney(
                    Number(
                        option.preco || 0
                    )
                );


            label.innerHTML = `

                <input
                    type="radio"
                    name="pizzaBorder"
                    value="${option.id}"
                >

                <span>

                    <strong>
                        ${escapeHtml(
                            option.nome
                        )}
                    </strong>

                    ${
                        price > 0
                            ? `
                                <small>
                                    + ${formatCurrency(
                                        price
                                    )}
                                </small>
                              `
                            : ""
                    }

                </span>

            `;


            const radio =
                label.querySelector(
                    "input"
                );


            if (
                defaultOption &&
                defaultOption.id ===
                    option.id
            ) {

                radio.checked =
                    true;

            }


            radio.addEventListener(
                "change",
                () => {

                    currentPizzaBorderOption =
                        options.find(
                            item =>
                                item.id ===
                                radio.value
                        )
                        ||
                        null;


                    showPizzaFlavorsAndExtras();


                    updateAddButtonPrice();

                }
            );


            container.appendChild(
                label
            );

        }
    );


    updateAddButtonPrice();

}


/* ==================================================
   SABORES
   ================================================== */

function renderPizzaFlavors() {

    const flavorsStep =
        productComplements.querySelector(
            "#pizzaFlavorsStep"
        );


    const flavorOptions =
        productComplements.querySelector(
            "#pizzaFlavorOptions"
        );


    const helper =
        productComplements.querySelector(
            "#pizzaFlavorsHelper"
        );


    if (
        !currentPizzaType
    ) {

        flavorsStep.classList.add(
            "pizza-step-hidden"
        );

        return;

    }


    const flavors =
        getAvailablePizzaFlavors(
            currentProduct,
            currentPizzaType.id
        );


    const min =
        Math.max(
            1,
            Number(
                currentPizzaType.minSabores || 1
            )
        );


    const max =
        Math.max(
            min,
            Number(
                currentPizzaType.maxSabores || min
            )
        );


    const rangeText =
        min === max
            ? `Selecione ${min} ${
                min === 1
                    ? "sabor"
                    : "sabores"
            }.`
            : `Selecione de ${min} a ${max} sabores.`;


    helper.textContent =
        rangeText;


    /*
     * Preserva as seleções atuais ao reconstruir
     * a lista de sabores. Isso é importante porque
     * a lista pode ser renderizada novamente ao
     * trocar a borda.
     */

    const selectedFlavorIds =
        new Set(
            currentPizzaSelectedFlavors.map(
                flavor =>
                    flavor.id
            )
        );


    flavorOptions.innerHTML =
        "";


    if (
        flavors.length <
        min
    ) {

        flavorOptions.innerHTML = `

            <div class="pizza-config-error">

                Não há sabores suficientes disponíveis
                para esta configuração.

            </div>

        `;


        updateAddButtonPrice();

        return;

    }


    flavors.forEach(
        flavor => {

            const label =
                document.createElement(
                    "label"
                );


            label.className =
                "pizza-checkbox-option";


            const price =
                getPizzaFlavorPrice(
                    flavor,
                    currentPizzaType.id
                );


            label.innerHTML = `

                <input
                    type="checkbox"
                    value="${flavor.id}"
                    ${
                        selectedFlavorIds.has(
                            flavor.id
                        )
                            ? "checked"
                            : ""
                    }
                >

                <div class="pizza-flavor-option-info">

                    <strong>
                        ${escapeHtml(
                            flavor.nome
                        )}
                    </strong>

                    ${
                        flavor.descricao
                            ? `
                                <em>
                                    ${escapeHtml(
                                        flavor.descricao
                                    )}
                                </em>
                              `
                            : ""
                    }

                </div>

                <small>
                    ${formatCurrency(price)}
                </small>

            `;


            const checkbox =
                label.querySelector(
                    "input"
                );


            checkbox.addEventListener(
                "change",
                () => {

                    if (
                        checkbox.checked
                    ) {

                        if (
                            currentPizzaSelectedFlavors.length >=
                            max
                        ) {

                            checkbox.checked =
                                false;


                            alert(
                                `Você pode escolher no máximo ${max} ${
                                    max === 1
                                        ? "sabor"
                                        : "sabores"
                                }.`
                            );


                            return;

                        }


                        const selectedFlavor =
                            flavors.find(
                                item =>
                                    item.id ===
                                    checkbox.value
                            );


                        if (
                            selectedFlavor
                        ) {

                            currentPizzaSelectedFlavors.push(
                                selectedFlavor
                            );

                        }

                    }

                    else {

                        currentPizzaSelectedFlavors =
                            currentPizzaSelectedFlavors.filter(
                                selected =>
                                    selected.id !==
                                    checkbox.value
                            );

                    }


                    currentPizzaFlavorCount =
                        currentPizzaSelectedFlavors.length;


                    updatePizzaFlavorSummary();

                    updateAddButtonPrice();

                }
            );


            flavorOptions.appendChild(
                label
            );

        }
    );


    flavorsStep.classList.remove(
        "pizza-step-hidden"
    );


    updatePizzaFlavorSummary();

}


/* ==================================================
   SINCRONIZA SABORES SELECIONADOS COM A INTERFACE
   ================================================== */

function syncPizzaFlavorSelectionFromDOM() {

    if (
        !currentProduct ||
        !currentPizzaType
    ) {

        currentPizzaSelectedFlavors =
            [];

        currentPizzaFlavorCount =
            0;

        return;

    }


    const checkedInputs =
        productComplements.querySelectorAll(
            "#pizzaFlavorOptions input[type=\"checkbox\"]:checked"
        );


    const availableFlavors =
        getAvailablePizzaFlavors(
            currentProduct,
            currentPizzaType.id
        );


    const selectedIds =
        new Set(
            [
                ...checkedInputs
            ].map(
                input =>
                    input.value
            )
        );


    currentPizzaSelectedFlavors =
        availableFlavors.filter(
            flavor =>
                selectedIds.has(
                    flavor.id
                )
        );


    currentPizzaFlavorCount =
        currentPizzaSelectedFlavors.length;

}


/* ==================================================
   RESUMO DOS SABORES
   ================================================== */

function updatePizzaFlavorSummary() {

    const helper =
        productComplements.querySelector(
            "#pizzaFlavorsHelper"
        );


    if (
        !helper ||
        !currentPizzaType
    ) {

        return;

    }


    const min =
        Math.max(
            1,
            Number(
                currentPizzaType.minSabores || 1
            )
        );


    const max =
        Math.max(
            min,
            Number(
                currentPizzaType.maxSabores || min
            )
        );


    const selectedCount =
        currentPizzaSelectedFlavors.length;


    currentPizzaFlavorCount =
        selectedCount;


    if (
        selectedCount === 0
    ) {

        helper.textContent =
            min === max
                ? `Selecione ${min} ${
                    min === 1
                        ? "sabor"
                        : "sabores"
                }.`
                : `Selecione de ${min} a ${max} sabores.`;

        return;

    }


    if (
        selectedCount < min
    ) {

        helper.textContent =
            `${selectedCount} ${
                selectedCount === 1
                    ? "sabor selecionado"
                    : "sabores selecionados"
            }. Selecione pelo menos ${min}.`;

        return;

    }


    if (
        selectedCount === max
    ) {

        helper.textContent =
            `${selectedCount} ${
                selectedCount === 1
                    ? "sabor selecionado"
                    : "sabores selecionados"
            }.`;

        return;

    }


    helper.textContent =
        `${selectedCount} sabores selecionados. Você pode escolher até ${max}.`;

}
/* ==================================================
   PREÇO DOS SABORES SELECIONADOS
   ================================================== */

function calculateCurrentPizzaFlavorPrice() {

    if (
        !currentPizzaType ||
        currentPizzaSelectedFlavors.length === 0
    ) {

        return 0;

    }


    const prices =
        currentPizzaSelectedFlavors.map(
            flavor =>
                getPizzaFlavorPrice(
                    flavor,
                    currentPizzaType.id
                )
        );


    if (
        prices.some(
            price =>
                price <= 0
        )
    ) {

        return 0;

    }


    if (
        pizzariaConfig.regraCobrancaSabores ===
        "media"
    ) {

        return roundMoney(
            prices.reduce(
                (
                    sum,
                    price
                ) =>
                    sum +
                    price,
                0
            ) /
            prices.length
        );

    }


    return roundMoney(
        Math.max(
            ...prices
        )
    );

}


/* ==================================================
   VERIFICA COMPLEMENTOS GENÉRICOS
   ================================================== */

function areProductComplementsComplete() {

    for (
        const complement
        of currentProductComplements
    ) {

        if (
            complement.minimo <= 0
        ) {

            continue;

        }


        let selectedQuantity =
            0;


        if (
            complement.tipo ===
            "unica"
        ) {

            selectedQuantity =
                document.querySelector(
                    `input[name="complement-${complement.id}"]:checked`
                )
                    ? 1
                    : 0;

        }

        else if (
            complement.tipo ===
            "multipla"
        ) {

            selectedQuantity =
                document.querySelectorAll(
                    `input.multiple-complement-option[data-complement-id="${complement.id}"]:checked`
                ).length;

        }

        else if (
            complement.tipo ===
            "quantidade"
        ) {

            selectedQuantity =
                [
                    ...document.querySelectorAll(
                        `.complement-quantity-selector[data-complement-id="${complement.id}"] .complement-quantity-value`
                    )
                ]
                    .reduce(
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


        if (
            selectedQuantity <
            complement.minimo
        ) {

            return false;

        }

    }


    return true;

}


/* ==================================================
   CONFIGURAÇÃO COMPLETA DA PIZZA
   ================================================== */

function isPizzaConfigurationComplete() {

    if (
        !currentProduct ||
        currentProduct.tipoProduto !==
            "pizza"
    ) {

        return false;

    }


    if (
        !currentPizzaType
    ) {

        return false;

    }


    const minFlavors =
        Math.max(
            1,
            Number(
                currentPizzaType.minSabores || 1
            )
        );


    const maxFlavors =
        Math.max(
            minFlavors,
            Number(
                currentPizzaType.maxSabores || minFlavors
            )
        );


    if (
        currentPizzaSelectedFlavors.length <
        minFlavors
    ) {

        return false;

    }


    if (
        currentPizzaSelectedFlavors.length >
        maxFlavors
    ) {

        return false;

    }


    if (
        currentPizzaBorderComplement
    ) {

        const required =
            currentPizzaBorderComplement.minimo >
            0;


        if (
            required &&
            !currentPizzaBorderOption
        ) {

            return false;

        }

    }


    return (
        calculateCurrentPizzaFlavorPrice() >
        0 &&
        areProductComplementsComplete()
    );

}


/* ==================================================
   VALIDA CONFIGURAÇÃO DA PIZZA
   ================================================== */

function validatePizzaConfiguration() {

    if (
        !currentPizzaType
    ) {

        alert(
            "Escolha o tipo da pizza."
        );

        return false;

    }


    const minFlavors =
        Math.max(
            1,
            Number(
                currentPizzaType.minSabores || 1
            )
        );


    const maxFlavors =
        Math.max(
            minFlavors,
            Number(
                currentPizzaType.maxSabores || minFlavors
            )
        );


    const selectedFlavorCount =
        currentPizzaSelectedFlavors.length;


    if (
        selectedFlavorCount < minFlavors
    ) {

        alert(
            minFlavors === 1
                ? "Selecione pelo menos 1 sabor."
                : `Selecione pelo menos ${minFlavors} sabores.`
        );

        return false;

    }


    if (
        selectedFlavorCount > maxFlavors
    ) {

        alert(
            `Você pode escolher no máximo ${maxFlavors} ${
                maxFlavors === 1
                    ? "sabor"
                    : "sabores"
            }.`
        );

        return false;

    }


    currentPizzaFlavorCount =
        selectedFlavorCount;


    if (
        currentPizzaBorderComplement &&
        currentPizzaBorderComplement.minimo >
            0 &&
        !currentPizzaBorderOption
    ) {

        alert(
            `Escolha uma opção em "${currentPizzaBorderComplement.nome}".`
        );

        return false;

    }


    if (
        calculateCurrentPizzaFlavorPrice() <=
        0
    ) {

        alert(
            "Não foi possível calcular o preço desta pizza."
        );

        return false;

    }


    return true;

}


/* ==================================================
   NORMALIZA TEXTO
   ================================================== */

function normalizePizzaText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLocaleLowerCase(
            "pt-BR"
        )
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* ==================================================
   ESCAPA HTML
   ================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==================================================
   TEXTO PARA WHATSAPP
   ================================================== */

function escapeWhatsAppText(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /%/g,
            "%25"
        )
        .replace(
            /\r?\n/g,
            "%0A"
        )
        .replace(
            /&/g,
            "%26"
        );

}


/* ==================================================
   ESTILOS DO CONFIGURADOR
   ================================================== */

function injectPizzaConfiguratorStyles() {

    if (
        document.getElementById(
            "pizzaConfiguratorStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "pizzaConfiguratorStyles";


    style.textContent = `

        .pizza-configurator {
            margin-top: 6px;
        }

        .pizza-step {
            margin-bottom: 18px;
            padding: 16px;
            border: 1px solid #e7e7e7;
            border-radius: 14px;
            background: #fff;
        }

        .pizza-step-hidden {
            display: none;
        }

        .pizza-step-header {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 14px;
        }

        .pizza-step-number {
            flex: 0 0 auto;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--primary);
            color: #fff;
            font-size: 13px;
            font-weight: 700;
        }

        .pizza-step-header h3 {
            margin: 2px 0 3px;
            font-size: 17px;
            line-height: 1.2;
        }

        .pizza-step-header p {
            margin: 0;
            color: #777;
            font-size: 13px;
            line-height: 1.4;
        }

        .pizza-option-grid {
            display: grid;
            grid-template-columns:
                repeat(
                    auto-fit,
                    minmax(
                        130px,
                        1fr
                    )
                );
            gap: 9px;
        }

        .pizza-option-card {
            position: relative;
            display: flex;
            align-items: stretch;
            cursor: pointer;
        }

        .pizza-option-card input {
            position: absolute;
            opacity: 0;
        }

        .pizza-option-card span {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 11px;
            background: #fff;
            transition: .15s ease;
        }

        .pizza-option-card strong {
            display: block;
            font-size: 14px;
            color: var(--text);
        }

        .pizza-option-card small {
            display: block;
            margin-top: 4px;
            color: #777;
            font-size: 12px;
        }

        .pizza-option-card input:checked + span {
            border-color: var(--primary);
            background: #fafafa;
            box-shadow:
                0 0 0 1px
                var(--primary);
        }

        .pizza-option-list {
            display: flex;
            flex-direction: column;
            gap: 7px;
        }

        .pizza-radio-option,
        .pizza-checkbox-option {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 12px;
            border: 1px solid #e5e5e5;
            border-radius: 10px;
            cursor: pointer;
            background: #fff;
        }

        .pizza-radio-option:hover,
        .pizza-checkbox-option:hover {
            background: #fafafa;
        }

        .pizza-radio-option input,
        .pizza-checkbox-option input {
            flex: 0 0 auto;
        }

        .pizza-radio-option span,
        .pizza-checkbox-option span {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            width: 100%;
        }

        .pizza-flavor-option-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
            min-width: 0;
            flex: 1;
        }

        .pizza-flavor-option-info em {
            color: #777;
            font-size: 11px;
            line-height: 1.35;
            font-style: normal;
        }


        .pizza-radio-option strong,
        .pizza-checkbox-option strong {
            font-size: 14px;
            color: var(--text);
        }

        .pizza-radio-option small,
        .pizza-checkbox-option small {
            color: var(--primary);
            font-size: 13px;
            font-weight: 600;
            white-space: nowrap;
        }

        .pizza-config-error {
            padding: 12px;
            border-radius: 10px;
            background: #fff5f3;
            color: var(--primary);
            font-size: 13px;
            line-height: 1.4;
        }

        .pizza-extras-container {
            display: block;
        }

        .pizza-step .product-complement-group {
            margin-bottom: 10px;
            padding: 10px;
            border:
                1px solid #ededed;
            border-radius: 10px;
        }

        .pizza-step .product-complement-group:last-child {
            margin-bottom: 0;
        }


        .cart-pizza-details {
            margin-top: 7px;
            padding: 8px 10px;
            border-left:
                3px solid
                var(--primary);
            background: #fafafa;
            border-radius: 7px;
            font-size: 13px;
            line-height: 1.6;
        }

        @media (max-width: 480px) {

            .pizza-option-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );
            }

            .pizza-step {
                padding: 13px;
            }

            .pizza-radio-option,
            .pizza-checkbox-option {
                padding: 10px;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}

