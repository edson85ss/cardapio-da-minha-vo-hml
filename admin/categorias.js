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
    orderBy,
    addDoc,
    doc,
    getDoc,
    updateDoc,
	deleteDoc,
    where,
    limit
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


/* ==================================================
   ELEMENTOS
   ================================================== */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");

const categoriesList =
    document.getElementById("categoriesList");

const newCategoryButton =
    document.getElementById("newCategoryButton");

const categoryModal =
    document.getElementById("categoryModal");

const categoryModalOverlay =
    document.getElementById("categoryModalOverlay");

const closeCategoryModal =
    document.getElementById("closeCategoryModal");

const cancelCategoryButton =
    document.getElementById("cancelCategoryButton");

const categoryForm =
    document.getElementById("categoryForm");

const categoryFormTitle =
    document.getElementById("categoryFormTitle");

const categoryIdInput =
    document.getElementById("categoryId");

const categoryNameInput =
    document.getElementById("categoryName");

const categoryActiveInput =
    document.getElementById("categoryActive");

const categoryFormMessage =
    document.getElementById("categoryFormMessage");

const saveCategoryButton =
    document.getElementById("saveCategoryButton");


/* ==================================================
   AUTENTICAÇÃO
   ================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }

        await loadCategories();

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

        await signOut(auth);

        window.location.href =
            "index.html";

    }
);


/* ==================================================
   CARREGA CATEGORIAS
   ================================================== */

async function loadCategories() {

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
            await getDocs(categoriesQuery);

        categoriesList.innerHTML = "";


        if (snapshot.empty) {

            categoriesList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ☷
                    </div>

                    <h3>
                        Nenhuma categoria cadastrada
                    </h3>

                    <p>
                        Clique em "Nova categoria" para começar.
                    </p>

                </div>
            `;

            return;

        }


        snapshot.forEach(
            documentSnapshot => {

                const category =
                    documentSnapshot.data();

                const categoryId =
                    documentSnapshot.id;

                const item =
                    document.createElement("div");

                item.className =
                    "admin-category-item";

                item.innerHTML = `

                    <div>

                        <h3>
                            ${category.nome || "Sem nome"}
                        </h3>

                        <span class="
                            product-status
                            ${category.ativo === false ? "inactive" : "active"}
                        ">
                            ${
                                category.ativo === false
                                ? "Inativa"
                                : "Ativa"
                            }
                        </span>

                    </div>

                    <div class="category-actions">

						<button
							class="edit-product-button edit-category-button"
							data-id="${categoryId}"
						>
							Editar
						</button>

						<button
							class="delete-category-button"
							data-id="${categoryId}"
							data-name="${category.nome || ""}"
						>
							Excluir
						</button>

					</div>

                `;

                categoriesList.appendChild(
                    item
                );

            }
        );


        setupCategoryEditButtons();
		setupCategoryDeleteButtons();

    }

    catch (error) {

        console.error(
            "Erro ao carregar categorias:",
            error
        );

    }

}


/* ==================================================
   NOVA CATEGORIA
   ================================================== */

function openNewCategoryModal() {

    categoryForm.reset();

    categoryIdInput.value = "";

    categoryActiveInput.checked =
        true;

    categoryFormTitle.textContent =
        "Nova categoria";

    categoryFormMessage.textContent =
        "";

    categoryModal.classList.add(
        "open"
    );

}


newCategoryButton.addEventListener(
    "click",
    openNewCategoryModal
);


/* ==================================================
   EDITAR CATEGORIA
   ================================================== */

function setupCategoryEditButtons() {

    const buttons =
        document.querySelectorAll(
            ".edit-category-button"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const categoryId =
                        button.dataset.id;

                    await openEditCategoryModal(
                        categoryId
                    );

                }
            );

        }
    );

}


async function openEditCategoryModal(
    categoryId
) {

    try {

        const categoryReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "categorias",
                categoryId
            );

        const snapshot =
            await getDoc(
                categoryReference
            );

        if (!snapshot.exists()) {
            return;
        }

        const category =
            snapshot.data();

        categoryIdInput.value =
            categoryId;

        categoryNameInput.value =
            category.nome || "";

        categoryActiveInput.checked =
            category.ativo !== false;

        categoryFormTitle.textContent =
            "Editar categoria";

        categoryFormMessage.textContent =
            "";

        categoryModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir categoria:",
            error
        );

    }

}


/* ==================================================
   FECHAR MODAL
   ================================================== */

function closeCategoryForm() {

    categoryModal.classList.remove(
        "open"
    );

}


closeCategoryModal.addEventListener(
    "click",
    closeCategoryForm
);

cancelCategoryButton.addEventListener(
    "click",
    closeCategoryForm
);

categoryModalOverlay.addEventListener(
    "click",
    closeCategoryForm
);


/* ==================================================
   SALVAR
   ================================================== */

categoryForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            categoryNameInput.value.trim();

        if (!name) {

            categoryFormMessage.textContent =
                "Informe o nome da categoria.";

            categoryFormMessage.className =
                "form-message error";

            return;

        }


        try {

            saveCategoryButton.disabled =
                true;

            saveCategoryButton.textContent =
                "Salvando...";


            const categoryId =
                categoryIdInput.value;


            if (categoryId) {

                const categoryReference =
                    doc(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "categorias",
                        categoryId
                    );

                await updateDoc(
                    categoryReference,
                    {
                        nome:
                            name,

                        ativo:
                            categoryActiveInput.checked
                    }
                );

            }

            else {

                /*
                 * Ordem automática simples:
                 * nova categoria vai para o final.
                 */

                const existingCategories =
                    await getDocs(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "categorias"
                        )
                    );

                await addDoc(
                    collection(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "categorias"
                    ),
                    {
                        nome:
                            name,

                        ativo:
                            categoryActiveInput.checked,

                        ordem:
                            existingCategories.size + 1
                    }
                );

            }


            closeCategoryForm();

            await loadCategories();

        }

        catch (error) {

            console.error(
                "Erro ao salvar categoria:",
                error
            );

            categoryFormMessage.textContent =
                "Não foi possível salvar a categoria.";

            categoryFormMessage.className =
                "form-message error";

        }

        finally {

            saveCategoryButton.disabled =
                false;

            saveCategoryButton.textContent =
                "Salvar categoria";

        }

    }
);

function setupCategoryDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-category-button"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const categoryId =
                        button.dataset.id;

                    const categoryName =
                        button.dataset.name;

                    await deleteCategory(
                        categoryId,
                        categoryName
                    );

                }
            );

        }
    );

}


async function deleteCategory(
    categoryId,
    categoryName
) {

    try {

        /*
         * Verifica se existe ao menos
         * um produto usando a categoria.
         */

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
                where(
                    "categoriaId",
                    "==",
                    categoryId
                ),
                limit(1)
            );

        const productsSnapshot =
            await getDocs(
                productsQuery
            );


        /*
         * Categoria em uso:
         * não permite excluir.
         */

        if (!productsSnapshot.empty) {

            alert(
                `A categoria "${categoryName}" não pode ser excluída porque possui produtos associados.`
            );

            return;

        }


        /*
         * Confirmação final.
         */

        const confirmed =
            confirm(
                `Deseja realmente excluir a categoria "${categoryName}"?`
            );

        if (!confirmed) {
            return;
        }


        const categoryReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "categorias",
                categoryId
            );


        await deleteDoc(
            categoryReference
        );


        /*
         * Atualiza a lista.
         */

        await loadCategories();

    }

    catch (error) {

        console.error(
            "Erro ao excluir categoria:",
            error
        );

        alert(
            "Não foi possível excluir a categoria."
        );

    }

}