/* ==================================================
   FIREBASE
   ================================================== */

import {
    auth,
    db,
    storage
}
from "../firebase-config.js";


import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc,
    addDoc,
    updateDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";


/* ==================================================
   ELEMENTOS
   ================================================== */

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");
	
const sidebarOverlay =
    document.getElementById("sidebarOverlay");
	
const productsList =
    document.getElementById("productsList");
	
const newProductButton =
    document.getElementById("newProductButton");

const productFormModal =
    document.getElementById("productFormModal");

const productModalOverlay =
    document.getElementById("productModalOverlay");

const closeProductModalButton =
    document.getElementById("closeProductModal");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");

const productFormTitle =
    document.getElementById("productFormTitle");

const productIdInput =
    document.getElementById("productId");

const productNameInput =
    document.getElementById("productName");

const productCategoryInput =
    document.getElementById("productCategory");

const productDescriptionInput =
    document.getElementById("productDescription");

const productPriceInput =
    document.getElementById("productPrice");

const productOrderInput =
    document.getElementById("productOrder");

const productImageInput =
    document.getElementById("productImage");

const productActiveInput =
    document.getElementById("productActive");

const productImagePreview =
    document.getElementById("productImagePreview");

const productImagePreviewWrapper =
    document.getElementById("productImagePreviewWrapper");

const productFormMessage =
    document.getElementById("productFormMessage");

const saveProductButton =
    document.getElementById("saveProductButton");
	
const categoryFilters =
    document.getElementById(
        "categoryFilters"
    );
	
/* ==================================================
   DADOS LOCAIS
   ================================================== */

let adminProducts = [];

let adminCategories = [];

let selectedCategoryId = "all";
	

/* ==================================================
   PROTEÇÃO DA PÁGINA
   ==================================================

   Se não houver usuário autenticado,
   volta para a tela de login.
   ================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        /*
         * Usuário autenticado:
         * pode carregar os produtos.
         */

        await loadCategoryFilters();

		await loadProducts();

    }
);


/* ==================================================
   MENU MOBILE
   ================================================== */

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.add("open");

        sidebarOverlay.classList.add("active");

    }
);

sidebarOverlay.addEventListener(
    "click",
    () => {

        sidebar.classList.remove("open");

        sidebarOverlay.classList.remove("active");

    }
);


/* ==================================================
   LOGOUT
   ================================================== */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.href =
                "index.html";

        }

        catch (error) {

            console.error(
                "Erro ao sair:",
                error
            );

        }

    }
);

newProductButton.addEventListener(
    "click",
    openProductForm
);

closeProductModalButton.addEventListener(
    "click",
    closeProductForm
);

cancelProductButton.addEventListener(
    "click",
    closeProductForm
);

productModalOverlay.addEventListener(
    "click",
    closeProductForm
);

productImageInput.addEventListener(
    "change",
    () => {

        const file =
            productImageInput.files[0];

        if (!file) return;

        const previewUrl =
            URL.createObjectURL(file);

        productImagePreview.src =
            previewUrl;

        productImagePreviewWrapper
            .classList.add("visible");

    }
);

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        productFormMessage.textContent =
            "";

        const price =
            parseBrazilianPrice(
                productPriceInput.value
            );
			
		const selectedCategory =
			adminCategories.find(
				category =>
					category.id ===
					productCategoryInput.value
			);


        if (
			!productNameInput.value.trim() ||
			!productCategoryInput.value ||
			Number.isNaN(price)
		) {

			productFormMessage.textContent =
				"Preencha os campos obrigatórios.";

			productFormMessage.className =
				"form-message error";

			return;

		}


        try {

            saveProductButton.disabled =
                true;

            saveProductButton.textContent =
                "Salvando...";


            const currentProductId =
                productIdInput.value;


            /*
             * NOVO PRODUTO
             */

            if (!currentProductId) {

                const documentReference =
                    await addDoc(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "produtos"
                        ),
                        {
                            nome:
                                productNameInput.value.trim(),

                            categoriaId:
								productCategoryInput.value,

							categoria:
								selectedCategory
									? selectedCategory.nome
									: "",

                            descricao:
                                productDescriptionInput.value.trim(),

                            preco:
                                price,

                            ordem:
                                Number(
                                    productOrderInput.value || 0
                                ),

                            ativo:
                                productActiveInput.checked,

                            imagemUrl:
                                ""
                        }
                    );


                const file =
                    productImageInput.files[0];


                if (file) {

                    const imageUrl =
                        await uploadProductImage(
                            file,
                            documentReference.id
                        );


                    await updateDoc(
                        documentReference,
                        {
                            imagemUrl:
                                imageUrl
                        }
                    );

                }

            }
			
			else {

				const productReference =
					doc(
						db,
						"lojas",
						"da-minha-vo",
						"produtos",
						currentProductId
					);


				const updateData = {

					nome:
						productNameInput.value.trim(),

					categoriaId:
						productCategoryInput.value,

					categoria:
						selectedCategory
							? selectedCategory.nome
							: "",

					descricao:
						productDescriptionInput.value.trim(),

					preco:
						price,

					ordem:
						Number(
							productOrderInput.value || 0
						),

					ativo:
						productActiveInput.checked

				};


				/*
				 * Nova imagem opcional
				 */

				const file =
					productImageInput.files[0];


				if (file) {

					const imageUrl =
						await uploadProductImage(
							file,
							currentProductId
						);

					updateData.imagemUrl =
						imageUrl;

				}


				await updateDoc(
					productReference,
					updateData
				);

			}


            /*
             * Depois implementaremos
             * a edição aqui.
             */


            closeProductForm();

            await loadProducts();

        }

        catch (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            productFormMessage.textContent =
                "Não foi possível salvar o produto.";

            productFormMessage.className =
                "form-message error";

        }

        finally {

            saveProductButton.disabled =
                false;

            saveProductButton.textContent =
                "Salvar produto";

        }

    }
);

