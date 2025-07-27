 //Store Info
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
      <div class="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full">
          <i class="ri-user-line"></i>
      </div>
    `;
  }
  fetchStoreData();

// Product Management
            const addProductForm = document.getElementById('addProductForm');
            const productImageInput = document.getElementById('productImage');
            const imagePreview = document.getElementById('image-preview');
            const previewImg = document.getElementById('preview-img');
            const uploadPlaceholder = document.getElementById('upload-placeholder');
            const productList = document.getElementById('product-list');
            //check
            const productCount = document.getElementById('product-count');
            //check
            const productLimit = document.getElementById('product-limit');
            const freeProgress = document.getElementById('free-progress');
            const freeUsed = document.getElementById('free-used');
            const addProductBtn = document.getElementById('addProductBtn');
            const addProductText = document.getElementById('addProductText');
            const addProductSpinner = document.getElementById('addProductSpinner');
            
            let product = [];
            let currentPlan = 'free';
            const planLimits = {
                'free': 15,
                'standard': 30,
                'premium': 65
            };
            
            // Update product limit based on current plan
            function updateProductLimit() {
                productLimit.textContent = planLimits[currentPlan];
                updateProgressBar();
            }
            
            // Update progress bar
            function updateProgressBar() {
                const limit = planLimits[currentPlan];
                const count = product.length;
                const percentage = (count / limit) * 100;
                
                freeProgress.style.width = `${percentage}%`;
                freeUsed.textContent = `${count} products`;
                
                // Warning color when approaching limit
                if (percentage > 80) {
                    freeProgress.classList.add('bg-yellow-500');
                    freeProgress.classList.remove('bg-primary');
                } else {
                    freeProgress.classList.add('bg-primary');
                    freeProgress.classList.remove('bg-yellow-500');
                }
            }
            
            // Handle image upload preview
            productImageInput.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        uploadPlaceholder.classList.add('hidden');
                        imagePreview.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            // Add product form submission
            addProductForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const productName = document.getElementById('productName').value;
                const productPrice = document.getElementById('productPrice').value;
                const productStock = document.getElementById('productStock').value;
                const productDescription = document.getElementById('productDescription').value;
                const productCategory = document.getElementById('productCategory').value
                
                // Form validation
                if (!productName || !productPrice || !productStock || !productDescription || !productCategory) {
                    showNotification('Error', 'Please fill in all required fields', 'error');
                    return;
                }
                
                // Check product limit
                if (product.length >= planLimits[currentPlan]) {
                    showNotification('Limit Reached', `You've reached the maximum number of products for your ${currentPlan} plan. Please upgrade to add more.`, 'error');
                    return;
                }
                
                addProductBtn.disabled = true;
                addProductBtn.classList.add('opacity-50', 'cursor-not-allowed');
                addProductSpinner.classList.remove('hidden');
                addProductText.textContent = 'Adding product...';

                //saving in a database
                const store = JSON.parse(localStorage.getItem("store"));
                const user = JSON.parse(localStorage.getItem("user"));
                if(!store || !store._id){
                    alert("Store not found in local storage");
                    return;
                }

                const formData = new FormData(addProductForm);
                formData.append("storeId", store._id);
                formData.append("userId", user.id);

                 try {
                  const response = await fetch("http://localhost:3000/api/products", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                    showNotification('Product Added', 'Your product has been added successfully', 'success');
                } else {
                    alert(result.message || "Failed to add product");
                }
                } catch (error) {
                console.error("Product creation error:", error);
                alert("Something went wrong. Please try again.");
                }

                
                // Reset form
                addProductForm.reset();
                uploadPlaceholder.classList.remove('hidden');
                imagePreview.classList.add('hidden');
                addProductBtn.disabled = false;
                addProductBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                addProductSpinner.classList.add('hidden');
                addProductText.textContent = 'Add Product';
            });
            
            // Update product count
            function updateProductCount() {
                productCount.textContent = product.length;
                updateProgressBar();
            }

            //fetching products
            const store = JSON.parse(localStorage.getItem("store"));
            const storeId = store._id
            async function fetchProducts() {
                try {
                    const response = await fetch(`http://localhost:3000/api/products/${encodeURIComponent(storeId)}`);
                    if (!response.ok) throw new Error("Failed to fetch product");

                   product = await response.json();
                    updateProductList(product);
                } catch (error) {
                    console.error('Failed to get product:', error);
                }
            }
            
            // Update product list
            function updateProductList(product) {
                if (product.length === 0) {
                    productList.innerHTML = `
                        <div class="text-center text-gray-500 py-8">
                            <div class="w-16 h-16 flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <i class="ri-shopping-bag-line text-4xl"></i>
                            </div>
                            <p>No products added yet</p>
                            <p class="text-sm mt-2">Add your first product to get started</p>
                        </div>
                    `;
                    return;
                }
                
                productList.innerHTML = '';
                
                // Show most recent products first (up to 5)
                const recentProducts = [...product].reverse().slice(0, 5);
                
                recentProducts.forEach(product => {
                    const productElement = document.createElement('div');
                    productElement.className = 'flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50';
                    productElement.innerHTML = `
                        <div class="w-12 h-12 rounded overflow-hidden mr-3 flex-shrink-0">
                            <img src="${product.productImage}" alt="${product.productName}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1 min-w-0">
                            <h4 class="text-sm font-medium text-gray-900 truncate">${product.productName}</h4>
                            <span class="mx-1">•</span>
                            <span>${product.productCategory}</span>
                            <div class="flex items-center text-xs text-gray-500 mt-1">
                                <span class="mx-1">•</span>
                                <span>${product.productStock} in stock</span>
                            </div>
                        </div>
                        <div class="text-sm font-medium text-gray-900">GHC ${product.productPrice.toFixed(2)}</div>
                    `;
                    productList.appendChild(productElement);
                });
                    updateProductLimit();
                    updateProductCount()
            }
            
            // Show notification
            function showNotification(title, message, type = 'success') {
                const notification = document.getElementById('notification');
                const notificationTitle = document.getElementById('notification-title');
                const notificationMessage = document.getElementById('notification-message');
                const notificationIcon = notification.querySelector('i');
                
                notificationTitle.textContent = title;
                notificationMessage.textContent = message;
                
                if (type === 'success') {
                    notification.querySelector('div:first-child').className = 'w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-3';
                    notificationIcon.className = 'ri-check-line text-green-500';
                } else {
                    notification.querySelector('div:first-child').className = 'w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-3';
                    notificationIcon.className = 'ri-close-line text-red-500';
                }
                
                notification.classList.remove('translate-x-full');
                
                setTimeout(() => {
                    notification.classList.add('translate-x-full');
                }, 5000);
            }
            
            // Close notification
            document.getElementById('close-notification').addEventListener('click', function() {
                document.getElementById('notification').classList.add('translate-x-full');
            });
            
            // Initialize
            fetchProducts();
        });

