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

  // ✅ Call it!
  fetchStoreData();
});