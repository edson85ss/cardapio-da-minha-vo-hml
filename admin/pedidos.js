
import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    where,
    limit,
    startAfter,
    endBefore,
    limitToLast,
	getCountFromServer,
    doc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/* ==================================================
   ELEMENTOS DA PÁGINA
   ================================================== */

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const sidebarOverlay =
    document.getElementById("sidebarOverlay");

const logoutButton =
    document.getElementById("logoutButton");

const ordersList =
    document.getElementById("ordersList");
	
const orderNumberFilter =
    document.getElementById("orderNumberFilter");

const orderStartDateFilter =
    document.getElementById("orderStartDateFilter");

const orderEndDateFilter =
    document.getElementById("orderEndDateFilter");

const searchOrdersButton =
    document.getElementById("searchOrdersButton");

const clearOrdersFiltersButton =
    document.getElementById("clearOrdersFiltersButton");
	
const exportOrdersCsvButton =
    document.getElementById("exportOrdersCsvButton");

const ordersFilterMessage =
    document.getElementById("ordersFilterMessage");

const ordersPagination =
    document.getElementById("ordersPagination");

const previousOrdersPageButton =
    document.getElementById("previousOrdersPageButton");

const nextOrdersPageButton =
    document.getElementById("nextOrdersPageButton");

const ordersPageInfo =
    document.getElementById("ordersPageInfo");


/* ==================================================
   ELEMENTOS DO MODAL
   ================================================== */

const orderDetailsModal =
    document.getElementById("orderDetailsModal");

const orderDetailsModalOverlay =
    document.getElementById("orderDetailsModalOverlay");

const orderDetailsTitle =
    document.getElementById("orderDetailsTitle");

const closeOrderDetailsModalButton =
    document.getElementById("closeOrderDetailsModal");

const closeOrderDetailsButton =
    document.getElementById("closeOrderDetailsButton");

const orderDetailsContent =
    document.getElementById("orderDetailsContent");
	
const deleteOrderButton =
    document.getElementById("deleteOrderButton");


/* ==================================================
   DADOS LOCAIS
   ================================================== */

// Armazena os pedidos carregados do Firestore.
// O ID do documento será usado para localizar
// os dados completos ao abrir o modal.

let adminOrders = [];

let currentOrderId = null;

const PAGE_SIZE = 25;

const MAX_EXPORT_ORDERS = 1000;

let currentPage = 1;

let currentPageFirstDoc = null;

let currentPageLastDoc = null;

let hasNextPage = false;

let activeOrderFilters = {

    number: null,

    startDate: null,

    endDate: null

};


/* ==================================================
   FORMATAÇÃO DE VALORES
   ================================================== */

function formatCurrency(value) {

    let numericValue;

    if (typeof value === "string") {

        const normalizedValue =
            value.trim().replace(/R\$\s?/g, "");

        numericValue =
            normalizedValue.includes(",")
                ? Number(
                    normalizedValue
                        .replace(/\./g, "")
                        .replace(",", ".")
                )
                : Number(normalizedValue);

    }

    else {

        numericValue = Number(value || 0);

    }

    if (!Number.isFinite(numericValue)) {
        numericValue = 0;
    }

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(numericValue);

}


/* ==================================================
   FORMATAÇÃO DE DATA E HORA
   ================================================== */

