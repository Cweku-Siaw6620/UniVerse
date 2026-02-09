document.addEventListener('DOMContentLoaded', () => {
  // Extract storeId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const storeSlug = urlParams.get('slug');

  // Initialize feather icons
  feather.replace();

  // Store data variable
  let resolvedStoreId = null;
  let storeData = null;

  // Main function to fetch and display store data
  async function initializeStorePage() {
    try {
      await fetchStoreDetails();
      await fetchStoreProducts();
      updateDetailedDescription();
    } catch (error) {
      console.error("Error initializing store page:", error);
      showErrorAlert("Failed to load store information.");
    }
  }

  // Fetch store details from API
  async function fetchStoreDetails() {
    try {
      const res = await fetch(
        `https://universe-api-uabt.onrender.com/api/stores/slug/${storeSlug}`
      );

      if (!res.ok) throw new Error("Store not found");

      const store = await res.json();
      storeData = store;

      // Save storeId for product fetching
      resolvedStoreId = store._id;

      // Save to localStorage
      try {
        localStorage.setItem("currentViewedStore", JSON.stringify(store));
      } catch (err) {
        console.error("Failed to save store to localStorage:", err);
      }

      // Update all store information sections
      updateStoreHeader(store);
      updateSellerContact(store);
      updateStoreStats(store);
      updateStoreCategories(store);
      updateProductCount(0); // Will be updated after products load

      return store;
    } catch (error) {
      console.error("Error fetching store details:", error);
      throw error;
    }
  }

  // Update store header with logo and basic info
  function updateStoreHeader(store) {
    const storeHeader = document.getElementById('storeHeader');
    if (storeHeader) {
      storeHeader.innerHTML = `
        <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}" 
             alt="${store.storeName}" 
             class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg">
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(store.storeName)}</h1>
          <p class="text-gray-600 mb-1">
            <i data-feather="user" class="w-4 h-4 inline mr-1"></i>
            <span class="font-medium">Seller:</span> 
            <span id="sellerName">${escapeHtml(store.sellerName || 'Not specified')}</span>
          </p>
          <p class="text-gray-600">
            <i data-feather="phone" class="w-4 h-4 inline mr-1"></i>
            <span class="font-medium">Contact:</span> 
            <span id="sellerNumber">${escapeHtml(store.sellerNumber || 'Not provided')}</span>
          </p>
        </div>
      `;
      feather.replace();
    }
  }

  // Update seller contact section
  function updateSellerContact(store) {
    const sellerContact = document.getElementById('sellerContact');
    if (sellerContact) {
      // Check if seller has a personal website
      const hasWebsite = store.sellerWebsite || store.website || store.personalUrl;
      const websiteUrl = store.sellerWebsite || store.website || store.personalUrl;
      
      sellerContact.innerHTML = `
        <!-- Seller Profile -->
        <div class="flex items-center mb-6">
          <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}" 
               alt="${store.sellerName}" 
               class="w-12 h-12 rounded-full object-cover border-2 border-white shadow mr-3">
          <div>
            <h4 class="font-semibold text-gray-800">${escapeHtml(store.sellerName || 'Seller')}</h4>
            <p class="text-sm text-gray-500">Store Owner</p>
          </div>
        </div>
        
        <!-- Contact Information -->
        <div class="space-y-4">
          <div class="flex items-center text-gray-700">
            <i data-feather="phone" class="w-5 h-5 text-green-500 mr-3"></i>
            <span>${escapeHtml(store.sellerNumber || 'Not provided')}</span>
          </div>
          
          ${store.sellerEmail ? `
            <div class="flex items-center text-gray-700">
              <i data-feather="mail" class="w-5 h-5 text-blue-500 mr-3"></i>
              <span>${escapeHtml(store.sellerEmail)}</span>
            </div>
          ` : ''}
          
          ${store.location ? `
            <div class="flex items-center text-gray-700">
              <i data-feather="map-pin" class="w-5 h-5 text-red-500 mr-3"></i>
              <span>${escapeHtml(store.location)}</span>
            </div>
          ` : ''}
        </div>
        
        <!-- Personal Website (if available) -->
        ${hasWebsite ? `
          <div id="sellerWebsite" class="pt-6 mt-6 border-t border-blue-100">
            <h4 class="font-medium text-gray-700 mb-3 flex items-center">
              <i data-feather="globe" class="w-4 h-4 mr-2"></i>
              Personal Website
            </h4>
            <a href="${websiteUrl.startsWith('http') ? websiteUrl : 'https://' + websiteUrl}" 
               target="_blank" 
               class="block text-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 hover:shadow-lg">
              <i data-feather="external-link" class="w-4 h-4 inline mr-2"></i>
              Visit Website
            </a>
          </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div class="space-y-3 pt-6 mt-6 border-t border-gray-100">
          <button onclick="window.history.back()" 
                  class="w-full flex items-center justify-center text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium py-2.5 px-4 rounded-lg transition-colors">
            <i data-feather="arrow-left" class="w-4 h-4 mr-2"></i>
            Back to Stores
          </button>
          
          ${store.sellerNumber ? `
            <a href="#" id="whatsappAllBtn"
               class="whatsapp-btn w-full flex items-center justify-center font-medium py-2.5 px-4 rounded-lg transition-all duration-300">
              <i data-feather="message-circle" class="w-4 h-4 mr-2"></i>
              Chat on WhatsApp
            </a>
          ` : ''}
        </div>
      `;
      
      feather.replace();
      
      // Add WhatsApp functionality for general contact
      if (store.sellerNumber) {
        document.getElementById('whatsappAllBtn').addEventListener('click', (e) => {
          e.preventDefault();
          const countryCode = '233';
          const cleanNumber = store.sellerNumber.replace(/\D/g, '');
          const message = encodeURIComponent(
            `Hi ${escapeHtml(store.sellerName)}! I saw your store "${escapeHtml(store.storeName)}" on UniVerse and I'm interested in learning more about your products.`
          );
          window.open(`https://api.whatsapp.com/send?phone=${countryCode}${cleanNumber}&text=${message}`, '_blank');
        });
      }
    }
  }

  // Update store statistics
  function updateStoreStats(store) {
    const storeStats = document.getElementById('storeStats');
    if (storeStats) {
      storeStats.innerHTML = `
        <div class="stats-card text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1" id="productCount" ></div>
          <div class="text-sm text-gray-500">Products</div>
        </div>
        <div class="stats-card text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1">${store.rating || 'New'}</div>
          <div class="text-sm text-gray-500">Rating</div>
        </div>
        <div class="stats-card text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1">${store.joinedDate ? new Date(store.joinedDate).getFullYear() : '2024'}</div>
          <div class="text-sm text-gray-500">Member Since</div>
        </div>
        <div class="stats-card text-center">
          <div class="text-2xl font-bold text-gray-800 mb-1">${store.responseRate || '100%'}</div>
          <div class="text-sm text-gray-500">Response Rate</div>
        </div>
      `;
    }
  }

  // Update store categories/tags
  function updateStoreCategories(store) {
    const storeCategories = document.getElementById('storeCategories');
    if (storeCategories) {
      const categories = store.categories || store.tags || ['Student Business', 'Local Seller'];
      storeCategories.innerHTML = categories.map(cat => 
        `<span class="category-tag">${escapeHtml(cat)}</span>`
      ).join('');
    }
  }

  // Update product count
  function updateProductCount(count) {
    const productCount = document.getElementById('productCount');
    if (productCount) {
      productCount.innerHTML = `<span class="font-medium">${count}</span>`;
    }
  }

  // Update detailed store description
  function updateDetailedDescription() {
    const detailedDesc = document.getElementById('detailedDescription');
    if (detailedDesc && storeData) {
      detailedDesc.innerHTML = `
        <p class="text-gray-700 leading-relaxed mb-4">
          ${escapeHtml(storeData.storeDescription || 'Welcome to our store! We offer quality products with great customer service.')}
        </p>
        ${storeData.additionalInfo ? `
          <p class="text-gray-700 leading-relaxed">
            ${escapeHtml(storeData.additionalInfo)}
          </p>
        ` : ''}
        ${storeData.mission ? `
          <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <h4 class="font-semibold text-green-800 mb-2 flex items-center">
              <i data-feather="target" class="w-4 h-4 mr-2"></i>
              Our Mission
            </h4>
            <p class="text-green-700">${escapeHtml(storeData.mission)}</p>
          </div>
        ` : ''}
      `;
      feather.replace();
    }
  }

  // Fetch and display store products
  async function fetchStoreProducts() {
    if (!resolvedStoreId) return;

    try {
      const res = await fetch(
        `https://universe-api-uabt.onrender.com/api/products/${resolvedStoreId}`
      );

      if (!res.ok) throw new Error("Failed to fetch products");
      const products = await res.json();

      const grid = document.getElementById('productGrid');
      const noProducts = document.getElementById('noProducts');

      // Update product count
      updateProductCount(products.length);

      if (!products.length) {
        grid.innerHTML = '';
        noProducts.classList.remove('hidden');
        return;
      }

      noProducts.classList.add('hidden');
      grid.innerHTML = '';

      // Get store info for WhatsApp links
      const sellerNumber = storeData?.sellerNumber || '';

      products.forEach((product, index) => {
        // Create WhatsApp message with product info
        let whatsappLink = '#';
        if (sellerNumber) {
          const countryCode = '233';
          const cleanNumber = sellerNumber.replace(/\D/g, '');
          
          const message = `Hi, I'm interested in this product from your store:
          
*${product.productName}*
Price: ₵${product.productPrice?.toFixed(2) || '0.00'}

${product.productImage ? 'Product Image: ' + product.productImage : ''}

Please let me know if this is available.`;
          
          const encodedMessage = encodeURIComponent(message);
          whatsappLink = `https://api.whatsapp.com/send?phone=${countryCode}${cleanNumber}&text=${encodedMessage}`;
        }

        // Create product card
        const card = document.createElement('div');
        card.className = 'product-card';
        card.style.animationDelay = `${index * 0.05}s`;
        
        card.innerHTML = `
          <div class="relative overflow-hidden">
            <img src="${product.productImage || 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}" onclick="window.location.href='../components/productDetail.html?id=${product._id}'"
                 alt="${product.productName}" 
                 class="product-image">
            ${product.productStock <= 5 ? `
              <span class="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Low Stock
              </span>
            ` : ''}
          </div>
          <div class="p-5">
            <h3 class="font-semibold text-gray-800 text-lg mb-2 truncate">${escapeHtml(product.productName)}</h3>
            <p class="text-green-600 font-bold text-xl mb-3">₵${(product.productPrice || 0).toFixed(2)}</p>
            
            <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div class="flex items-center">
                <i data-feather="package" class="w-4 h-4 mr-1"></i>
                <span>${product.productStock || 0} in stock</span>
              </div>
              ${product.category ? `
                <span class="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  ${escapeHtml(product.category)}
                </span>
              ` : ''}
            </div>
            
            <a href="${whatsappLink}" target="_blank"
               class="whatsapp-btn w-full flex items-center justify-center font-medium py-3 px-4 rounded-lg transition-all duration-300">
              <i data-feather="shopping-cart" class="w-4 h-4 mr-2"></i>
              BUY NOW
            </a>
          </div>
        `;
        
        grid.appendChild(card);
      });

      feather.replace();
    } catch (error) {
      console.error("Error fetching products:", error);
      showErrorAlert("Failed to load products. Please try again later.");
    }
  }

  // Error alert function
  function showErrorAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg z-50 max-w-sm';
    alert.innerHTML = `
      <div class="flex items-center">
        <i data-feather="alert-circle" class="w-6 h-6 mr-3 flex-shrink-0"></i>
        <div>
          <p class="font-medium">Error</p>
          <p class="text-sm mt-1">${escapeHtml(message)}</p>
        </div>
      </div>
    `;
    document.body.appendChild(alert);
    feather.replace();
    
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }

  // Utility function to escape HTML
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Initialize the page
  initializeStorePage();
});