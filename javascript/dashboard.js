        // Store data from previous page
        const storeData = {
            storeName: "My Awesome Store",
            sellerName: "John Doe",
            sellerNumber: "0244123456"
        };
        

        // Products array
        let products = [];
        const maxFreeProducts = 10;
        let currentPlan = "Free";
        let productToDelete = null;

        // DOM elements
        const storeNameDisplay = document.getElementById('storeNameDisplay');
        const sellerNameDisplay = document.getElementById('sellerNameDisplay');
        const sellerInitial = document.getElementById('sellerInitial');
        const totalProductsDisplay = document.getElementById('totalProducts');
        const availableSlotsDisplay = document.getElementById('availableSlots');
        const productsContainer = document.getElementById('productsContainer');
        const noProductsMessage = document.getElementById('noProductsMessage');

        // Modal elements
        const addProductModal = document.getElementById('addProductModal');
        const upgradeModal = document.getElementById('upgradeModal');
        const deleteModal = document.getElementById('deleteModal');

        // Initialize the dashboard
        function initDashboard() {
            // Set store info
            storeNameDisplay.textContent = storeData.storeName;
            sellerNameDisplay.textContent = storeData.sellerName;
            sellerInitial.textContent = storeData.sellerName.charAt(0);
            
            // Load products from localStorage if available
            const savedProducts = localStorage.getItem('storeDashProducts');
            if (savedProducts) {
                products = JSON.parse(savedProducts);
            }
            
            // Load plan from localStorage if available
            const savedPlan = localStorage.getItem('storeDashPlan');
            if (savedPlan) {
                currentPlan = savedPlan;
                updatePlanUI();
            }
            
            updateProductsUI();
        }

        // Update products UI
        function updateProductsUI() {
            totalProductsDisplay.textContent = products.length;
            
            // Calculate available slots based on plan
            let maxProducts = maxFreeProducts;
            if (currentPlan === "Standard") maxProducts = 35;
            if (currentPlan === "Premium") maxProducts = 60;
            
            const availableSlots = Math.max(0, maxProducts - products.length);
            availableSlotsDisplay.textContent = availableSlots;
            
            // Show/hide no products message
            if (products.length === 0) {
                noProductsMessage.classList.remove('hidden');
            } else {
                noProductsMessage.classList.add('hidden');
            }
            
            // Clear products container
            productsContainer.innerHTML = '';
            
            // Add product cards
            products.forEach((product, index) => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card bg-white rounded-lg shadow p-4 transition duration-300';
                productCard.innerHTML = `
                    <div class="h-40 bg-gray-100 rounded-md mb-3 overflow-hidden">
                        <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}" alt="${product.name}" class="w-full h-full object-cover">
                    </div>
                    <h3 class="font-medium text-gray-800 truncate">${product.name}</h3>
                    <p class="text-purple-600 font-bold mt-1">GHC ${product.price.toFixed(2)}</p>
                    <div class="mt-4 flex justify-between">
                        <button onclick="editProduct(${index})" class="text-sm text-gray-600 hover:text-purple-600">
                            <i class="fas fa-edit mr-1"></i> Edit
                        </button>
                        <button onclick="openDeleteModal(${index})" class="text-sm text-red-500 hover:text-red-700">
                            <i class="fas fa-trash-alt mr-1"></i> Delete
                        </button>
                    </div>
                `;
                productsContainer.appendChild(productCard);
            });
        }

        // Add product
        function addProduct(e) {
            e.preventDefault();
            
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const image = document.getElementById('productImage').value;
            
            // Check if we've reached the product limit
            let maxProducts = maxFreeProducts;
            if (currentPlan === "Standard") maxProducts = 35;
            if (currentPlan === "Premium") maxProducts = 60;
            
            if (products.length >= maxProducts) {
                alert(`You've reached your product limit (${maxProducts}). Please upgrade your plan to add more products.`);
                return;
            }
            
            const newProduct = {
                name,
                price,
                image: image || null
            };
            
            products.push(newProduct);
            localStorage.setItem('storeDashProducts', JSON.stringify(products));
            
            closeAddProductModal();
            updateProductsUI();
            
            // Reset form
            document.getElementById('productForm').reset();
        }

        // Edit product
        function editProduct(index) {
            const product = products[index];
            document.getElementById('productName').value = product.name;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image || '';
            
            // Change modal title and button
            const modalTitle = addProductModal.querySelector('h3');
            modalTitle.textContent = 'Edit Product';
            
            const submitButton = addProductModal.querySelector('button[type="submit"]');
            submitButton.textContent = 'Update Product';
            submitButton.onclick = function(e) {
                e.preventDefault();
                updateProduct(index);
            };
            
            openAddProductModal();
        }

        // Update product
        function updateProduct(index) {
            const name = document.getElementById('productName').value;
            const price = parseFloat(document.getElementById('productPrice').value);
            const image = document.getElementById('productImage').value;
            
            products[index] = {
                name,
                price,
                image: image || null
            };
            
            localStorage.setItem('storeDashProducts', JSON.stringify(products));
            
            closeAddProductModal();
            updateProductsUI();
            
            // Reset form and modal
            document.getElementById('productForm').reset();
            const modalTitle = addProductModal.querySelector('h3');
            modalTitle.textContent = 'Add New Product';
            
            const submitButton = addProductModal.querySelector('button[type="submit"]');
            submitButton.textContent = 'Add Product';
            submitButton.onclick = function(e) {
                e.preventDefault();
                addProduct(e);
            };
        }

        // Open delete modal
        function openDeleteModal(index) {
            productToDelete = index;
            deleteModal.classList.remove('hidden');
        }

        // Close delete modal
        function closeDeleteModal() {
            productToDelete = null;
            deleteModal.classList.add('hidden');
        }

        // Confirm delete
        function confirmDelete() {
            if (productToDelete !== null) {
                products.splice(productToDelete, 1);
                localStorage.setItem('storeDashProducts', JSON.stringify(products));
                updateProductsUI();
                closeDeleteModal();
            }
        }

        // Open add product modal
        function openAddProductModal() {
            addProductModal.classList.remove('hidden');
        }

        // Close add product modal
        function closeAddProductModal() {
            addProductModal.classList.add('hidden');
        }

        // Open upgrade modal
        function openUpgradeModal(plan = 'Standard') {
            const modalTitle = document.getElementById('upgradeModalTitle');
            const selectedPlanName = document.getElementById('selectedPlanName');
            const planBenefits = document.getElementById('planBenefits');
            
            selectedPlanName.textContent = plan;
            
            if (plan === 'Standard') {
                modalTitle.textContent = 'Upgrade to Standard Plan';
                planBenefits.innerHTML = `
                    <li>35 product slots (25 extra)</li>
                    <li>Advanced analytics</li>
                    <li>Priority support</li>
                    <li>Basic customization</li>
                `;
            } else {
                modalTitle.textContent = 'Upgrade to Premium Plan';
                planBenefits.innerHTML = `
                    <li>60 product slots (50 extra)</li>
                    <li>Premium analytics dashboard</li>
                    <li>24/7 VIP support</li>
                    <li>Advertising tools</li>
                    <li>Featured store placement</li>
                    <li>Custom domain</li>
                `;
            }
            
            // Show the upgrade content and hide success message
            document.getElementById('upgradeModalContent').classList.remove('hidden');
            document.getElementById('paymentSuccess').classList.add('hidden');
            
            upgradeModal.classList.remove('hidden');
        }

        // Close upgrade modal
        function closeUpgradeModal() {
            upgradeModal.classList.add('hidden');
        }

        // Complete payment
        function completePayment() {
            const paymentNumber = document.getElementById('paymentNumber').value;
            
            if (!paymentNumber) {
                alert('Please enter your mobile money number');
                return;
            }
            
            // Simulate payment processing
            setTimeout(() => {
                // Update plan
                const selectedPlan = document.getElementById('selectedPlanName').textContent;
                currentPlan = selectedPlan;
                localStorage.setItem('storeDashPlan', currentPlan);
                
                // Show success message
                document.getElementById('upgradeModalContent').classList.add('hidden');
                document.getElementById('paymentSuccess').classList.remove('hidden');
                document.getElementById('upgradedPlanName').textContent = selectedPlan;
                
                // Update UI
                updatePlanUI();
                updateProductsUI();
            }, 1500);
        }

        // Update plan UI
        function updatePlanUI() {
            // Remove selected class from all plans
            document.querySelectorAll('.pricing-card').forEach(card => {
                card.classList.remove('selected-plan');
            });
            
            // Add selected class to current plan
            if (currentPlan === 'Free') {
                document.querySelectorAll('.pricing-card')[0].classList.add('selected-plan');
            } else if (currentPlan === 'Standard') {
                document.querySelectorAll('.pricing-card')[1].classList.add('selected-plan');
            } else if (currentPlan === 'Premium') {
                document.querySelectorAll('.pricing-card')[2].classList.add('selected-plan');
            }
        }

        // Initialize the dashboard when the page loads
        window.onload = initDashboard;
    