function formatDateTime(value) {

    if (!value) {
        return "—";
    }

    let date;

    // Timestamp do Firestore

    if (
        typeof value.toDate === "function"
    ) {

        date = value.toDate();

    }

    // Data já convertida para Date

    else if (
        value instanceof Date
    ) {

        date = value;

    }

    // Data armazenada como texto

    else {

        date = new Date(value);

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ==================================================
   PROTEÇÃO CONTRA HTML INJETADO
   ================================================== */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


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

        await loadOrders();

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
   FILTROS DE PEDIDOS
   ================================================== */

function clearOrderFilterMessage() {

    ordersFilterMessage.textContent = "";

    ordersFilterMessage.classList.remove(
        "error"
    );

}


function showOrderFilterError(message) {

    ordersFilterMessage.textContent =
        message;

    ordersFilterMessage.classList.add(
        "error"
    );

}


function createLocalDate(
    value,
    endOfDay = false
) {

    const [
        year,
        month,
        day
    ] = value.split("-").map(Number);


    return endOfDay

        ? new Date(
            year,
            month - 1,
            day,
            23,
            59,
            59,
            999
        )

        : new Date(
            year,
            month - 1,
            day,
            0,
            0,
            0,
            0
        );

}


function applyOrderFilters() {

    clearOrderFilterMessage();


    const numberText =
        orderNumberFilter.value.trim();

    const startDateText =
        orderStartDateFilter.value;

    const endDateText =
        orderEndDateFilter.value;


    /*
       Número e período não são combinados.
    */

    if (
        numberText &&
        (
            startDateText ||
            endDateText
        )
    ) {

        showOrderFilterError(
            "Informe o número do pedido ou um período de datas."
        );

        return;

    }


    /*
       Busca por número.
    */

    if (numberText) {

        if (
            !/^\d+$/.test(numberText)
        ) {

            showOrderFilterError(
                "Informe um número de pedido válido."
            );

            return;

        }


        const numberValue =
            Number(numberText);


        if (
            !Number.isSafeInteger(
                numberValue
            ) ||
            numberValue < 1
        ) {

            showOrderFilterError(
                "Informe um número de pedido válido."
            );

            return;

        }


        activeOrderFilters = {

            number:
                numberValue,

            startDate:
                null,

            endDate:
                null

        };

        loadOrders();

        return;

    }


    /*
       Busca por período.
    */

    if (
        startDateText ||
        endDateText
    ) {

        if (
            !startDateText ||
            !endDateText
        ) {

            showOrderFilterError(
                "Informe a data inicial e a data final."
            );

            return;

        }


        const startDate =
            createLocalDate(
                startDateText
            );

        const endDate =
            createLocalDate(
                endDateText,
                true
            );


        if (
            startDate > endDate
        ) {

            showOrderFilterError(
                "A data inicial não pode ser posterior à data final."
            );

            return;

        }


        activeOrderFilters = {

            number:
                null,

            startDate:
                startDate,

            endDate:
                endDate

        };

        loadOrders();

        return;

    }


    /*
       Sem filtros.
    */

    activeOrderFilters = {

        number:
            null,

        startDate:
            null,

        endDate:
            null

    };

    loadOrders();

}


function clearOrderFilters() {

    orderNumberFilter.value =
        "";

    orderStartDateFilter.value =
        "";

    orderEndDateFilter.value =
        "";

    activeOrderFilters = {

        number:
            null,

        startDate:
            null,

        endDate:
            null

    };

    clearOrderFilterMessage();

    loadOrders();

}


/* ==================================================
   EXPORTAÇÃO CSV
   ================================================== */

function normalizeExportValue(value) {

    if (value === null || value === undefined) {
        return "";
    }


    /*
       Firestore Timestamp
    */

    if (
        value &&
        typeof value.toDate === "function"
    ) {

        return value.toDate().toLocaleString(
            "pt-BR"
        );

    }


    /*
       Date nativo
    */

    if (
        value instanceof Date
    ) {

        return value.toLocaleString(
            "pt-BR"
        );

    }


    /*
       Arrays
    */

    if (
        Array.isArray(value)
    ) {

        return JSON.stringify(
            value.map(
                item =>
                    normalizeExportObject(item)
            ),
            null,
            0
        );

    }


    /*
       Objetos
    */

    if (
        typeof value === "object"
    ) {

        return JSON.stringify(
            normalizeExportObject(value),
            null,
            0
        );

    }


    return String(value);

}


function normalizeExportObject(object) {

    if (
        object === null ||
        object === undefined
    ) {

        return object;

    }


    if (
        object &&
        typeof object.toDate === "function"
    ) {

        return object.toDate().toLocaleString(
            "pt-BR"
        );

    }


    if (
        object instanceof Date
    ) {

        return object.toLocaleString(
            "pt-BR"
        );

    }


    if (
        Array.isArray(object)
    ) {

        return object.map(
            item =>
                normalizeExportObject(item)
        );

    }


    if (
        typeof object === "object"
    ) {

        const normalized = {};

        Object.keys(object).forEach(
            key => {

                normalized[key] =
                    normalizeExportObject(
                        object[key]
                    );

            }
        );

        return normalized;

    }


    return object;

}


function escapeCsvValue(value) {

    const text =
        String(value ?? "");


    /*
       CSV com separador ;
       adequado ao Excel em ambiente
       pt-BR.
    */

    return `"${text.replace(
        /"/g,
        '""'
    )}"`;

}


function createOrdersCsv(orders) {

    if (
        !orders.length
    ) {

        return null;

    }


    /*
       Mantemos os principais campos
       conhecidos do snapshot no início.
       Campos adicionais existentes no
       documento também serão exportados.
    */

    const preferredFields = [

        "numero",
        "criadoEm",
        "cliente",
        "entrega",
        "pagamento",
        "itens",
        "subtotal",
        "taxaEntrega",
        "total"

    ];


    /*
       Descobre eventuais campos adicionais
       sem perder nenhum dado do documento.
    */

    const additionalFields = [
        ...new Set(
            orders.flatMap(
                order =>
                    Object.keys(order)
            )
        )
    ].filter(
        field =>
            !preferredFields.includes(field)
    );


    const fields = [
        ...preferredFields.filter(
            field =>
                orders.some(
                    order =>
                        Object.prototype.hasOwnProperty.call(
                            order,
                            field
                        )
                )
        ),
        ...additionalFields
    ];


    const header =
        fields
            .map(
                field =>
                    escapeCsvValue(field)
            )
            .join(";");


    const monetaryFields = [
    "subtotal",
    "taxaEntrega",
    "total"
];


const rows =
    orders.map(
        order =>
            fields
                .map(
                    field => {

                        let value;


                        if (
                            monetaryFields.includes(
                                field
                            )
                        ) {

                            const numericValue =
                                Number(
                                    order[field] ?? 0
                                );


                            value =
                                Number.isFinite(
                                    numericValue
                                )
                                    ? numericValue
                                        .toFixed(2)
                                        .replace(
                                            ".",
                                            ","
                                        )
                                    : "0,00";

                        }

                        else {

                            value =
                                normalizeExportValue(
                                    order[field]
                                );

                        }


                        return escapeCsvValue(
                            value
                        );

                    }
                )
                .join(";")
    );


    /*
       BOM UTF-8 para melhor compatibilidade
       com Excel.
    */

    return "\uFEFF" +
        header +
        "\r\n" +
        rows.join("\r\n");

}


function getOrdersExportFilename() {

    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );

    const hour =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );

    const minute =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    return `pedidos-${year}-${month}-${day}-${hour}-${minute}.csv`;

}


