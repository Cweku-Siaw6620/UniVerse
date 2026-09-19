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

  function getPlanInfo(store) {
    const plan = store.plan || 'free';
    return {
      plan,
      isPremium: plan === 'premium' || plan === 'organizational'
    };
  }

  function applyStoreTheme(store) {
    const info = getPlanInfo(store);
    document.body.classList.toggle('store-premium', info.isPremium);
    document.body.classList.toggle('store-free', !info.isPremium);
    return info;
  }

  function buildWhatsAppLink(store) {
    const cleanNumber = (store.sellerNumber || '').replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello ${store.sellerName || 'there'},\nI found your store, "${store.storeName || 'your store'}", on UniVerse and would like to learn more about your products.\nStore Link: ${window.location.href}`
    );
    return `https://api.whatsapp.com/send?phone=233${cleanNumber}&text=${message}`;
  }

  // Fetch store details from API
  async function fetchStoreDetails() {
    try {
      const res = await fetch(
        `https://api.universeweb.co/api/stores/slug/${storeSlug}`
      );

      if (!res.ok) throw new Error("Store not found");

      const store = await res.json();
      storeData = store;

      // Save storeId for product fetching
      resolvedStoreId = store._id;

      const ownerVerified =
        store.owner?.isVerified === true ||
        store.owner?.affiliation === 'student_verified';

      storeData = {...store,ownerVerified };

      // Save to localStorage
      try {
        localStorage.setItem("currentViewedStore", JSON.stringify(storeData));
      } catch (err) {
        console.error("Failed to save store to localStorage:", err);
      }

      // Update all store information sections
      const planInfo = applyStoreTheme(storeData);
      updateStoreHeader(storeData);
      updateSellerContact(storeData);
      updateStoreStats(storeData);
      updateStoreCategories(storeData);
      updateProductCount(0); // Will be updated after products load

    // Track store view for Tier 2 analytics
    // Skips automatically if logged-in user is the store owner
    UniTracker.storeView(store._id, store.owner?._id || store.owner);

      return storeData;
    } catch (error) {
      console.error("Error fetching store details:", error);
      throw error;
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('#shareStoreBtn')) {
      const store = JSON.parse(localStorage.getItem("currentViewedStore"));
      if (store && store.slug) {
        const link = `https://api.universeweb.co/stores/${store.slug}`;
        navigator.clipboard.writeText(link);
        alert("Store link copied!");
      }
    }
  });

  // Update store header with logo and basic info
  function updateStoreHeader(store) {
    const { isPremium, plan } = getPlanInfo(store);

    if (isPremium) {
      // Hide the standard info/contact grid, render the hero instead
      const grid = document.getElementById('storeTopGrid');
      if (grid) grid.classList.add('hidden');
      renderPremiumHero(store, plan);
      return;
    }
    renderFreeHeader(store);
  }

  // Render premium hero section for premium stores
  function renderPremiumHero(store, plan) {
    const mount = document.getElementById('premiumHeroMount');
    if (!mount) return;

    const badgeMeta = plan === 'organizational'
      ? { label: 'Verified Organization', icon: 'award' }
      : { label: 'Premium Seller', icon: 'crown' };

    const cover = store.storeLogo || store.bannerImage ||
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80';
    const logo = store.storeLogo ||
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80';
    const categories = store.categories || store.tags || ['Student Business'];

    mount.innerHTML = `
    <section class="store-hero">
      <div class="store-hero__bg" style="background-image:url('${cover}')"></div>
      <div class="store-hero__scrim"></div>

      <div class="store-hero__inner">
        <span class="store-hero__badge">
          <i data-feather="${badgeMeta.icon}" class="w-3.5 h-3.5"></i>${badgeMeta.label}
        </span>

        <div class="store-hero__identity">
          <img class="store-hero__logo" src="${logo}" alt="${escapeHtml(store.storeName)}">
          <div class="store-hero__identity-text">
            <h1 class="store-hero__name">
              ${escapeHtml(store.storeName)}
              ${store.ownerVerified ? window.uniVerseVerification.getVerifiedBadgeHtml() : ''}
            </h1>
            <p class="store-hero__meta">
              <i data-feather="user" class="w-4 h-4"></i>
              ${escapeHtml(store.sellerName || 'Seller')}
              ${store.location ? `&nbsp;·&nbsp;<i data-feather="map-pin" class="w-4 h-4"></i> ${escapeHtml(store.location)}` : ''}
            </p>
            <div class="store-hero__cats">
              ${categories.map(c => `<span>${escapeHtml(c)}</span>`).join('')}
            </div>
          </div>
        </div>

        ${store.storeDescription ? `<p class="store-hero__desc">${escapeHtml(store.storeDescription)}</p>` : ''}

        <div class="store-hero__actions">
          ${store.sellerNumber ? `
            <a href="${buildWhatsAppLink(store)}" target="_blank" class="store-hero__cta store-hero__cta--gold">
              <i data-feather="message-circle" class="w-4 h-4"></i> Chat on WhatsApp
            </a>` : ''}
          <button id="shareStoreBtn" class="store-hero__cta store-hero__cta--ghost">
            <i data-feather="share-2" class="w-4 h-4"></i> Share store
          </button>
          ${store.personalWebsite ? `
            <a href="${store.personalWebsite}" target="_blank" class="store-hero__cta store-hero__cta--ghost">
              <i data-feather="globe" class="w-4 h-4"></i> Website
            </a>` : ''}
        </div>

        <div class="store-hero__stats">
          <div class="store-hero__stat"><strong data-product-count>0</strong><span>Products</span></div>
          <div class="store-hero__stat"><strong>${store.rating || 'New'}</strong><span>Rating</span></div>
          <div class="store-hero__stat"><strong>${store.createdAt ? new Date(store.createdAt).getFullYear() : '2026'}</strong><span>Member Since</span></div>
          <div class="store-hero__stat"><strong>${store.responseRate || '100%'}</strong><span>Response Rate</span></div>
        </div>
      </div>
    </section>`;

    feather.replace();
  }

  // Free-plan store header (light theme card layout)
