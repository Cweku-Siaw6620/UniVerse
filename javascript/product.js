document.addEventListener('DOMContentLoaded', function () {
    let user = null;
    try {
        const userData = localStorage.getItem("user");
        user = userData ? JSON.parse(userData) : null;
    } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
    }

    if (!user || !user.id) {
        console.error("User not found. Please log in first.");
        window.location.href = "/components/login.html";
        return;
    }

    const userId = user.id;

    let storePlan = 'free';
    let featuredCount = 0;
    const PLAN_FEATURED_LIMITS = { free: 0, premium: 3, organizational: 999 };

    // DOM elements
    const productsContainer = document.getElementById('products-container');
    const paginationContainer = document.getElementById('pagination');
    const loadingSpinner = document.getElementById('loading-spinner');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const categoryFilter = document.getElementById('category-filter');
    const stockFilter = document.getElementById('stock-filter');
    const sortBy = document.getElementById('sort-by');

    // State
    let products = [];
    let filteredProducts = [];
    let currentPage = 1;
    const productsPerPage = 8;

    // Store data
    let currentStore = null;

    async function fetchStoreData() {
        try {
            const res = await fetch(`https://uni-verse-api.vercel.app/api/stores/${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error("Failed to fetch store");

            currentStore = await res.json();
            storePlan = currentStore.plan || 'free';
            updateStoreInfo(currentStore);
        } catch (error) {
            console.error('Failed to get store:', error);
        }
    }

    function updateStoreInfo(store) {
        const storeInfoContainer = document.getElementById('store-info');
        if (!storeInfoContainer) return;

        storeInfoContainer.innerHTML = `
            <div class="flex items-center">
                <div class="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden mr-3">
                    <img src="${store.storeLogo}" alt="${store.storeName}" class="w-full h-full object-cover">
                </div>
                <div class="hidden md:block">
                    <div class="text-sm font-medium text-gray-900">${store.storeName}</div>
                    <div class="text-xs text-gray-500">${store.sellerName}</div>
                </div>
            </div>
        `;
    }

    // Fetch store data first, then products
    fetchStoreData().then(() => {
        fetchProducts();
    });

    applyFiltersBtn.addEventListener('click', () => {
        currentPage = 1;
        filterAndSortProducts();
        renderProducts();
        renderPagination();
    });

    // Functions
    async function fetchProducts() {
        try {
            loadingSpinner.classList.remove('hidden');
            let store = null;
            try {
                const storeData = localStorage.getItem("store");
                store = storeData ? JSON.parse(storeData) : null;
            } catch (err) {
                console.error("Failed to parse store from localStorage:", err);
            }

            if (!store || !store._id) {
                throw new Error("Store not found. Please create a store first.");
            }

            const storeId = store._id;

            const response = await fetch(`https://uni-verse-api.vercel.app/api/products/${encodeURIComponent(storeId)}`);
            if (!response.ok) throw new Error("Failed to fetch products");

            const result = await response.json();

            // Normalize backend fields to match frontend expected structure
            products = result.map((product) => ({
                id: product._id,
                title: product.productName,
                price: product.productPrice,
                description: product.productDescription,
                category: product.productCategory || 'uncategorized',
                image: product.productImage,
                stock: product.productStock,
                featured: product.featured || false,
                hidden: product.hidden || false,
                storeId: storeId,
                publicId: product.publicId
            }));

            featuredCount = products.filter(p => p.featured).length;

            filterAndSortProducts();
            renderProducts();
            renderPagination();
        } catch (error) {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = `
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        } finally {
            loadingSpinner.classList.add('hidden');
        }
    }

    function filterAndSortProducts() {
        // Apply category filter
        filteredProducts = products.filter(product => {
            if (categoryFilter.value && product.category !== categoryFilter.value) {
                return false;
            }
            return true;
        });

        // Apply stock filter
        filteredProducts = filteredProducts.filter(product => {
            if (stockFilter.value === 'in-stock' && product.stock <= 0) {
                return false;
            }
            if (stockFilter.value === 'low-stock' && (product.stock > 10 || product.stock <= 0)) {
                return false;
            }
            if (stockFilter.value === 'out-of-stock' && product.stock > 0) {
                return false;
            }
            return true;
        });

        // Apply sorting
        const [sortField, sortDirection] = sortBy.value.split('-');

        filteredProducts.sort((a, b) => {
            let compareValue;

            if (sortField === 'name') {
                compareValue = a.title.localeCompare(b.title);
            } else if (sortField === 'price') {
                compareValue = a.price - b.price;
            } else if (sortField === 'stock') {
                compareValue = a.stock - b.stock;
            }

            return sortDirection === 'asc' ? compareValue : -compareValue;
        });
    }

    function renderProducts() {
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

        if (productsToDisplay.length === 0) {
            productsContainer.innerHTML = `
                <div class="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-12 rounded-lg text-center">
                    <i class="ri-search-line text-4xl text-gray-400 mb-3"></i>
                    <p class="text-lg font-medium">No products found</p>
                    <p class="text-sm">Try adjusting your filters or add a new product</p>
                </div>
            `;
            return;
        }

        let productsHTML = '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">';

        productsToDisplay.forEach(product => {
            const stockStatus = product.stock <= 0 ? `${product.stock} - Out of Stock` :
                product.stock <= 10 ? `${product.stock} - Low Stock` : `${product.stock} - In Stock`;
            const statusClass = product.stock <= 0 ? 'bg-red-100 text-red-800' :
                product.stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

            const featuredLimit = PLAN_FEATURED_LIMITS[storePlan] || 0;
            const canFeature = featuredLimit > 0;
            const isFeatured = product.featured;
            const isHidden = product.hidden;

            const starButton = canFeature ? `
                <button class="p-1.5 transition-colors toggle-featured ${isFeatured ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}"
                        data-id="${product.id}"
                        title="${isFeatured ? 'Remove from featured' : 'Mark as featured'}">
                    <i class="${isFeatured ? 'ri-star-fill' : 'ri-star-line'}"></i>
                </button>
            ` : '';

            productsHTML += `
                <div class="product-card bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 ${isHidden ? 'opacity-60' : ''}">
                    <div class="relative pb-[75%] bg-gray-100">
                        <img src="${product.image}" alt="${product.title}" class="absolute h-full w-full object-cover">
                        <div class="absolute top-2 left-2 flex flex-col gap-1 items-start">
                            ${isFeatured ? `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                                    <i class="ri-star-fill text-xs"></i> Featured
                                </span>
                            ` : ''}
                            ${isHidden ? `
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-700 text-white border border-gray-600">
                                    <i class="ri-eye-off-line text-xs"></i> Hidden
                                </span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-medium text-gray-900 truncate">${product.title}</h3>
                            <span class="font-medium text-gray-900">Ghc ${product.price.toFixed(2)}</span>
                        </div>
                        <p class="text-sm text-gray-500 mb-3 line-clamp-2">${product.category}</p>
                        <div class="flex justify-between items-center">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                                ${stockStatus}
                            </span>
                            <div class="flex space-x-2">
                                ${starButton}
                                <button class="p-1.5 text-blue-600 hover:text-blue-800 transition-colors edit-product" 
                                        data-id="${product.id}"
                                        data-title="${product.title}"
                                        data-price="${product.price}"
                                        data-stock="${product.stock}"
                                        data-category="${product.category}"
                                        data-description="${product.description || ''}"
                                        data-image="${product.image}"
                                        title="Edit product">
                                    <i class="ri-edit-line"></i>
                                </button>
                                <button class="p-1.5 text-gray-600 hover:text-red-600 transition-colors delete-product" 
                                        data-id="${product.id}"
                                        data-title="${product.title}"
                                        title="Delete product">
                                    <i class="ri-delete-bin-line"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        productsHTML += '</div>';
        productsContainer.innerHTML = productsHTML;

        // Attach delete event listeners
        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const productTitle = e.currentTarget.getAttribute('data-title');
                showDeleteConfirmation(productId, productTitle);
            });
        });

        // Attach edit event listeners
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                const title = e.currentTarget.getAttribute('data-title');
                const price = e.currentTarget.getAttribute('data-price');
                const stock = e.currentTarget.getAttribute('data-stock');
                const category = e.currentTarget.getAttribute('data-category');
                const description = e.currentTarget.getAttribute('data-description');
                const image = e.currentTarget.getAttribute('data-image');
                openEditModal(productId, title, price, stock, category, description, image);
            });
        });

        // Attach featured-toggle event listeners
        document.querySelectorAll('.toggle-featured').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.currentTarget.getAttribute('data-id');
                toggleFeatured(productId);
            });
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <nav class="flex items-center justify-center space-x-2">
                <button class="px-3 py-1 rounded-lg border ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}" 
                        ${currentPage === 1 ? 'disabled' : ''} id="prev-page">
                    <i class="ri-arrow-left-line"></i>
                </button>
        `;

        // Always show first page
        paginationHTML += `
            <button class="px-3 py-1 rounded-lg border ${currentPage === 1 ? 'bg-primary text-white border-primary' : 'text-gray-700 hover:bg-gray-50'}" 
                    data-page="1">
                1
            </button>
        `;

        // Show ellipsis if needed
        if (currentPage > 3) {
            paginationHTML += `<span class="px-2">...</span>`;
        }

        // Show pages around current page
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="px-3 py-1 rounded-lg border ${currentPage === i ? 'bg-primary text-white border-primary' : 'text-gray-700 hover:bg-gray-50'}" 
                        data-page="${i}">
                    ${i}
                </button>
            `;
        }

        // Show ellipsis if needed
        if (currentPage < totalPages - 2) {
            paginationHTML += `<span class="px-2">...</span>`;
        }

        // Always show last page if different from first
        if (totalPages > 1) {
            paginationHTML += `
                <button class="px-3 py-1 rounded-lg border ${currentPage === totalPages ? 'bg-primary text-white border-primary' : 'text-gray-700 hover:bg-gray-50'}" 
                        data-page="${totalPages}">
                    ${totalPages}
                </button>
            `;
        }

        paginationHTML += `
                <button class="px-3 py-1 rounded-lg border ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}" 
                        ${currentPage === totalPages ? 'disabled' : ''} id="next-page">
                    <i class="ri-arrow-right-line"></i>
                </button>
            </nav>
        `;

        paginationContainer.innerHTML = paginationHTML;

        // Add event listeners to pagination buttons
        document.querySelectorAll('[data-page]').forEach(button => {
            button.addEventListener('click', (e) => {
                currentPage = parseInt(e.currentTarget.getAttribute('data-page'));
                renderProducts();
                renderPagination();
            });
        });

        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                renderPagination();
            }
        });

        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                renderPagination();
            }
        });
    }

    // ============================================
    // DELETE CONFIRMATION MODAL (Replaces alert)
    // ============================================
    function showDeleteConfirmation(productId, productTitle) {
        // Check if modal exists, if not create it
        let modal = document.getElementById('delete-confirmation-modal');
        
        if (!modal) {
            modal = createDeleteConfirmationModal();
            document.body.appendChild(modal);
        }

        // Update modal with product info
        document.getElementById('delete-product-id').value = productId;
        document.getElementById('delete-product-title').textContent = productTitle || 'this product';

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    function createDeleteConfirmationModal() {
        const modal = document.createElement('div');
        modal.id = 'delete-confirmation-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all">
                <div class="w-16 h-16 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-4">
                    <i class="ri-alert-line text-red-500 text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 text-center mb-2">Delete Product</h3>
                <p class="text-gray-600 text-center mb-2">
                    Are you sure you want to delete "<span id="delete-product-title" class="font-semibold">this product</span>"?
                </p>
                <p class="text-sm text-red-500 text-center mb-6">This action cannot be undone.</p>
                
                <input type="hidden" id="delete-product-id">
                
                <div class="flex justify-center space-x-3">
                    <button id="cancel-delete-product" class="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-button hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-delete-product" class="px-6 py-2 bg-red-500 text-white font-medium rounded-button hover:bg-red-600 transition-colors">
                        <span id="delete-product-btn-text">Delete Product</span>
                        <span id="delete-product-btn-loading" class="hidden"><i class="ri-loader-4-line animate-spin"></i> Deleting...</span>
                    </button>
                </div>
            </div>
        `;

        // Close on cancel button
        modal.querySelector('#cancel-delete-product').addEventListener('click', closeDeleteConfirmation);
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeDeleteConfirmation();
        });

        // Confirm delete
        modal.querySelector('#confirm-delete-product').addEventListener('click', handleDeleteConfirm);

        return modal;
    }

    function closeDeleteConfirmation() {
        const modal = document.getElementById('delete-confirmation-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
            
            // Reset form
            const productIdInput = document.getElementById('delete-product-id');
            if (productIdInput) productIdInput.value = '';
        }
    }

    async function handleDeleteConfirm() {
        const productId = document.getElementById('delete-product-id').value;
        if (!productId) {
            showToast('Product ID not found', 'error');
            return;
        }

        const confirmBtn = document.getElementById('confirm-delete-product');
        const btnText = document.getElementById('delete-product-btn-text');
        const btnLoading = document.getElementById('delete-product-btn-loading');

        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        confirmBtn.disabled = true;

        try {
            const res = await fetch(`https://uni-verse-api.vercel.app/api/products/${productId}`, {
                method: 'DELETE',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to delete product');
            }

            // Remove deleted product from frontend
            products = products.filter(p => p.id !== productId);
            filterAndSortProducts();
            renderProducts();
            renderPagination();
            
            // Close modal
            closeDeleteConfirmation();
            
            showToast('Product deleted successfully');

        } catch (error) {
            console.error('Delete error:', error);
            showToast(error.message || 'Something went wrong deleting the product. Please try again.', 'error');
            closeDeleteConfirmation();
        } finally {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            confirmBtn.disabled = false;
        }
    }

    // ============================================
    // OPEN EDIT MODAL
    // ============================================
    function openEditModal(productId, title, price, stock, category, description, image) {
        // Check if modal exists, if not create it
        let modal = document.getElementById('edit-product-modal');
        
        if (!modal) {
            modal = createEditModal();
            document.body.appendChild(modal);
        }

        // Fill form with product data
        document.getElementById('edit-product-id').value = productId;
        document.getElementById('edit-product-title').value = title || '';
        document.getElementById('edit-product-price').value = price || '';
        document.getElementById('edit-product-stock').value = stock || 0;
        document.getElementById('edit-product-category').value = category || '';
        document.getElementById('edit-product-description').value = description || '';
        
        // Show current image preview
        const preview = document.getElementById('edit-product-image-preview');
        if (image && preview) {
            preview.src = image;
            preview.classList.remove('hidden');
        } else if (preview) {
            preview.classList.add('hidden');
        }

        // Store the current image URL for reference
        const hiddenInput = document.getElementById('edit-product-current-image');
        if (hiddenInput) hiddenInput.value = image || '';

        // Show modal
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }

    // ============================================
    // CREATE EDIT MODAL
    // ============================================
    function createEditModal() {
        const modal = document.createElement('div');
        modal.id = 'edit-product-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 hidden';
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900">Edit Product</h3>
                        <button class="text-gray-500 hover:text-gray-700 close-edit-modal">
                            <i class="ri-close-line text-2xl"></i>
                        </button>
                    </div>

                    <form id="edit-product-form" enctype="multipart/form-data">
                        <input type="hidden" id="edit-product-id">
                        <input type="hidden" id="edit-product-current-image">

                        <div class="space-y-4">
                            <!-- Product Image -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                                <div class="flex items-center space-x-4">
                                    <img id="edit-product-image-preview" src="" alt="Product" class="w-24 h-24 rounded-lg object-cover border border-gray-200 hidden">
                                    <div class="flex-1">
                                        <input type="file" id="edit-product-image" accept="image/*" 
                                               class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-button file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20">
                                        <p class="text-xs text-gray-400 mt-1">Leave empty to keep current image</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Product Name -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input type="text" id="edit-product-title" required
                                       class="w-full px-4 py-2 border border-gray-300 rounded-button text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                            </div>

                            <!-- Price & Stock -->
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Price (Ghc) *</label>
                                    <input type="number" id="edit-product-price" step="0.01" min="0" required
                                           class="w-full px-4 py-2 border border-gray-300 rounded-button text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                                    <input type="number" id="edit-product-stock" min="0" required
                                           class="w-full px-4 py-2 border border-gray-300 rounded-button text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                                </div>
                            </div>

                            <!-- Category -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select id="edit-product-category" required
                                        class="w-full px-4 py-2 border border-gray-300 rounded-button text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                                    <option value="">Select Category</option>
                                    <option value="electronics">Electronics & Gadgets</option>
                                    <option value="fashion">Fashion & Apparel</option>
                                    <option value="health_beauty">Health & Beauty</option>
                                    <option value="home_living">Home & Living</option>
                                    <option value="food">Food & Groceries</option>
                                    <option value="appliances">Appliances</option>
                                    <option value="books">Books & Stationery</option>
                                    <option value="kids_baby">Kids, Toys & Baby Products</option>
                                    <option value="sports_outdoors">Sports & Outdoors</option>
                                    <option value="automotive">Automotive</option>
                                    <option value="jewelry">Jewelry & Accessories</option>
                                    <option value="pets">Pet Supplies</option>
                                    <option value="tools">Tools & Industrial</option>
                                    <option value="music_art">Music, Art & Entertainment</option>
                                    <option value="digital">Services & Digital Listings</option>
                                </select>
                            </div>

                            <!-- Description -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="edit-product-description" rows="3"
                                          class="w-full px-4 py-2 border border-gray-300 rounded-button text-sm focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                            </div>
                        </div>

                        <div class="flex justify-end space-x-3 pt-6 mt-4 border-t border-gray-200">
                            <button type="button" class="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-button hover:bg-gray-200 transition-colors close-edit-modal">
                                Cancel
                            </button>
                            <button type="submit" class="px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary/90 transition-colors" id="edit-submit-btn">
                                <span id="edit-btn-text">Update Product</span>
                                <span id="edit-btn-loading" class="hidden"><i class="ri-loader-4-line animate-spin"></i> Updating...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners
        // Close buttons
        modal.querySelectorAll('.close-edit-modal').forEach(btn => {
            btn.addEventListener('click', closeEditModal);
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeEditModal();
        });

        // Preview image on file select
        const imageInput = modal.querySelector('#edit-product-image');
        const preview = modal.querySelector('#edit-product-image-preview');
        if (imageInput && preview) {
            imageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        preview.src = event.target.result;
                        preview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Form submission
        const form = modal.querySelector('#edit-product-form');
        form.addEventListener('submit', handleEditSubmit);

        return modal;
    }

    // ============================================
    // CLOSE EDIT MODAL
    // ============================================
    function closeEditModal() {
        const modal = document.getElementById('edit-product-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = '';
            
            // Reset form
            const form = document.getElementById('edit-product-form');
            if (form) form.reset();
            
            // Reset image preview
            const preview = document.getElementById('edit-product-image-preview');
            if (preview) {
                preview.src = '';
                preview.classList.add('hidden');
            }
        }
    }

    // ============================================
    // HANDLE EDIT SUBMIT
    // ============================================
    async function handleEditSubmit(e) {
        e.preventDefault();

        const productId = document.getElementById('edit-product-id').value;
        if (!productId) {
            showToast('Product ID not found', 'error');
            return;
        }

        const submitBtn = document.getElementById('edit-submit-btn');
        const btnText = document.getElementById('edit-btn-text');
        const btnLoading = document.getElementById('edit-btn-loading');

        // Show loading state
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            const imageFile = document.getElementById('edit-product-image').files[0];
            
            if (imageFile) {
                formData.append('productImage', imageFile);
            }

            formData.append('productName', document.getElementById('edit-product-title').value.trim());
            formData.append('productPrice', document.getElementById('edit-product-price').value);
            formData.append('productStock', document.getElementById('edit-product-stock').value);
            formData.append('productCategory', document.getElementById('edit-product-category').value);
            formData.append('productDescription', document.getElementById('edit-product-description').value.trim());

            const response = await fetch(`https://uni-verse-api.vercel.app/api/products/${productId}`, {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to update product');
            }

            showToast('Product updated successfully!');
            
            // Close modal
            closeEditModal();
            
            // Refresh products
            await fetchProducts();
            
        } catch (error) {
            console.error('Update error:', error);
            showToast(error.message || 'Failed to update product', 'error');
        } finally {
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
            submitBtn.disabled = false;
        }
    }

    // ============================================
    // TOGGLE FEATURED
    // ============================================
    async function toggleFeatured(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const featuredLimit = PLAN_FEATURED_LIMITS[storePlan] || 0;

        // Client-side guard for limit (server also enforces this)
        if (!product.featured && featuredCount >= featuredLimit) {
            showToast(`You can only feature up to ${featuredLimit} product${featuredLimit !== 1 ? 's' : ''} on the ${storePlan === 'premium' ? 'Premium' : 'current'} plan.`, 'error');
            return;
        }

        try {
            const res = await fetch(`https://uni-verse-api.vercel.app/api/products/${productId}/featured`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: product.storeId })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                showToast(data.message || 'Failed to update featured status.', 'error');
                return;
            }

            product.featured = data.featured;
            featuredCount = products.filter(p => p.featured).length;

            showToast(data.message || (data.featured ? 'Product is now featured' : 'Removed from featured'));
            renderProducts();

        } catch (error) {
            console.error('Toggle featured error:', error);
            showToast('Network error. Please try again.', 'error');
        }
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================
    function showToast(message, type = 'success') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.custom-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        const bgClass = type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-yellow-500' : 'bg-green-500';
        const iconClass = type === 'error' ? 'ri-error-warning-line' : type === 'warning' ? 'ri-alert-line' : 'ri-checkbox-circle-line';
        toast.className = `custom-toast fixed bottom-4 right-4 ${bgClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center z-50 max-w-sm`;
        toast.innerHTML = `
            <i class="${iconClass} mr-2 text-xl"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ============================================
    // MOBILE MENU TOGGLE (FIXED)
    // ============================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        // Remove existing listeners by cloning and replacing
        const newToggle = mobileMenuToggle.cloneNode(true);
        mobileMenuToggle.parentNode.replaceChild(newToggle, mobileMenuToggle);
        
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        const newOverlay = sidebarOverlay.cloneNode(true);
        sidebarOverlay.parentNode.replaceChild(newOverlay, sidebarOverlay);
        
        newOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            newOverlay.classList.remove('active');
        });
    }
});