async function exportOrdersCsv() {

    try {

        /*
           Sem filtro significa exportar toda
           a coleção. Pedimos confirmação antes
           da leitura para evitar uma exportação
           acidentalmente grande.
        */

        const exportingAllOrders =
            activeOrderFilters.number === null &&
            activeOrderFilters.startDate === null &&
            activeOrderFilters.endDate === null;


        if (
            exportingAllOrders
        ) {

            const confirmed =
                confirm(
                    "Nenhum filtro está aplicado.\n\n" +
                    "O CSV será gerado com todos os pedidos disponíveis.\n\n" +
                    "Deseja continuar?"
                );


            if (
                !confirmed
            ) {

                return;

            }

        }


        exportOrdersCsvButton.disabled =
            true;

        exportOrdersCsvButton.textContent =
            "Exportando...";


        const ordersReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "pedidos"
            );


        const constraints = [];


        /*
           Número
        */

        if (
            activeOrderFilters.number !== null
        ) {

            constraints.push(
                where(
                    "numero",
                    "==",
                    activeOrderFilters.number
                )
            );

        }

        else {

            /*
               Data inicial
            */

            if (
                activeOrderFilters.startDate
            ) {

                constraints.push(
                    where(
                        "criadoEm",
                        ">=",
                        activeOrderFilters.startDate
                    )
                );

            }


            /*
               Data final
            */

            if (
                activeOrderFilters.endDate
            ) {

                constraints.push(
                    where(
                        "criadoEm",
                        "<=",
                        activeOrderFilters.endDate
                    )
                );

            }


            /*
               Mantemos a mesma ordenação
               utilizada na listagem.
            */

            constraints.push(
                orderBy(
                    "criadoEm",
                    "desc"
                )
            );

        }


        /*
		   Primeiro contamos quantos pedidos
		   correspondem ao filtro.

		   Não usamos orderBy no count(),
		   pois ele não é necessário para
		   determinar a quantidade.
		*/

		const countConstraints = [];


		/*
		   Busca por número
		*/

		if (
			activeOrderFilters.number !== null
		) {

			countConstraints.push(
				where(
					"numero",
					"==",
					activeOrderFilters.number
				)
			);

		}

		else {

			/*
			   Filtro por data inicial
			*/

			if (
				activeOrderFilters.startDate
			) {

				countConstraints.push(
					where(
						"criadoEm",
						">=",
						activeOrderFilters.startDate
					)
				);

			}


			/*
			   Filtro por data final
			*/

			if (
				activeOrderFilters.endDate
			) {

				countConstraints.push(
					where(
						"criadoEm",
						"<=",
						activeOrderFilters.endDate
					)
				);

			}

		}


		/*
		   Query utilizada somente para obter
		   a quantidade de documentos.
		*/

		const countQuery =
			query(
				ordersReference,
				...countConstraints
			);


		const countSnapshot =
			await getCountFromServer(
				countQuery
			);


		const totalOrdersToExport =
			countSnapshot.data().count;


		/*
		   Proteção contra exportações muito grandes.
		*/

		if (
			totalOrdersToExport >
			MAX_EXPORT_ORDERS
		) {

			alert(
				`Foram encontrados ${totalOrdersToExport.toLocaleString("pt-BR")} pedidos para exportação.\n\n` +
				`Por segurança, o limite para uma única exportação é de ${MAX_EXPORT_ORDERS.toLocaleString("pt-BR")} pedidos.\n\n` +
				`Refine o período de consulta e faça a exportação em partes.`
			);

			return;

		}


		/*
		   Agora fazemos a consulta real,
		   somente porque sabemos que está
		   dentro do limite.
		*/

		const exportQuery =
			query(
				ordersReference,
				...constraints
			);


		const snapshot =
			await getDocs(
				exportQuery
			);


        const orders =
            snapshot.docs.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        if (
            orders.length === 0
        ) {

            alert(
                "Nenhum pedido encontrado para exportação."
            );

            return;

        }


        const csv =
            createOrdersCsv(
                orders
            );


        if (
            !csv
        ) {

            alert(
                "Não foi possível gerar o arquivo CSV."
            );

            return;

        }


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;

        link.download =
            getOrdersExportFilename();


        document.body.appendChild(
            link
        );

        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );


        alert(
            `${orders.length} pedido(s) exportado(s) com sucesso.`
        );

    }

    catch (error) {

        console.error(
            "Erro ao exportar pedidos:",
            error
        );


        alert(
            "Não foi possível exportar os pedidos."
        );

    }

    finally {

        exportOrdersCsvButton.disabled =
            false;

        exportOrdersCsvButton.textContent =
            "Exportar CSV";

    }

}


