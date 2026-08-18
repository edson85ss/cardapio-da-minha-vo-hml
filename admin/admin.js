/* ==================================================
   FIREBASE
   ================================================== */

import {
    auth,
    db
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
    orderBy
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


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

