/* ==================================================
   FIREBASE
   ================================================== */

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
    collection,
    getDocs,
    query,
    orderBy,
    doc,
    getDoc,
    addDoc,
    updateDoc,
	deleteDoc,
	writeBatch
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
}
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";


/* ==================================================
   ELEMENTOS
   ================================================== */

const sidebar =
    document.getElementById("sidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");
	
const sidebarOverlay =
    document.getElementById("sidebarOverlay");
	
const productsList =
    document.getElementById("productsList");
	
const newProductButton =
    document.getElementById("newProductButton");

const productFormModal =
    document.getElementById("productFormModal");

const productModalOverlay =
    document.getElementById("productModalOverlay");

const closeProductModalButton =
    document.getElementById("closeProductModal");

const cancelProductButton =
    document.getElementById("cancelProductButton");

const productForm =
    document.getElementById("productForm");

const productFormTitle =
    document.getElementById("productFormTitle");

const productIdInput =
    document.getElementById("productId");

const productNameInput =
    document.getElementById("productName");

const productCategoryInput =
    document.getElementById("productCategory");

const productDescriptionInput =
    document.getElementById("productDescription");

const productPriceInput =
    document.getElementById("productPrice");

const productImageInput =
    document.getElementById("productImage");

const productActiveInput =
    document.getElementById("productActive");

const productImagePreview =
    document.getElementById("productImagePreview");

const productImagePreviewWrapper =
    document.getElementById("productImagePreviewWrapper");

const productFormMessage =
    document.getElementById("productFormMessage");

const saveProductButton =
    document.getElementById("saveProductButton");
	
const categoryFilters =
    document.getElementById(
        "categoryFilters"
    );
	
const newComplementGroupButton =
    document.getElementById(
        "newComplementGroupButton"
    );

const complementGroupsList =
    document.getElementById(
        "complementGroupsList"
    );

const complementGroupModal =
    document.getElementById(
        "complementGroupModal"
    );

const complementGroupModalOverlay =
    document.getElementById(
        "complementGroupModalOverlay"
    );

const closeComplementGroupModalButton =
    document.getElementById(
        "closeComplementGroupModal"
    );

const cancelComplementGroupButton =
    document.getElementById(
        "cancelComplementGroupButton"
    );

const complementGroupForm =
    document.getElementById(
        "complementGroupForm"
    );

const complementGroupFormTitle =
    document.getElementById(
        "complementGroupFormTitle"
    );

const complementGroupIdInput =
    document.getElementById(
        "complementGroupId"
    );

const complementGroupNameInput =
    document.getElementById(
        "complementGroupName"
    );

const complementGroupTypeInput =
    document.getElementById(
        "complementGroupType"
    );

const complementGroupMinInput =
    document.getElementById(
        "complementGroupMin"
    );

const complementGroupMaxInput =
    document.getElementById(
        "complementGroupMax"
    );

const complementGroupActiveInput =
    document.getElementById(
        "complementGroupActive"
    );

const complementGroupMessage =
    document.getElementById(
        "complementGroupMessage"
    );

const saveComplementGroupButton =
    document.getElementById(
        "saveComplementGroupButton"
    );

	
/* ==================================================
   DADOS LOCAIS
   ================================================== */

let adminProducts = [];

let adminCategories = [];

let selectedCategoryId = "all";

let currentComplementProductId = null;
	

/* ==================================================
   PROTEÇÃO DA PÁGINA
   ==================================================

   Se não houver usuário autenticado,
   volta para a tela de login.
   ================================================== */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "index.html";

            return;

        }


        /*
         * Usuário autenticado:
         * pode carregar os produtos.
         */

        await loadCategoryFilters();

		await loadProducts();

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

newProductButton.addEventListener(
    "click",
    openProductForm
);

closeProductModalButton.addEventListener(
    "click",
    closeProductForm
);

cancelProductButton.addEventListener(
    "click",
    closeProductForm
);

productModalOverlay.addEventListener(
    "click",
    closeProductForm
);