/* ==================================================
   CARREGA PEDIDOS DO FIRESTORE
   ================================================== */

async function loadOrders(
    direction = "first"
) {

    try {

        ordersList.innerHTML = `
            <div class="empty-state">
                Carregando pedidos...
            </div>
        `;


        /*
           Quando uma nova busca começa,
           voltamos para a primeira página.
        */

        if (
            direction === "first"
        ) {

            currentPage = 1;

            currentPageFirstDoc =
                null;

            currentPageLastDoc =
                null;

            hasNextPage =
                false;

        }


        const ordersReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "pedidos"
            );


        const constraints = [];


        /*
           Busca exata por número.
           Não usamos orderBy neste caso.
        */

        if (
            activeOrderFilters.number !==
            null
        ) {

            constraints.push(
                where(
                    "numero",
                    "==",
                    activeOrderFilters.number
                )
            );

        }

        else {

            /*
               Filtro por intervalo.
            */

            if (
                activeOrderFilters.startDate
            ) {

                constraints.push(
                    where(
                        "criadoEm",
                        ">=",
                        activeOrderFilters.startDate
                    )
                );

            }


            if (
                activeOrderFilters.endDate
            ) {

                constraints.push(
                    where(
                        "criadoEm",
                        "<=",
                        activeOrderFilters.endDate
                    )
                );

            }


            /*
               Mantém a ordem mais recente
               primeiro.
            */

            constraints.push(
                orderBy(
                    "criadoEm",
                    "desc"
                )
            );

        }


        /*
           Paginação.
        */

        if (
            direction === "next" &&
            currentPageLastDoc
        ) {

            constraints.push(
                startAfter(
                    currentPageLastDoc
                )
            );

        }


        if (
            direction === "previous" &&
            currentPageFirstDoc
        ) {

            constraints.push(
                endBefore(
                    currentPageFirstDoc
                )
            );

        }


        /*
           Para avançar, buscamos 26 registros.
           O 26º serve apenas para saber
           se existe uma próxima página.
        */

        if (
            direction === "previous"
        ) {

            constraints.push(
                limitToLast(
                    PAGE_SIZE
                )
            );

        }

        else {

            constraints.push(
                limit(
                    PAGE_SIZE + 1
                )
            );

        }


        const ordersQuery =
            query(
                ordersReference,
                ...constraints
            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        let documents =
            snapshot.docs;


        /*
           Se estivermos avançando ou
           carregando a primeira página:
        */

        if (
            direction !== "previous"
        ) {

            hasNextPage =
                documents.length >
                PAGE_SIZE;


            if (
                hasNextPage
            ) {

                documents =
                    documents.slice(
                        0,
                        PAGE_SIZE
                    );

            }

        }

        else {

            /*
               Se estamos voltando,
               sabemos que existe uma
               página à frente.
            */

            hasNextPage =
                true;

        }


        adminOrders =
            documents.map(
                documentSnapshot => ({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                })
            );


        /*
           Atualiza os cursores da página
           atualmente exibida.
        */

        currentPageFirstDoc =
            documents[0] ?? null;

        currentPageLastDoc =
            documents[
                documents.length - 1
            ] ?? null;


        if (
            direction === "next"
        ) {

            currentPage += 1;

        }


        if (
            direction === "previous"
        ) {

            currentPage -= 1;

        }


        renderOrders();

    }

    catch (error) {

        console.error(
            "Erro ao carregar pedidos:",
            error
        );


        ordersList.innerHTML = `
            <div class="empty-state">

                <h3>
                    Não foi possível carregar os pedidos.
                </h3>

                <p>
                    Verifique sua conexão e tente atualizar a página.
                </p>

            </div>
        `;


        ordersPagination.hidden =
            true;

    }

}


