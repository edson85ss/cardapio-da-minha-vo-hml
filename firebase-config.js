/* ==================================================
   CONFIGURAÇÃO DO FIREBASE
   ==================================================

   Este arquivo inicializa a conexão da página
   com o projeto Firebase.

   Os dados firebaseConfig são fornecidos pelo
   próprio Firebase Console.
   ================================================== */


/* Firebase principal */

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";


/* Cloud Firestore */

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";


/* Firebase Authentication
   Já deixaremos preparado para o futuro painel admin.
*/

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";


/* Firebase Storage
   Será usado posteriormente para logos e fotos.
*/

import { getStorage }
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";


/* ==================================================
   CONFIGURAÇÃO DO SEU PROJETO
   ==================================================

   Substitua os valores abaixo exatamente pelos
   fornecidos pelo Firebase Console.
   ================================================== */

const firebaseConfig = {

  apiKey: "AIzaSyD2B0RyoDf3EOxxqpwiBzrLdrWCz3FmbTk",
  authDomain: "cardapios-digitais-2d3fd.firebaseapp.com",
  projectId: "cardapios-digitais-2d3fd",
  storageBucket: "cardapios-digitais-2d3fd.firebasestorage.app",
  messagingSenderId: "538029388855",
  appId: "1:538029388855:web:dfa38730dff8f1c514fbb2"

};


/* ==================================================
   INICIALIZA O FIREBASE
   ================================================== */

const firebaseApp =
    initializeApp(firebaseConfig);


/* ==================================================
   SERVIÇOS QUE UTILIZAREMOS
   ================================================== */

/* Banco de dados */

const db =
    getFirestore(firebaseApp);


/* Autenticação */

const auth =
    getAuth(firebaseApp);


/* Armazenamento de imagens */

const storage =
    getStorage(firebaseApp);


/* ==================================================
   EXPORTAÇÃO
   ==================================================

   Outros arquivos poderão importar somente
   aquilo que precisarem.
   ================================================== */

export {
    firebaseApp,
    db,
    auth,
    storage
};