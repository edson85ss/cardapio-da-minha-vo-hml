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
    setDoc,
    updateDoc,
    writeBatch
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


/* ==================================================
   CONSTANTES
   ================================================== */

const STORE_ID =
    "da-minha-vo";


/* ==================================================
   ELEMENTOS - MENU
   ================================================== */

const sidebar =
    document.getElementById("sidebar");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");


/* ==================================================
   ELEMENTOS - ABAS
   ================================================== */

const pizzaTabs =
    document.querySelectorAll(
        ".pizza-tab"
    );

const pizzaPanels = {

    configuracao:
        document.getElementById(
            "pizzaPanelConfiguracao"
        ),

    tipos:
        document.getElementById(
            "pizzaPanelTipos"
        ),

    sabores:
        document.getElementById(
            "pizzaPanelSabores"
        )

};


/* ==================================================
   ELEMENTOS - CONFIGURAÇÃO
   ================================================== */

const pizzaConfigForm =
    document.getElementById(
        "pizzaConfigForm"
    );

const pizzaModuleActiveInput =
    document.getElementById(
        "pizzaModuleActive"
    );

const pizzaPricingRuleInput =
    document.getElementById(
        "pizzaPricingRule"
    );

const pizzaConfigMessage =
    document.getElementById(
        "pizzaConfigMessage"
    );

const savePizzaConfigButton =
    document.getElementById(
        "savePizzaConfigButton"
    );


/* ==================================================
   ELEMENTOS - TIPOS
   ================================================== */

const pizzaTypesList =
    document.getElementById(
        "pizzaTypesList"
    );

const newPizzaTypeButton =
    document.getElementById(
        "newPizzaTypeButton"
    );

const pizzaTypeModal =
    document.getElementById(
        "pizzaTypeModal"
    );

const pizzaTypeModalOverlay =
    document.getElementById(
        "pizzaTypeModalOverlay"
    );

const closePizzaTypeModal =
    document.getElementById(
        "closePizzaTypeModal"
    );

const cancelPizzaTypeButton =
    document.getElementById(
        "cancelPizzaTypeButton"
    );

const pizzaTypeForm =
    document.getElementById(
        "pizzaTypeForm"
    );

const pizzaTypeFormTitle =
    document.getElementById(
        "pizzaTypeFormTitle"
    );

const pizzaTypeIdInput =
    document.getElementById(
        "pizzaTypeId"
    );

const pizzaTypeNameInput =
    document.getElementById(
        "pizzaTypeName"
    );

const pizzaTypeMinFlavorsInput =
    document.getElementById(
        "pizzaTypeMinFlavors"
    );

const pizzaTypeMaxFlavorsInput =
    document.getElementById(
        "pizzaTypeMaxFlavors"
    );

const pizzaTypeActiveInput =
    document.getElementById(
        "pizzaTypeActive"
    );

const pizzaTypeFormMessage =
    document.getElementById(
        "pizzaTypeFormMessage"
    );

const savePizzaTypeButton =
    document.getElementById(
        "savePizzaTypeButton"
    );


/* ==================================================
   ESTADO
   ================================================== */

let pizzaTypes = [];


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


        await loadPizzariaConfig();

        await loadPizzaTypes();

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
   ABAS
   ================================================== */

pizzaTabs.forEach(
    tab => {

        tab.addEventListener(
            "click",
            () => {

                const target =
                    tab.dataset.tab;


                pizzaTabs.forEach(
                    item => {

                        item.classList.toggle(
                            "active",
                            item === tab
                        );

                    }
                );


                Object.entries(
                    pizzaPanels
                ).forEach(
                    ([key, panel]) => {

                        panel.classList.toggle(
                            "active",
                            key === target
                        );

                    }
                );

            }
        );

    }
);


/* ==================================================
   CARREGA CONFIGURAÇÃO
   ================================================== */