/* ==================================================
   CARREGA CATEGORIAS PARA O FILTRO
   ================================================== */

async function loadCategoryFilters() {

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


        adminCategories = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                /*
                 * Apenas categorias ativas
                 */

                if (data.ativo === false) {
                    return;
                }


                adminCategories.push({
					id: documentSnapshot.id,
					nome: data.nome || "Sem nome"
				});

            }
        );


        renderCategoryFilters(
			adminCategories
		);

		populateProductCategorySelect();

    }

    catch (error) {

        console.error(
            "Erro ao carregar filtros:",
            error
        );

    }

}

/* ==================================================
   CARREGA PRODUTOS
   ================================================== */

async function loadProducts() {

    try {

        const productsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "produtos"
            );

        const productsQuery =
            query(
                productsReference,
                orderBy("ordem", "asc")
            );

        const snapshot =
            await getDocs(productsQuery);

        adminProducts = [];

        snapshot.forEach(
            documentSnapshot => {

                const product =
                    documentSnapshot.data();

                adminProducts.push({

                    id:
                        documentSnapshot.id,

                    ...product

                });

            }
        );

        renderAdminProducts();

    }

    catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        productsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Não foi possível carregar os produtos
                </h3>

                <p>
                    Verifique o console do navegador.
                </p>

            </div>
        `;

    }

}


/* ==================================================
   PREÇO EM REAL
   ================================================== */

function formatCurrency(value) {

    return value.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* ==================================================
   BOTÕES EDITAR
   ================================================== */

function setupEditButtons() {

    const buttons =
        document.querySelectorAll(
            ".edit-product-button"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    await openEditProductForm(
                        productId
                    );

                }
            );

        }
    );

}

function openProductForm() {

    productForm.reset();

    productIdInput.value = "";

    productActiveInput.checked = true;

    productImagePreviewWrapper
        .classList.remove("visible");

    productImagePreview.src = "";

    productFormMessage.textContent = "";

    productFormMessage.className =
        "form-message";

    productFormTitle.textContent =
        "Novo produto";

    productFormModal.classList.add(
        "open"
    );

}


function closeProductForm() {

    productFormModal.classList.remove(
        "open"
    );

}

function parseBrazilianPrice(value) {

    return Number(
        value
            .replace(/\./g, "")
            .replace(",", ".")
    );

}

async function uploadProductImage(
    file,
    productId
) {

    if (!file) {
        return null;
    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const fileName =
        `${Date.now()}.${extension}`;

    const imageReference =
        ref(
            storage,
            `lojas/da-minha-vo/produtos/${productId}/${fileName}`
        );

    await uploadBytes(
        imageReference,
        file
    );

    return await getDownloadURL(
        imageReference
    );

}

/* ==================================================
   RENDERIZA FILTROS
   ================================================== */

function renderCategoryFilters(
    categories
) {

    categoryFilters.innerHTML = "";


    /*
     * Botão TODOS
     */

    const allButton =
        document.createElement(
            "button"
        );


    allButton.className =
        "category-filter-button active";


    allButton.textContent =
        "Todos";


    allButton.dataset.id =
        "all";


    categoryFilters.appendChild(
        allButton
    );


    /*
     * Categorias
     */

    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-filter-button";


            button.textContent =
                category.nome;


            button.dataset.id =
                category.id;


            categoryFilters.appendChild(
                button
            );

        }
    );


    setupCategoryFilterButtons();

}

/* ==================================================
   CLIQUE NOS FILTROS
   ================================================== */

function setupCategoryFilterButtons() {

    const buttons =
        document.querySelectorAll(
            ".category-filter-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {


                    /*
                     * Remove seleção anterior
                     */

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Marca botão atual
                     */

                    button.classList.add(
                        "active"
                    );


                    selectedCategoryId =
                        button.dataset.id;


                    /*
                     * Atualiza somente a interface.
                     * Nenhuma nova leitura Firestore.
                     */

                    renderAdminProducts();

                }
            );

        }
    );

}

/* ==================================================
   RENDERIZA PRODUTOS
   ================================================== */

function renderAdminProducts() {

    productsList.innerHTML = "";


    let filteredProducts =
        adminProducts;


    /*
     * Aplica filtro somente se
     * não estiver em "Todos".
     */

    if (
        selectedCategoryId !== "all"
    ) {

        filteredProducts =
            adminProducts.filter(
                product => {

                    return (
                        product.categoriaId ===
                        selectedCategoryId
                    );

                }
            );

    }


    /*
     * Nenhum produto encontrado
     */

    if (
        filteredProducts.length === 0
    ) {

        productsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🍽️
                </div>

                <h3>
                    Nenhum produto encontrado
                </h3>

                <p>
                    Não há produtos nesta categoria.
                </p>

            </div>
        `;

        return;

    }


    filteredProducts.forEach(
        product => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-product-item";


            item.innerHTML = `

                <div class="admin-product-image">

                    ${
                        product.imagemUrl
                        ?
                        `<img
                            src="${product.imagemUrl}"
                            alt="${product.nome || "Produto"}"
                        >`
                        :
                        `<div class="image-placeholder">
                            🍽️
                        </div>`
                    }

                </div>


                <div class="admin-product-info">

                    <div class="product-title-row">

                        <div>

                            <h3>
                                ${product.nome || "Sem nome"}
                            </h3>

                            <span class="product-category">
                                ${product.categoria || "Sem categoria"}
                            </span>

                        </div>


                        <span class="
                            product-status
                            ${product.ativo === false ? "inactive" : "active"}
                        ">

                            ${
                                product.ativo === false
                                ? "Inativo"
                                : "Ativo"
                            }

                        </span>

                    </div>


                    <div class="product-bottom-row">

                        <strong class="admin-product-price">

                            ${formatCurrency(
                                Number(
                                    product.preco || 0
                                )
                            )}

                        </strong>


                        <button
                            class="edit-product-button"
                            data-id="${product.id}"
                        >
                            Editar
                        </button>

                    </div>

                </div>

            `;


            productsList.appendChild(
                item
            );

        }
    );


    setupEditButtons();

}