function renderFreeHeader(store) {
  const storeHeader = document.getElementById('storeHeader');
  if (!storeHeader) return;

  storeHeader.innerHTML = `
    <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}"
         alt="${escapeHtml(store.storeName)}"
         class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg">
    <div class="flex-1 text-center md:text-left">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">${escapeHtml(store.storeName)}</h1>
      <p class="text-gray-600 mb-1">
        <i data-feather="user" class="w-4 h-4 inline mr-1"></i>
        <span class="font-medium">Seller:</span>
        <span id="sellerName" class="inline-flex items-center gap-2 flex-wrap">${escapeHtml(store.sellerName || 'Not specified')}${store.ownerVerified ? window.uniVerseVerification.getVerifiedBadgeHtml() : ''}</span>
      </p>
      <p class="text-gray-600">
        <i data-feather="phone" class="w-4 h-4 inline mr-1"></i>
        <span class="font-medium">Contact:</span>
        <span id="sellerNumber">${escapeHtml(store.sellerNumber || 'Not provided')}</span>
      </p>
      <button id="shareStoreBtn" class="w-full flex items-center justify-center gap-2 font-medium py-2.5 px-4 rounded-lg transition-all duration-300 bg-gray-100 hover:bg-gray-200 text-gray-800 mt-4">
        <i data-feather="share-2" class="w-4 h-4"></i>
        Share link to store
      </button>
      ${store.personalWebsite ? `
        <p class="text-gray-600 mt-2">
          <a href="${store.personalWebsite}" target="_blank" class="whatsapp-btn w-full flex items-center justify-center font-medium py-2.5 px-4 rounded-lg transition-all duration-300">
            <i data-feather="globe" class="w-4 h-4 inline mr-1"></i>
            Visit Personal Website
          </a>
        </p>
      ` : ''}
    </div>
  `;
  feather.replace();
}

  // Update seller contact section
  function updateSellerContact(store) {
    const sellerContact = document.getElementById('sellerContact');
    if (sellerContact) {
      
      sellerContact.innerHTML = `
        <!-- Seller Profile -->
        <div class="flex items-center mb-6">
          <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}" 
               alt="${store.sellerName}" 
               class="w-12 h-12 rounded-full object-cover border-2 border-white shadow mr-3">
          <div>
            <h4 class="font-semibold text-gray-800 flex items-center gap-2 flex-wrap">${escapeHtml(store.sellerName || 'Seller')}${store.ownerVerified ? window.uniVerseVerification.getVerifiedBadgeHtml() : ''}</h4>
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
          const sellerName = store.sellerName || 'there';
          const storeUrl = `https://api.universeweb.co/stores/${store.slug}`;
          const storeName = store.storeName || 'your store';
          const message = encodeURIComponent(
            `Hello ${sellerName},\nI found your store, "${storeName}", on UniVerse and would like to learn more about your products and services.\nStore Link: ${storeUrl}`
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
          <div class="text-2xl font-bold text-gray-800 mb-1">${store.createdAt ? new Date(store.createdAt).getFullYear() : '2026'}</div>
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
    document.querySelectorAll('[data-product-count]').forEach(el => {
      el.textContent = count;
    });
    const legacy = document.getElementById('productCount');
    if (legacy) legacy.innerHTML = `<span class="font-medium">${count}</span>`;
  }

  function updateDetailedDescription() {
    const detailedDesc = document.getElementById('detailedDescription');
    if (detailedDesc && storeData) {
      detailedDesc.innerHTML = `
        <p class="about-lead">
          ${escapeHtml(storeData.storeDescription || 'Welcome to our store! We offer quality products with great customer service.')}
        </p>
        ${storeData.additionalInfo ? `
          <p class="about-body">${escapeHtml(storeData.additionalInfo)}</p>
        ` : ''}
        ${storeData.mission ? `
          <div class="about-mission">
            <h4><i data-feather="target" class="w-4 h-4"></i>Our Mission</h4>
            <p>${escapeHtml(storeData.mission)}</p>
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
        `https://api.universeweb.co/api/products/${resolvedStoreId}`
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
      const cta = document.getElementById('emptyWhatsAppCta');
      if (cta && storeData?.sellerNumber) {
        cta.href = buildWhatsAppLink(storeData);
        cta.style.display = 'inline-flex';
      }
      return;
    }

      noProducts.classList.add('hidden');
      grid.innerHTML = '';

      products.forEach((product, index) => {
        const isFeatured = Boolean(product.featured);

        const card = document.createElement('div');
        card.className = 'overlay-card fade-up';
        card.style.animationDelay = `${index * 0.05}s`;
        card.onclick = () => {
          window.location.href = `../components/productDetail.html?id=${product._id}`;
        };

        card.innerHTML = `
          <div class="overlay-card-image">
            <img src="${product.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop'}"
                 alt="${escapeHtml(product.productName)}"
                 loading="lazy">
            <div class="overlay-card-gradient"></div>
            ${isFeatured ? `
              <span class="overlay-card-badge">
                <i data-feather="star" class="w-3 h-3"></i> Featured
              </span>
            ` : ''}
            <div class="overlay-card-info">
              <h3 class="overlay-card-name">${escapeHtml(product.productName)}</h3>
              <p class="overlay-card-price">GH₵ ${(product.productPrice || 0).toFixed(2)}</p>
            </div>
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