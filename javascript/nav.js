  document.addEventListener('DOMContentLoaded', async function () {
    let user = null;
    try {
      const userData = localStorage.getItem("user");
      user = userData ? JSON.parse(userData) : null;
    } catch (err) {
      console.error("Failed to parse user from localStorage:", err);
    }

    if (user && user.picture) {
      const nav = document.querySelector('nav');
      const loginLink = nav.querySelector('a[href*="./components/login"]');

      // Create wrapper for profile & dropdown
      const profileWrapper = document.createElement("div");
      profileWrapper.className = "relative";

      // Create profile image
      const profileImg = document.createElement("img");
      profileImg.src = user.picture;
      profileImg.alt = user.name;
      profileImg.title = user.name;
      profileImg.className = "h-10 w-10 rounded-full object-cover cursor-pointer";

      // Create dropdown menu
      const dropdown = document.createElement("div");
      dropdown.className = "hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50";

      // Fetch whether user has a store
      let hasStore = false;
      try {
        const res = await fetch(`https://corsproxy.io/?https://universe-api-uabt.onrender.com/api/stores/${encodeURIComponent(user.id)}/exists`);
        const result = await res.json();
        hasStore = result.hasStore;
      } catch (err) {
        console.error("Failed to check store existence:", err);
      }

      // Dropdown menu HTML
      dropdown.innerHTML = `
        <a href="${hasStore ? '/components/dashboard.html' : '/components/createStore.html'}"  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          ${hasStore ?  "Open Store" :"Create Your Store"}
        </a>
        <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
          Logout
        </button>
      `;

      // Show/hide dropdown on click
      profileImg.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
      });

      // Handle logout
      dropdown.querySelector('#logoutBtn').addEventListener('click', () => {
        try {
          localStorage.removeItem("user");
        } catch (err) {
          console.error("Failed to remove user from localStorage:", err);
        }
        window.location.href = './index.html';
      });

      profileWrapper.appendChild(profileImg);
      profileWrapper.appendChild(dropdown);

      if (loginLink) {
        loginLink.replaceWith(profileWrapper);
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!profileWrapper.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
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
    const res = await fetch("https://corsproxy.io/?https://universe-api-uabt.onrender.com/api/products/all");
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
        <img src="${prod.productImage}" alt="${prod.productName}" class="w-full h-80 object-cover transform hover:scale-105 transition-transform duration-300">
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
