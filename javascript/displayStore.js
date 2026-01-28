document.addEventListener('DOMContentLoaded', () => {
  // Extract storeId from URL
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get('id');
  const storeSlug = urlParams.get('slug');

  if (!storeId) {
    showErrorAlert('Invalid store ID');
    return;
  }

  // ✅ Add Go Back button
  const headerContainer = document.getElementById('storeHeader');
  const backBtn = document.createElement('button');
  backBtn.innerHTML = `
    <i data-feather="arrow-left" class="w-4 h-4 mr-1"></i> Go Back
  `;
  backBtn.className = 'flex items-center text-green-700 font-medium bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-md mb-4 shadow-sm transition';
  backBtn.addEventListener('click', () => {
    window.history.back();
  });
  headerContainer.parentElement.insertBefore(backBtn, headerContainer);

  Promise.all([fetchStoreDetails(), fetchStoreProducts()])
    .catch(error => {
      console.error('Error:', error);
      showErrorAlert('Failed to load store data. Please try again later.');
    });

  /*async function fetchStoreDetails() {
    try {
      const res = await fetch(`https://universe-api-uabt.onrender.com/api/stores/storeID/${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch store info");
      const store = await res.json();

      // Save store for later use (for WhatsApp)
      try {
        localStorage.setItem("currentViewedStore", JSON.stringify(store));
      } catch (err) {
        console.error("Failed to save store to localStorage:", err);
      }

      updateStoreHeader(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      throw error;
    }
  }
    */
   async function fetchStoreDetails() {
  const endpoint = storeSlug
    ? `https://universe-api-uabt.onrender.com/api/stores/slug/${storeSlug}`
    : `https://universe-api-uabt.onrender.com/api/stores/storeID/${storeId}`;

  const res = await fetch(`${endpoint}`);
  if (!res.ok) throw new Error("Failed to fetch store");

  const store = await res.json();
  localStorage.setItem("currentViewedStore", JSON.stringify(store));
  updateStoreHeader(store);
}

  function updateStoreHeader(store) {
    const storeHeader = document.getElementById('storeHeader');
    storeHeader.innerHTML = `
      <img src="${store.storeLogo || 'http://static.photos/green/1200x630/1'}" 
           alt="${store.storeName}" 
           class="w-16 h-16 rounded-full object-cover border-2 border-green-500">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">${store.storeName}</h1>
        <p class="text-gray-600">
          <span class="font-medium">Seller:</span> 
          <span id="sellerName">${store.sellerName}</span> • 
          <span id="sellerNumber">${store.sellerNumber}</span>
        </p>
      </div>
    `;
  }

async function fetchStoreProducts() {
    try {
      const res = await fetch(`https://universe-api-uabt.onrender.com/api/products/${storeId}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const products = await res.json();

      const grid = document.getElementById('productGrid');
      grid.innerHTML = '';

      if (!products.length) {
        grid.innerHTML = `
          <div class="col-span-full text-center py-12">
            <i data-feather="package" class="w-12 h-12 mx-auto text-gray-400"></i>
            <p class="mt-4 text-gray-500">No products found for this store.</p>
          </div>
        `;
        feather.replace();
        return;
      }

      // Get store info from local storage
      let store = {};
      try {
        const storeData = localStorage.getItem("currentViewedStore");
        store = storeData ? JSON.parse(storeData) : {};
      } catch (err) {
        console.error("Failed to parse store from localStorage:", err);
      }
      const sellerNumber = store.sellerNumber || '';

      products.forEach((prod, index) => {
        
        // --- WHATSAPP LOGIC START ---
        const countryCode = '233';
        let whatsappLink = '#';
        
        if (sellerNumber) {
            const cleanNumber = sellerNumber.replace(/\D/g, '');

            // We put the Image URL on its own line at the bottom or top.
            // This maximizes the chance WhatsApp generates the "Card Preview".
            const text = `Hi, I am interested in this product:
          *${prod.productName}*
          Price: ₵${prod.productPrice.toFixed(2)}

          ${prod.productImage}
          `;

            const encodedMessage = encodeURIComponent(text);
           // whatsappLink = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
           whatsappLink = `https://api.whatsapp.com/send?phone=${countryCode}${cleanNumber}&text=${encodedMessage}`;
        }
        // --- WHATSAPP LOGIC END ---

        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
          <img src="${prod.productImage || 'http://static.photos/green/640x360/' + (index + 1)}" 
               alt="${prod.productName}" 
               class="w-full h-80 object-cover">
          <div class="p-4">
            <h3 class="font-semibold text-gray-800 text-lg mb-1">${prod.productName}</h3>
            <p class="text-green-600 font-bold mb-2">₵${prod.productPrice.toFixed(2)}</p>
            <div class="flex items-center text-sm text-gray-500 mb-3">
              <i data-feather="package" class="w-4 h-4 mr-1"></i>
              <span>${prod.productStock} in stock</span>
            </div>
            
            <a href="${whatsappLink}" target="_blank"
               class="block text-center bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors duration-200">
               <i data-feather="message-circle" class="w-4 h-4 inline mr-1"></i> Contact Seller
            </a>
          </div>
        `;
        grid.appendChild(card);
      });

      feather.replace();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  }


  function showErrorAlert(message) {
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50';
    alert.innerHTML = `
      <div class="flex items-center">
        <i data-feather="alert-circle" class="w-6 h-6 mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(alert);
    feather.replace();
    
    setTimeout(() => {
      alert.remove();
    }, 5000);
  }
});

