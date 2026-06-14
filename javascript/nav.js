document.addEventListener('DOMContentLoaded', async function () {
    let user = null;
    try {
      const userData = localStorage.getItem("user");
      user = userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }

    if (user && user.picture) {
      // Login selectors
      const loginSelectors = [
        'nav a[href*="/components/login"]',          // Desktop nav
        'nav a[href$="/login.html"]',                // Local component navs
        '#mobileMenu a[href*="/components/login"]',  // Mobile menu
        '#mobileMenu a[href$="/login.html"]',        // Local component mobile navs
        '.auth-link'                                  // Fallback for mobile
      ];
      
      // Find all login links
      const loginLinks = [];
      loginSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => loginLinks.push(el));
      });

      // Create profile UI component
      function createProfileComponent(isMobile = false) {
        const profileWrapper = document.createElement("div");
        profileWrapper.className = isMobile ? "relative w-full" : "relative";

        const profileImg = document.createElement("img");
        profileImg.src = user.picture;
        profileImg.alt = user.name;
        profileImg.title = user.name;
        profileImg.className = isMobile 
          ? "h-12 w-12 rounded-full object-cover cursor-pointer mx-auto"
          : "h-10 w-10 rounded-full object-cover cursor-pointer";

        const dropdown = document.createElement("div");
        dropdown.className = isMobile
          ? "hidden mt-2 w-full bg-white rounded-md shadow-lg py-2"
          : "hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50";

        dropdown.innerHTML = `
          <a href="/components/profile.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Profile
          </a>
          <a href="#" id="storeLink" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Loading...
          </a>
          <button id="logoutBtn${isMobile ? 'Mobile' : ''}" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            Logout
          </button>
        `;

        profileImg.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('hidden');
        });

        dropdown.querySelector(`#logoutBtn${isMobile ? 'Mobile' : ''}`).addEventListener('click', () => {
          try {
            localStorage.removeItem("user");
          } catch (err) {
            console.error("Failed to remove user from localStorage:", err);
          }
          window.location.href = './index.html';
        });

        profileWrapper.appendChild(profileImg);
        profileWrapper.appendChild(dropdown);

        // Fetch store status and update link
        fetch(`https://uni-verse-api.vercel.app/api/stores/${encodeURIComponent(user.id)}/exists`)
          .then(res => res.json())
          .then(result => {
            const storeLink = dropdown.querySelector('#storeLink');
            const hasStore = result.hasStore;
            storeLink.href = hasStore ? '/components/dashboard.html' : '/components/createStore.html';
            storeLink.textContent = hasStore ? 'Open Store' : 'Create Your Store';
          })
          .catch(err => {
            console.error("Failed to check store existence:", err);
            const storeLink = dropdown.querySelector('#storeLink');
            storeLink.href = '/components/createStore.html';
            storeLink.textContent = 'Create Your Store';
          });

        return profileWrapper;
      }

      // Replace desktop nav login link
      const desktopNav = document.querySelector('nav');
      if (desktopNav) {
        const desktopLogin = desktopNav.querySelector('a[href*="/components/login"]');
        if (desktopLogin) {
          const desktopProfile = createProfileComponent(false);
          desktopLogin.replaceWith(desktopProfile);
          
          // Close dropdown when clicking outside (desktop)
          document.addEventListener('click', (e) => {
            if (!desktopProfile.contains(e.target)) {
              desktopProfile.querySelector('div:last-child').classList.add('hidden');
            }
          });
        }
      }

      // Replace mobile menu login link
      const mobileMenu = document.getElementById('mobileMenu');
      if (mobileMenu) {
        const mobileLogin = mobileMenu.querySelector('a[href*="/components/login"]') || 
                           mobileMenu.querySelector('.auth-link');
        if (mobileLogin) {
          const mobileProfile = createProfileComponent(true);
          
          // Wrap in div for mobile layout
          const wrapper = document.createElement('div');
          wrapper.className = "flex flex-col items-center py-4 border-t border-gray-200 mt-4";
          wrapper.appendChild(mobileProfile);
          
          mobileLogin.replaceWith(wrapper);
          
          // Close dropdown when clicking outside (mobile)
          document.addEventListener('click', (e) => {
            if (!mobileProfile.contains(e.target)) {
              mobileProfile.querySelector('div:last-child').classList.add('hidden');
            }
          });
        }
      }
    }
    
    // Load featured and all products on the homepage; only all products elsewhere.
    const isHomepage =
      window.location.pathname === '/' ||
      window.location.pathname.endsWith('index.html') ||
      window.location.pathname === '/index.html';

    if (isHomepage) {
      loadFeaturedProducts();
      fetchAllProducts();
    } else {
      fetchAllProducts();
    }
});

