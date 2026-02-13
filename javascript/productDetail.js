document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  

  if (!productId) {
    showError("No product found!");
    return;
  }

  try {
    // Fetch product details
    const product = await fetchProductDetails(productId);

    const storeId = product.storeId;

    //fetching store details
    const store = await fetchStoreDetails(storeId);
    
    // Update all product information
    updateProductDisplay(product, store);
    updateStoreInfo(store);
    updateBreadcrumb(product);
    
    // Set up button actions
    setupButtonActions(product, store);
    
    // Fetch and display related products
    await fetchRelatedProducts(product.productCategory, productId);
    
    // Set up image gallery functionality
    setupImageGallery(product);
    
    // Set up share functionality
    //check later
    setupShareFunctionality(product);
    
  } catch (err) {
    console.error("Error loading product:", err);
    showError("Failed to load product details. Please try again.");
  }
});

// Fetch product details from API
async function fetchProductDetails(productId) {
  const res = await fetch(`https://universe-api-uabt.onrender.com/api/products/id/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
}

async function fetchStoreDetails(storeId) {
const res = await fetch(`https://universe-api-uabt.onrender.com/api/stores/storeID/${storeId}`);
  if (!res.ok) throw new Error("Failed to fetch store");
  return await res.json();
}

// Update all product information on the page
function updateProductDisplay(product, store) {
  // Update main image
  const mainImageContainer = document.getElementById('mainImageContainer');
  if (mainImageContainer) {
    mainImageContainer.innerHTML = `
      <img src="${product.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" 
           alt="${escapeHtml(product.productName)}" 
           class="w-full h-auto product-image rounded"
           id="mainProductImage">
      ${product.productStock <= 5 ? `
        <div class="stock-badge">Only ${product.productStock} left</div>
      ` : ''}
    `;
  }

  // Update product title and price
  document.querySelector('#productDetail h1')?.remove();
  document.querySelector('#productDetail h1')?.remove();
  
  const productHeader = document.getElementById('productHeader');
  if (productHeader) {
    productHeader.innerHTML = `
      <h1 class="serif-heading text-3xl mb-3">${escapeHtml(product.productName)}</h1>
      <div class="mb-2">
        <span class="vintage-tag">${escapeHtml(product.productCategory || 'General')}</span>
      </div>
      <p class="text-2xl font-semibold text-gray-900 mb-4">₵${(product.productPrice || 0).toFixed(2)}</p>
    `;
  }

  // Update product description
  const descriptionContainer = document.getElementById('productDescription');
  if (descriptionContainer) {
    descriptionContainer.innerHTML = `
      <p class="text-gray-700 leading-relaxed">${escapeHtml(product.productDescription || 'No description available.')}</p>
    `;
  }

  // Update specifications table
  const specsTable = document.getElementById('productSpecs');
  if (specsTable) {
    specsTable.innerHTML = `
      <tr>
        <td>Category</td>
        <td><span class="font-medium">${escapeHtml(product.productCategory || 'Not specified')}</span></td>
      </tr>
      <tr>
        <td>Stock Available</td>
        <td>
          <span class="font-medium ${product.productStock > 10 ? 'text-green-600' : product.productStock > 0 ? 'text-yellow-600' : 'text-red-600'}">
            ${product.productStock || 0} units
          </span>
        </td>
      </tr>
      <tr>
        <td>Condition</td>
        <td><span class="font-medium">${product.condition || 'New'}</span></td>
      </tr>
      <tr>
        <td>Store</td>
        <td><span class="font-medium">${escapeHtml(store.storeName || 'Unknown Store')}</span></td>
      </tr>
    `;
  }
}

// Update store information
function updateStoreInfo(store) {
  const storeInfo = document.getElementById('storeInfo');
  if (storeInfo) {
    storeInfo.innerHTML = `
      <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80'}" 
           alt="${escapeHtml(store.storeName || 'Store')}" 
           class="w-16 h-16 rounded-full object-cover border-2 border-primary">
      <div>
        <h4 class="font-semibold text-lg">${escapeHtml(store.storeName || 'Unknown Store')}</h4>
        <p class="text-gray-600">Student Seller • ${escapeHtml(store.sellerName || 'Unknown')}</p>
        <div class="flex items-center mt-2">
          <i class="ri-phone-line text-sm text-gray-500 mr-2"></i>
          <span class="text-gray-700">${escapeHtml(store.sellerNumber || 'Contact via WhatsApp')}</span>
        </div>
        <p class="text-gray-600"> ${escapeHtml(store.storeDescription || 'Unknown')}</p>
      </div>
    `;
  }
}

// Set up button actions
function setupButtonActions(product, store) {
  const visitStoreBtn = document.getElementById('visitStoreBtn');
  const contactSellerBtn = document.getElementById('contactSellerBtn');
  const shareProductBtn = document.getElementById('shareProductBtn');

  if (visitStoreBtn && store.storeId) {
    visitStoreBtn.addEventListener('click', () => {
      window.location.href = `displayStore.html?slug=${store.storeSlug || store.storeId}`;
    });
  }

  if (contactSellerBtn && store.sellerNumber) {
    contactSellerBtn.addEventListener('click', () => {
      const countryCode = '233';
      const cleanNumber = store.sellerNumber.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Hi, I'm interested in your product: *${escapeHtml(product.productName)}*\n\nPrice: ₵${(product.productPrice || 0).toFixed(2)}\n\nCan you provide more details?`
      );
      window.open(`https://api.whatsapp.com/send?phone=${countryCode}${cleanNumber}&text=${message}`, '_blank');
    });
  }

  if (shareProductBtn) {
    shareProductBtn.addEventListener('click', () => {
      shareProduct(product);
    });
  }
}

