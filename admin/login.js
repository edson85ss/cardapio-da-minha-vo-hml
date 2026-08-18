/* ==================================================
   FIREBASE
   ================================================== */

import {
    auth
}
from "../firebase-config.js";


import {
    signInWithEmailAndPassword,
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";


/* ==================================================
   ELEMENTOS
   ================================================== */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginError =
    document.getElementById("loginError");


/* ==================================================
   USUÁRIO JÁ AUTENTICADO
   ==================================================

   Se já houver uma sessão válida,
   não mostramos o login novamente.
   ================================================== */

onAuthStateChanged(
    auth,
    (user) => {

        if (user) {

            window.location.href =
                "produtos.html";

        }

    }
);


/* ==================================================
   LOGIN
   ================================================== */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        loginError.textContent =
            "";

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            loginError.textContent =
                "Informe o e-mail e a senha.";

            return;

        }


        try {

            loginButton.disabled =
                true;

            loginButton.textContent =
                "Entrando...";


            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            /*
             * O onAuthStateChanged acima
             * fará o redirecionamento.
             */

        }

        catch (error) {

            console.error(
                "Erro no login:",
                error
            );


            loginError.textContent =
                getLoginErrorMessage(
                    error.code
                );


            loginButton.disabled =
                false;

            loginButton.textContent =
                "Entrar";

        }

    }
);


/* ==================================================
   MENSAGENS AMIGÁVEIS
   ================================================== */

function getLoginErrorMessage(code) {

    switch (code) {

        case "auth/invalid-email":

            return "E-mail inválido.";


        case "auth/invalid-credential":

            return "E-mail ou senha incorretos.";


        case "auth/user-disabled":

            return "Este usuário está desativado.";


        case "auth/too-many-requests":

            return "Muitas tentativas. Aguarde alguns minutos.";


        default:

            return "Não foi possível realizar o login.";

    }

}