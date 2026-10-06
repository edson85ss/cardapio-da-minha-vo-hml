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
                        data-id="${flavor.id}"
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
                        data-id="${flavor.id}"
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
                        data-id="${flavor.id}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="secondary-button pizza-toggle-flavor"
                        data-id="${flavor.id}"
                    >
                        ${
                            flavor.ativo === false
                                ? "Ativar"
                                : "Desativar"
                        }
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

pizzaFlavorSearchInput.addEventListener(
    "input",
    () => {

        renderPizzaFlavors();

    }
);

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
                        data-type-id="${type.id}"
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
                        data-type-id="${type.id}"
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
                price < 0
            ) {

                showMessage(
                    pizzaFlavorFormMessage,
                    "Todos os preços devem ser valores válidos.",
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


