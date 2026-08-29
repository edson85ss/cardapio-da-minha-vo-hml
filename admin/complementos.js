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
    deleteDoc
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


/* ==================================================
   ELEMENTOS
   ================================================== */

const sidebar =
    document.getElementById(
        "sidebar"
    );

const sidebarOverlay =
    document.getElementById(
        "sidebarOverlay"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const complementsList =
    document.getElementById(
        "complementsList"
    );

const newComplementButton =
    document.getElementById(
        "newComplementButton"
    );

const complementModal =
    document.getElementById(
        "complementModal"
    );

const complementModalOverlay =
    document.getElementById(
        "complementModalOverlay"
    );

const closeComplementModalButton =
    document.getElementById(
        "closeComplementModal"
    );

const cancelComplementButton =
    document.getElementById(
        "cancelComplementButton"
    );

const complementForm =
    document.getElementById(
        "complementForm"
    );

const complementFormTitle =
    document.getElementById(
        "complementFormTitle"
    );

const complementIdInput =
    document.getElementById(
        "complementId"
    );

const complementNameInput =
    document.getElementById(
        "complementName"
    );

const complementTypeInput =
    document.getElementById(
        "complementType"
    );

const complementMinInput =
    document.getElementById(
        "complementMin"
    );

const complementMaxInput =
    document.getElementById(
        "complementMax"
    );

const complementActiveInput =
    document.getElementById(
        "complementActive"
    );

const complementFormMessage =
    document.getElementById(
        "complementFormMessage"
    );

const saveComplementButton =
    document.getElementById(
        "saveComplementButton"
    );


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

        await loadComplements();

    }
);


/* ==================================================
   MENU MOBILE
   ================================================== */

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.add(
            "open"
        );

        sidebarOverlay.classList.add(
            "active"
        );

    }
);