function populateProductCategorySelect() {

    productCategoryInput.innerHTML = `
        <option value="">
            Selecione uma categoria
        </option>
    `;

    adminCategories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category.id;

            option.textContent =
                category.nome;

            productCategoryInput.appendChild(
                option
            );

        }
    );

}

async function openEditProductForm(
    productId
) {

    try {

        const productReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                productId
            );

        const snapshot =
            await getDoc(
                productReference
            );

        if (!snapshot.exists()) {

            alert(
                "Produto não encontrado."
            );

            return;

        }

        const product =
            snapshot.data();


        productForm.reset();

        productIdInput.value =
            productId;

        productNameInput.value =
            product.nome || "";

        productCategoryInput.value =
            product.categoriaId || "";

        productDescriptionInput.value =
            product.descricao || "";

        productPriceInput.value =
            Number(
                product.preco || 0
            )
            .toFixed(2)
            .replace(".", ",");

        productOrderInput.value =
            product.ordem || 0;

        productActiveInput.checked =
            product.ativo !== false;


        /*
         * Imagem atual
         */

        if (product.imagemUrl) {

            productImagePreview.src =
                product.imagemUrl;

            productImagePreviewWrapper
                .classList.add(
                    "visible"
                );

        }

        else {

            productImagePreview.src =
                "";

            productImagePreviewWrapper
                .classList.remove(
                    "visible"
                );

        }


        productFormTitle.textContent =
            "Editar produto";

        productFormMessage.textContent =
            "";

        productFormMessage.className =
            "form-message";


        productFormModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir produto:",
            error
        );

        alert(
            "Não foi possível carregar o produto."
        );

    }

}