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
	writeBatch
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
   ELEMENTOS - OPÇÕES
   ================================================== */

const optionsModal =
    document.getElementById(
        "optionsModal"
    );

const optionsModalOverlay =
    document.getElementById(
        "optionsModalOverlay"
    );

const closeOptionsModalButton =
    document.getElementById(
        "closeOptionsModal"
    );

const optionsComplementName =
    document.getElementById(
        "optionsComplementName"
    );

const optionsList =
    document.getElementById(
        "optionsList"
    );

const newOptionButton =
    document.getElementById(
        "newOptionButton"
    );


const optionFormModal =
    document.getElementById(
        "optionFormModal"
    );

const optionFormModalOverlay =
    document.getElementById(
        "optionFormModalOverlay"
    );

const closeOptionFormModalButton =
    document.getElementById(
        "closeOptionFormModal"
    );

const cancelOptionButton =
    document.getElementById(
        "cancelOptionButton"
    );

const optionForm =
    document.getElementById(
        "optionForm"
    );

const optionFormTitle =
    document.getElementById(
        "optionFormTitle"
    );

const optionFormComplementName =
    document.getElementById(
        "optionFormComplementName"
    );

const optionIdInput =
    document.getElementById(
        "optionId"
    );

const optionNameInput =
    document.getElementById(
        "optionName"
    );

const optionPriceInput =
    document.getElementById(
        "optionPrice"
    );

const optionQuantityMaxGroup =
    document.getElementById(
        "optionQuantityMaxGroup"
    );

const optionQuantityMaxInput =
    document.getElementById(
        "optionQuantityMax"
    );

const optionActiveInput =
    document.getElementById(
        "optionActive"
    );

const optionFormMessage =
    document.getElementById(
        "optionFormMessage"
    );

const saveOptionButton =
    document.getElementById(
        "saveOptionButton"
    );


let currentComplementId =
    null;

let currentComplementData =
    null;

let currentOptions =
    [];


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
							class="edit-product-button manage-options-button"
							data-id="${documentSnapshot.id}"
						>
							Opções
						</button>

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


function normalizeName(name) {

    return name
        .trim()
        .toLocaleLowerCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

}

async function optionNameExists(
    name,
    currentOptionId = null
) {

    if (!currentComplementId) {
        return false;
    }


    const normalizedName =
        normalizeName(name);


    const snapshot =
        await getDocs(
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                currentComplementId,
                "opcoes"
            )
        );


    return snapshot.docs.some(
        documentSnapshot => {

            // Na edição, ignora a própria opção.
            if (
                currentOptionId &&
                documentSnapshot.id === currentOptionId
            ) {

                return false;

            }


            const data =
                documentSnapshot.data();


            return (
                normalizeName(
                    data.nome || ""
                ) === normalizedName
            );

        }
    );

}

async function complementNameExists(
    name,
    currentComplementId = null
) {

    const normalizedName =
        normalizeName(name);


    const snapshot =
        await getDocs(
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "complementos"
            )
        );


    return snapshot.docs.some(
        documentSnapshot => {

            // Na edição, ignora o próprio documento.
            if (
                currentComplementId &&
                documentSnapshot.id === currentComplementId
            ) {

                return false;

            }


            const data =
                documentSnapshot.data();


            return (
                normalizeName(
                    data.nome || ""
                ) === normalizedName
            );

        }
    );

}

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
		
		const currentComplementId =
			complementIdInput.value;


		try {

			const duplicate =
				await complementNameExists(
					name,
					currentComplementId
				);


			if (duplicate) {

				complementFormMessage.textContent =
					"Já existe um complemento com este nome.";

				complementFormMessage.className =
					"form-message error";

				return;

			}

		}

		catch (error) {

			console.error(
				"Erro ao verificar complemento duplicado:",
				error
			);


			complementFormMessage.textContent =
				"Não foi possível verificar o nome do complemento.";

			complementFormMessage.className =
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
        ".manage-options-button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    await openOptions(
                        button.dataset.id
                    );

                }
            );

        }
    );

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
	
	const optionsSnapshot =
		await getDocs(
			collection(
				db,
				"lojas",
				"da-minha-vo",
				"complementos",
				complementId,
				"opcoes"
			)
		);


	if (!optionsSnapshot.empty) {

		alert(
			"Este complemento possui opções cadastradas. Exclua as opções primeiro."
		);

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

/* ==================================================
   ABRIR OPÇÕES
   ================================================== */

async function openOptions(
    complementId
) {

    try {

        const reference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                complementId
            );


        const snapshot =
            await getDoc(reference);


        if (!snapshot.exists()) {
            return;
        }


        currentComplementId =
            complementId;

        currentComplementData =
            snapshot.data();


        optionsComplementName.textContent =
            currentComplementData.nome ||
            "Complemento";


        await loadOptions();


        optionsModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir opções:",
            error
        );

    }

}

