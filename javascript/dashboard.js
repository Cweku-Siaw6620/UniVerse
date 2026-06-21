document.addEventListener('DOMContentLoaded', function () {
 //Store Info
 
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

  async function fetchStoreData() {
    try {
      const res = await fetch(`https://uni-verse-api.vercel.app/api/stores/${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error("Failed to fetch store");

      const store = await res.json();
            const verification = window.uniVerseVerification
                ? await window.uniVerseVerification.fetchVerificationStatus(userId)
                : { isVerified: false };
            updateStoreInfo(store, verification);
    } catch (error) {
      console.error('Failed to get store:', error);
    }
  }

    function updateStoreInfo(store, verification = { isVerified: false }) {
    const storeInfoContainer = document.getElementById('store-info');
    if (!storeInfoContainer) return;

    storeInfoContainer.innerHTML = `
      <div class="flex items-center space-x-4 p-2 bg-white rounded-lg shadow-sm">
        <!-- Store Logo -->
        <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden">
            <img src="${store.storeLogo}" alt="${store.storeName}" class="w-full h-full object-cover">
        </div>

        <!-- Store Info -->
        <div class="hidden md:block">
            <div class="text-sm font-semibold text-gray-900">${store.storeName}</div>
            <div class="text-xs text-gray-500 flex items-center gap-2 flex-wrap">${store.sellerName}${verification.isVerified ? window.uniVerseVerification.getVerifiedBadgeHtml() : ''}</div>
        </div>

        <!-- Private Website Button (only if personalWebsite exists) -->
        ${store.personalWebsite ? `
            <a href="${store.personalWebsite}" target="_blank"
            class="ml-auto text-sm bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-200 ease-in-out">
            Private Website
            </a>
        ` : ``}
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
                'premium': 45,
                'organizational': 90
            };
            
            // Update product limit based on current plan
            function updateProductLimit() {
                productLimit.textContent = planLimits[currentPlan];
                updateProgressBar();
            }

            // Allow the plan-status fetch (later in this file) to update
            // currentPlan once the real plan is known from the backend,
            // instead of staying stuck on the 'free' default.
            window.setCurrentPlan = function (plan) {
                if (!planLimits.hasOwnProperty(plan)) return;
                currentPlan = plan;
                productLimit.textContent = planLimits[currentPlan];
                updateProgressBar();
            };
            
            // Update progress bar — updates all three plan cards,
            // since the seller's actual product count applies regardless of
            // which plan they're currently on. Only the active plan's bar
            // should visually represent "used vs limit" in full color.
            function updateProgressBar() {
                const count = product.length;

                const bars = {
                    free:           { bar: freeProgress,  used: freeUsed,  limit: planLimits.free },
                    premium:        { bar: document.getElementById('premium-progress'),        used: document.getElementById('premium-used'),        limit: planLimits.premium },
                    organizational: { bar: document.getElementById('organizational-progress'),  used: document.getElementById('organizational-used'),  limit: planLimits.organizational }
                };

                Object.entries(bars).forEach(([planKey, els]) => {
                    if (!els.bar || !els.used) return;

                    const percentage = Math.min((count / els.limit) * 100, 100);
                    els.bar.style.width = `${percentage}%`;
                    els.used.textContent = `${count} products`;

                    if (planKey === currentPlan) {
                        // Active plan — full color, with yellow warning near limit
                        els.bar.classList.remove('bg-gray-300');
                        if (percentage > 80) {
                            els.bar.classList.add('bg-yellow-500');
                            els.bar.classList.remove('bg-primary', 'bg-purple-600', 'bg-amber-500');
                        } else {
                            els.bar.classList.remove('bg-yellow-500');
                            const activeColor = planKey === 'free' ? 'bg-primary' : planKey === 'premium' ? 'bg-purple-600' : 'bg-amber-500';
                            els.bar.classList.add(activeColor);
                        }
                    } else {
                        // Inactive plan card — muted, not the live indicator
                        els.bar.classList.remove('bg-primary', 'bg-purple-600', 'bg-amber-500', 'bg-yellow-500');
                        els.bar.classList.add('bg-gray-300');
                    }
                });
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
                let store = null;
                let currentUser = null;
                try {
                  const storeData = localStorage.getItem("store");
                  store = storeData ? JSON.parse(storeData) : null;
                  const userData = localStorage.getItem("user");
                  currentUser = userData ? JSON.parse(userData) : null;
                } catch (err) {
                  console.error("Failed to parse localStorage data:", err);
                }
                
                if(!store || !store._id){
                    showNotification("Store not found. Please create a store first.", "error");
                    return;
                }
                if (!currentUser || !currentUser.id) {
                    showNotification("User not found. Please log in again.", "error");
                    return;
                }

                const formData = new FormData(addProductForm);
                formData.append("storeId", store._id);
                formData.append("userId", currentUser.id);

                 try {
                  const response = await fetch("https://uni-verse-api.vercel.app/api/products", {
                    method: "POST",
                    body: formData,
                });
                const result = await response.json();
                if (response.ok) {
                showNotification('Product Added', 'Your product has been added successfully', 'success');
                setTimeout(() => window.location.reload(), 1500);
                // Add the new product locally
               // product.push(result);
                
               
                // Reset the form and spinner
                
                }

                else {
                    alert(result.message || "Failed to add product");
                }
                } catch (error) {
                console.error("Product creation error:", error);
                alert("Something went wrong. Please try again.");
                }

                
            });
            
            // Update product count
            function updateProductCount() {
                productCount.textContent = product.length;
                updateProgressBar();
            }

            //fetching products
            let storeId = null;
            try {
              const storeData = localStorage.getItem("store");
              const store = storeData ? JSON.parse(storeData) : null;
              storeId = store?._id;
            } catch (err) {
              console.error("Failed to get store ID from localStorage:", err);
            }
            
            async function fetchProducts() {
              if (!storeId) {
                console.error("Store ID not found.");
                return;
              }
                try {
                    const response = await fetch(`https://uni-verse-api.vercel.app/api/products/${encodeURIComponent(storeId)}`);
                    if (!response.ok) throw new Error("Failed to fetch product");

                   product = await response.json();
                    updateProductList(product);
                     // Update UI dynamically
                    updateProductCount();
                    updateProgressBar();

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
                            <h3 class="text-sm font-medium text-gray-900 truncate">${product.productName}</h3>
                            <div class="text-sm text-gray-400">GHC ${product.productPrice.toFixed(2)}</div>
                            <div class="flex items-center text-xs text-gray-500 mt-1">
                                <span class="mx-1">•</span>
                                <span>${product.productStock} in stock</span>
                            </div>
                            
                        </div>
                       
                    `;
                    productList.appendChild(productElement);
                });
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
           updateProductLimit();
           //updateProductCount()

// ============================================================
// PLAN STATUS + PAYSTACK PAYMENT FLOW
// ============================================================
(() => {
  const API = 'https://uni-verse-api.vercel.app';

  const PLANS = {
    premium:        { amount: 50, limit: 45,  label: 'Premium'       },
    organizational: { amount: 80, limit: 90,  label: 'Organizational' }
  };

  let currentPlanData = null;

  // ── Get store from localStorage ──────────────────────
  let store = null;
  try { store = JSON.parse(localStorage.getItem('store')); } catch {}
  if (!store || !store._id) return;

  // ── Inject plan status bar above pricing section ─────
  const pricingSection = document.querySelector('#free-plan')?.closest('.bg-white.rounded-lg.shadow-sm.p-6.mb-6');
  if (pricingSection) {
    const bar = document.createElement('div');
    bar.id = 'plan-status-bar';
    bar.className = 'bg-white rounded-lg shadow-sm p-5 mb-6';
    bar.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-center gap-3">
          <div id="plan-badge" class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"></div>
          <div>
            <p id="plan-label" class="text-sm font-semibold text-gray-900"></p>
            <p id="plan-sublabel" class="text-xs text-gray-500 mt-0.5"></p>
          </div>
        </div>
        <div id="plan-countdown" class="hidden sm:w-52">
          <div class="flex justify-between text-xs text-gray-500 mb-1">
            <span>Days remaining</span>
            <span id="plan-days-text" class="font-semibold text-gray-700"></span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div id="plan-days-bar" class="h-1.5 rounded-full transition-all duration-500"></div>
          </div>
        </div>
      </div>
    `;
    pricingSection.parentNode.insertBefore(bar, pricingSection);
  }

  // ── Render plan status bar ────────────────────────────
  function renderPlanStatus(data) {
    currentPlanData = data;

    const badge    = document.getElementById('plan-badge');
    const label    = document.getElementById('plan-label');
    const sublabel = document.getElementById('plan-sublabel');
    const countdown = document.getElementById('plan-countdown');
    const daysText = document.getElementById('plan-days-text');
    const daysBar  = document.getElementById('plan-days-bar');

    const styles = {
      free:           'bg-gray-100 text-gray-600',
      premium:        'bg-purple-100 text-purple-700',
      organizational: 'bg-amber-100 text-amber-700'
    };

    badge.className   = `px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[data.plan]}`;
    badge.textContent = data.plan === 'organizational' ? 'Organizational' : data.plan;

    if (data.plan === 'free') {
      label.textContent    = 'Free Plan';
      sublabel.textContent = 'Up to 15 products · Basic analytics';
      countdown.classList.add('hidden');
    } else {
      label.textContent = `${PLANS[data.plan].label} Plan — ${data.productLimit} products`;
      countdown.classList.remove('hidden');

      const days = data.daysLeft;
      daysText.textContent  = `${days} day${days !== 1 ? 's' : ''}`;
      const pct = Math.round((days / 31) * 100);
      daysBar.style.width   = `${pct}%`;
      daysBar.style.background =
        days <= 5  ? '#ef4444' :
        days <= 10 ? '#f59e0b' : '#16a34a';

      if (days <= 5) {
        sublabel.className   = 'text-xs text-red-500 mt-0.5 font-semibold';
        sublabel.textContent = `⚠️ Expires in ${days} day${days !== 1 ? 's' : ''} — renew now`;
      } else {
        sublabel.className   = 'text-xs text-gray-500 mt-0.5';
        sublabel.textContent = `Expires ${new Date(data.planExpiresAt)
          .toLocaleDateString('en-GH', {
            day: 'numeric', month: 'short', year: 'numeric'
          })}`;
      }
    }

    updatePlanCards(data.plan);

    // Keep the Add Product section's progress logic in sync with the live plan
    if (typeof window.setCurrentPlan === 'function') {
      window.setCurrentPlan(data.plan);
    }
  }

  // ── Update plan card UI ───────────────────────────────
  function updatePlanCards(activePlan) {
    // Reset all cards
    ['free-plan', 'premium-plan', 'organizational-plan'].forEach(id => {
      const card = document.getElementById(id);
      if (!card) return;
      card.querySelectorAll('.current-plan-badge').forEach(b => b.remove());
    });

    // Mark active card with a colored badge that matches the card style
    const activeCard = document.getElementById(`${activePlan}-plan`);
    if (activeCard) {
      const badge = document.createElement('div');
      const badgeStyles = {
        free: 'bg-gray-100 text-gray-700',
        premium: 'bg-purple-600 text-white',
        organizational: 'bg-amber-500 text-white'
      };
      badge.className = `current-plan-badge absolute top-4 right-4 text-xs font-medium px-2 py-1 rounded-full ${badgeStyles[activePlan] || 'bg-primary text-white'}`;
      badge.textContent = 'Current Plan';
      activeCard.style.position = 'relative';
      activeCard.appendChild(badge);
    }

    // Premium button
    const premBtn = document.getElementById('upgrade-premium');
    if (premBtn) {
      if (activePlan === 'premium') {
        premBtn.textContent = 'Current Plan';
        premBtn.disabled    = true;
        premBtn.className   = 'w-full px-4 py-2 bg-gray-100 text-gray-500 font-medium rounded-button cursor-not-allowed whitespace-nowrap';
      } else {
        premBtn.textContent = 'Upgrade Plan';
        premBtn.disabled    = false;
        premBtn.className   = 'w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-button hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 whitespace-nowrap';
      }
    }

    // Organizational button
    const orgBtn = document.getElementById('upgrade-organizational');
    if (orgBtn) {
      if (activePlan === 'organizational') {
        orgBtn.textContent = 'Current Plan';
        orgBtn.disabled    = true;
        orgBtn.className   = 'w-full px-4 py-2 bg-gray-100 text-gray-500 font-medium rounded-button cursor-not-allowed whitespace-nowrap';
      } else {
        orgBtn.textContent = 'Upgrade Plan';
        orgBtn.disabled    = false;
        orgBtn.className   = 'w-full px-4 py-2 bg-amber-500 text-white font-medium rounded-button hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 whitespace-nowrap';
      }
    }

    // Product limit display
    const limitEl = document.getElementById('product-limit');
    if (limitEl) {
      limitEl.textContent =
        activePlan === 'free'           ? '15' :
        activePlan === 'premium'        ? '45' : '90';
    }
  }

  // ── Fetch live plan status ────────────────────────────
  async function fetchPlanStatus() {
    try {
      const res  = await fetch(`${API}/api/plans/status/${store._id}`);
      const data = await res.json();
      if (data.success) renderPlanStatus(data);
    } catch {
      // silently fail
    }
  }

  fetchPlanStatus();

  // Ensure default UI shows Free as the active plan until server responds
  updatePlanCards('free');

  // ── Show notification ─────────────────────────────────
  function showNotification(title, message) {
    const notification = document.getElementById('notification');
    const titleEl      = document.getElementById('notification-title');
    const messageEl    = document.getElementById('notification-message');
    if (!notification || !titleEl || !messageEl) return;
    titleEl.textContent   = title;
    messageEl.textContent = message;
    notification.classList.remove('translate-x-full');
    setTimeout(() => notification.classList.add('translate-x-full'), 5000);
  }

  // ── Initiate Paystack payment ─────────────────────────
  async function initiatePayment(plan) {
    const btn = document.getElementById(
      plan === 'premium' ? 'upgrade-premium' : 'upgrade-organizational'
    );

    const originalText = btn.textContent;
    btn.disabled    = true;
    btn.textContent = 'Loading...';

    try {
      const res = await fetch(`${API}/api/plans/initiate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId: store._id, plan })
      });

      const data = await res.json();

      if (!data.success) {
        showNotification('Error', data.message || 'Failed to initiate payment.');
        btn.disabled    = false;
        btn.textContent = originalText;
        return;
      }

// open Paystack payment model
  const handler = PaystackPop.setup({
  key:         'pk_test_06a5336a803a441f45b7989742954a4a76e30c2f',
  email:       user?.email || '',
  amount:      plan === 'premium' ? 3500 : 8000,
  currency:    'GHS',
  access_code: data.access_code,
  ref:         data.reference,
  onClose: function() {
    btn.disabled    = false;
    btn.textContent = originalText;
  },
  callback: function(response) {
    showNotification(
      'Payment Successful!',
      'Your plan is being activated. This usually takes a few seconds.'
    );
    btn.disabled    = false;
    btn.textContent = originalText;

    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      await fetchPlanStatus();
      if (currentPlanData?.plan === plan || attempts >= 10) {
        clearInterval(poll);
      }
    }, 3000);
  }
});

handler.openIframe();

 } catch {
      showNotification('Error', 'Network error. Please try again.');
      btn.disabled    = false;
      btn.textContent = originalText;
    }
  }


  // ── Button listeners ──────────────────────────────────
  document.getElementById('upgrade-premium')?.addEventListener('click', () => {
    initiatePayment('premium');
  });

  document.getElementById('upgrade-organizational')?.addEventListener('click', () => {
    initiatePayment('organizational');
  });

  // ── Close notification ────────────────────────────────
  document.getElementById('close-notification')?.addEventListener('click', () => {
    document.getElementById('notification')?.classList.add('translate-x-full');
  });

})();
        });