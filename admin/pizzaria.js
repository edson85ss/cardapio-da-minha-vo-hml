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
   ELEMENTOS - SABORES
   ================================================== */

const pizzaFlavorsList =
    document.getElementById(
        "pizzaFlavorsList"
    );

const newPizzaFlavorButton =
    document.getElementById(
        "newPizzaFlavorButton"
    );

const pizzaFlavorSearchInput =
    document.getElementById(
        "pizzaFlavorSearch"
    );

const downloadPizzaFlavorTemplateButton =
    document.getElementById(
        "downloadPizzaFlavorTemplateButton"
    );

const importPizzaFlavorCsvButton =
    document.getElementById(
        "importPizzaFlavorCsvButton"
    );

const pizzaFlavorCsvInput =
    document.getElementById(
        "pizzaFlavorCsvInput"
    );

const pizzaFlavorImportPanel =
    document.getElementById(
        "pizzaFlavorImportPanel"
    );

const closePizzaFlavorImportPanelButton =
    document.getElementById(
        "closePizzaFlavorImportPanelButton"
    );

const cancelPizzaFlavorImportButton =
    document.getElementById(
        "cancelPizzaFlavorImportButton"
    );

const confirmPizzaFlavorImportButton =
    document.getElementById(
        "confirmPizzaFlavorImportButton"
    );

const pizzaFlavorImportMessage =
    document.getElementById(
        "pizzaFlavorImportMessage"
    );

const pizzaFlavorImportSummary =
    document.getElementById(
        "pizzaFlavorImportSummary"
    );

const pizzaFlavorImportPreviewWrapper =
    document.getElementById(
        "pizzaFlavorImportPreviewWrapper"
    );

const pizzaFlavorImportPreviewHead =
    document.getElementById(
        "pizzaFlavorImportPreviewHead"
    );

const pizzaFlavorImportPreviewBody =
    document.getElementById(
        "pizzaFlavorImportPreviewBody"
    );

const pizzaFlavorModal =
    document.getElementById(
        "pizzaFlavorModal"
    );

const pizzaFlavorModalOverlay =
    document.getElementById(
        "pizzaFlavorModalOverlay"
    );

const closePizzaFlavorModal =
    document.getElementById(
        "closePizzaFlavorModal"
    );

const cancelPizzaFlavorButton =
    document.getElementById(
        "cancelPizzaFlavorButton"
    );

const pizzaFlavorForm =
    document.getElementById(
        "pizzaFlavorForm"
    );

const pizzaFlavorFormTitle =
    document.getElementById(
        "pizzaFlavorFormTitle"
    );

const pizzaFlavorIdInput =
    document.getElementById(
        "pizzaFlavorId"
    );

const pizzaFlavorNameInput =
    document.getElementById(
        "pizzaFlavorName"
    );

const pizzaFlavorDescriptionInput =
    document.getElementById(
        "pizzaFlavorDescription"
    );

const pizzaFlavorTypes =
    document.getElementById(
        "pizzaFlavorTypes"
    );

const pizzaFlavorActiveInput =
    document.getElementById(
        "pizzaFlavorActive"
    );

const pizzaFlavorFormMessage =
    document.getElementById(
        "pizzaFlavorFormMessage"
    );

const savePizzaFlavorButton =
    document.getElementById(
        "savePizzaFlavorButton"
    );


/* ==================================================
   ESTADO
   ================================================== */

let pizzaTypes = [];

let pizzaFlavors = [];

let pizzaFlavorImportPlan = null;

const MAX_PIZZA_FLAVOR_CSV_SIZE =
    2 * 1024 * 1024;

const MAX_PIZZA_FLAVOR_CSV_ROWS =
    1000;

const PIZZA_FLAVOR_IMPORT_BATCH_SIZE =
    400;


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
		
		await loadPizzaFlavors();

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
				"configuracao",
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
   CARREGA SABORES
   ================================================== */

