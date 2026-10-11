import { auth, db } from "../firebase-config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import {
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const PIZZARIA_MENU_SELECTOR = "[data-menu-pizzaria]";
let refreshSequence = 0;

function setPizzariaMenuVisible(visible) {
    document.querySelectorAll(PIZZARIA_MENU_SELECTOR).forEach((item) => {
        item.classList.toggle("menu-item-pizzaria-hidden", !visible);
    });
}

async function refreshPizzariaMenu() {
    const sequence = ++refreshSequence;

    try {
        const storeSnapshot = await getDoc(
            doc(db, "lojas", "da-minha-vo")
        );

        // Ignore stale reads if a more recent refresh already started.
        if (sequence !== refreshSequence) {
            return;
        }

        const isPizzaria =
            storeSnapshot.exists() &&
            storeSnapshot.data().tipoCardapio === "pizzaria";

        setPizzariaMenuVisible(isPizzaria);
    } catch (error) {
        console.error("Não foi possível verificar o tipo de cardápio para o menu:", error);
        // Fail closed if the current configuration cannot be read.
        if (sequence === refreshSequence) {
            setPizzariaMenuVisible(false);
        }
    }
}

onAuthStateChanged(auth, (user) => {
    if (!user) {
        refreshSequence++;
        setPizzariaMenuVisible(false);
        return;
    }

    refreshPizzariaMenu();
});

// The settings page emits this event only after Firestore confirms a save.
window.addEventListener("store-config-saved", refreshPizzariaMenu);
