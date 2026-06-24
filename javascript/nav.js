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
      loadAllProducts()
    } else {
      loadAllProducts();
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
// ── CATEGORY DATA ─────────────────────────────────
const CATEGORIES = [
    { name: "Electronics & Gadgets", slug: "electronics", image: "https://images.unsplash.com/photo-1620783770629-122b7f187703?w=200&h=200&fit=crop" },
    { name: "Fashion & Apparel", slug: "fashion", image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop" },
    { name: "Health & Beauty", slug: "health_beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop" },
    { name: "Home & Living", slug: "home_living", image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=200&h=200&fit=crop" },
    { name: "Groceries & Essentials", slug: "groceries", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop" },
    { name: "Appliances", slug: "appliances", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop" },
    { name: "Books & Stationery", slug: "books", image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&h=200&fit=crop" },
    { name: "Kids, Toys & Baby", slug: "kids_baby", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&h=200&fit=crop" },
    { name: "Sports & Outdoors", slug: "sports_outdoors", image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&h=200&fit=crop" },
    { name: "Automotive", slug: "automotive", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=200&fit=crop" },
    { name: "Jewelry & Accessories", slug: "jewelry", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop" },
    { name: "Pet Supplies", slug: "pets", image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=200&h=200&fit=crop" },
    { name: "Tools & Industrial", slug: "tools", image: "https://plus.unsplash.com/premium_photo-1723478480754-436a04e21412?w=200&h=200&fit=crop" },
    { name: "Music, Art & Entertainment", slug: "music_art", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200&h=200&fit=crop" },
    { name: "Services & Digital", slug: "digital", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop" }
];

// ── OVERLAY PRODUCT CARD ────────────────────────
function createOverlayCard(prod, options = {}) {
    const { featured = false, compact = false } = options;
    const isFeatured = featured || Boolean(prod.featured);

    return (async () => {
        const card = document.createElement("div");
        card.className = "carousel-item snap-start";
        
        const whatsappLink = await getWhatsAppLink({
            ...prod,
            sellerId: prod.storeId?._id || prod.storeId
        });

        const aspectClass = compact ? "aspect-square" : "aspect-[3/4]";

        card.innerHTML = `
            <div class="overlay-card" onclick="window.location.href='./components/productDetail.html?id=${prod._id}'">
                <div class="overlay-card-image ${aspectClass}">
                    <img src="${prod.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=800&fit=crop'}" 
                         alt="${escapeHtml(prod.productName)}"
                         loading="lazy">
                    <div class="overlay-card-gradient"></div>
                    ${isFeatured ? `
                    <span class="overlay-card-badge">
                        <i data-feather="star" class="w-3 h-3"></i> Featured
                    </span>` : ''}
                    <div class="overlay-card-info">
                        <h3 class="overlay-card-name">${escapeHtml(prod.productName)}</h3>
                        <p class="overlay-card-price">₵${(prod.productPrice || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>
        `;

        return card;
    })();
}

// ── CATEGORY CARD ─────────────────────────────────
function createCategoryCard(category) {
    const card = document.createElement("div");
    card.className = "category-card snap-start";
    card.onclick = () => {
        window.location.href = `../homeScreens/allProducts.html?category=${category.slug}`;
    };
    
    card.innerHTML = `
        <div class="category-card-image">
            <img src="${category.image}" alt="${escapeHtml(category.name)}" loading="lazy">
        </div>
        <p class="category-card-name">${escapeHtml(category.name)}</p>
    `;
    
    return card;
}

// ── CAROUSEL NAVIGATION ───────────────────────────
function setupCarousel(carouselId, leftBtnId, rightBtnId) {
    const carousel = document.getElementById(carouselId);
    const leftBtn = document.getElementById(leftBtnId);
    const rightBtn = document.getElementById(rightBtnId);
    
    if (!carousel) return;
    
    const scrollAmount = 320;
    
    if (leftBtn) {
        leftBtn.onclick = () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        };
    }
    
    if (rightBtn) {
        rightBtn.onclick = () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        };
    }
}

// ── FEATURED PRODUCTS ───────────────────────────
async function loadFeaturedProducts() {
    const carousel = document.getElementById('featuredCarousel');
    if (!carousel) return;

    try {
        const res = await fetch("https://uni-verse-api.vercel.app/api/products/featured");
        const data = await res.json();
        
        if (!data.success || !data.products?.length) {
            carousel.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">No featured products yet</div>';
            return;
        }

        carousel.innerHTML = '';
        const promises = data.products.map((prod, i) => createOverlayCard(prod, { featured: true }));
        const cards = await Promise.all(promises);
        cards.forEach(card => carousel.appendChild(card));
        
        if (typeof feather !== 'undefined') feather.replace();
        setupCarousel('featuredCarousel', 'featuredArrowLeft', 'featuredArrowRight');

    } catch (err) {
        console.error("Featured products error:", err);
        carousel.innerHTML = '<div class="col-span-full text-center py-12 text-gray-400">Unable to load featured products</div>';
    }
}

// ── SHOP BY CATEGORY ──────────────────────────────
function loadCategories() {
    const carousel = document.getElementById('categoryCarousel');
    if (!carousel) return;

    carousel.innerHTML = '';
    CATEGORIES.forEach(cat => {
        carousel.appendChild(createCategoryCard(cat));
    });
    
    setupCarousel('categoryCarousel', 'categoryArrowLeft', 'categoryArrowRight');
}

// ── RECENTLY VIEWED ───────────────────────────────
function loadRecentlyViewed() {
    const section = document.getElementById('recentlyViewedSection');
    const carousel = document.getElementById('recentCarousel');
    if (!section || !carousel) return;

    // Check if user is logged in
    const user = localStorage.getItem("user");
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    
    if (!user || !viewed.length) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    carousel.innerHTML = '';
    
    // Render viewed products (limit to 8)
    const promises = viewed.slice(0, 8).map((prod, i) => createOverlayCard(prod));
    Promise.all(promises).then(cards => {
        cards.forEach(card => carousel.appendChild(card));
        if (typeof feather !== 'undefined') feather.replace();
        setupCarousel('recentCarousel', 'recentArrowLeft', 'recentArrowRight');
    });
}

// Track product views
function trackProductView(product) {
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    // Remove if already exists
    viewed = viewed.filter(p => p._id !== product._id);
    // Add to front
    viewed.unshift(product);
    // Keep max 12
    viewed = viewed.slice(0, 12);
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
}

// ── ALL PRODUCTS (MULTI-ROW) ──────────────────────
async function loadAllProducts() {
    const container = document.getElementById('allProductsScroll');
    if (!container) return;

    try {
        const res = await fetch("https://uni-verse-api.vercel.app/api/products/all");
        if (!res.ok) throw new Error("Failed to fetch");
        const products = await res.json();

        if (!products.length) {
            container.innerHTML = '<div class="text-center py-12 text-gray-400">No products available</div>';
            return;
        }

        // Split into 3 rows
        const rows = [[], [], []];
        products.forEach((prod, i) => {
            rows[i % 3].push(prod);
        });

        container.innerHTML = '';
        
        rows.forEach((rowProducts, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'multi-row';
            
            const promises = rowProducts.map((prod, i) => 
                createOverlayCard(prod, { compact: true })
            );
            
            Promise.all(promises).then(cards => {
                cards.forEach(card => rowDiv.appendChild(card));
            });
            
            container.appendChild(rowDiv);
        });

        if (typeof feather !== 'undefined') feather.replace();
        setupCarousel('allProductsScroll', 'allArrowLeft', 'allArrowRight');

    } catch (err) {
        console.error("All products error:", err);
        container.innerHTML = '<div class="text-center py-12 text-gray-400">Unable to load products</div>';
    }
}

// ── INIT ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadRecentlyViewed();
    loadAllProducts();
});

// ── WHATSAPP & UTILITIES (keep existing) ──────────
async function getWhatsAppLink(product, sellerData) {
    let whatsappLink = '#';
    const sellerId = product.sellerId || product.storeId?._id || product.storeId;
    if (!sellerId) return whatsappLink;
    
    try {
        let sellerRes = await fetch(`https://uni-verse-api.vercel.app/api/stores/storeID/${encodeURIComponent(sellerId)}`);
        if (!sellerRes.ok) {
            sellerRes = await fetch(`https://uni-verse-api.vercel.app/api/stores/${encodeURIComponent(sellerId)}`);
        }
        if (!sellerRes.ok) throw new Error();
        
        const sellerData = await sellerRes.json();
        if (!sellerData?.sellerNumber) return whatsappLink;
        
        const cleanNumber = sellerData.sellerNumber.replace(/\D/g, '');
        const message = `Hi, I'm interested in this product: ${product.productName} (₵${product.productPrice?.toFixed(2) || '0.00'})`;
        whatsappLink = `https://api.whatsapp.com/send?phone=233${cleanNumber}&text=${encodeURIComponent(message)}`;
    } catch (err) {
        console.error("WhatsApp link error:", err);
    }
        // Fire click tracking before returning the link
    if (product._id && sellerData) {
        UniTracker.whatsappClick(
            product.sellerId || product.storeId?._id || product.storeId,
            product._id,
            sellerData.owner
        );
    }
    return whatsappLink;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}