// Set up image gallery
function setupImageGallery(product) {
  const galleryContainer = document.getElementById('imageGallery');
  if (!galleryContainer) return;

  // Check if product has multiple images
  const images = product.additionalImages || [];
  
  // Add main image as first thumbnail
  images.unshift(product.productImage);
  
  // Create thumbnails
  galleryContainer.innerHTML = images.slice(0, 4).map((img, index) => `
    <img src="${img}" 
         alt="Product view ${index + 1}" 
         class="gallery-thumb ${index === 0 ? 'active' : ''}"
         data-image="${img}"
         onclick="changeMainImage('${img}', this)">
  `).join('');
}

// Change main image function (global for onclick)
window.changeMainImage = function(imageUrl, element) {
  const mainImage = document.getElementById('mainProductImage');
  if (mainImage) {
    mainImage.src = imageUrl;
  }
  
  // Update active thumbnail
  document.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.classList.remove('active');
  });
  element.classList.add('active');
};

// Set up share functionality
function setupShareFunctionality(product) {
  window.shareProduct = function(product) {
    const shareData = {
      title: `${escapeHtml(product.productName)} - UniVerse`,
      text: `Check out ${escapeHtml(product.productName)} on UniVerse for ₵${(product.productPrice || 0).toFixed(2)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Product shared successfully'))
        .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareData.url)
        .then(() => {
          alert('Link copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy:', err);
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = shareData.url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          alert('Link copied to clipboard!');
        });
    }
  };
}

// Fetch and display related products
async function fetchRelatedProducts(category, currentProductId) {
  try {
    const res = await fetch(`https://universe-api-uabt.onrender.com/api/products/category/${encodeURIComponent(category)}`);
    const related = await res.json();
    const relatedContainer = document.getElementById('relatedProducts');
    
    // Update "View all" link
    const viewAllLink = document.getElementById('viewAllCategory');
    if (viewAllLink) {
      viewAllLink.href = `stores.html?category=${encodeURIComponent(category)}`;
    }

    if (!related || !related.length) {
      relatedContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="ri-box-3-line text-4xl text-gray-300 mb-4"></i>
          <p class="text-gray-500">No related products found in this category.</p>
        </div>
      `;
      return;
    }

    // Filter out current product and limit to 4
    const filteredRelated = related
      .filter(p => p._id !== currentProductId)
      .slice(0, 4);

    relatedContainer.innerHTML = filteredRelated.map(p => `
      <div class="related-product classic-card cursor-pointer" onclick="window.location.href='productDetail.html?id=${p._id}'">
        <div class="relative overflow-hidden">
          <img src="${p.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'}" 
               alt="${escapeHtml(p.productName)}" 
               class="w-full h-48 object-cover transition-transform duration-300 hover:scale-105">
          <span class="vintage-tag absolute top-3 right-3">${escapeHtml(p.productCategory || 'General')}</span>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 mb-2 truncate">${escapeHtml(p.productName)}</h3>
          <p class="text-gray-600 text-sm mb-3 line-clamp-2">${escapeHtml(p.productDescription || 'No description available.')}</p>
          <div class="flex items-center justify-between mb-3">
            <span class="text-lg font-semibold text-gray-900">₵${(p.productPrice || 0).toFixed(2)}</span>
            <span class="text-sm ${p.productStock > 10 ? 'text-green-600' : 'text-yellow-600'}">
              ${p.productStock || 0} in stock
            </span>
          </div>
          <button class="w-full classic-btn py-2 text-sm">
            View Details
          </button>
        </div>
      </div>
    `).join('');
    
  } catch (err) {
    console.error("Error loading related products:", err);
    document.getElementById('relatedProducts').innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500">Unable to load related products.</p>
      </div>
    `;
  }
}

// Update breadcrumb
function updateBreadcrumb(product) {
  const breadcrumb = document.getElementById('breadcrumbProduct');
  if (breadcrumb) {
    breadcrumb.textContent = escapeHtml(product.productName);
  }
}

// Show error message
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg z-50 max-w-sm';
  errorDiv.innerHTML = `
    <div class="flex items-center">
      <i class="ri-error-warning-line text-xl mr-3"></i>
      <div>
        <p class="font-medium">Error</p>
        <p class="text-sm">${escapeHtml(message)}</p>
      </div>
    </div>
  `;
  document.body.appendChild(errorDiv);
  
  setTimeout(() => {
    errorDiv.remove();
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