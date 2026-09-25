
import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
    collection,
    getDocs,
    query,
    orderBy
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


/* ==================================================
   DADOS LOCAIS
   ================================================== */

// Armazena os pedidos carregados do Firestore.
// O ID do documento será usado para localizar
// os dados completos ao abrir o modal.

let adminOrders = [];


/* ==================================================
   FORMATAÇÃO DE VALORES
   ================================================== */

function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value || 0)
    );

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
   CARREGA PEDIDOS DO FIRESTORE
   ================================================== */

async function loadOrders() {

    try {

        ordersList.innerHTML = `
            <div class="empty-state">
                Carregando pedidos...
            </div>
        `;


        const ordersReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "pedidos"
            );


        // Ordena do pedido mais recente
        // para o mais antigo.

        const ordersQuery =
            query(
                ordersReference,
                orderBy(
                    "criadoEm",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        adminOrders = [];


        snapshot.forEach(
            documentSnapshot => {

                adminOrders.push({

                    id:
                        documentSnapshot.id,

                    ...documentSnapshot.data()

                });

            }
        );


        renderOrders();

    }

    catch (error) {

        console.error(
            "Erro ao carregar pedidos:",
            error
        );

        ordersList.innerHTML = `
            <div class="empty-state">
                <h3>Não foi possível carregar os pedidos.</h3>

                <p>
                    Verifique sua conexão e tente atualizar a página.
                </p>
            </div>
        `;

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
   FECHA MODAL DE DETALHES
   ================================================== */

function closeOrderDetailsModal() {

    orderDetailsModal.classList.remove(
        "open"
    );

}


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