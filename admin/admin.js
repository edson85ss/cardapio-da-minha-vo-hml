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


        if (
            !productNameInput.value.trim() ||
            !productCategoryInput.value.trim() ||
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

                            categoria:
                                productCategoryInput.value.trim(),

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

        productsList.innerHTML = "";


        if (snapshot.empty) {

            productsList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🍔
                    </div>

                    <h3>
                        Nenhum produto cadastrado
                    </h3>

                    <p>
                        Clique em "Novo produto" para começar.
                    </p>

                </div>
            `;

            return;

        }


        snapshot.forEach(
            documentSnapshot => {

                const product =
                    documentSnapshot.data();

                const productId =
                    documentSnapshot.id;

                const item =
                    document.createElement("div");

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
                                    Number(product.preco || 0)
                                )}

                            </strong>


                            <button
                                class="edit-product-button"
                                data-id="${productId}"
                            >
                                Editar
                            </button>

                        </div>

                    </div>

                `;


                productsList.appendChild(item);

            }
        );


        setupEditButtons();

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
                () => {

                    const productId =
                        button.dataset.id;

                    console.log(
                        "Editar produto:",
                        productId
                    );

                    /*
                     * Na próxima etapa
                     * abriremos o formulário
                     * deste produto.
                     */

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