async function loadPizzaFlavors() {

    try {

        const flavorsReference =
            collection(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "configuracao",
                "sabores"
            );


        const flavorsQuery =
            query(
                flavorsReference,
                orderBy(
                    "ordem",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                flavorsQuery
            );


        pizzaFlavors = [];


        snapshot.forEach(
            documentSnapshot => {

                pizzaFlavors.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        pizzaFlavors.sort(
            (a, b) =>
                Number(a.ordem || 0) -
                Number(b.ordem || 0)
        );


        renderPizzaFlavors();

    }

    catch (error) {

        console.error(
            "Erro ao carregar sabores de pizza:",
            error
        );


        pizzaFlavorsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Não foi possível carregar os sabores
                </h3>

                <p>
                    Verifique sua conexão e tente novamente.
                </p>

            </div>

        `;

    }

}

/* ==================================================
   RENDERIZA SABORES
   ================================================== */

function renderPizzaFlavors() {

    const search =
        normalizeName(
            pizzaFlavorSearchInput.value
        );


    pizzaFlavorsList.innerHTML =
        "";


    const filteredFlavors =
        pizzaFlavors.filter(
            flavor => {

                if (!search) {

                    return true;

                }


                return normalizeName(
                    flavor.nome
                ).includes(search);

            }
        );


    if (filteredFlavors.length === 0) {

        pizzaFlavorsList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🍕
                </div>

                <h3>

                    ${
                        search
                            ? "Nenhum sabor encontrado"
                            : "Nenhum sabor cadastrado"
                    }

                </h3>

                <p>

                    ${
                        search
                            ? "Tente outro termo de pesquisa."
                            : "Clique em \"Novo sabor\" para começar."
                    }

                </p>

            </div>

        `;

        return;

    }


    filteredFlavors.forEach(
        flavor => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "pizza-flavor-item";


            const prices =
                flavor.precosPorTipo || {};


            const configuredPrices =
                Object.keys(
                    prices
                ).length;


            const description =
                flavor.descricao
                    ? flavor.descricao
                    : "Sem descrição cadastrada";


            const statusText =
                flavor.ativo === false
                    ? "Inativo"
                    : "Ativo";


            const statusClass =
                flavor.ativo === false
                    ? "inactive"
                    : "active";


            const fullIndex =
                pizzaFlavors.findIndex(
                    current =>
                        current.id === flavor.id
                );


            item.innerHTML = `

                <div class="pizza-flavor-order-controls">

                    <button
                        type="button"
                        class="pizza-flavor-order-button"
                        data-id="${escapeHtml(flavor.id)}"
                        data-direction="up"
                        ${
                            fullIndex === 0
                                ? "disabled"
                                : ""
                        }
                        title="Subir"
                    >
                        ↑
                    </button>


                    <button
                        type="button"
                        class="pizza-flavor-order-button"
                        data-id="${escapeHtml(flavor.id)}"
                        data-direction="down"
                        ${
                            fullIndex ===
                            pizzaFlavors.length - 1
                                ? "disabled"
                                : ""
                        }
                        title="Descer"
                    >
                        ↓
                    </button>

                </div>


                <div class="pizza-flavor-main">

                    <div class="pizza-flavor-info">

                        <strong class="pizza-flavor-name">
                            ${escapeHtml(flavor.nome || "")}
                        </strong>


                        <span class="pizza-flavor-description">
                            ${escapeHtml(description)}
                        </span>


                        <span class="pizza-flavor-price-count">

                            ${configuredPrices}
                            ${
                                configuredPrices === 1
                                    ? "tipo com preço"
                                    : "tipos com preço"
                            }

                        </span>

                    </div>


                    <span
                        class="product-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div class="pizza-flavor-actions">

                    <button
                        type="button"
                        class="secondary-button pizza-edit-flavor"
                        data-id="${escapeHtml(flavor.id)}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="secondary-button pizza-toggle-flavor"
                        data-id="${escapeHtml(flavor.id)}"
                    >
                        ${
                            flavor.ativo === false
                                ? "Ativar"
                                : "Desativar"
                        }
                    </button>

                    <button
                        type="button"
                        class="delete-pizza-item-button pizza-delete-flavor"
                        data-id="${escapeHtml(flavor.id)}"
                        aria-label="Excluir sabor de pizza"
                    >
                        Excluir
                    </button>

                </div>

            `;


            pizzaFlavorsList.appendChild(
                item
            );

        }
    );


    bindPizzaFlavorActions();

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
                        data-id="${escapeHtml(type.id)}"
                        data-direction="up"
                        ${index === 0 ? "disabled" : ""}
                        title="Subir"
                    >
                        ↑
                    </button>

                    <button
                        type="button"
                        class="pizza-type-order-button"
                        data-id="${escapeHtml(type.id)}"
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
                        data-id="${escapeHtml(type.id)}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="secondary-button pizza-toggle-type"
                        data-id="${escapeHtml(type.id)}"
                    >
                        ${
                            type.ativo === false
                                ? "Ativar"
                                : "Desativar"
                        }
                    </button>

                    <button
                        type="button"
                        class="delete-pizza-item-button pizza-delete-type"
                        data-id="${escapeHtml(type.id)}"
                        aria-label="Excluir tipo de pizza"
                    >
                        Excluir
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
            ".pizza-delete-type"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deletePizzaType(
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
						"configuracao",
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
                        "configuracao",
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
				"configuracao",
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
   EXCLUI TIPO DE PIZZA
   ================================================== */

async function deletePizzaType(typeId) {

    const type = pizzaTypes.find(item => item.id === typeId);

    if (!type) return;

    let deactivatedForSafeCleanup = false;

    try {

        const [flavorsSnapshot, productsSnapshot] = await Promise.all([
            getDocs(collection(
                db,
                "lojas", STORE_ID,
                "pizzaria", "configuracao", "sabores"
            )),
            getDocs(collection(
                db,
                "lojas", STORE_ID,
                "produtos"
            ))
        ]);

        const products = productsSnapshot.docs.map(snapshot => ({
            id: snapshot.id,
            ...snapshot.data()
        }));

        const explicitlyLinkedProducts = products.filter(product => {
            if (product.tipoProduto !== "pizza") return false;
            const typeIds = product.pizzaria?.tiposPizzaIds;
            return Array.isArray(typeIds) && typeIds.length > 0 && typeIds.includes(typeId);
        });

        const blockingProducts = explicitlyLinkedProducts.filter(product =>
            product.pizzaria.tiposPizzaIds.filter(id => id !== typeId).length === 0
        );

        if (blockingProducts.length > 0) {
            const names = blockingProducts
                .slice(0, 5)
                .map(product => product.nome || product.id)
                .join(", ");
            const more = blockingProducts.length > 5
                ? ` e mais ${blockingProducts.length - 5}`
                : "";

            alert(
                `Não é possível excluir o tipo “${type.nome}” porque ele é o único tipo selecionado nestes produtos: ${names}${more}. ` +
                "Edite esses produtos e selecione outro tipo ou escolha ‘Todos os tipos ativos’; depois tente excluir novamente."
            );
            return;
        }

        const affectedFlavors = flavorsSnapshot.docs.filter(snapshot => {
            const prices = snapshot.data().precosPorTipo || {};
            return Object.prototype.hasOwnProperty.call(prices, typeId);
        });

        const affectedProducts = explicitlyLinkedProducts.length;

        const confirmation =
            `Excluir permanentemente o tipo de pizza “${type.nome}”?

` +
            `Esta ação removerá o tipo, o preço associado a ele em ${affectedFlavors.length} sabor(es) e atualizará ${affectedProducts} produto(s) que o selecionam explicitamente.

` +
            "Os pedidos históricos serão preservados. Esta ação não pode ser desfeita.";

        if (!window.confirm(confirmation)) return;

        const operations = [];

        for (const snapshot of affectedFlavors) {
            const data = snapshot.data();
            const prices = { ...(data.precosPorTipo || {}) };
            delete prices[typeId];

            operations.push({
                action: "update",
                ref: doc(
                    db,
                    "lojas", STORE_ID,
                    "pizzaria", "configuracao", "sabores", snapshot.id
                ),
                data: { precosPorTipo: prices }
            });
        }

        for (const product of explicitlyLinkedProducts) {
            const nextTypeIds = product.pizzaria.tiposPizzaIds.filter(id => id !== typeId);

            operations.push({
                action: "update",
                ref: doc(db, "lojas", STORE_ID, "produtos", product.id),
                data: {
                    pizzaria: {
                        ...product.pizzaria,
                        tiposPizzaIds: nextTypeIds
                    }
                }
            });
        }

        const typeReference = doc(
            db,
            "lojas", STORE_ID,
            "pizzaria", "configuracao", "tiposPizza", typeId
        );

        // For multi-batch deletion, hide the type before incremental cleanup.
        if (operations.length + 1 > 400) {
            await updateDoc(typeReference, { ativo: false });
            deactivatedForSafeCleanup = true;
        }

        operations.push({
            action: "delete",
            ref: typeReference
        });

        await commitPizzaWriteOperations(operations);
        await Promise.all([loadPizzaTypes(), loadPizzaFlavors()]);

        alert(`O tipo de pizza “${type.nome}” foi excluído. Os pedidos históricos foram preservados.`);

    } catch (error) {
        console.error("Erro ao excluir tipo de pizza:", error);
        alert(
            deactivatedForSafeCleanup
                ? "A exclusão não foi concluída. Por segurança, o tipo foi desativado para não aparecer com configurações parciais. Confira as associações e tente excluir novamente antes de reativá-lo. Os pedidos históricos não foram apagados."
                : "Não foi possível concluir a exclusão do tipo de pizza. Se a operação tiver sido interrompida, confira as configurações relacionadas e tente novamente. Os pedidos históricos não são apagados."
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
				"configuracao",
				"tiposPizza",
				current.id
			);


        const targetReference =
			doc(
				db,
				"lojas",
				STORE_ID,
				"pizzaria",
				"configuracao",
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
        value ?? ""
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

pizzaFlavorSearchInput.addEventListener(
    "input",
    () => {

        renderPizzaFlavors();

    }
);

/* ==================================================
   IMPORTAÇÃO DE SABORES VIA CSV
   ================================================== */

downloadPizzaFlavorTemplateButton.addEventListener(
    "click",
    downloadPizzaFlavorCsvTemplate
);

importPizzaFlavorCsvButton.addEventListener(
    "click",
    () => {

        openPizzaFlavorImportPanel();

        if (getActivePizzaTypes().length === 0) {

            showPizzaFlavorImportMessage(
                "Cadastre e ative pelo menos um tipo de pizza antes de importar sabores.",
                "error"
            );

            return;

        }

        pizzaFlavorCsvInput.click();

    }
);

pizzaFlavorCsvInput.addEventListener(
    "change",
    handlePizzaFlavorCsvSelection
);

closePizzaFlavorImportPanelButton.addEventListener(
    "click",
    closePizzaFlavorImportPanel
);

cancelPizzaFlavorImportButton.addEventListener(
    "click",
    closePizzaFlavorImportPanel
);

confirmPizzaFlavorImportButton.addEventListener(
    "click",
    importPizzaFlavorsFromCsv
);

function getActivePizzaTypes() {

    return pizzaTypes.filter(
        type => type.ativo !== false
    );

}

function openPizzaFlavorImportPanel() {

    pizzaFlavorImportPanel.hidden = false;

    pizzaFlavorImportPanel.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}

function closePizzaFlavorImportPanel() {

    if (confirmPizzaFlavorImportButton.disabled === false) {
        confirmPizzaFlavorImportButton.disabled = true;
    }

    pizzaFlavorImportPlan = null;
    pizzaFlavorCsvInput.value = "";
    pizzaFlavorImportPanel.hidden = true;
    pizzaFlavorImportMessage.textContent = "";
    pizzaFlavorImportMessage.className = "form-message";
    pizzaFlavorImportSummary.textContent = "";
    pizzaFlavorImportPreviewHead.innerHTML = "";
    pizzaFlavorImportPreviewBody.innerHTML = "";
    pizzaFlavorImportPreviewWrapper.hidden = true;
    confirmPizzaFlavorImportButton.textContent = "Importar sabores válidos";
}

function showPizzaFlavorImportMessage(message, type = "") {

    pizzaFlavorImportMessage.textContent = message;
    pizzaFlavorImportMessage.className = type
        ? `form-message ${type}`
        : "form-message";

}

function downloadPizzaFlavorCsvTemplate() {

    const activeTypes = getActivePizzaTypes();

    if (activeTypes.length === 0) {

        openPizzaFlavorImportPanel();
        showPizzaFlavorImportMessage(
            "Cadastre e ative pelo menos um tipo de pizza antes de baixar o modelo.",
            "error"
        );
        return;

    }

    const headers = [
        "nome",
        "descricao",
        ...activeTypes.map(
            type => `preco - ${type.nome}`
        )
    ];

    const csv = "\uFEFF" + headers
        .map(csvEscapeField)
        .join(";") + "\r\n";

    const blob = new Blob(
        [csv],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-sabores-pizzaria.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(
        () => URL.revokeObjectURL(url),
        1000
    );

}

function csvEscapeField(value) {

    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;

}

async function handlePizzaFlavorCsvSelection() {

    const file = pizzaFlavorCsvInput.files?.[0];

    if (!file) {
        return;
    }

    // Permite selecionar novamente o mesmo arquivo após uma validação com erro.
    pizzaFlavorCsvInput.value = "";

    openPizzaFlavorImportPanel();
    pizzaFlavorImportPlan = null;
    confirmPizzaFlavorImportButton.disabled = true;
    pizzaFlavorImportPreviewWrapper.hidden = true;
    pizzaFlavorImportSummary.textContent = "";
    pizzaFlavorImportPreviewHead.innerHTML = "";
    pizzaFlavorImportPreviewBody.innerHTML = "";
    showPizzaFlavorImportMessage("Validando arquivo...", "");

    try {

        if (!file.name.toLocaleLowerCase("pt-BR").endsWith(".csv")) {
            throw new Error("Selecione um arquivo com extensão .csv.");
        }

        if (file.size > MAX_PIZZA_FLAVOR_CSV_SIZE) {
            throw new Error("O arquivo excede o limite de 2 MB.");
        }

        const csvText = (await file.text()).replace(/^\uFEFF/, "");
        const records = parseSemicolonCsv(csvText)
            .filter(row => row.some(cell => String(cell).trim() !== ""));

        if (records.length < 2) {
            throw new Error("O CSV precisa conter o cabeçalho e pelo menos uma linha de sabor.");
        }

        const activeTypes = getActivePizzaTypes();
        if (activeTypes.length === 0) {
            throw new Error("Cadastre e ative pelo menos um tipo de pizza antes de importar sabores.");
        }

        const header = records[0].map(cell => String(cell).trim());
        const mappedColumns = validatePizzaFlavorCsvHeader(header, activeTypes);
        const dataRecords = records.slice(1);

        if (dataRecords.length > MAX_PIZZA_FLAVOR_CSV_ROWS) {
            throw new Error(`O arquivo contém ${dataRecords.length} linhas de dados. O limite por importação é ${MAX_PIZZA_FLAVOR_CSV_ROWS} sabores; divida o arquivo em partes menores.`);
        }

        const existingNames = new Set(
            pizzaFlavors.map(flavor => normalizeName(flavor.nome))
        );
        const seenFileNames = new Set();

        const rows = dataRecords.map((cells, index) => {

            const rowNumber = index + 2;
            const errors = [];

            if (cells.length !== header.length) {
                errors.push(`A linha tem ${cells.length} colunas; eram esperadas ${header.length}.`);
            }

            const name = String(cells[0] ?? "").trim();
            const description = String(cells[1] ?? "").trim();
            const prices = {};
            const rawPricesByType = {};

            if (!name) {
                errors.push("Informe o nome do sabor.");
            } else if (name.length > 80) {
                errors.push("O nome excede o limite de 80 caracteres.");
            }

            if (description.length > 500) {
                errors.push("A descrição excede o limite de 500 caracteres.");
            }

            const normalizedName = normalizeName(name);
            if (normalizedName && existingNames.has(normalizedName)) {
                errors.push("Já existe um sabor com este nome no cadastro.");
            }
            if (normalizedName && seenFileNames.has(normalizedName)) {
                errors.push("Este nome aparece mais de uma vez no arquivo.");
            }
            if (normalizedName) {
                seenFileNames.add(normalizedName);
            }

            let configuredPriceCount = 0;

            mappedColumns.forEach(({ type, columnIndex }) => {

                const rawPrice = String(cells[columnIndex] ?? "").trim();
                rawPricesByType[type.id] = rawPrice;

                if (!rawPrice) {
                    return;
                }

                const parsedPrice = parseCsvBrazilianPrice(rawPrice);

                if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
                    errors.push(`Preço inválido para o tipo "${type.nome}".`);
                    return;
                }

                prices[type.id] = roundPizzaMoney(parsedPrice);
                configuredPriceCount++;

            });

            if (configuredPriceCount === 0) {
                errors.push("Informe um preço válido em pelo menos um tipo de pizza.");
            }

            return {
                rowNumber,
                nome: name,
                descricao: description,
                precosPorTipo: prices,
                rawPricesByType,
                status: errors.length === 0 ? "valid" : "error",
                message: errors.join(" ")
            };

        });

        if (rows.length === 0) {
            throw new Error("Não foram encontradas linhas de sabores para importar.");
        }

        pizzaFlavorImportPlan = {
            rows,
            activeTypeIds: activeTypes.map(type => type.id).sort(),
            fileName: file.name
        };

        renderPizzaFlavorCsvPreview(rows, activeTypes);

        const validCount = rows.filter(row => row.status === "valid").length;
        const invalidCount = rows.length - validCount;

        pizzaFlavorImportSummary.textContent =
            `${validCount} sabor(es) pronto(s) para importar. ${invalidCount} linha(s) com erro serão ignoradas. Os sabores já existentes não serão sobrescritos.`;

        showPizzaFlavorImportMessage(
            validCount > 0
                ? "Arquivo validado. Confira a prévia antes de confirmar."
                : "Nenhuma linha válida para importar. Corrija o arquivo e tente novamente.",
            validCount > 0 ? "success" : "error"
        );

        confirmPizzaFlavorImportButton.disabled = validCount === 0;
        confirmPizzaFlavorImportButton.textContent = validCount > 0
            ? `Importar ${validCount} sabor(es) válido(s)`
            : "Importar sabores válidos";

    } catch (error) {

        console.error("Erro ao validar CSV de sabores:", error);
        pizzaFlavorImportPlan = null;
        showPizzaFlavorImportMessage(
            error.message || "Não foi possível ler o arquivo CSV.",
            "error"
        );

    }

}

function validatePizzaFlavorCsvHeader(header, activeTypes) {

    if (header.length < 3) {
        throw new Error("O cabeçalho deve conter nome, descricao e pelo menos uma coluna de preço por tipo de pizza.");
    }

    if (normalizeName(header[0]) !== "nome") {
        throw new Error('A primeira coluna deve se chamar "nome". Baixe um novo modelo CSV se necessário.');
    }

    if (normalizeName(header[1]) !== "descricao") {
        throw new Error('A segunda coluna deve se chamar "descricao". Baixe um novo modelo CSV se necessário.');
    }

    const typesByName = new Map(
        activeTypes.map(type => [normalizeName(type.nome), type])
    );
    const mappedColumns = [];
    const seenTypeIds = new Set();
    const unknownTypes = [];

    header.slice(2).forEach((columnName, index) => {

        const match = String(columnName).trim().match(/^preco\s*-\s*(.+)$/i);

        if (!match) {
            unknownTypes.push(columnName || `(coluna ${index + 3})`);
            return;
        }

        const normalizedTypeName = normalizeName(match[1]);
        const type = typesByName.get(normalizedTypeName);

        if (!type) {
            unknownTypes.push(match[1]);
            return;
        }

        if (seenTypeIds.has(type.id)) {
            throw new Error(`A coluna de preço do tipo "${type.nome}" aparece mais de uma vez.`);
        }

        seenTypeIds.add(type.id);
        mappedColumns.push({
            type,
            columnIndex: index + 2
        });

    });

    if (unknownTypes.length > 0) {
        throw new Error(`O arquivo contém colunas de tipo desconhecido ou formato incorreto: ${unknownTypes.join(", ")}. Baixe um novo modelo para usar os tipos atualmente ativos.`);
    }

    const missingTypes = activeTypes.filter(type => !seenTypeIds.has(type.id));
    if (missingTypes.length > 0) {
        throw new Error(`O modelo está desatualizado. Faltam colunas para: ${missingTypes.map(type => type.nome).join(", ")}. Baixe novamente o modelo CSV.`);
    }

    return mappedColumns;

}

function parseSemicolonCsv(text) {

    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        if (char === '"') {

            if (inQuotes && text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }

            continue;

        }

        if (char === ";" && !inQuotes) {
            row.push(field);
            field = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {

            if (char === "\r" && text[i + 1] === "\n") {
                i++;
            }

            row.push(field);
            rows.push(row);
            row = [];
            field = "";
            continue;

        }

        field += char;

    }

    if (inQuotes) {
        throw new Error("Há aspas sem fechamento no arquivo CSV. Confira o texto e as descrições com aspas.");
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field);
        rows.push(row);
    }

    return rows;

}

function parseCsvBrazilianPrice(value) {

    let normalized = String(value ?? "")
        .trim()
        .replace(/^R\$\s*/i, "")
        .replace(/\s/g, "");

    if (!normalized) {
        return NaN;
    }

    if (normalized.includes(",")) {

        if (!/^\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?$|^\d+(?:,\d{1,2})?$/.test(normalized)) {
            return NaN;
        }

        normalized = normalized
            .replace(/\./g, "")
            .replace(",", ".");

    } else if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
        return NaN;
    }

    return Number(normalized);

}

function renderPizzaFlavorCsvPreview(rows, activeTypes) {

    const headerCells = [
        "Linha",
        "Nome",
        "Descrição",
        ...activeTypes.map(type => type.nome),
        "Validação"
    ];

    pizzaFlavorImportPreviewHead.innerHTML = `
        <tr>${headerCells.map(label => `<th>${escapeHtml(label)}</th>`).join("")}</tr>
    `;

    pizzaFlavorImportPreviewBody.innerHTML = rows.map(row => {

        const priceCells = activeTypes.map(type => {

            const raw = row.rawPricesByType[type.id] || "";
            const parsed = raw ? parseCsvBrazilianPrice(raw) : null;

            return `<td>${raw
                ? (Number.isFinite(parsed) && parsed > 0
                    ? escapeHtml(formatImportPrice(parsed))
                    : `<span class="pizza-import-invalid-value">${escapeHtml(raw)}</span>`)
                : "—"}</td>`;

        }).join("");

        const statusText = row.status === "valid"
            ? "Pronto para importar"
            : row.message;

        return `
            <tr class="${row.status === "valid" ? "pizza-import-row-valid" : "pizza-import-row-invalid"}">
                <td>${row.rowNumber}</td>
                <td>${escapeHtml(row.nome || "(sem nome)")}</td>
                <td>${escapeHtml(row.descricao || "—")}</td>
                ${priceCells}
                <td>${row.status === "valid" ? '<span class="pizza-import-status-valid">Válido</span>' : `<span class="pizza-import-status-invalid">${escapeHtml(statusText)}</span>`}</td>
            </tr>
        `;

    }).join("");

    pizzaFlavorImportPreviewWrapper.hidden = false;

}

function formatImportPrice(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);

}

async function importPizzaFlavorsFromCsv() {

    const plan = pizzaFlavorImportPlan;
    if (!plan) {
        return;
    }

    const rowsToImport = plan.rows.filter(row => row.status === "valid");
    if (rowsToImport.length === 0) {
        showPizzaFlavorImportMessage("Não há sabores válidos para importar.", "error");
        return;
    }

    confirmPizzaFlavorImportButton.disabled = true;
    cancelPizzaFlavorImportButton.disabled = true;
    closePizzaFlavorImportPanelButton.disabled = true;
    confirmPizzaFlavorImportButton.textContent = "Importando...";
    showPizzaFlavorImportMessage("Gravando sabores no banco de dados. Aguarde...", "");

    let importedCount = 0;

    try {

        const freshTypesSnapshot = await getDocs(
            query(
                collection(db, "lojas", STORE_ID, "pizzaria", "configuracao", "tiposPizza"),
                orderBy("ordem", "asc")
            )
        );

        const freshActiveTypeIds = [];
        freshTypesSnapshot.forEach(snapshot => {
            const data = snapshot.data();
            if (data.ativo !== false) {
                freshActiveTypeIds.push(snapshot.id);
            }
        });
        freshActiveTypeIds.sort();

        if (freshActiveTypeIds.join("|") !== plan.activeTypeIds.join("|")) {
            throw new Error("Os tipos de pizza ativos foram alterados desde a leitura do arquivo. Baixe um novo modelo CSV e tente novamente.");
        }

        const freshFlavorsSnapshot = await getDocs(
            query(
                collection(db, "lojas", STORE_ID, "pizzaria", "configuracao", "sabores"),
                orderBy("ordem", "asc")
            )
        );

        const freshNames = new Set();
        let maxOrder = 0;

        freshFlavorsSnapshot.forEach(snapshot => {
            const data = snapshot.data();
            freshNames.add(normalizeName(data.nome));
            maxOrder = Math.max(maxOrder, Number(data.ordem || 0));
        });

        const conflicts = rowsToImport.filter(row => freshNames.has(normalizeName(row.nome)));
        if (conflicts.length > 0) {
            throw new Error(`Alguns sabores foram cadastrados por outro acesso desde a prévia (${conflicts.slice(0, 5).map(row => row.nome).join(", ")}). Feche a prévia, atualize a página e valide novamente o CSV.`);
        }

        const flavorsCollection = collection(
            db,
            "lojas",
            STORE_ID,
            "pizzaria",
            "configuracao",
            "sabores"
        );

        for (let offset = 0; offset < rowsToImport.length; offset += PIZZA_FLAVOR_IMPORT_BATCH_SIZE) {

            const chunk = rowsToImport.slice(
                offset,
                offset + PIZZA_FLAVOR_IMPORT_BATCH_SIZE
            );
            const batch = writeBatch(db);

            chunk.forEach((row, chunkIndex) => {

                const flavorReference = doc(flavorsCollection);
                batch.set(flavorReference, {
                    nome: row.nome,
                    descricao: row.descricao,
                    precosPorTipo: row.precosPorTipo,
                    ativo: true,
                    ordem: maxOrder + offset + chunkIndex + 1
                });

            });

            await batch.commit();
            importedCount += chunk.length;

        }

        await loadPizzaFlavors();

        const invalidCount = plan.rows.length - rowsToImport.length;
        pizzaFlavorImportPlan = null;
        pizzaFlavorCsvInput.value = "";
        pizzaFlavorImportSummary.textContent =
            `${importedCount} sabor(es) importado(s). ${invalidCount} linha(s) foram ignoradas por conterem erros.`;
        showPizzaFlavorImportMessage(
            invalidCount === 0
                ? "Importação concluída com sucesso."
                : "Importação concluída parcialmente: sabores válidos foram importados e as linhas com erro foram ignoradas.",
            invalidCount === 0 ? "success" : "error"
        );
        pizzaFlavorImportPreviewWrapper.hidden = true;
        pizzaFlavorImportPreviewHead.innerHTML = "";
        pizzaFlavorImportPreviewBody.innerHTML = "";
        confirmPizzaFlavorImportButton.textContent = "Importação concluída";

    } catch (error) {

        console.error("Erro ao importar sabores via CSV:", error);
        await loadPizzaFlavors();

        if (importedCount > 0) {
            showPizzaFlavorImportMessage(
                `A importação foi interrompida após gravar ${importedCount} sabor(es). Atualize a lista e confira os registros antes de continuar. Detalhe: ${error.message}`,
                "error"
            );
        } else {
            showPizzaFlavorImportMessage(
                error.message || "Não foi possível importar os sabores.",
                "error"
            );
        }

        confirmPizzaFlavorImportButton.disabled = true;

    } finally {

        cancelPizzaFlavorImportButton.disabled = false;
        closePizzaFlavorImportPanelButton.disabled = false;

        if (confirmPizzaFlavorImportButton.textContent === "Importando...") {
            confirmPizzaFlavorImportButton.textContent = "Importar sabores válidos";
        }

    }

}

/* ==================================================
   AÇÕES DOS SABORES
   ================================================== */

function bindPizzaFlavorActions() {

    document
        .querySelectorAll(
            ".pizza-edit-flavor"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openPizzaFlavorModal(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pizza-toggle-flavor"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await togglePizzaFlavor(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pizza-delete-flavor"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await deletePizzaFlavor(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".pizza-flavor-order-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await reorderPizzaFlavor(
                            button.dataset.id,
                            button.dataset.direction
                        );

                    }
                );

            }
        );

}

newPizzaFlavorButton.addEventListener(
    "click",
    () => {

        openPizzaFlavorModal();

    }
);

/* ==================================================
   RENDERIZA TIPOS NO FORMULÁRIO DE SABOR
   ================================================== */

function renderPizzaFlavorTypeInputs(
    existingPrices = {}
) {

    pizzaFlavorTypes.innerHTML =
        "";


    const activeTypes =
        pizzaTypes.filter(
            type =>
                type.ativo !== false
        );


    if (activeTypes.length === 0) {

        pizzaFlavorTypes.innerHTML = `

            <div class="form-message error">

                Cadastre e ative pelo menos um tipo de pizza
                antes de cadastrar sabores.

            </div>

        `;

        return;

    }


    activeTypes.forEach(
        type => {

            const hasPrice =
                Object.prototype.hasOwnProperty.call(
                    existingPrices,
                    type.id
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "pizza-flavor-type-row";


            row.innerHTML = `

                <label class="pizza-flavor-type-check">

                    <input
                        type="checkbox"
                        class="pizza-flavor-type-enabled"
                        data-type-id="${escapeHtml(type.id)}"
                        ${
                            hasPrice
                                ? "checked"
                                : ""
                        }
                    >


                    <span>
                        ${escapeHtml(type.nome || "")}
                    </span>

                </label>


                <div class="pizza-flavor-type-price">

                    <span>
                        R$
                    </span>


                    <input
                        type="text"
                        class="pizza-flavor-price-input"
                        data-type-id="${escapeHtml(type.id)}"
                        inputmode="decimal"
                        placeholder="0,00"
                        value="${
                            hasPrice
                                ? Number(
                                    existingPrices[type.id]
                                )
                                .toFixed(2)
                                .replace(
                                    ".",
                                    ","
                                )
                                : ""
                        }"
                    >

                </div>

            `;


            pizzaFlavorTypes.appendChild(
                row
            );

        }
    );


    bindPizzaFlavorTypeInputs();

}

function bindPizzaFlavorTypeInputs() {

    document
        .querySelectorAll(
            ".pizza-flavor-type-enabled"
        )
        .forEach(
            checkbox => {

                const typeId =
                    checkbox.dataset.typeId;


                const priceInput =
                    document.querySelector(
                        `.pizza-flavor-price-input[data-type-id="${typeId}"]`
                    );


                updatePizzaFlavorPriceInput(
                    checkbox,
                    priceInput
                );


                checkbox.addEventListener(
                    "change",
                    () => {

                        updatePizzaFlavorPriceInput(
                            checkbox,
                            priceInput
                        );

                    }
                );

            }
        );

}


function updatePizzaFlavorPriceInput(
    checkbox,
    priceInput
) {

    if (!priceInput) {

        return;

    }


    priceInput.disabled =
        !checkbox.checked;


    if (
        checkbox.checked &&
        !priceInput.value
    ) {

        priceInput.focus();

    }

}

/* ==================================================
   ABRE MODAL DE SABOR
   ================================================== */

function openPizzaFlavorModal(
    flavorId = null
) {

    pizzaFlavorForm.reset();


    pizzaFlavorIdInput.value =
        "";


    pizzaFlavorFormMessage.textContent =
        "";


    pizzaFlavorFormMessage.className =
        "form-message";


    pizzaFlavorFormTitle.textContent =
        flavorId
            ? "Editar sabor"
            : "Novo sabor";


    pizzaFlavorActiveInput.checked =
        true;


    let existingPrices = {};


    if (flavorId) {

        const flavor =
            pizzaFlavors.find(
                item =>
                    item.id === flavorId
            );


        if (!flavor) {

            return;

        }


        pizzaFlavorIdInput.value =
            flavor.id;

        pizzaFlavorNameInput.value =
            flavor.nome || "";

        pizzaFlavorDescriptionInput.value =
            flavor.descricao || "";

        pizzaFlavorActiveInput.checked =
            flavor.ativo !== false;

        existingPrices =
            flavor.precosPorTipo || {};

    }

    else {

        /*
         * Para um novo sabor, os tipos ativos
         * começam marcados, mas sem preço.
         * O administrador poderá desmarcar os
         * tipos nos quais o sabor não é oferecido.
         */

        pizzaTypes
            .filter(
                type =>
                    type.ativo !== false
            )
            .forEach(
                type => {

                    existingPrices[type.id] =
                        null;

                }
            );

    }


    renderPizzaFlavorTypeInputs(
        existingPrices
    );


    /*
     * O valor null acima significa
     * "marcado sem preço".
     * Corrige o estado visual:
     */

    if (!flavorId) {

        document
            .querySelectorAll(
                ".pizza-flavor-type-enabled"
            )
            .forEach(
                checkbox => {

                    checkbox.checked =
                        true;

                    const input =
                        document.querySelector(
                            `.pizza-flavor-price-input[data-type-id="${checkbox.dataset.typeId}"]`
                        );


                    updatePizzaFlavorPriceInput(
                        checkbox,
                        input
                    );

                }
            );

    }


    pizzaFlavorModal.classList.add(
        "open"
    );


    setTimeout(
        () => {

            pizzaFlavorNameInput.focus();

        },
        50
    );

}

function closePizzaFlavorForm() {

    pizzaFlavorModal.classList.remove(
        "open"
    );

}


closePizzaFlavorModal.addEventListener(
    "click",
    closePizzaFlavorForm
);


cancelPizzaFlavorButton.addEventListener(
    "click",
    closePizzaFlavorForm
);


pizzaFlavorModalOverlay.addEventListener(
    "click",
    closePizzaFlavorForm
);

/* ==================================================
   SALVA SABOR
   ================================================== */

pizzaFlavorForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const name =
            pizzaFlavorNameInput.value.trim();


        const description =
            pizzaFlavorDescriptionInput.value.trim();


        if (!name) {

            showMessage(
                pizzaFlavorFormMessage,
                "Informe o nome do sabor.",
                "error"
            );

            return;

        }


        const duplicate =
            pizzaFlavors.find(
                flavor =>

                    normalizeName(
                        flavor.nome
                    ) ===
                    normalizeName(
                        name
                    )

                    &&

                    flavor.id !==
                        pizzaFlavorIdInput.value
            );


        if (duplicate) {

            showMessage(
                pizzaFlavorFormMessage,
                "Já existe um sabor com este nome.",
                "error"
            );

            return;

        }


        const prices = {};


        const enabledInputs =
            document.querySelectorAll(
                ".pizza-flavor-type-enabled"
            );


        let selectedTypes = 0;


        for (
            const checkbox
            of enabledInputs
        ) {

            const typeId =
                checkbox.dataset.typeId;


            if (!checkbox.checked) {

                continue;

            }


            selectedTypes++;


            const priceInput =
                document.querySelector(
                    `.pizza-flavor-price-input[data-type-id="${typeId}"]`
                );


            const rawPrice =
                priceInput
                    ? priceInput.value.trim()
                    : "";


            if (!rawPrice) {

                showMessage(
                    pizzaFlavorFormMessage,
                    "Informe o preço de todos os tipos selecionados.",
                    "error"
                );

                return;

            }


            const price =
                parseBrazilianPrice(
                    rawPrice
                );


            if (
				!Number.isFinite(price) ||
				price <= 0
			) {

				showMessage(
					pizzaFlavorFormMessage,
					"O preço deve ser maior que R$ 0,00.",
					"error"
				);

				return;

			}


            prices[typeId] =
                roundPizzaMoney(
                    price
                );

        }


        if (selectedTypes === 0) {

            showMessage(
                pizzaFlavorFormMessage,
                "Selecione pelo menos um tipo de pizza para este sabor.",
                "error"
            );

            return;

        }


        try {

            savePizzaFlavorButton.disabled =
                true;

            savePizzaFlavorButton.textContent =
                "Salvando...";


            const flavorId =
                pizzaFlavorIdInput.value;


            const flavorData = {

                nome:
                    name,

                descricao:
                    description,

                precosPorTipo:
                    prices,

                ativo:
                    pizzaFlavorActiveInput.checked

            };


            if (flavorId) {

                const reference =
                    doc(
                        db,
                        "lojas",
                        STORE_ID,
                        "pizzaria",
                        "configuracao",
                        "sabores",
                        flavorId
                    );


                await updateDoc(
                    reference,
                    flavorData
                );

            }

            else {

                const nextOrder =
                    pizzaFlavors.length > 0

                        ? Math.max(
                            ...pizzaFlavors.map(
                                flavor =>
                                    Number(
                                        flavor.ordem || 0
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
                        "configuracao",
                        "sabores"
                    ),
                    {
                        ...flavorData,

                        ordem:
                            nextOrder
                    }
                );

            }


            closePizzaFlavorForm();

            await loadPizzaFlavors();

        }

        catch (error) {

            console.error(
                "Erro ao salvar sabor:",
                error
            );


            showMessage(
                pizzaFlavorFormMessage,
                "Não foi possível salvar o sabor.",
                "error"
            );

        }

        finally {

            savePizzaFlavorButton.disabled =
                false;

            savePizzaFlavorButton.textContent =
                "Salvar";

        }

    }
);

function parseBrazilianPrice(
    value
) {

    return Number(
        String(
            value || ""
        )
            .replace(
                /\./g,
                ""
            )
            .replace(
                ",",
                "."
            )
    );

}


function roundPizzaMoney(
    value
) {

    return Math.round(
        (
            Number(value) +
            Number.EPSILON
        ) * 100
    ) / 100;

}

/* ==================================================
   ATIVA / DESATIVA SABOR
   ================================================== */

async function togglePizzaFlavor(
    flavorId
) {

    const flavor =
        pizzaFlavors.find(
            item =>
                item.id === flavorId
        );


    if (!flavor) {

        return;

    }


    try {

        const reference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "configuracao",
                "sabores",
                flavorId
            );


        await updateDoc(
            reference,
            {
                ativo:
                    flavor.ativo === false
            }
        );


        await loadPizzaFlavors();

    }

    catch (error) {

        console.error(
            "Erro ao alterar status do sabor:",
            error
        );


        alert(
            "Não foi possível alterar o status do sabor."
        );

    }

}

/* ==================================================
   EXCLUI SABOR DE PIZZA
   ================================================== */

async function deletePizzaFlavor(flavorId) {

    const flavor = pizzaFlavors.find(item => item.id === flavorId);

    if (!flavor) return;

    let deactivatedForSafeCleanup = false;

    try {

        const productsSnapshot = await getDocs(collection(
            db,
            "lojas", STORE_ID,
            "produtos"
        ));

        const products = productsSnapshot.docs.map(snapshot => ({
            id: snapshot.id,
            ...snapshot.data()
        }));

        const explicitlyLinkedProducts = products.filter(product => {
            if (product.tipoProduto !== "pizza") return false;
            const flavorIds = product.pizzaria?.saboresIds;
            return Array.isArray(flavorIds) && flavorIds.length > 0 && flavorIds.includes(flavorId);
        });

        const blockingProducts = explicitlyLinkedProducts.filter(product =>
            product.pizzaria.saboresIds.filter(id => id !== flavorId).length === 0
        );

        if (blockingProducts.length > 0) {
            const names = blockingProducts
                .slice(0, 5)
                .map(product => product.nome || product.id)
                .join(", ");
            const more = blockingProducts.length > 5
                ? ` e mais ${blockingProducts.length - 5}`
                : "";

            alert(
                `Não é possível excluir o sabor “${flavor.nome}” porque ele é o único sabor selecionado nestes produtos: ${names}${more}. ` +
                "Edite esses produtos e selecione outros sabores ou escolha ‘Todos os sabores ativos’; depois tente excluir novamente."
            );
            return;
        }

        const confirmation =
            `Excluir permanentemente o sabor “${flavor.nome}”?

` +
            `A ação removerá o sabor do catálogo e de ${explicitlyLinkedProducts.length} produto(s) que o selecionam explicitamente.

` +
            "Os pedidos históricos serão preservados. Esta ação não pode ser desfeita.";

        if (!window.confirm(confirmation)) return;

        const operations = [];

        for (const product of explicitlyLinkedProducts) {
            const nextFlavorIds = product.pizzaria.saboresIds.filter(id => id !== flavorId);

            operations.push({
                action: "update",
                ref: doc(db, "lojas", STORE_ID, "produtos", product.id),
                data: {
                    pizzaria: {
                        ...product.pizzaria,
                        saboresIds: nextFlavorIds
                    }
                }
            });
        }

        const flavorReference = doc(
            db,
            "lojas", STORE_ID,
            "pizzaria", "configuracao", "sabores", flavorId
        );

        // For multi-batch deletion, hide the flavor before incremental cleanup.
        if (operations.length + 1 > 400) {
            await updateDoc(flavorReference, { ativo: false });
            deactivatedForSafeCleanup = true;
        }

        operations.push({
            action: "delete",
            ref: flavorReference
        });

        await commitPizzaWriteOperations(operations);
        await loadPizzaFlavors();

        alert(`O sabor “${flavor.nome}” foi excluído. Os pedidos históricos foram preservados.`);

    } catch (error) {
        console.error("Erro ao excluir sabor de pizza:", error);
        alert(
            deactivatedForSafeCleanup
                ? "A exclusão não foi concluída. Por segurança, o sabor foi desativado para não aparecer com associações parciais. Confira as associações e tente excluir novamente antes de reativá-lo. Os pedidos históricos não foram apagados."
                : "Não foi possível concluir a exclusão do sabor. Se a operação tiver sido interrompida, confira as associações com os produtos e tente novamente. Os pedidos históricos não são apagados."
        );
    }
}


/* ==================================================
   GRAVA OPERAÇÕES EM LOTES
   ================================================== */

async function commitPizzaWriteOperations(operations) {

    const batchSize = 400;

    for (let start = 0; start < operations.length; start += batchSize) {
        const batch = writeBatch(db);
        const chunk = operations.slice(start, start + batchSize);

        for (const operation of chunk) {
            if (operation.action === "delete") {
                batch.delete(operation.ref);
            } else {
                batch.update(operation.ref, operation.data);
            }
        }

        await batch.commit();
    }
}


/* ==================================================
   ORDENAÇÃO DOS SABORES
   ================================================== */

async function reorderPizzaFlavor(
    flavorId,
    direction
) {

    const index =
        pizzaFlavors.findIndex(
            flavor =>
                flavor.id === flavorId
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
        targetIndex >= pizzaFlavors.length
    ) {

        return;

    }


    const current =
        pizzaFlavors[index];

    const target =
        pizzaFlavors[targetIndex];


    try {

        const currentReference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "configuracao",
                "sabores",
                current.id
            );


        const targetReference =
            doc(
                db,
                "lojas",
                STORE_ID,
                "pizzaria",
                "configuracao",
                "sabores",
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


        await loadPizzaFlavors();

    }

    catch (error) {

        console.error(
            "Erro ao ordenar sabores:",
            error
        );


        alert(
            "Não foi possível alterar a ordem."
        );

    }

}


