/* ==================================================
   CONFIGURAÇÕES GERAIS DA LOJA
   ================================================== */

const CONFIG = {

    /* Nome da loja */

    storeName: "Da Minha Vó Massas Afetivas",

    /* Horário exibido no topo */

    storeHours: "Seg a Sáb • 09h às 19h | Dom 09h às 12h",
	
	// storeHours: "Voltaremos ao antedimento normal em 13/07/26",

    /* WhatsApp que receberá os pedidos */

    whatsappNumber: "5518991971486",

    /* Logo da loja */

    logo: "assets/logo.png",
	
	/* Chave PIX */
	
	pixKey: "18 99197-1486",
	
	/* Titular PIX */
	
	pixOwner: "Edson de Souza",
	 
	/* Taxa delivery */
	
	deliveryFee: 0.00,
	
	/* URL Google sheets */
	
	productsSheetUrl: "https://docs.google.com/spreadsheets/d/18_m33h_qUJ_TyILfTIIdMhOMItSq4ySTFkJOersxY6E/gviz/tq?tqx=responseHandler:handleSheetData&gid=0",

	openingHours: {
    //0: null, // Domingo fechado
	0: ["09:00", "12:00"], // Domingo
    1: ["09:00", "19:00"], // Segunda
    2: ["09:00", "19:00"], // Terça
    3: ["09:00", "19:00"], // Quarta
    4: ["09:00", "19:00"], // Quinta
    5: ["09:00", "19:00"], // Sexta
    6: ["09:00", "19:00"]  // Sábado
},

	/* Endereco retirada */
	pickupAddress: "Avenida Rodrigues Alves, 67 - Andradina/SP",

    /* ==================================================
       CORES DA IDENTIDADE VISUAL
       ================================================== */

    colors: {

        primary: "#D4432B",

        secondary: "#F2E3CC",

        text: "#4B5454"

    }

};