//pricing
 document.addEventListener('DOMContentLoaded', function() {
            const freePlan = document.getElementById('free-plan');
            const standardPlan = document.getElementById('standard-plan');
            const premiumPlan = document.getElementById('premium-plan');
            const upgradeStandard = document.getElementById('upgrade-standard');
            const upgradePremium = document.getElementById('upgrade-premium');
            
            let currentPlan = 'free';
            
            function updateActivePlan() {
                // Remove active class from all plans
                [freePlan, standardPlan, premiumPlan].forEach(plan => {
                    plan.classList.remove('active');
                    plan.querySelector('button').classList.remove('bg-gray-100', 'text-gray-700', 'bg-primary', 'text-white', 'border-primary', 'bg-white', 'text-primary');
                    
                    // Remove current plan badge if exists
                    const badge = plan.querySelector('.absolute');
                    if (badge) {
                        badge.remove();
                    }
                });
                
                // Add active class to current plan
                let activePlan;
                if (currentPlan === 'free') {
                    activePlan = freePlan;
                    freePlan.querySelector('button').className = 'w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-button hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 whitespace-nowrap';
                    freePlan.querySelector('button').textContent = 'Current Plan';
                } else if (currentPlan === 'standard') {
                    activePlan = standardPlan;
                    standardPlan.querySelector('button').className = 'w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-button hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 whitespace-nowrap';
                    standardPlan.querySelector('button').textContent = 'Current Plan';
                } else {
                    activePlan = premiumPlan;
                    premiumPlan.querySelector('button').className = 'w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-button hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 whitespace-nowrap';
                    premiumPlan.querySelector('button').textContent = 'Current Plan';
                }
                
                activePlan.classList.add('active');
                
                // Add current plan badge
                const badge = document.createElement('div');
                badge.className = 'absolute top-4 right-4 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full';
                badge.textContent = 'Current Plan';
                activePlan.appendChild(badge);
                
                // Update product limit
                const productLimit = document.getElementById('product-limit');
                if (currentPlan === 'free') {
                    productLimit.textContent = '15';
                } else if (currentPlan === 'standard') {
                    productLimit.textContent = '30';
                } else {
                    productLimit.textContent = '65';
                }
                
                // Reset other plan buttons
                if (currentPlan !== 'standard') {
                    upgradeStandard.className = 'w-full px-4 py-2 bg-primary text-white font-medium rounded-button hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap';
                    upgradeStandard.textContent = 'Upgrade Plan';
                }
                
                if (currentPlan !== 'premium') {
                    upgradePremium.className = 'w-full px-4 py-2 border border-primary bg-white text-primary font-medium rounded-button hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 whitespace-nowrap';
                    upgradePremium.textContent = 'Upgrade Plan';
                }
            }
            
            // Upgrade to Standard plan
            upgradeStandard.addEventListener('click', function() {
                // Simulate payment process
                setTimeout(() => {
                    currentPlan = 'standard';
                    updateActivePlan();
                    
                    // Show success notification
                    const notification = document.getElementById('notification');
                    const notificationTitle = document.getElementById('notification-title');
                    const notificationMessage = document.getElementById('notification-message');
                    
                    notificationTitle.textContent = 'Plan Upgraded';
                    notificationMessage.textContent = 'You have successfully upgraded to the Standard plan';
                    
                    notification.classList.remove('translate-x-full');
                    
                    setTimeout(() => {
                        notification.classList.add('translate-x-full');
                    }, 5000);
                }, 1000);
            });
            
            // Upgrade to Premium plan
            upgradePremium.addEventListener('click', function() {
                // Simulate payment process
                setTimeout(() => {
                    currentPlan = 'premium';
                    updateActivePlan();
                    
                    // Show success notification
                    const notification = document.getElementById('notification');
                    const notificationTitle = document.getElementById('notification-title');
                    const notificationMessage = document.getElementById('notification-message');
                    
                    notificationTitle.textContent = 'Plan Upgraded';
                    notificationMessage.textContent = 'You have successfully upgraded to the Premium plan';
                    
                    notification.classList.remove('translate-x-full');
                    
                    setTimeout(() => {
                        notification.classList.add('translate-x-full');
                    }, 5000);
                }, 1000);
            });
            
            // Initialize
            updateActivePlan();
        });