async function loadOptions() {

    if (!currentComplementId) {
        return;
    }


    try {

        const reference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                currentComplementId,
                "opcoes"
            );


        const optionsQuery =
            query(
                reference,
                orderBy(
                    "ordem",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(
                optionsQuery
            );


        currentOptions =
            snapshot.docs.map(
                documentSnapshot => ({
                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()
                })
            );


        renderOptions();

    }

    catch (error) {

        console.error(
            "Erro ao carregar opções:",
            error
        );

    }

}

function renderOptions() {

    optionsList.innerHTML =
        "";


    if (
        currentOptions.length === 0
    ) {

        optionsList.innerHTML = `
            <div class="options-empty">
                Nenhuma opção cadastrada neste complemento.
            </div>
        `;

        return;

    }


    currentOptions.forEach(
        (option, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "complement-option-item";


            const price =
                Number(
                    option.preco || 0
                )
                .toLocaleString(
                    "pt-BR",
                    {
                        style:
                            "currency",

                        currency:
                            "BRL"
                    }
                );


            item.innerHTML = `

                <div class="complement-option-order">

                    <button
                        type="button"
                        class="option-order-button option-up-button"
                        data-id="${option.id}"
                        ${index === 0 ? "disabled" : ""}
                        title="Mover para cima"
                    >
                        ↑
                    </button>


                    <button
                        type="button"
                        class="option-order-button option-down-button"
                        data-id="${option.id}"
                        ${
                            index === currentOptions.length - 1
                            ? "disabled"
                            : ""
                        }
                        title="Mover para baixo"
                    >
                        ↓
                    </button>

                </div>


                <div class="complement-option-info">

                    <h4>
                        ${option.nome || "Sem nome"}
                    </h4>

                    <div class="complement-option-price">
                        ${price}
                    </div>

                </div>


                <span class="
                    product-status
                    ${option.ativo === false ? "inactive" : "active"}
                ">

                    ${
                        option.ativo === false
                        ? "Inativo"
                        : "Ativo"
                    }

                </span>


                <div class="complement-option-actions">

                    <button
                        type="button"
                        class="edit-product-button edit-option-button"
                        data-id="${option.id}"
                    >
                        Editar
                    </button>


                    <button
                        type="button"
                        class="delete-product-button delete-option-button"
                        data-id="${option.id}"
                        data-name="${option.nome || ""}"
                    >
                        Excluir
                    </button>

                </div>

            `;


            optionsList.appendChild(
                item
            );

        }
    );


    setupOptionButtons();

}

newOptionButton.addEventListener(
    "click",
    () => {

        if (!currentComplementId) {
            return;
        }


        optionForm.reset();


        optionIdInput.value =
            "";

        optionPriceInput.value =
            "0";

        optionActiveInput.checked =
            true;

        optionQuantityMaxInput.value =
            "10";


        optionFormTitle.textContent =
            "Nova opção";


        optionFormComplementName.textContent =
            currentComplementData?.nome ||
            "Complemento";


        optionFormMessage.textContent =
            "";


        updateQuantityFieldVisibility();


        optionFormModal.classList.add(
            "open"
        );

    }
);

function updateQuantityFieldVisibility() {

    if (
        currentComplementData?.tipo ===
        "quantidade"
    ) {

        optionQuantityMaxGroup.style.display =
            "block";

    }

    else {

        optionQuantityMaxGroup.style.display =
            "none";

    }

}

optionForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!currentComplementId) {
            return;
        }


        const name =
            optionNameInput
                .value
                .trim();


        const price =
            Number(
                optionPriceInput.value
            );


        if (!name) {

            optionFormMessage.textContent =
                "Informe o nome da opção.";

            optionFormMessage.className =
                "form-message error";

            return;

        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            optionFormMessage.textContent =
                "Informe um preço válido.";

            optionFormMessage.className =
                "form-message error";

            return;

        }
		
		const currentOptionId =
			optionIdInput.value;


		try {

			const duplicate =
				await optionNameExists(
					name,
					currentOptionId
				);


			if (duplicate) {

				optionFormMessage.textContent =
					"Já existe uma opção com este nome neste complemento.";

				optionFormMessage.className =
					"form-message error";

				return;

			}

		}

		catch (error) {

			console.error(
				"Erro ao verificar opção duplicada:",
				error
			);


			optionFormMessage.textContent =
				"Não foi possível verificar o nome da opção.";

			optionFormMessage.className =
				"form-message error";

			return;

		}


        try {

            saveOptionButton.disabled =
                true;

            saveOptionButton.textContent =
                "Salvando...";


            const optionId =
                optionIdInput.value;


            const data = {

                nome:
                    name,

                preco:
                    price,

                ativo:
                    optionActiveInput.checked

            };


            if (
                currentComplementData?.tipo ===
                "quantidade"
            ) {

                const quantityMax =
                    Number(
                        optionQuantityMaxInput.value
                    );


                if (
                    !Number.isInteger(quantityMax) ||
                    quantityMax < 1
                ) {

                    throw new Error(
                        "Quantidade máxima inválida."
                    );

                }


                data.quantidadeMaxima =
                    quantityMax;

            }


            if (optionId) {

                await updateDoc(
                    doc(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "complementos",
                        currentComplementId,
                        "opcoes",
                        optionId
                    ),
                    data
                );

            }

            else {

                const snapshot =
                    await getDocs(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "complementos",
                            currentComplementId,
                            "opcoes"
                        )
                    );


                data.ordem =
                    snapshot.size + 1;


                await addDoc(
                    collection(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "complementos",
                        currentComplementId,
                        "opcoes"
                    ),
                    data
                );

            }


            closeOptionForm();


            await loadOptions();

        }

        catch (error) {

            console.error(
                "Erro ao salvar opção:",
                error
            );


            optionFormMessage.textContent =
                error.message ===
                    "Quantidade máxima inválida."
                ? "Informe uma quantidade máxima válida."
                : "Não foi possível salvar a opção.";


            optionFormMessage.className =
                "form-message error";

        }

        finally {

            saveOptionButton.disabled =
                false;

            saveOptionButton.textContent =
                "Salvar opção";

        }

    }
);