/* ==================================================
   RENDERIZA TABELA DE PEDIDOS
   ================================================== */

function renderOrders() {

    ordersList.innerHTML = "";


    // Nenhum pedido cadastrado

    if (
        adminOrders.length === 0
    ) {

        ordersList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ▤
                </div>

                <h3>
                    Nenhum pedido encontrado
                </h3>

                <p>
                    Os pedidos realizados pelo cardápio aparecerão aqui.
                </p>

            </div>
        `;
		
		updateOrdersPagination();

        return;

    }


    const tableWrapper =
        document.createElement("div");

    tableWrapper.className =
        "orders-table-wrapper";


    const table =
        document.createElement("table");

    table.className =
        "orders-table";


    // Cabeçalho da tabela

    table.innerHTML = `
        <thead>
            <tr>
                <th>Pedido nº</th>
                <th>Data/hora</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Total</th>
            </tr>
        </thead>

        <tbody></tbody>
    `;


    const tbody =
        table.querySelector("tbody");


    adminOrders.forEach(
        order => {

            const row =
                document.createElement("tr");


            const orderNumber =
                escapeHTML(
                    order.numero ?? "—"
                );

            const orderDate =
                escapeHTML(
                    formatDateTime(
                        order.criadoEm
                    )
                );

            const customerName =
                escapeHTML(
                    order.cliente?.nome || "—"
                );

            const customerPhone =
                escapeHTML(
                    order.cliente?.telefone || "—"
                );

            const total =
                escapeHTML(
                    formatCurrency(
                        order.total
                    )
                );


            row.innerHTML = `

                <td>
                    <button
                        type="button"
                        class="order-number-button"
                        data-order-id="${escapeHTML(order.id)}"
                    >
                        #${orderNumber}
                    </button>
                </td>

                <td>
                    ${orderDate}
                </td>

                <td>
                    ${customerName}
                </td>

                <td>
                    ${customerPhone}
                </td>

                <td class="order-total">
                    ${total}
                </td>

            `;


            tbody.appendChild(row);

        }
    );


    tableWrapper.appendChild(table);

    ordersList.appendChild(tableWrapper);


    setupOrderButtons();
	
	updateOrdersPagination();

}

/* ==================================================
   ATUALIZA PAGINAÇÃO
   ================================================== */

function updateOrdersPagination() {

    const shouldShowPagination =
        adminOrders.length > 0 &&
        (
            currentPage > 1 ||
            hasNextPage
        );


    ordersPagination.hidden =
        !shouldShowPagination;


    previousOrdersPageButton.disabled =
        currentPage <= 1;


    nextOrdersPageButton.disabled =
        !hasNextPage;


    ordersPageInfo.textContent =
        `Página ${currentPage}`;

}


/* ==================================================
   BOTÕES DE DETALHAMENTO
   ================================================== */

function setupOrderButtons() {

    document
        .querySelectorAll(
            ".order-number-button"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const orderId =
                            button.dataset.orderId;


                        openOrderDetails(
                            orderId
                        );

                    }
                );

            }
        );

}


/* ==================================================
   ABRE DETALHES DO PEDIDO
   ================================================== */

function openOrderDetails(orderId) {

    const order =
        adminOrders.find(
            item =>
                item.id === orderId
        );


    if (!order) {

        return;

    }
	
	currentOrderId = order.id;

    orderDetailsTitle.textContent =
        `Pedido #${order.numero ?? "—"}`;


    orderDetailsContent.innerHTML =
        buildOrderDetailsHTML(order);


    orderDetailsModal.classList.add(
        "open"
    );

}


/* ==================================================
   MONTA HTML DOS DETALHES
   ================================================== */

function buildOrderDetailsHTML(order) {

    const cliente =
        order.cliente || {};

    const entrega =
        order.entrega || {};

    const pagamento =
        order.pagamento || {};


    /* ==============================================
       CLIENTE
       ============================================== */

    const customerHTML = `

        <div class="order-detail-section">

            <h3>Dados do cliente</h3>

            <div class="order-detail-field">

                <span>Nome</span>

                <strong>
                    ${escapeHTML(cliente.nome || "—")}
                </strong>

            </div>

            <div class="order-detail-field">

                <span>Telefone</span>

                <strong>
                    ${escapeHTML(cliente.telefone || "—")}
                </strong>

            </div>

        </div>

    `;


    /* ==============================================
       ENTREGA / RETIRADA
       ============================================== */

    const deliveryType =
        entrega.tipo ||
        entrega.modalidade ||
        entrega.forma ||
        "—";


    const deliveryAddress =
        entrega.endereco ||
        entrega.enderecoCompleto ||
        entrega.observacao ||
        "";


    const deliveryHTML = `

        <div class="order-detail-section">

            <h3>Entrega / retirada</h3>

            <div class="order-detail-field">

                <span>Modalidade</span>

                <strong>
                    ${escapeHTML(deliveryType)}
                </strong>

            </div>

            ${
                deliveryAddress
                    ? `
                        <div class="order-detail-field">

                            <span>Endereço / informações</span>

                            <strong>
                                ${escapeHTML(deliveryAddress)}
                            </strong>

                        </div>
                    `
                    : ""
            }

        </div>

    `;


    /* ==============================================
       PAGAMENTO
       ============================================== */

    const paymentMethod =
        pagamento.forma ||
        pagamento.metodo ||
        pagamento.tipo ||
        "—";


    const changeFor =
        pagamento.trocoPara;


    const paymentHTML = `

        <div class="order-detail-section">

            <h3>Pagamento</h3>

            <div class="order-detail-field">

                <span>Forma de pagamento</span>

                <strong>
                    ${escapeHTML(paymentMethod)}
                </strong>

            </div>

            ${
                changeFor
                    ? `
                        <div class="order-detail-field">

                            <span>Troco para</span>

                            <strong>
                                ${escapeHTML(formatCurrency(changeFor))}
                            </strong>

                        </div>
                    `
                    : ""
            }

        </div>

    `;


    /* ==============================================
       ITENS DO PEDIDO
       ============================================== */

    const items =
        Array.isArray(order.itens)
            ? order.itens
            : [];


    let itemsHTML = `

        <div class="order-detail-section">

            <h3>Itens do pedido</h3>

    `;


    if (
        items.length === 0
    ) {

        itemsHTML += `
            <p>Nenhum item encontrado.</p>
        `;

    }


    items.forEach(
        item => {

            const productName =
                item.nome ||
                item.name ||
                "Produto";


            const quantity =
                Number(
                    item.quantidade ??
                    item.quantity ??
                    1
                );


            const basePrice =
                Number(
                    item.precoBase ??
                    item.preco ??
                    item.price ??
                    0
                );


            const itemSubtotal =
                Number(
                    item.subtotal ??
                    (
                        Number(item.precoUnitario || basePrice) *
                        quantity
                    )
                );


            itemsHTML += `

                <div class="order-detail-product">

                    <div class="order-detail-product-header">

                        <strong>
                            ${escapeHTML(productName)}
                        </strong>

                        <strong>
                            ${escapeHTML(formatCurrency(itemSubtotal))}
                        </strong>

                    </div>

                    <div class="order-detail-product-info">

                        <span>
                            ${quantity} × ${escapeHTML(formatCurrency(basePrice))}
                        </span>

                    </div>

            `;


            /* ======================================
               COMPLEMENTOS
               ====================================== */

            const complements =
                Array.isArray(item.complementos)
                    ? item.complementos
                    : [];


            if (
                complements.length > 0
            ) {

                itemsHTML += `
                    <div class="order-detail-complements">
                        <span>Complementos:</span>
                `;


                complements.forEach(
                    complement => {

                        const complementName =
                            complement.nome ||
                            complement.name ||
                            "Complemento";


                        const options =
                            Array.isArray(complement.opcoes)
                                ? complement.opcoes
                                : [];


                        if (
                            options.length > 0
                        ) {

                            options.forEach(
                                option => {

                                    const optionName =
                                        option.nome ||
                                        option.name ||
                                        "Opção";


                                    const optionQuantity =
                                        Number(
                                            option.quantidade || 1
                                        );


                                    const optionPrice =
                                        Number(
                                            option.preco ??
                                            option.price ??
                                            0
                                        );


                                    itemsHTML += `

                                        <div class="order-detail-complement-line">

                                            <span>
                                                ${escapeHTML(complementName)}:
                                                ${escapeHTML(optionName)}
                                                ${
                                                    optionQuantity > 1
                                                        ? `(${optionQuantity}x)`
                                                        : ""
                                                }
                                            </span>

                                            <span>
                                                ${escapeHTML(formatCurrency(optionPrice * optionQuantity))}
                                            </span>

                                        </div>

                                    `;

                                }
                            );

                        }

                        else {

                            const complementPrice =
                                Number(
                                    complement.preco ||
                                    complement.price ||
                                    0
                                );


                            itemsHTML += `

                                <div class="order-detail-complement-line">

                                    <span>
                                        ${escapeHTML(complementName)}
                                    </span>

                                    <span>
                                        ${escapeHTML(formatCurrency(complementPrice))}
                                    </span>

                                </div>

                            `;

                        }

                    }
                );


                itemsHTML += `
                    </div>
                `;

            }


            /* ======================================
               OBSERVAÇÕES
               ====================================== */

            const observation =
                item.observacao ||
                item.observacoes ||
                "";


            if (observation) {

                itemsHTML += `

                    <div class="order-detail-observation">

                        <span>Observações:</span>

                        <p>
                            ${escapeHTML(observation)}
                        </p>

                    </div>

                `;

            }


            itemsHTML += `
                </div>
            `;

        }
    );


    itemsHTML += `
        </div>
    `;


    /* ==============================================
       RESUMO DOS VALORES
       ============================================== */

    const subtotal =
        Number(order.subtotal || 0);

    const deliveryFee =
        Number(order.taxaEntrega || 0);

    const total =
        Number(order.total || 0);


    const totalsHTML = `

        <div class="order-detail-totals">

            <div class="order-detail-total-line">

                <span>Subtotal</span>

                <strong>
                    ${escapeHTML(formatCurrency(subtotal))}
                </strong>

            </div>

            <div class="order-detail-total-line">

                <span>Taxa de entrega</span>

                <strong>
                    ${escapeHTML(formatCurrency(deliveryFee))}
                </strong>

            </div>

            <div class="order-detail-total-line order-detail-grand-total">

                <span>Total do pedido</span>

                <strong>
                    ${escapeHTML(formatCurrency(total))}
                </strong>

            </div>

        </div>

    `;


    /* ==============================================
       RETORNO COMPLETO
       ============================================== */

    return `
        ${customerHTML}
        ${deliveryHTML}
        ${paymentHTML}
        ${itemsHTML}
        ${totalsHTML}
    `;

}

/* ==================================================
   EXCLUI PEDIDO
   ================================================== */

async function deleteCurrentOrder() {

    if (!currentOrderId) {
        return;
    }

    const order =
        adminOrders.find(
            item =>
                item.id === currentOrderId
        );

    if (!order) {
        return;
    }

    const confirmed =
        confirm(
            `Deseja realmente excluir o pedido #${order.numero ?? "—"}?\n\n` +
            `A exclusão do pedido não restaura automaticamente o estoque. ` +
            `Se necessário, a reposição deverá ser feita manualmente no módulo de estoque.\n\n` +
            `Esta ação não pode ser desfeita.`
        );

    if (!confirmed) {
        return;
    }

    deleteOrderButton.disabled = true;
    deleteOrderButton.textContent = "Excluindo...";

    try {

        const orderReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "pedidos",
                currentOrderId
            );

        await deleteDoc(
            orderReference
        );

        currentOrderId = null;

        closeOrderDetailsModal();

        await loadOrders();

    }

    catch (error) {

        console.error(
            "Erro ao excluir pedido:",
            error
        );

        alert(
            "Não foi possível excluir o pedido."
        );

    }

    finally {

        deleteOrderButton.disabled = false;
        deleteOrderButton.textContent = "Excluir pedido";

    }

}

