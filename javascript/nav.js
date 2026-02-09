document.addEventListener('DOMContentLoaded', async function () {
    let user = null;
    try {
      const userData = localStorage.getItem("user");
      user = userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }

    if (user && user.picture) {
      // Remove * before push
      const loginSelectors = [
        'nav a[href="/components/login"]',           // Desktop nav
        '#mobileMenu a[href="/components/login"]',   // Mobile menu
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
        // Create wrapper for profile & dropdown
        const profileWrapper = document.createElement("div");
        profileWrapper.className = isMobile ? "relative w-full" : "relative";

        // Create profile image
        const profileImg = document.createElement("img");
        profileImg.src = user.picture;
        profileImg.alt = user.name;
        profileImg.title = user.name;
        profileImg.className = isMobile 
          ? "h-12 w-12 rounded-full object-cover cursor-pointer mx-auto"
          : "h-10 w-10 rounded-full object-cover cursor-pointer";

        // Create dropdown menu
        const dropdown = document.createElement("div");
        dropdown.className = isMobile
          ? "hidden mt-2 w-full bg-white rounded-md shadow-lg py-2"
          : "hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50";

        // Build dropdown content
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

        // Show/hide dropdown on click
        profileImg.addEventListener('click', (e) => {
          e.stopPropagation();
          dropdown.classList.toggle('hidden');
        });

        // Handle logout
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
        fetch(`https://universe-api-uabt.onrender.com/api/stores/${encodeURIComponent(user.id)}/exists`)
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
  });

  //products on home screen
document.addEventListener("DOMContentLoaded", fetchAllProducts);

  async function fetchAllProducts() {
  const grid = document.getElementById("productGrid");
  const loading = document.getElementById("loading");

  // FIX: Stop the function here if these elements don't exist on the current page
  if (!grid || !loading) {
    return; 
  }

  try {
    const res = await fetch("https://universe-api-uabt.onrender.com/api/products/all");
    if (!res.ok) throw new Error("Failed to fetch products");
    const products = await res.json();

    loading.style.display = "none"; // This line won't crash now
    grid.innerHTML = "";

    if (!products.length) {
      grid.innerHTML = `
        <div class="col-span-full text-center text-gray-500 py-12">
          <i data-feather="package" class="w-12 h-12 mx-auto text-gray-400"></i>
          <p class="mt-4">No products available right now.</p>
        </div>`;
      if (typeof feather !== 'undefined') feather.replace();
      return;
    }

    products.forEach(prod => {
      const card = document.createElement("div");
      card.className = "product-card bg-white rounded-lg overflow-hidden shadow";
      card.innerHTML = `
        <img
         src="${prod.productImage}"
        alt="${prod.productName}"  
        class="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-300" 
        onclick="window.location.href='./components/productDetail.html?id=${prod._id}'">
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800">${prod.productName}</h3>
          <p class="text-green-600 font-bold">₵${prod.productPrice.toFixed(2)}</p>
          <p class="text-sm text-gray-500">${prod.productCategory || "Uncategorized"}</p>
          <p class="text-xs text-gray-400">${prod.productStock} in stock</p>
          <button onclick="window.location.href='./components/productDetail.html?id=${prod._id}'"
                  class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded">
            View Details
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    if (typeof feather !== 'undefined') feather.replace();
  } catch (error) {
    console.error("Error fetching all products:", error);
    // Only try to modify loading text if the element actually exists
    if (loading) loading.textContent = "Failed to load products. Try again later.";
  }
}
    function contactSeller(ownerId) {
      alert("Contacting seller with ID: " + ownerId + " (You can integrate WhatsApp link here)");
      // In future: fetch seller info from your /api/users/:id and open WhatsApp
    }