productImageInput.addEventListener(
    "change",
    () => {

        const file =
            productImageInput.files[0];

        if (!file) return;

        const previewUrl =
            URL.createObjectURL(file);

        productImagePreview.src =
            previewUrl;

        productImagePreviewWrapper
            .classList.add("visible");

    }
);

productForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        productFormMessage.textContent =
            "";

        const price =
            parseBrazilianPrice(
                productPriceInput.value
            );
			
		const selectedCategory =
			adminCategories.find(
				category =>
					category.id ===
					productCategoryInput.value
			);


        if (
			!productNameInput.value.trim() ||
			!productCategoryInput.value ||
			Number.isNaN(price)
		) {

			productFormMessage.textContent =
				"Preencha os campos obrigatórios.";

			productFormMessage.className =
				"form-message error";

			return;

		}


        try {

            saveProductButton.disabled =
                true;

            saveProductButton.textContent =
                "Salvando...";


            const currentProductId =
                productIdInput.value;


            /*
             * NOVO PRODUTO
             */

            if (!currentProductId) {

                const documentReference =
                    await addDoc(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "produtos"
                        ),
                        {
                            nome:
                                productNameInput.value.trim(),

                            categoriaId:
								productCategoryInput.value,

							categoria:
								selectedCategory
									? selectedCategory.nome
									: "",

                            descricao:
                                productDescriptionInput.value.trim(),

                            preco:
                                price,

                            ordem:
                                getNextOrderForCategory(
								productCategoryInput.value
							),

                            ativo:
                                productActiveInput.checked,

                            imagemUrl:
                                ""
                        }
                    );


                const file =
                    productImageInput.files[0];


                if (file) {

                    const uploadedImage =
						await uploadProductImage(
							file,
							documentReference.id
						);


					await updateDoc(
						documentReference,
						{

							imagemUrl:
								uploadedImage.url,

							imagemPath:
								uploadedImage.path

						}
					);

                }

            }
			
			else {

				const productReference =
					doc(
						db,
						"lojas",
						"da-minha-vo",
						"produtos",
						currentProductId
					);


				const updateData = {

					nome:
						productNameInput.value.trim(),

					categoriaId:
						productCategoryInput.value,

					categoria:
						selectedCategory
							? selectedCategory.nome
							: "",

					descricao:
						productDescriptionInput.value.trim(),

					preco:
						price,

					ativo:
						productActiveInput.checked

				};


				/*
				 * Nova imagem opcional
				 */

				const file =
					productImageInput.files[0];


				if (file) {

					/*
					 * Descobre qual arquivo está
					 * atualmente associado ao produto.
					 */

					const currentSnapshot =
						await getDoc(
							productReference
						);


					const currentData =
						currentSnapshot.data();


					/*
					 * Primeiro envia a nova imagem.
					 */
					 
					saveProductButton.textContent =
						"Otimizando imagem...";

					const uploadedImage =
						await uploadProductImage(
							file,
							currentProductId
						);
						
					saveProductButton.textContent =
						"Salvando...";


					/*
					 * Depois remove a antiga.
					 */

					if (currentData?.imagemPath) {

						await deleteOldProductImage(
							currentData.imagemPath
						);

					}
					
				


					/*
					 * Atualiza as referências.
					 */

					updateData.imagemUrl =
						uploadedImage.url;

					updateData.imagemPath =
						uploadedImage.path;

				}


				await updateDoc(
					productReference,
					updateData
				);

			}


            /*
             * Depois implementaremos
             * a edição aqui.
             */


            closeProductForm();

            await loadProducts();

        }

        catch (error) {

            console.error(
                "Erro ao salvar produto:",
                error
            );

            productFormMessage.textContent =
                "Não foi possível salvar o produto.";

            productFormMessage.className =
                "form-message error";

        }

        finally {

            saveProductButton.disabled =
                false;

            saveProductButton.textContent =
                "Salvar produto";

        }

    }
);