sidebarOverlay.addEventListener(
    "click",
    () => {

        sidebar.classList.remove(
            "open"
        );

        sidebarOverlay.classList.remove(
            "active"
        );

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
   CARREGA COMPLEMENTOS
   ================================================== */

async function loadComplements() {

    try {

        const complementsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "complementos"
            );


        const complementsQuery =
            query(
                complementsReference,
                orderBy(
                    "ordem",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                complementsQuery
            );


        complementsList.innerHTML =
            "";


        if (snapshot.empty) {

            complementsList.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        ＋
                    </div>

                    <h3>
                        Nenhum complemento cadastrado
                    </h3>

                    <p>
                        Clique em "Novo complemento" para começar.
                    </p>

                </div>
            `;

            return;

        }


        snapshot.forEach(
            documentSnapshot => {

                const complement =
                    documentSnapshot.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "admin-complement-item";


                let typeLabel =
                    "Escolha única";


                if (
                    complement.tipo ===
                    "multipla"
                ) {

                    typeLabel =
                        "Múltipla escolha";

                }


                if (
                    complement.tipo ===
                    "quantidade"
                ) {

                    typeLabel =
                        "Quantidades";

                }


                item.innerHTML = `

                    <div class="admin-complement-info">

                        <h3>
                            ${complement.nome || "Sem nome"}
                        </h3>

                        <div class="admin-complement-meta">

                            ${typeLabel}
                            · mínimo ${complement.minimo ?? 0}
                            · máximo ${complement.maximo ?? 1}

                        </div>

                    </div>


                    <span class="
                        product-status
                        ${complement.ativo === false ? "inactive" : "active"}
                    ">

                        ${
                            complement.ativo === false
                            ? "Inativo"
                            : "Ativo"
                        }

                    </span>


                    <div class="admin-complement-actions">

                        <button
                            type="button"
                            class="edit-product-button edit-complement-button"
                            data-id="${documentSnapshot.id}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="delete-product-button delete-complement-button"
                            data-id="${documentSnapshot.id}"
                            data-name="${complement.nome || ""}"
                        >
                            Excluir
                        </button>

                    </div>

                `;


                complementsList
                    .appendChild(
                        item
                    );

            }
        );


        setupComplementButtons();

    }

    catch (error) {

        console.error(
            "Erro ao carregar complementos:",
            error
        );

    }

}


/* ==================================================
   NOVO
   ================================================== */

newComplementButton.addEventListener(
    "click",
    () => {

        complementForm.reset();

        complementIdInput.value =
            "";

        complementTypeInput.value =
            "unica";

        complementMinInput.value =
            0;

        complementMaxInput.value =
            1;

        complementActiveInput.checked =
            true;

        complementFormTitle.textContent =
            "Novo complemento";

        complementFormMessage.textContent =
            "";

        complementModal.classList.add(
            "open"
        );

    }
);


/* ==================================================
   FECHAR
   ================================================== */

function closeComplementForm() {

    complementModal.classList.remove(
        "open"
    );

}


closeComplementModalButton
    .addEventListener(
        "click",
        closeComplementForm
    );


cancelComplementButton
    .addEventListener(
        "click",
        closeComplementForm
    );


complementModalOverlay
    .addEventListener(
        "click",
        closeComplementForm
    );


/* ==================================================
   SALVAR
   ================================================== */

complementForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            complementNameInput
                .value
                .trim();


        const minimum =
            Number(
                complementMinInput.value
            );


        const maximum =
            Number(
                complementMaxInput.value
            );


        if (!name) {

            complementFormMessage
                .textContent =
                "Informe o nome.";

            complementFormMessage
                .className =
                "form-message error";

            return;

        }


        if (
            minimum < 0 ||
            maximum < 1 ||
            minimum > maximum
        ) {

            complementFormMessage
                .textContent =
                "Confira os valores mínimo e máximo.";

            complementFormMessage
                .className =
                "form-message error";

            return;

        }


        try {

            saveComplementButton.disabled =
                true;

            saveComplementButton.textContent =
                "Salvando...";


            const complementId =
                complementIdInput.value;


            const data = {

                nome:
                    name,

                tipo:
                    complementTypeInput.value,

                minimo:
                    minimum,

                maximo:
                    maximum,

                ativo:
                    complementActiveInput.checked

            };


            if (complementId) {

                const reference =
                    doc(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "complementos",
                        complementId
                    );


                await updateDoc(
                    reference,
                    data
                );

            }

            else {

                const current =
                    await getDocs(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "complementos"
                        )
                    );


                data.ordem =
                    current.size + 1;


                await addDoc(
                    collection(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "complementos"
                    ),
                    data
                );

            }


            closeComplementForm();

            await loadComplements();

        }

        catch (error) {

            console.error(
                "Erro ao salvar complemento:",
                error
            );


            complementFormMessage
                .textContent =
                "Não foi possível salvar.";

            complementFormMessage
                .className =
                "form-message error";

        }

        finally {

            saveComplementButton.disabled =
                false;

            saveComplementButton.textContent =
                "Salvar complemento";

        }

    }
);


/* ==================================================
   BOTÕES
   ================================================== */

function setupComplementButtons() {

    document
        .querySelectorAll(
            ".edit-complement-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await openEditComplement(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-complement-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deleteComplement(
                            button.dataset.id,
                            button.dataset.name
                        );

                    }
                );

            }
        );

}


/* ==================================================
   EDITAR
   ================================================== */

async function openEditComplement(
    complementId
) {

    const reference =
        doc(
            db,
            "lojas",
            "da-minha-vo",
            "complementos",
            complementId
        );


    const snapshot =
        await getDoc(
            reference
        );


    if (!snapshot.exists()) {
        return;
    }


    const data =
        snapshot.data();


    complementIdInput.value =
        complementId;

    complementNameInput.value =
        data.nome || "";

    complementTypeInput.value =
        data.tipo || "unica";

    complementMinInput.value =
        data.minimo ?? 0;

    complementMaxInput.value =
        data.maximo ?? 1;

    complementActiveInput.checked =
        data.ativo !== false;


    complementFormTitle.textContent =
        "Editar complemento";


    complementFormMessage.textContent =
        "";


    complementModal.classList.add(
        "open"
    );

}


/* ==================================================
   EXCLUIR
   ================================================== */

async function deleteComplement(
    complementId,
    complementName
) {

    const confirmed =
        confirm(
            `Deseja realmente excluir o complemento "${complementName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                complementId
            )
        );


        await loadComplements();

    }

    catch (error) {

        console.error(
            "Erro ao excluir complemento:",
            error
        );


        alert(
            "Não foi possível excluir o complemento."
        );

    }

}