async function loadPizzariaConfig() {

    try {

        const configReference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "configuracao"
            );


        const snapshot =
            await getDoc(
                configReference
            );


        if (!snapshot.exists()) {

            pizzaModuleActiveInput.checked =
                true;

            pizzaPricingRuleInput.value =
                "maior";

            return;

        }


        const data =
            snapshot.data();


        pizzaModuleActiveInput.checked =
            data.ativo !== false;


        pizzaPricingRuleInput.value =
            data.regraCobrancaSabores === "media"
                ? "media"
                : "maior";

    }

    catch (error) {

        console.error(
            "Erro ao carregar configuração da pizzaria:",
            error
        );

        showMessage(
            pizzaConfigMessage,
            "Não foi possível carregar a configuração.",
            "error"
        );

    }

}


/* ==================================================
   SALVA CONFIGURAÇÃO
   ================================================== */

pizzaConfigForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            savePizzaConfigButton.disabled =
                true;

            savePizzaConfigButton.textContent =
                "Salvando...";


            const configReference =
                doc(
                    db,
                    "lojas",
                    STORE_ID,
                    "pizzaria",
                    "configuracao"
                );


            await setDoc(
                configReference,
                {
                    ativo:
                        pizzaModuleActiveInput.checked,

                    regraCobrancaSabores:
                        pizzaPricingRuleInput.value
                },
                {
                    merge: true
                }
            );


            showMessage(
                pizzaConfigMessage,
                "Configuração salva com sucesso.",
                "success"
            );

        }

        catch (error) {

            console.error(
                "Erro ao salvar configuração:",
                error
            );

            showMessage(
                pizzaConfigMessage,
                "Não foi possível salvar a configuração.",
                "error"
            );

        }

        finally {

            savePizzaConfigButton.disabled =
                false;

            savePizzaConfigButton.textContent =
                "Salvar configuração";

        }

    }
);


/* ==================================================
   CARREGA TIPOS
   ================================================== */

async function loadPizzaTypes() {

    try {

        const typesReference =
            collection(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "tiposPizza"
            );


        const typesQuery =
            query(
                typesReference,
                orderBy(
                    "ordem",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                typesQuery
            );


        pizzaTypes = [];


        snapshot.forEach(
            documentSnapshot => {

                pizzaTypes.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        pizzaTypes.sort(
            (a, b) =>
                Number(a.ordem || 0) -
                Number(b.ordem || 0)
        );


        renderPizzaTypes();

    }

    catch (error) {

        console.error(
            "Erro ao carregar tipos de pizza:",
            error
        );


        pizzaTypesList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Não foi possível carregar os tipos
                </h3>

                <p>
                    Verifique sua conexão e tente novamente.
                </p>

            </div>

        `;

    }

}


/* ==================================================
   RENDERIZA TIPOS
   ================================================== */

function renderPizzaTypes() {

    pizzaTypesList.innerHTML = "";


    if (pizzaTypes.length === 0) {

        pizzaTypesList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🍕
                </div>

                <h3>
                    Nenhum tipo cadastrado
                </h3>

                <p>
                    Clique em "Novo tipo" para começar.
                </p>

            </div>

        `;

        return;

    }


    pizzaTypes.forEach(
        (type, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "pizza-type-item";


            const min =
                Number(
                    type.minSabores || 1
                );

            const max =
                Number(
                    type.maxSabores || 1
                );


            let flavorText;


            if (min === max) {

                flavorText =
                    `${min} ${min === 1 ? "sabor" : "sabores"}`;

            }

            else {

                flavorText =
                    `${min} a ${max} sabores`;

            }


            const statusText =
                type.ativo === false
                    ? "Inativo"
                    : "Ativo";


            const statusClass =
                type.ativo === false
                    ? "inactive"
                    : "active";


            item.innerHTML = `

                <div class="pizza-type-order-controls">

                    <button
                        type="button"
                        class="pizza-type-order-button"
                        data-id="${type.id}"
                        data-direction="up"
                        ${index === 0 ? "disabled" : ""}
                        title="Subir"
                    >
                        ↑
                    </button>

                    <button
                        type="button"
                        class="pizza-type-order-button"
                        data-id="${type.id}"
                        data-direction="down"
                        ${
                            index === pizzaTypes.length - 1
                                ? "disabled"
                                : ""
                        }
                        title="Descer"
                    >
                        ↓
                    </button>

                </div>


                <div class="pizza-type-main">

                    <div>

                        <strong class="pizza-type-name">
                            ${escapeHtml(type.nome || "")}
                        </strong>


                        <div class="pizza-type-info">

                            ${flavorText}

                        </div>

                    </div>


                    <span
                        class="product-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div class="pizza-type-actions">

                    <button
                        type="button"
                        class="secondary-button pizza-edit-type"
                        data-id="${type.id}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="secondary-button pizza-toggle-type"
                        data-id="${type.id}"
                    >
                        ${
                            type.ativo === false
                                ? "Ativar"
                                : "Desativar"
                        }
                    </button>

                </div>

            `;


            pizzaTypesList.appendChild(
                item
            );

        }
    );


    bindPizzaTypeActions();

}


/* ==================================================
   AÇÕES DOS TIPOS
   ================================================== */

function bindPizzaTypeActions() {

    document
        .querySelectorAll(
            ".pizza-edit-type"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openPizzaTypeModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pizza-toggle-type"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await togglePizzaType(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pizza-type-order-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await reorderPizzaType(
                            button.dataset.id,
                            button.dataset.direction
                        );

                    }
                );

            }
        );

}