async function openEditOption(
    optionId
) {

    try {

        const reference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                currentComplementId,
                "opcoes",
                optionId
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


        optionIdInput.value =
            optionId;

        optionNameInput.value =
            data.nome || "";

        optionPriceInput.value =
            data.preco ?? 0;

        optionActiveInput.checked =
            data.ativo !== false;

        optionQuantityMaxInput.value =
            data.quantidadeMaxima ?? 10;


        optionFormTitle.textContent =
            "Editar opção";


        optionFormComplementName.textContent =
            currentComplementData?.nome ||
            "Complemento";


        optionFormMessage.textContent =
            "";


        updateQuantityFieldVisibility();


        optionFormModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir opção:",
            error
        );

    }

}

async function deleteOption(
    optionId,
    optionName
) {

    const confirmed =
        confirm(
            `Deseja realmente excluir a opção "${optionName}"?`
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
                currentComplementId,
                "opcoes",
                optionId
            )
        );


        await normalizeOptionOrder();

        await loadOptions();

    }

    catch (error) {

        console.error(
            "Erro ao excluir opção:",
            error
        );


        alert(
            "Não foi possível excluir a opção."
        );

    }

}

async function moveOption(
    optionId,
    direction
) {

    const index =
        currentOptions.findIndex(
            option =>
                option.id === optionId
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
        targetIndex >= currentOptions.length
    ) {

        return;

    }


    const current =
        currentOptions[index];

    const target =
        currentOptions[targetIndex];


    try {

        const batch =
            writeBatch(db);


        batch.update(
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                currentComplementId,
                "opcoes",
                current.id
            ),
            {
                ordem:
                    target.ordem
            }
        );


        batch.update(
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "complementos",
                currentComplementId,
                "opcoes",
                target.id
            ),
            {
                ordem:
                    current.ordem
            }
        );


        await batch.commit();


        await loadOptions();

    }

    catch (error) {

        console.error(
            "Erro ao ordenar opções:",
            error
        );

    }

}

async function normalizeOptionOrder() {

    const reference =
        collection(
            db,
            "lojas",
            "da-minha-vo",
            "complementos",
            currentComplementId,
            "opcoes"
        );


    const snapshot =
        await getDocs(
            query(
                reference,
                orderBy(
                    "ordem",
                    "asc"
                )
            )
        );


    if (snapshot.empty) {
        return;
    }


    const batch =
        writeBatch(db);


    snapshot.docs.forEach(
        (documentSnapshot, index) => {

            batch.update(
                documentSnapshot.ref,
                {
                    ordem:
                        index + 1
                }
            );

        }
    );


    await batch.commit();

}

function setupOptionButtons() {

    document
        .querySelectorAll(
            ".edit-option-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openEditOption(
                            button.dataset.id
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".delete-option-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteOption(
                            button.dataset.id,
                            button.dataset.name
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".option-up-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        moveOption(
                            button.dataset.id,
                            "up"
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".option-down-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        moveOption(
                            button.dataset.id,
                            "down"
                        );

                    }
                );

            }
        );

}

function closeOptions() {

    optionsModal.classList.remove(
        "open"
    );

    currentComplementId =
        null;

    currentComplementData =
        null;

    currentOptions =
        [];

}


function closeOptionForm() {

    optionFormModal.classList.remove(
        "open"
    );

}


closeOptionsModalButton.addEventListener(
    "click",
    closeOptions
);


optionsModalOverlay.addEventListener(
    "click",
    closeOptions
);


closeOptionFormModalButton.addEventListener(
    "click",
    closeOptionForm
);


cancelOptionButton.addEventListener(
    "click",
    closeOptionForm
);


optionFormModalOverlay.addEventListener(
    "click",
    closeOptionForm
);