/* ==================================================
   FECHA MODAL DE DETALHES
   ================================================== */

function closeOrderDetailsModal() {

    orderDetailsModal.classList.remove(
        "open"
    );
	
	currentOrderId = null;
}

deleteOrderButton.addEventListener(
    "click",
    deleteCurrentOrder
);

closeOrderDetailsModalButton.addEventListener(
    "click",
    closeOrderDetailsModal
);


closeOrderDetailsButton.addEventListener(
    "click",
    closeOrderDetailsModal
);


orderDetailsModalOverlay.addEventListener(
    "click",
    closeOrderDetailsModal
);

searchOrdersButton.addEventListener(
    "click",
    applyOrderFilters
);


clearOrdersFiltersButton.addEventListener(
    "click",
    clearOrderFilters
);

previousOrdersPageButton.addEventListener(
    "click",
    () => {

        if (
            currentPage > 1
        ) {

            loadOrders(
                "previous"
            );

        }

    }
);


nextOrdersPageButton.addEventListener(
    "click",
    () => {

        if (
            hasNextPage
        ) {

            loadOrders(
                "next"
            );

        }

    }
);

exportOrdersCsvButton.addEventListener(
    "click",
    exportOrdersCsv
);


/* ==================================================
   FECHA MODAL COM ESC
   ================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeOrderDetailsModal();

        }

    }
);