// Add this to your profile page script
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('verified') === 'true') {
    alert("🎉 Success! Your student status is verified. Your store now has boosted visibility.");
    // Clean up the URL so the alert doesn't keep popping up on refresh
    window.history.replaceState({}, document.title, window.location.pathname);
}

/**
 * Fetch all products from API - With WhatsApp Buy Now functionality
 */
function createProductCard(prod, index, options = {}) {
  const { featured = false } = options;

  return (async () => {
    const card = document.createElement("div");
    card.className = "premium-product-card fade-up";
    card.style.animationDelay = `${index * 0.05}s`;

    const whatsappLink = await getWhatsAppLink({
      ...prod,
      sellerId: prod.storeId?._id || prod.storeId
    });

    const stockStatus = prod.productStock > 10 ? 'In Stock' :
               prod.productStock > 0 ? 'Low Stock' : 'Sold Out';
    const stockClass = prod.productStock > 10 ? 'text-green-600' :
              prod.productStock > 0 ? 'text-gold' : 'text-red-500';

    card.innerHTML = `
      <div class="image-container relative group">
        <img src="${prod.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" 
           alt="${escapeHtml(prod.productName)}"
           loading="lazy"
           class="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
           onclick="window.location.href='./components/productDetail.html?id=${prod._id}'">
        <div class="absolute top-4 right-4">
          <span class="bg-white px-3 py-1 text-xs font-medium shadow-md rounded-full ${stockClass}">
            ${stockStatus}
          </span>
        </div>
        ${featured ? `
        <div class="absolute top-4 left-4">
          <span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;
            background:rgba(124,58,237,0.9);border-radius:999px;
            font-size:10px;font-weight:600;color:white;">
            ⭐ Featured
          </span>
        </div>` : ''}
      </div>
      <div class="pt-6 pb-2">
        <div class="flex justify-between items-start mb-2">
          <h3 class="product-name text-lg font-medium">${escapeHtml(prod.productName)}</h3>
          <span class="product-price text-gold font-semibold">₵${(prod.productPrice || 0).toFixed(2)}</span>
        </div>
        <div class="flex justify-between items-center mb-4">
          <span class="product-category text-xs uppercase tracking-wider text-gray-500">
            ${escapeHtml(prod.productCategory || 'Uncategorized')}
          </span>
          <span class="text-xs text-gray-400">
            ${prod.productStock || 0} available
          </span>
        </div>
        <button type="button" class="w-full mt-6 py-3 border border-charcoal text-charcoal hover:bg-green-500 hover:text-white 
          text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 ${whatsappLink === '#' ? 'opacity-50 cursor-not-allowed' : ''}"
          ${whatsappLink === '#' ? 'disabled' : ''}>
          BUY NOW
        </button>
      </div>
    `;

    const buyButton = card.querySelector('button');
    buyButton?.addEventListener('click', (event) => {
      event.stopPropagation();

      if (whatsappLink === '#') {
        return;
      }

      window.open(whatsappLink, '_blank', 'noopener,noreferrer');
    });

    return card;
  })();
}

async function fetchAllProducts(gridId = "productGrid", loadingId = "loading") {
  const grid = document.getElementById(gridId);
  const loading = document.getElementById(loadingId);

    // Exit if not on homepage
    if (!grid || !loading) {
        return;
    }

    // Show loading state
    loading.classList.remove('hidden');
    grid.innerHTML = ''; // Clear skeletons

    try {
        const res = await fetch("https://uni-verse-api.vercel.app/api/products/all");
        if (!res.ok) throw new Error("Failed to fetch products");
        const products = await res.json();

        loading.classList.add('hidden');
        grid.innerHTML = "";

        if (!products.length) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <i data-feather="package" class="w-16 h-16 mx-auto text-gray-300 mb-6"></i>
                    <p class="text-graphite text-lg mb-2">No products available</p>
                    <p class="text-sm text-gray-500">New collections arriving soon.</p>
                </div>`;
            if (typeof feather !== 'undefined') feather.replace();
            return;
        }

        // Create an array of promises for fetching seller info
        const productPromises = products.map((prod, index) => createProductCard(prod, index));

        // Wait for all WhatsApp links to be generated
        const cards = await Promise.all(productPromises);
        
        // Append all cards to grid
        cards.forEach(card => {
            grid.appendChild(card);
        });

        // Replace feather icons
        if (typeof feather !== 'undefined') feather.replace();
        
    } catch (error) {
        console.error("Error fetching all products:", error);
        loading.classList.add('hidden');
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i data-feather="alert-circle" class="w-16 h-16 mx-auto text-gray-300 mb-6"></i>
                <p class="text-graphite text-lg mb-2">Unable to load products</p>
                <p class="text-sm text-gray-500 mb-6">Please try again later.</p>
                <button onclick="fetchAllProducts()" 
                        class="px-8 py-3 border border-charcoal text-charcoal hover:bg-charcoal hover:text-white text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300">
                    Retry
                </button>
            </div>`;
        if (typeof feather !== 'undefined') feather.replace();
    }
}

