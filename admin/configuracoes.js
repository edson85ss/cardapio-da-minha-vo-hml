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
    doc,
    getDoc,
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

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");


const storeConfigForm =
    document.getElementById("storeConfigForm");

const storeNameInput =
    document.getElementById("storeName");

const storeHoursTextInput =
    document.getElementById("storeHoursText");

const storeWhatsappInput =
    document.getElementById("storeWhatsapp");

const storePixKeyInput =
    document.getElementById("storePixKey");

const storePixOwnerInput =
    document.getElementById("storePixOwner");

const storeDeliveryFeeInput =
    document.getElementById("storeDeliveryFee");

const storePickupAddressInput =
    document.getElementById("storePickupAddress");

const storePrimaryColorInput =
    document.getElementById("storePrimaryColor");

const storeSecondaryColorInput =
    document.getElementById("storeSecondaryColor");

const storeTextColorInput =
    document.getElementById("storeTextColor");

const storeLogoInput =
    document.getElementById("storeLogo");

const storeLogoPreview =
    document.getElementById("storeLogoPreview");

const storeLogoPreviewWrapper =
    document.getElementById(
        "storeLogoPreviewWrapper"
    );

const storeActiveInput =
    document.getElementById("storeActive");
	
const paymentMethodInput =
    document.getElementById(
        "paymentMethodInput"
    );

const addPaymentMethodButton =
    document.getElementById(
        "addPaymentMethodButton"
    );

const paymentMethodsList =
    document.getElementById(
        "paymentMethodsList"
    );

const openingHoursContainer =
    document.getElementById(
        "openingHoursContainer"
    );

const configFormMessage =
    document.getElementById(
        "configFormMessage"
    );

const saveConfigButton =
    document.getElementById(
        "saveConfigButton"
    );


/* ==================================================
   DIAS
   ================================================== */

const days = [

    ["domingo", "Domingo"],
    ["segunda", "Segunda-feira"],
    ["terca", "Terça-feira"],
    ["quarta", "Quarta-feira"],
    ["quinta", "Quinta-feira"],
    ["sexta", "Sexta-feira"],
    ["sabado", "Sábado"]

];

let paymentMethods = [];


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

        renderOpeningHours();

        await loadStoreConfig();

    }
);


/* ==================================================
   MENU MOBILE
   ================================================== */

menuButton.addEventListener(
    "click",
    () => {

        sidebar.classList.add("open");

        sidebarOverlay.classList.add(
            "active"
        );

    }
);