/* ==================================================
   CARREGA CATEGORIAS PARA O FILTRO
   ================================================== */

async function loadCategoryFilters() {

    try {

        const categoriesReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "categorias"
            );


        const categoriesQuery =
            query(
                categoriesReference,
                orderBy("ordem", "asc")
            );


        const snapshot =
            await getDocs(
                categoriesQuery
            );


        adminCategories = [];


        snapshot.forEach(
            documentSnapshot => {

                const data =
                    documentSnapshot.data();


                /*
                 * Apenas categorias ativas
                 */

                if (data.ativo === false) {
                    return;
                }


                adminCategories.push({
					id: documentSnapshot.id,
					nome: data.nome || "Sem nome"
				});

            }
        );


        renderCategoryFilters(
			adminCategories
		);

		populateProductCategorySelect();

    }

    catch (error) {

        console.error(
            "Erro ao carregar filtros:",
            error
        );

    }

}

/* ==================================================
   CARREGA PRODUTOS
   ================================================== */

async function loadProducts() {

    try {

        const productsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "produtos"
            );

        const productsQuery =
            query(
                productsReference,
                orderBy("ordem", "asc")
            );

        const snapshot =
            await getDocs(productsQuery);

        adminProducts = [];

        snapshot.forEach(
            documentSnapshot => {

                const product =
                    documentSnapshot.data();

                adminProducts.push({

                    id:
                        documentSnapshot.id,

                    ...product

                });

            }
        );

        renderAdminProducts();

    }

    catch (error) {

        console.error(
            "Erro ao carregar produtos:",
            error
        );

        productsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h3>
                    Não foi possível carregar os produtos
                </h3>

                <p>
                    Verifique o console do navegador.
                </p>

            </div>
        `;

    }

}


/* ==================================================
   PREÇO EM REAL
   ================================================== */

function formatCurrency(value) {

    return value.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* ==================================================
   BOTÕES EDITAR
   ================================================== */

function setupEditButtons() {

    const buttons =
        document.querySelectorAll(
            ".edit-product-button"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    await openEditProductForm(
                        productId
                    );

                }
            );

        }
    );

}

function openProductForm() {

    productForm.reset();

    productIdInput.value = "";

    productActiveInput.checked = true;

    productImagePreviewWrapper
        .classList.remove("visible");

    productImagePreview.src = "";

    productFormMessage.textContent = "";

    productFormMessage.className =
        "form-message";

    productFormTitle.textContent =
        "Novo produto";

    productFormModal.classList.add(
        "open"
    );
	
	currentComplementProductId =
    null;

	newComplementGroupButton.disabled =
		true;

	complementGroupsList.innerHTML = `
		<div class="complements-empty">
			Salve o produto primeiro para cadastrar complementos.
		</div>
	`;

}


function closeProductForm() {

    productFormModal.classList.remove(
        "open"
    );

}

function parseBrazilianPrice(value) {

    return Number(
        value
            .replace(/\./g, "")
            .replace(",", ".")
    );

}

async function uploadProductImage(
    originalFile,
    productId
) {

    if (!originalFile) {
        return null;
    }


    /*
     * Otimiza no navegador antes
     * de enviar qualquer coisa
     * para o Firebase.
     */

    const optimizedFile =
        await optimizeImage(
            originalFile,
            500,
            0.80
        );


    /*
     * Nome sempre WebP.
     */

    const fileName =
        `${Date.now()}.webp`;


    const imagePath =
        `lojas/da-minha-vo/produtos/${productId}/${fileName}`;


    const imageReference =
        ref(
            storage,
            imagePath
        );


    await uploadBytes(
        imageReference,
        optimizedFile,
        {
            contentType:
                "image/webp"
        }
    );


    const imageUrl =
        await getDownloadURL(
            imageReference
        );


    return {

        url:
            imageUrl,

        path:
            imagePath

    };

}

/* ==================================================
   RENDERIZA FILTROS
   ================================================== */

function renderCategoryFilters(
    categories
) {

    categoryFilters.innerHTML = "";


    /*
     * Botão TODOS
     */

    const allButton =
        document.createElement(
            "button"
        );


    allButton.className =
        "category-filter-button active";


    allButton.textContent =
        "Todos";


    allButton.dataset.id =
        "all";


    categoryFilters.appendChild(
        allButton
    );


    /*
     * Categorias
     */

    categories.forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-filter-button";


            button.textContent =
                category.nome;


            button.dataset.id =
                category.id;


            categoryFilters.appendChild(
                button
            );

        }
    );


    setupCategoryFilterButtons();

}

/* ==================================================
   CLIQUE NOS FILTROS
   ================================================== */

function setupCategoryFilterButtons() {

    const buttons =
        document.querySelectorAll(
            ".category-filter-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {


                    /*
                     * Remove seleção anterior
                     */

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Marca botão atual
                     */

                    button.classList.add(
                        "active"
                    );


                    selectedCategoryId =
                        button.dataset.id;


                    /*
                     * Atualiza somente a interface.
                     * Nenhuma nova leitura Firestore.
                     */

                    renderAdminProducts();

                }
            );

        }
    );

}

/* ==================================================
   RENDERIZA PRODUTOS
   ================================================== */

function renderAdminProducts() {

    productsList.innerHTML = "";


    let filteredProducts =
        adminProducts;


    /*
     * Aplica filtro somente se
     * não estiver em "Todos".
     */

    if (
        selectedCategoryId !== "all"
    ) {

        filteredProducts =
            adminProducts.filter(
                product => {

                    return (
                        product.categoriaId ===
                        selectedCategoryId
                    );

                }
            );

    }
	
	filteredProducts =
		[...filteredProducts].sort(
			(a, b) =>
				Number(a.ordem || 0) -
				Number(b.ordem || 0)
		);


    /*
     * Nenhum produto encontrado
     */

    if (
        filteredProducts.length === 0
    ) {

        productsList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🍽️
                </div>

                <h3>
                    Nenhum produto encontrado
                </h3>

                <p>
                    Não há produtos nesta categoria.
                </p>

            </div>
        `;

        return;

    }


    filteredProducts.forEach(
		(product, index) => {
			
			const canReorder =
				selectedCategoryId !== "all";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-product-item";


            item.innerHTML = `
			
				${
					canReorder
					?
					`
					<div class="product-order-controls">

						<button
							type="button"
							class="order-button"
							data-id="${product.id}"
							data-direction="up"
							title="Mover para cima"
							${index === 0 ? "disabled" : ""}
						>
							↑
						</button>

						<button
							type="button"
							class="order-button"
							data-id="${product.id}"
							data-direction="down"
							title="Mover para baixo"
							${
								index === filteredProducts.length - 1
								? "disabled"
								: ""
							}
						>
							↓
						</button>

					</div>
					`
					:
					""
				}

                <div class="admin-product-image">

                    ${
                        product.imagemUrl
                        ?
                        `<img
                            src="${product.imagemUrl}"
                            alt="${product.nome || "Produto"}"
                        >`
                        :
                        `<div class="image-placeholder">
                            🍽️
                        </div>`
                    }

                </div>


                <div class="admin-product-info">

                    <div class="product-title-row">

                        <div>

                            <h3>
                                ${product.nome || "Sem nome"}
                            </h3>

                            <span class="product-category">
                                ${product.categoria || "Sem categoria"}
                            </span>

                        </div>


                        <span class="
                            product-status
                            ${product.ativo === false ? "inactive" : "active"}
                        ">

                            ${
                                product.ativo === false
                                ? "Inativo"
                                : "Ativo"
                            }

                        </span>

                    </div>


                    <div class="product-bottom-row">

                        <strong class="admin-product-price">

                            ${formatCurrency(
                                Number(
                                    product.preco || 0
                                )
                            )}

                        </strong>


                        <div class="product-actions">

							<button
								class="edit-product-button"
								data-id="${product.id}"
							>
								Editar
							</button>

							<button
								class="delete-product-button"
								data-id="${product.id}"
								data-name="${product.nome || ""}"
							>
								Excluir
							</button>

						</div>

                    </div>

                </div>

            `;


            productsList.appendChild(
                item
            );

        }
    );


    setupEditButtons();
	
	setupDeleteButtons();
	
	setupOrderButtons();

}