/**
 * Fetch featured products for homepage (Premium/Organizational stores only)
 */
async function loadFeaturedProducts(gridId = "featuredProductGrid", loadingId = "featuredLoading") {
  const grid    = document.getElementById(gridId);
  const loading = document.getElementById(loadingId);

    if (!grid || !loading) return;

    loading.classList.remove('hidden');
    grid.innerHTML = '';

    try {
        const res  = await fetch("https://uni-verse-api.vercel.app/api/products/featured");
        const data = await res.json();

        loading.classList.add('hidden');

        if (!data.success || !data.products.length) {
          grid.innerHTML = `
            <div class="col-span-full text-center py-20">
              <i data-feather="star" class="w-16 h-16 mx-auto text-gray-300 mb-6"></i>
              <p class="text-graphite text-lg mb-2">No featured products yet</p>
              <p class="text-sm text-gray-500">Featured items will appear here once they are marked.</p>
            </div>`;
          if (typeof feather !== 'undefined') feather.replace();
          return;
        }

        const productPromises = data.products.map((prod, index) => createProductCard(prod, index, { featured: true }));

        const cards = await Promise.all(productPromises);
        cards.forEach(card => grid.appendChild(card));
        if (typeof feather !== 'undefined') feather.replace();

    } catch (error) {
        console.error("Error fetching featured products:", error);
        loading.classList.add('hidden');
        grid.innerHTML = `
          <div class="col-span-full text-center py-20">
            <i data-feather="alert-circle" class="w-16 h-16 mx-auto text-gray-300 mb-6"></i>
            <p class="text-graphite text-lg mb-2">Unable to load featured products</p>
            <p class="text-sm text-gray-500">Please try again later.</p>
          </div>`;
        if (typeof feather !== 'undefined') feather.replace();
    }
}

/**
 * @param {Object} product - Product object
 * @returns {Promise<string>} - WhatsApp link
 */

async function getWhatsAppLink(product) {
    let whatsappLink = '#';
    
    const sellerId = product.sellerId || product.storeId?._id || product.storeId;
    
    if (!sellerId) {
        console.warn("No sellerId for product:", product._id);
        return whatsappLink;
    }
    
    try {
        let sellerRes = await fetch(`https://uni-verse-api.vercel.app/api/stores/storeID/${encodeURIComponent(sellerId)}`);

        if (!sellerRes.ok) {
          sellerRes = await fetch(`https://uni-verse-api.vercel.app/api/stores/${encodeURIComponent(sellerId)}`);
        }

        if (!sellerRes.ok) throw new Error(`Failed to fetch store info: ${sellerRes.status}`);
        
        const sellerData = await sellerRes.json();

        // Guard against null or missing sellerNumber
        if (!sellerData || !sellerData.sellerNumber) {
            return whatsappLink;
        }
        
        const countryCode = '233';
        const cleanNumber = sellerData.sellerNumber.replace(/\D/g, '');
        
        const message = `Hi, I'm interested in this product from your store:
            
*${product.productName}*
💰 Price: ₵${product.productPrice?.toFixed(2) || '0.00'}
📦 Stock: ${product.productStock || 'Available'}

Can you provide more details about this item?`;
        
        whatsappLink = `https://api.whatsapp.com/send?phone=${countryCode}${cleanNumber}&text=${encodeURIComponent(message)}`;
        
    } catch (err) {
        console.error(`Failed to fetch seller info for product ${product._id}:`, err);
    }
    
    return whatsappLink;
}

/**
 * Contact seller function - Preserved from original
 */
function contactSeller(ownerId) {
    alert("Contacting seller with ID: " + ownerId + " (You can integrate WhatsApp link here)");
}

/**
 * Escape HTML utility - Prevents XSS attacks
 */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}