/* ==================================================
   NOVO TIPO
   ================================================== */

newPizzaTypeButton.addEventListener(
    "click",
    () => {

        openPizzaTypeModal();

    }
);


/* ==================================================
   ABRE MODAL
   ================================================== */

function openPizzaTypeModal(
    typeId = null
) {

    pizzaTypeForm.reset();


    pizzaTypeIdInput.value =
        "";


    pizzaTypeFormMessage.textContent =
        "";


    pizzaTypeFormTitle.textContent =
        typeId
            ? "Editar tipo de pizza"
            : "Novo tipo de pizza";


    pizzaTypeMinFlavorsInput.value =
        1;

    pizzaTypeMaxFlavorsInput.value =
        1;

    pizzaTypeActiveInput.checked =
        true;


    if (typeId) {

        const type =
            pizzaTypes.find(
                item =>
                    item.id === typeId
            );


        if (!type) {

            return;

        }


        pizzaTypeIdInput.value =
            type.id;

        pizzaTypeNameInput.value =
            type.nome || "";

        pizzaTypeMinFlavorsInput.value =
            Number(
                type.minSabores || 1
            );

        pizzaTypeMaxFlavorsInput.value =
            Number(
                type.maxSabores || 1
            );

        pizzaTypeActiveInput.checked =
            type.ativo !== false;

    }


    pizzaTypeModal.classList.add(
        "open"
    );


    setTimeout(
        () => {

            pizzaTypeNameInput.focus();

        },
        50
    );

}


/* ==================================================
   FECHA MODAL
   ================================================== */

function closePizzaTypeForm() {

    pizzaTypeModal.classList.remove(
        "open"
    );

}


closePizzaTypeModal.addEventListener(
    "click",
    closePizzaTypeForm
);


cancelPizzaTypeButton.addEventListener(
    "click",
    closePizzaTypeForm
);


pizzaTypeModalOverlay.addEventListener(
    "click",
    closePizzaTypeForm
);


/* ==================================================
   SALVA TIPO
   ================================================== */

pizzaTypeForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            pizzaTypeNameInput.value.trim();


        const min =
            Number(
                pizzaTypeMinFlavorsInput.value
            );


        const max =
            Number(
                pizzaTypeMaxFlavorsInput.value
            );


        if (!name) {

            showMessage(
                pizzaTypeFormMessage,
                "Informe o nome do tipo.",
                "error"
            );

            return;

        }


        if (
            !Number.isInteger(min) ||
            min < 1
        ) {

            showMessage(
                pizzaTypeFormMessage,
                "O mínimo de sabores deve ser um número inteiro maior que zero.",
                "error"
            );

            return;

        }


        if (
            !Number.isInteger(max) ||
            max < 1
        ) {

            showMessage(
                pizzaTypeFormMessage,
                "O máximo de sabores deve ser um número inteiro maior que zero.",
                "error"
            );

            return;

        }


        if (min > max) {

            showMessage(
                pizzaTypeFormMessage,
                "O mínimo não pode ser maior que o máximo.",
                "error"
            );

            return;

        }


        const duplicate =
            pizzaTypes.find(
                type =>
                    normalizeName(type.nome) ===
                    normalizeName(name) &&
                    type.id !==
                        pizzaTypeIdInput.value
            );


        if (duplicate) {

            showMessage(
                pizzaTypeFormMessage,
                "Já existe um tipo de pizza com este nome.",
                "error"
            );

            return;

        }


        try {

            savePizzaTypeButton.disabled =
                true;

            savePizzaTypeButton.textContent =
                "Salvando...";


            const typeId =
                pizzaTypeIdInput.value;


            const typeData = {

                nome:
                    name,

                minSabores:
                    min,

                maxSabores:
                    max,

                ativo:
                    pizzaTypeActiveInput.checked

            };


            if (typeId) {

                const reference =
                    doc(
                        db,
                        "lojas",
                        STORE_ID,
                        "pizzaria",
                        "tiposPizza",
                        typeId
                    );


                await updateDoc(
                    reference,
                    typeData
                );

            }

            else {

                const nextOrder =
                    pizzaTypes.length > 0

                        ? Math.max(
                            ...pizzaTypes.map(
                                type =>
                                    Number(
                                        type.ordem || 0
                                    )
                            )
                        ) + 1

                        : 1;


                await addDoc(
                    collection(
                        db,
                        "lojas",
                        STORE_ID,
                        "pizzaria",
                        "tiposPizza"
                    ),
                    {
                        ...typeData,
                        ordem:
                            nextOrder
                    }
                );

            }


            closePizzaTypeForm();

            await loadPizzaTypes();

        }

        catch (error) {

            console.error(
                "Erro ao salvar tipo de pizza:",
                error
            );


            showMessage(
                pizzaTypeFormMessage,
                "Não foi possível salvar o tipo.",
                "error"
            );

        }

        finally {

            savePizzaTypeButton.disabled =
                false;

            savePizzaTypeButton.textContent =
                "Salvar";

        }

    }
);


/* ==================================================
   ATIVA / DESATIVA
   ================================================== */

async function togglePizzaType(
    typeId
) {

    const type =
        pizzaTypes.find(
            item =>
                item.id === typeId
        );


    if (!type) {

        return;

    }


    try {

        const reference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "tiposPizza",
                typeId
            );


        await updateDoc(
            reference,
            {
                ativo:
                    type.ativo === false
            }
        );


        await loadPizzaTypes();

    }

    catch (error) {

        console.error(
            "Erro ao alterar status do tipo:",
            error
        );

        alert(
            "Não foi possível alterar o status do tipo."
        );

    }

}


/* ==================================================
   ORDENAÇÃO
   ================================================== */

async function reorderPizzaType(
    typeId,
    direction
) {

    const index =
        pizzaTypes.findIndex(
            type =>
                type.id === typeId
        );


    if (index === -1) {

        return;

    }


    const targetIndex =
        direction === "up"
            ? index - 1
            : index + 1;


    if (
        targetIndex < 0 ||
        targetIndex >= pizzaTypes.length
    ) {

        return;

    }


    const current =
        pizzaTypes[index];

    const target =
        pizzaTypes[targetIndex];


    try {

        const currentReference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "tiposPizza",
                current.id
            );


        const targetReference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "tiposPizza",
                target.id
            );


        const batch =
            writeBatch(db);


        batch.update(
            currentReference,
            {
                ordem:
                    Number(
                        target.ordem || 0
                    )
            }
        );


        batch.update(
            targetReference,
            {
                ordem:
                    Number(
                        current.ordem || 0
                    )
            }
        );


        await batch.commit();


        await loadPizzaTypes();

    }

    catch (error) {

        console.error(
            "Erro ao ordenar tipos:",
            error
        );

        alert(
            "Não foi possível alterar a ordem."
        );

    }

}


/* ==================================================
   UTILITÁRIOS
   ================================================== */

function normalizeName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLocaleLowerCase(
            "pt-BR"
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        );

}


function escapeHtml(
    value
) {

    return String(
        value || ""
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


function showMessage(
    element,
    message,
    type
) {

    element.textContent =
        message;

    element.className =
        `form-message ${type}`;

}