function populateProductCategorySelect() {

    productCategoryInput.innerHTML = `
        <option value="">
            Selecione uma categoria
        </option>
    `;

    adminCategories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                category.id;

            option.textContent =
                category.nome;

            productCategoryInput.appendChild(
                option
            );

        }
    );

}

async function openEditProductForm(
    productId
) {

    try {

        const productReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                productId
            );

        const snapshot =
            await getDoc(
                productReference
            );

        if (!snapshot.exists()) {

            alert(
                "Produto não encontrado."
            );

            return;

        }

        const product =
            snapshot.data();


        productForm.reset();

        productIdInput.value =
            productId;
			
		currentComplementProductId =
			productId;

		newComplementGroupButton.disabled =
			false;

		await loadComplementGroups(
			productId
		);

        productNameInput.value =
            product.nome || "";

        productCategoryInput.value =
            product.categoriaId || "";

        productDescriptionInput.value =
            product.descricao || "";

        productPriceInput.value =
            Number(
                product.preco || 0
            )
            .toFixed(2)
            .replace(".", ",");

        productActiveInput.checked =
            product.ativo !== false;


        /*
         * Imagem atual
         */

        if (product.imagemUrl) {

            productImagePreview.src =
                product.imagemUrl;

            productImagePreviewWrapper
                .classList.add(
                    "visible"
                );

        }

        else {

            productImagePreview.src =
                "";

            productImagePreviewWrapper
                .classList.remove(
                    "visible"
                );

        }


        productFormTitle.textContent =
            "Editar produto";

        productFormMessage.textContent =
            "";

        productFormMessage.className =
            "form-message";


        productFormModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir produto:",
            error
        );

        alert(
            "Não foi possível carregar o produto."
        );

    }

}

