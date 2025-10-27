document.addEventListener('DOMContentLoaded', function () {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user.id) {
            console.error("User not found.");
            return;
         }
         
        const userId = user.id;

  async function fetchStoreData() {
    try {
      const res = await fetch(`http://localhost:3000/api/stores/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to fetch store");

      const store = await res.json();
      updateStoreInfo(store);
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
      <div class="relative">
          <button class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full focus:outline-none">
              <div class="w-10 h-10 flex items-center justify-center">
                  <i class="ri-notification-3-line"></i>
              </div>
          </button>
          <div class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
      </div>
    `;
  }
  fetchStoreData();

   
            // DOM elements
            const productsContainer = document.getElementById('products-container');
            const paginationContainer = document.getElementById('pagination');
            const loadingSpinner = document.getElementById('loading-spinner');
            const productModal = document.getElementById('product-modal');
            const modalTitle = document.getElementById('modal-title');
            const productForm = document.getElementById('product-form');
            const productIdInput = document.getElementById('product-id');
            const productNameInput = document.getElementById('product-name');
            const productPriceInput = document.getElementById('product-price');
            const productCategoryInput = document.getElementById('product-category');
            const productStockInput = document.getElementById('product-stock');
            const productDescriptionInput = document.getElementById('product-description');
            const productImageInput = document.getElementById('product-image');
            const closeModalBtn = document.getElementById('close-modal');
            const cancelBtn = document.getElementById('cancel-btn');
            const addProductBtn = document.getElementById('add-product-btn');
            const applyFiltersBtn = document.getElementById('apply-filters');
            const categoryFilter = document.getElementById('category-filter');
            const stockFilter = document.getElementById('stock-filter');
            const sortBy = document.getElementById('sort-by');
            
            // State
            let products = [];
            let filteredProducts = [];
            let currentPage = 1;
            const productsPerPage = 8;
            
            // Initialize
            fetchProducts();
        
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
                    const store = JSON.parse(localStorage.getItem("store"));
                    const storeId = store._id;

        const response = await fetch(`http://localhost:3000/api/products/${encodeURIComponent(storeId)}`);
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
            stock: product.productStock
        }));;
                    
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
                    const stockStatus = product.stock <= 0 ? 'Out of Stock' : 
                                       product.stock <= 10 ? 'Low Stock' : 'In Stock';
                    const statusClass = product.stock <= 0 ? 'bg-red-100 text-red-800' : 
                                      product.stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
                    
                    productsHTML += `
                        <div class="product-card bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300">
                            <div class="relative pb-[75%] bg-gray-100">
                                <img src="${product.image}" alt="${product.title}" class="absolute h-full w-full object-cover">
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
                                        <button class="p-1.5 text-gray-600 hover:text-blue-600 transition-colors edit-product" data-id="${product.id}">
                                            <i class="ri-edit-line"></i>
                                        </button>
                                        <button class="p-1.5 text-gray-600 hover:text-red-600 transition-colors delete-product" data-id="${product.id}">
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
                
                // Add event listeners to edit and delete buttons
                document.querySelectorAll('.edit-product').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                        openModal('edit', productId);
                    });
                });
                
                document.querySelectorAll('.delete-product').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = parseInt(e.currentTarget.getAttribute('data-id'));
                        deleteProduct(productId);
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
            
            function openModal(mode, productId = null) {
                if (mode === 'add') {
                    modalTitle.textContent = 'Add New Product';
                    productForm.reset();
                    productIdInput.value = '';
                } else if (mode === 'edit') {
                    modalTitle.textContent = 'Edit Product';
                    const product = products.find(p => p.id === productId);
                    
                    if (product) {
                        productIdInput.value = product.id;
                        productNameInput.value = product.title;
                        productPriceInput.value = product.price;
                        productCategoryInput.value = product.category;
                        productStockInput.value = product.stock;
                        productDescriptionInput.value = product.description;
                        productImageInput.value = product.image;
                    }
                }
                
                productModal.classList.remove('hidden');
            }
            
            function closeModal() {
                productModal.classList.add('hidden');
            }
            
            function saveProduct() {
                const productId = productIdInput.value;
                const productData = {
                    title: productNameInput.value,
                    price: parseFloat(productPriceInput.value),
                    category: productCategoryInput.value,
                    stock: parseInt(productStockInput.value),
                    description: productDescriptionInput.value,
                    image: productImageInput.value || 'https://via.placeholder.com/400?text=No+Image'
                };
                
                // In a real app, you would send this to your API
                if (productId) {
                    // Update existing product
                    const index = products.findIndex(p => p.id === parseInt(productId));
                    if (index !== -1) {
                        products[index] = { ...products[index], ...productData };
                    }
                } else {
                    // Add new product
                    const newId = Math.max(...products.map(p => p.id)) + 1;
                    products.unshift({
                        id: newId,
                        ...productData
                    });
                }
                
                closeModal();
                filterAndSortProducts();
                currentPage = 1;
                renderProducts();
                renderPagination();
                
                // Show success message
                showToast(productId ? 'Product updated successfully' : 'Product added successfully');
            }
            
            function deleteProduct(productId) {
                if (confirm('Are you sure you want to delete this product?')) {
                    // In a real app, you would send a DELETE request to your API
                    products = products.filter(p => p.id !== productId);
                    
                    // Reset to first page if current page would be empty
                    const startIndex = (currentPage - 1) * productsPerPage;
                    if (startIndex >= filteredProducts.length) {
                        currentPage = Math.max(1, currentPage - 1);
                    }
                    
                    filterAndSortProducts();
                    renderProducts();
                    renderPagination();
                    
                    // Show success message
                    showToast('Product deleted successfully');
                }
            }
            
            function showToast(message) {
                const toast = document.createElement('div');
                toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
                toast.innerHTML = `
                    <i class="ri-checkbox-circle-line mr-2"></i>
                    <span>${message}</span>
                `;
                
                document.body.appendChild(toast);
                
                setTimeout(() => {
                    toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            }
        });