sidebarOverlay.addEventListener(
    "click",
    () => {

        sidebar.classList.remove("open");

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
   HORÁRIOS
   ================================================== */

function renderOpeningHours() {

    openingHoursContainer.innerHTML =
        "";

    days.forEach(
        ([key, label]) => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "opening-day-row";

            row.innerHTML = `

                <div class="opening-day-name">
                    ${label}
                </div>

                <input
                    type="time"
                    id="${key}Open"
                >

                <input
                    type="time"
                    id="${key}Close"
                >

                <label class="day-closed-label">

                    <input
                        type="checkbox"
                        id="${key}Closed"
                    >

                    Fechado

                </label>

            `;

            openingHoursContainer
                .appendChild(row);

        }
    );


    days.forEach(
        ([key]) => {

            const closed =
                document.getElementById(
                    `${key}Closed`
                );

            closed.addEventListener(
                "change",
                () =>
                    updateDayInputs(
                        key
                    )
            );

        }
    );

}


function updateDayInputs(key) {

    const closed =
        document.getElementById(
            `${key}Closed`
        );

    const open =
        document.getElementById(
            `${key}Open`
        );

    const close =
        document.getElementById(
            `${key}Close`
        );

    open.disabled =
        closed.checked;

    close.disabled =
        closed.checked;

}


/* ==================================================
   CARREGA CONFIGURAÇÕES
   ================================================== */

async function loadStoreConfig() {

    try {

        const storeReference =
            doc(
                db,
                "lojas",
                "da-minha-vo"
            );


        const snapshot =
            await getDoc(
                storeReference
            );


        if (!snapshot.exists()) {

            throw new Error(
                "Loja não encontrada."
            );

        }


        const data =
            snapshot.data();
			
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


        storeNameInput.value =
            data.nomeLoja || "";

        storeHoursTextInput.value =
            data.horarioTexto || "";

        storeWhatsappInput.value =
            data.whatsapp || "";

        storePixKeyInput.value =
            data.pixChave || "";

        storePixOwnerInput.value =
            data.pixTitular || "";

        storeDeliveryFeeInput.value =
            Number(
                data.taxaEntrega || 0
            )
            .toFixed(2)
            .replace(".", ",");

        storePickupAddressInput.value =
            data.enderecoRetirada || "";

        storePrimaryColorInput.value =
            data.corPrimaria || "#D4432B";

        storeSecondaryColorInput.value =
            data.corSecundaria || "#F2E3CC";

        storeTextColorInput.value =
            data.corTexto || "#4B5454";

        storeActiveInput.checked =
            data.ativo !== false;


        if (data.logoUrl) {

            storeLogoPreview.src =
                data.logoUrl;

            storeLogoPreviewWrapper
                .classList.add(
                    "visible"
                );

        }


        if (data.horarios) {

            days.forEach(
                ([key]) => {

                    const schedule =
                        data.horarios[key];

                    const open =
                        document.getElementById(
                            `${key}Open`
                        );

                    const close =
                        document.getElementById(
                            `${key}Close`
                        );

                    const closed =
                        document.getElementById(
                            `${key}Closed`
                        );


                    if (
                        !schedule ||
                        schedule.fechado === true
                    ) {

                        closed.checked =
                            true;

                        open.value =
                            "";

                        close.value =
                            "";

                    }

                    else {

                        closed.checked =
                            false;

                        open.value =
                            schedule.abre || "";

                        close.value =
                            schedule.fecha || "";

                    }


                    updateDayInputs(
                        key
                    );

                }
            );

        }

    }

    catch (error) {

        console.error(
            "Erro ao carregar configurações:",
            error
        );

    }

}

function normalizePaymentMethod(
    name
) {

    return name
        .trim()
        .toLocaleLowerCase("pt-BR")
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


/* ==================================================
   PREÇO BRASILEIRO
   ================================================== */

function parseBrazilianPrice(value) {

    return Number(
        value
            .replace(/\./g, "")
            .replace(",", ".")
    );

}


/* ==================================================
   OTIMIZA IMAGEM
   ================================================== */

async function optimizeImage(
    file,
    maxDimension = 500,
    quality = 0.80
) {

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];


    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Formato de imagem não permitido."
        );

    }


    if (
        file.size >
        10 * 1024 * 1024
    ) {

        throw new Error(
            "A imagem deve possuir no máximo 10 MB."
        );

    }


    const bitmap =
        await createImageBitmap(file);


    let width =
        bitmap.width;

    let height =
        bitmap.height;


    if (
        width > maxDimension ||
        height > maxDimension
    ) {

        const scale =
            Math.min(
                maxDimension / width,
                maxDimension / height
            );

        width =
            Math.round(
                width * scale
            );

        height =
            Math.round(
                height * scale
            );

    }


    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width =
        width;

    canvas.height =
        height;


    const context =
        canvas.getContext("2d");


    context.drawImage(
        bitmap,
        0,
        0,
        width,
        height
    );


    bitmap.close();


    const blob =
        await new Promise(
            (resolve, reject) => {

                canvas.toBlob(
                    result => {

                        if (result) {
                            resolve(result);
                        }

                        else {
                            reject(
                                new Error(
                                    "Falha ao otimizar imagem."
                                )
                            );
                        }

                    },
                    "image/webp",
                    quality
                );

            }
        );


    if (
        blob.size >
        1 * 1024 * 1024
    ) {

        throw new Error(
            "Imagem final maior que 1 MB."
        );

    }


    return new File(
        [blob],
        "logo.webp",
        {
            type:
                "image/webp"
        }
    );

}


/* ==================================================
   PREVIEW LOGO
   ================================================== */

storeLogoInput.addEventListener(
    "change",
    () => {

        const file =
            storeLogoInput.files[0];

        if (!file) {
            return;
        }


        storeLogoPreview.src =
            URL.createObjectURL(file);

        storeLogoPreviewWrapper
            .classList.add(
                "visible"
            );

    }
);


/* ==================================================
   SALVA
   ================================================== */

storeConfigForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        try {

            saveConfigButton.disabled =
                true;

            saveConfigButton.textContent =
                "Salvando...";


            const horarios = {};


            days.forEach(
                ([key]) => {

                    const closed =
                        document.getElementById(
                            `${key}Closed`
                        ).checked;

                    const open =
                        document.getElementById(
                            `${key}Open`
                        ).value;

                    const close =
                        document.getElementById(
                            `${key}Close`
                        ).value;


                    horarios[key] = {

                        abre:
                            closed ? "" : open,

                        fecha:
                            closed ? "" : close,

                        fechado:
                            closed

                    };

                }
            );


            const updateData = {

                nomeLoja:
                    storeNameInput.value.trim(),

                horarioTexto:
                    storeHoursTextInput.value.trim(),

                whatsapp:
                    storeWhatsappInput.value.trim(),

                pixChave:
                    storePixKeyInput.value.trim(),

                pixTitular:
                    storePixOwnerInput.value.trim(),

                taxaEntrega:
                    parseBrazilianPrice(
                        storeDeliveryFeeInput.value
                    ),

                enderecoRetirada:
                    storePickupAddressInput.value.trim(),

                corPrimaria:
                    storePrimaryColorInput.value,

                corSecundaria:
                    storeSecondaryColorInput.value,

                corTexto:
                    storeTextColorInput.value,

                ativo:
                    storeActiveInput.checked,

                horarios:
                    horarios,
					
				formasPagamento:
					paymentMethods

            };


            const storeReference =
                doc(
                    db,
                    "lojas",
                    "da-minha-vo"
                );


            const logoFile =
                storeLogoInput.files[0];


            if (logoFile) {

                saveConfigButton.textContent =
                    "Otimizando logo...";


                const optimizedLogo =
                    await optimizeImage(
                        logoFile,
                        500,
                        0.80
                    );


                const logoReference =
                    ref(
                        storage,
                        "lojas/da-minha-vo/logo/logo.webp"
                    );


                await uploadBytes(
                    logoReference,
                    optimizedLogo,
                    {
                        contentType:
                            "image/webp"
                    }
                );


                updateData.logoUrl =
                    await getDownloadURL(
                        logoReference
                    );

            }


            saveConfigButton.textContent =
                "Salvando...";


            await updateDoc(
                storeReference,
                updateData
            );


            configFormMessage.textContent =
                "Configurações salvas com sucesso.";

            configFormMessage.className =
                "form-message success";


            await loadStoreConfig();

        }

        catch (error) {

            console.error(
                "Erro ao salvar configurações:",
                error
            );


            configFormMessage.textContent =
                error.message ||
                "Não foi possível salvar.";

            configFormMessage.className =
                "form-message error";

        }

        finally {

            saveConfigButton.disabled =
                false;

            saveConfigButton.textContent =
                "Salvar configurações";

        }

    }
);

function renderPaymentMethods() {

    paymentMethodsList.innerHTML =
        "";


    paymentMethods.forEach(
        (method, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "payment-method-row";


            row.innerHTML = `

                <span>
                    ${method}
                </span>

                <button
                    type="button"
                    class="remove-payment-method-button"
                    data-index="${index}"
                    aria-label="Remover forma de pagamento"
                >
                    ×
                </button>

            `;


            paymentMethodsList
                .appendChild(row);

        }
    );


    paymentMethodsList
        .querySelectorAll(
            ".remove-payment-method-button"
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


                        paymentMethods.splice(
                            index,
                            1
                        );


                        renderPaymentMethods();

                    }
                );

            }
        );

}

addPaymentMethodButton.addEventListener(
    "click",
    () => {

        const name =
            paymentMethodInput.value.trim();


        if (!name) {

            return;

        }


        const normalizedName =
            normalizePaymentMethod(
                name
            );


        const alreadyExists =
            paymentMethods.some(
                method =>
                    normalizePaymentMethod(
                        method
                    ) === normalizedName
            );


        if (alreadyExists) {

            alert(
                "Esta forma de pagamento já está cadastrada."
            );

            return;

        }


        paymentMethods.push(
            name
        );


        paymentMethodInput.value =
            "";


        renderPaymentMethods();


        paymentMethodInput.focus();

    }
);