async function deleteOldProductImage(
    imagePath
) {

    if (!imagePath) {
        return;
    }


    try {

        const imageReference =
            ref(
                storage,
                imagePath
            );


        await deleteObject(
            imageReference
        );


        console.log(
            "Imagem antiga removida:",
            imagePath
        );

    }

    catch (error) {

        console.warn(
            "Não foi possível remover a imagem antiga:",
            error
        );

    }

}

function setupDeleteButtons() {

    const buttons =
        document.querySelectorAll(
            ".delete-product-button"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const productId =
                        button.dataset.id;

                    const productName =
                        button.dataset.name;

                    await deleteProduct(
                        productId,
                        productName
                    );

                }
            );

        }
    );

}


async function deleteProduct(
    productId,
    productName
) {

    const confirmed =
        confirm(
            `Deseja realmente excluir o produto "${productName}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const productReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                productId
            );

        /*
         * Busca dados atuais antes de excluir,
         * principalmente imagemPath.
         */

        const snapshot =
            await getDoc(
                productReference
            );

        if (!snapshot.exists()) {

            alert(
                "Produto não encontrado."
            );

            return;

        }

        const product =
            snapshot.data();


        /*
         * Remove imagem do Storage,
         * se existir.
         */

        if (product.imagemPath) {

            await deleteOldProductImage(
                product.imagemPath
            );

        }


        /*
         * Remove documento do Firestore.
         */

        await deleteDoc(
            productReference
        );


        /*
         * Atualiza a lista local.
         */

        await loadProducts();

    }

    catch (error) {

        console.error(
            "Erro ao excluir produto:",
            error
        );

        alert(
            "Não foi possível excluir o produto."
        );

    }

}

function getNextOrderForCategory(
    categoryId
) {

    const categoryProducts =
        adminProducts.filter(
            product =>
                product.categoriaId === categoryId
        );


    if (
        categoryProducts.length === 0
    ) {
        return 1;
    }


    const highestOrder =
        Math.max(
            ...categoryProducts.map(
                product =>
                    Number(product.ordem || 0)
            )
        );


    return highestOrder + 1;

}

function setupOrderButtons() {

    const buttons =
        document.querySelectorAll(
            ".order-button"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    if (button.disabled) {
                        return;
                    }


                    const productId =
                        button.dataset.id;


                    const direction =
                        button.dataset.direction;


                    await moveProduct(
                        productId,
                        direction
                    );

                }
            );

        }
    );

}

async function moveProduct(
    productId,
    direction
) {

    if (
        selectedCategoryId === "all"
    ) {
        return;
    }


    try {

        /*
         * Produtos somente da categoria
         * atualmente selecionada.
         */

        const categoryProducts =
            adminProducts
                .filter(
                    product =>
                        product.categoriaId ===
                        selectedCategoryId
                )
                .sort(
                    (a, b) =>
                        Number(a.ordem || 0) -
                        Number(b.ordem || 0)
                );


        const currentIndex =
            categoryProducts.findIndex(
                product =>
                    product.id === productId
            );


        if (currentIndex === -1) {
            return;
        }


        const targetIndex =
            direction === "up"
                ? currentIndex - 1
                : currentIndex + 1;


        /*
         * Proteção contra início/fim.
         */

        if (
            targetIndex < 0 ||
            targetIndex >=
                categoryProducts.length
        ) {
            return;
        }


        const currentProduct =
            categoryProducts[
                currentIndex
            ];


        const targetProduct =
            categoryProducts[
                targetIndex
            ];


        const currentOrder =
            Number(
                currentProduct.ordem || 0
            );


        const targetOrder =
            Number(
                targetProduct.ordem || 0
            );


        /*
         * Atualização atômica:
         * troca a ordem dos dois produtos.
         */

        const batch =
            writeBatch(db);


        const currentReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                currentProduct.id
            );


        const targetReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                targetProduct.id
            );


        batch.update(
            currentReference,
            {
                ordem:
                    targetOrder
            }
        );


        batch.update(
            targetReference,
            {
                ordem:
                    currentOrder
            }
        );


        await batch.commit();


        /*
         * Atualiza o array local.
         * Não precisamos consultar
         * o Firestore novamente.
         */

        currentProduct.ordem =
            targetOrder;


        targetProduct.ordem =
            currentOrder;


        renderAdminProducts();

    }

    catch (error) {

        console.error(
            "Erro ao alterar ordem:",
            error
        );

        alert(
            "Não foi possível alterar a ordem dos produtos."
        );

    }

}/* ==================================================
   OTIMIZA IMAGEM ANTES DO UPLOAD
   ================================================== */

async function optimizeImage(
    file,
    maxDimension = 500,
    quality = 0.80
) {

    /*
     * Tipos permitidos na entrada.
     */

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


    /*
     * Limite do arquivo original:
     * 10 MB.
     */

    const maxOriginalSize =
        10 * 1024 * 1024;


    if (file.size > maxOriginalSize) {

        throw new Error(
            "A imagem deve possuir no máximo 10 MB."
        );

    }


    /*
     * Carrega a imagem.
     */

    const bitmap =
        await createImageBitmap(file);


    let width =
        bitmap.width;

    let height =
        bitmap.height;


    /*
     * Calcula dimensões mantendo proporção.
     */

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


    /*
     * Canvas temporário.
     */

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


    /*
     * Converte para WebP.
     */

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
                                    "Não foi possível otimizar a imagem."
                                )
                            );

                        }

                    },
                    "image/webp",
                    quality
                );

            }
        );


    /*
     * Segurança adicional:
     * arquivo final não pode ultrapassar 1 MB.
     */

    const maxFinalSize =
        1 * 1024 * 1024;


    if (blob.size > maxFinalSize) {

        throw new Error(
            "Mesmo após a otimização, a imagem ficou maior que 1 MB."
        );

    }


    /*
     * Retorna como File para manter
     * compatibilidade com o upload atual.
     */

    return new File(
        [blob],
        "imagem.webp",
        {
            type:
                "image/webp"
        }
    );

}

async function loadComplementGroups(
    productId
) {

    if (!productId) {
        return;
    }


    try {

        const groupsReference =
            collection(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                productId,
                "gruposAdicionais"
            );


        const groupsQuery =
            query(
                groupsReference,
                orderBy("ordem", "asc")
            );


        const snapshot =
            await getDocs(
                groupsQuery
            );


        complementGroupsList.innerHTML =
            "";


        if (snapshot.empty) {

            complementGroupsList.innerHTML = `
                <div class="complements-empty">
                    Nenhum grupo cadastrado.
                </div>
            `;

            return;

        }


        snapshot.forEach(
            documentSnapshot => {

                const group =
                    documentSnapshot.data();


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "complement-group-item";


                let typeLabel =
                    "Escolha única";


                if (
                    group.tipo ===
                    "multipla"
                ) {

                    typeLabel =
                        "Múltipla escolha";

                }


                if (
                    group.tipo ===
                    "quantidade"
                ) {

                    typeLabel =
                        "Quantidades";

                }


                item.innerHTML = `

                    <div class="complement-group-info">

                        <h4>
                            ${group.nome || "Sem nome"}
                        </h4>

                        <div class="complement-group-meta">

                            ${typeLabel}
                            · mínimo ${group.minimo ?? 0}
                            · máximo ${group.maximo ?? 1}
                            · ${
                                group.ativo === false
                                ? "Inativo"
                                : "Ativo"
                            }

                        </div>

                    </div>


                    <div class="complement-group-actions">

                        <button
                            type="button"
                            class="edit-product-button edit-complement-group-button"
                            data-id="${documentSnapshot.id}"
                        >
                            Editar
                        </button>


                        <button
                            type="button"
                            class="delete-product-button delete-complement-group-button"
                            data-id="${documentSnapshot.id}"
                            data-name="${group.nome || ""}"
                        >
                            Excluir
                        </button>

                    </div>

                `;


                complementGroupsList
                    .appendChild(item);

            }
        );


        setupComplementGroupButtons();

    }

    catch (error) {

        console.error(
            "Erro ao carregar grupos:",
            error
        );

    }

}

newComplementGroupButton
    .addEventListener(
        "click",
        () => {

            if (
                !currentComplementProductId
            ) {

                return;

            }


            complementGroupForm.reset();

            complementGroupIdInput.value =
                "";

            complementGroupTypeInput.value =
                "unica";

            complementGroupMinInput.value =
                0;

            complementGroupMaxInput.value =
                1;

            complementGroupActiveInput.checked =
                true;

            complementGroupFormTitle.textContent =
                "Novo grupo";

            complementGroupMessage.textContent =
                "";

            complementGroupModal.classList.add(
                "open"
            );

        }
    );
	
function closeComplementGroupForm() {

    complementGroupModal.classList.remove(
        "open"
    );

}


closeComplementGroupModalButton
    .addEventListener(
        "click",
        closeComplementGroupForm
    );


cancelComplementGroupButton
    .addEventListener(
        "click",
        closeComplementGroupForm
    );


complementGroupModalOverlay
    .addEventListener(
        "click",
        closeComplementGroupForm
    );
	
complementGroupForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (
            !currentComplementProductId
        ) {

            return;

        }


        const name =
            complementGroupNameInput.value.trim();


        const minimum =
            Number(
                complementGroupMinInput.value
            );


        const maximum =
            Number(
                complementGroupMaxInput.value
            );


        if (!name) {

            complementGroupMessage.textContent =
                "Informe o nome do grupo.";

            complementGroupMessage.className =
                "form-message error";

            return;

        }


        if (
            minimum < 0 ||
            maximum < 1 ||
            minimum > maximum
        ) {

            complementGroupMessage.textContent =
                "Confira os valores mínimo e máximo.";

            complementGroupMessage.className =
                "form-message error";

            return;

        }


        try {

            saveComplementGroupButton.disabled =
                true;

            saveComplementGroupButton.textContent =
                "Salvando...";


            const groupId =
                complementGroupIdInput.value;


            const groupData = {

                nome:
                    name,

                tipo:
                    complementGroupTypeInput.value,

                minimo:
                    minimum,

                maximo:
                    maximum,

                ativo:
                    complementGroupActiveInput.checked

            };


            if (groupId) {

                const groupReference =
                    doc(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "produtos",
                        currentComplementProductId,
                        "gruposAdicionais",
                        groupId
                    );


                await updateDoc(
                    groupReference,
                    groupData
                );

            }

            else {

                const existingGroups =
                    await getDocs(
                        collection(
                            db,
                            "lojas",
                            "da-minha-vo",
                            "produtos",
                            currentComplementProductId,
                            "gruposAdicionais"
                        )
                    );


                groupData.ordem =
                    existingGroups.size + 1;


                await addDoc(
                    collection(
                        db,
                        "lojas",
                        "da-minha-vo",
                        "produtos",
                        currentComplementProductId,
                        "gruposAdicionais"
                    ),
                    groupData
                );

            }


            closeComplementGroupForm();


            await loadComplementGroups(
                currentComplementProductId
            );

        }

        catch (error) {

            console.error(
                "Erro ao salvar grupo:",
                error
            );


            complementGroupMessage.textContent =
                "Não foi possível salvar o grupo.";

            complementGroupMessage.className =
                "form-message error";

        }

        finally {

            saveComplementGroupButton.disabled =
                false;

            saveComplementGroupButton.textContent =
                "Salvar grupo";

        }

    }
);

function setupComplementGroupButtons() {

    const editButtons =
        document.querySelectorAll(
            ".edit-complement-group-button"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    await openEditComplementGroup(
                        button.dataset.id
                    );

                }
            );

        }
    );


    const deleteButtons =
        document.querySelectorAll(
            ".delete-complement-group-button"
        );


    deleteButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    await deleteComplementGroup(
                        button.dataset.id,
                        button.dataset.name
                    );

                }
            );

        }
    );

}

async function openEditComplementGroup(
    groupId
) {

    try {

        const groupReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                currentComplementProductId,
                "gruposAdicionais",
                groupId
            );


        const snapshot =
            await getDoc(
                groupReference
            );


        if (!snapshot.exists()) {
            return;
        }


        const group =
            snapshot.data();


        complementGroupIdInput.value =
            groupId;

        complementGroupNameInput.value =
            group.nome || "";

        complementGroupTypeInput.value =
            group.tipo || "unica";

        complementGroupMinInput.value =
            group.minimo ?? 0;

        complementGroupMaxInput.value =
            group.maximo ?? 1;

        complementGroupActiveInput.checked =
            group.ativo !== false;


        complementGroupFormTitle.textContent =
            "Editar grupo";


        complementGroupMessage.textContent =
            "";


        complementGroupModal.classList.add(
            "open"
        );

    }

    catch (error) {

        console.error(
            "Erro ao abrir grupo:",
            error
        );

    }

}

async function deleteComplementGroup(
    groupId,
    groupName
) {

    const confirmed =
        confirm(
            `Deseja realmente excluir o grupo "${groupName}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        const groupReference =
            doc(
                db,
                "lojas",
                "da-minha-vo",
                "produtos",
                currentComplementProductId,
                "gruposAdicionais",
                groupId
            );


        await deleteDoc(
            groupReference
        );


        await loadComplementGroups(
            currentComplementProductId
        );

    }

    catch (error) {

        console.error(
            "Erro ao excluir grupo:",
            error
        );


        alert(
            "Não foi possível excluir o grupo."
        );

    }

}