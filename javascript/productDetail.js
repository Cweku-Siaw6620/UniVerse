document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) return alert("No product found!");

  try {
    const res = await fetch(`http://localhost:3000/api/products/id/${productId}`);
    const product = await res.json();

    // Display product info
    const detailContainer = document.getElementById("productDetail");
    detailContainer.innerHTML = `
      <div class="flex flex-col md:flex-row gap-6">
        <img src="${product.productImage}" alt="${product.productName}" class="w-full md:w-1/2 h-68 object-cover rounded-lg">
        <div class="flex flex-col justify-between">
          <div>
            <h1 class="text-3xl font-bold mb-2">${product.productName}</h1>
            <p class="text-green-600 text-2xl font-semibold mb-2">₵${product.productPrice.toFixed(2)}</p>
            <p class="text-gray-600 mb-2">${product.productDescription || "No description available."}</p>
            <p class="text-sm text-gray-400 mb-1">Category: ${product.productCategory}</p>
            <p class="text-sm text-gray-400">Stock: ${product.productStock}</p>
          </div>
          <div>
          <button 
            onclick="window.location.href='displayStore.html?id=${product.storeId}'" 
            class="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
            Visit Store
          </button>
          <button 
            onclick="window.location.href='displayStore.html?id=${product.storeId}'" 
            class="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
             <i data-feather="message-circle" class="w-4 h-4 inline mr-1"></i> Contact Seller
          </button>
          </div>
        </div>
      </div>
    `;

    // Fetch related products (same category)
    const relRes = await fetch(`http://localhost:3000/api/products/category/${encodeURIComponent(product.productCategory)}`);
    const related = await relRes.json();
    const relatedContainer = document.getElementById("relatedProducts");

    related
      .filter(p => p._id !== productId)
      .forEach(p => {
        const div = document.createElement("div");
        div.className = "bg-white rounded-lg shadow hover:shadow-md transition";
        div.innerHTML = `
          <div class="relative w-full h-56 overflow-hidden rounded-t-lg">
          <img src="${p.productImage}" 
              alt="${p.productName}" 
              class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300">
          <span class="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            ${p.productCategory || "General"}
          </span>
        </div>

        <div class="p-4 flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-gray-900 truncate">${p.productName}</h3>
          <p class="text-gray-600 text-sm line-clamp-2">${p.productDescription || "No description available."}</p>

          <div class="flex items-center justify-between mt-2">
            <span class="text-green-600 font-bold text-base">₵${p.productPrice.toFixed(2)}</span>
            <span class="text-xs text-gray-500">${p.productStock} in stock</span>
          </div>

          <button 
            class="mt-3 w-full bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 rounded-md transition-colors duration-200">
            View Details
          </button>
        </div>

        `;
        div.addEventListener("click", () => {
          window.location.href = `productDetail.html?id=${p._id}`;
        });
        relatedContainer.appendChild(div);
      });
  } catch (err) {
    console.error("Error loading product:", err);
  }
});
