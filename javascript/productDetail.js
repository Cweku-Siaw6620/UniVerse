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
  const res = await fetch(`https://uni-verse-api.vercel.app/api/products/id/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
}

async function fetchStoreDetails(storeId) {
const res = await fetch(`https://uni-verse-api.vercel.app/api/stores/storeID/${storeId}`);
  if (!res.ok) throw new Error("Failed to fetch store");
  const store = await res.json();
  const verification = window.uniVerseVerification
    ? await window.uniVerseVerification.fetchVerificationStatus(store.owner)
    : { isVerified: false };
  return { ...store, ownerVerified: verification.isVerified };
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
    const verificationBadge = store.ownerVerified
      ? window.uniVerseVerification.getVerifiedBadgeHtml()
      : '<span class="store-verify-chip store-verify-chip--unverified"><i class="ri-shield-line mr-1"></i>Pending verification</span>';

    storeInfo.innerHTML = `
      <div class="store-card-shell">
        <div class="store-card-header">
          <div class="store-card-brand">
            <img src="${store.storeLogo || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80'}"
                 alt="${escapeHtml(store.storeName || 'Store')}"
                 class="store-card-avatar">
            <div>
              <div class="store-card-kicker">Verified seller profile</div>
              <h4 class="store-card-name">${escapeHtml(store.storeName || 'Unknown Store')}</h4>
              <div class="store-card-subtitle">${escapeHtml(store.sellerName || 'Unknown seller')} · Student seller</div>
            </div>
          </div>
          <div class="store-card-badge-wrap">
            ${verificationBadge}
          </div>
        </div>

        <div class="store-card-description">
          ${escapeHtml(store.storeDescription || 'No store description available.')}
        </div>

        <div class="store-card-stats">
          <div class="store-stat">
            <i class="ri-shield-check-line"></i>
            <span>${store.ownerVerified ? 'Verified seller' : 'Verification pending'}</span>
          </div>
          <div class="store-stat">
            <i class="ri-smartphone-line"></i>
            <span>${escapeHtml(store.sellerNumber || 'Contact via WhatsApp')}</span>
          </div>
        </div>

        <div class="store-card-footer">
          <button type="button" class="store-card-action" onclick="document.getElementById('contactSellerBtn')?.click()">
            <i class="ri-whatsapp-line"></i>
            Contact seller
          </button>
        </div>
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
    const res = await fetch(`https://uni-verse-api.vercel.app/api/products/category/${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed to fetch related products');
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

    // Build cards asynchronously so we can fetch WhatsApp links like on the homepage
    const productPromises = filteredRelated.map(async (p, index) => {
      const card = document.createElement('div');
      card.className = 'premium-product-card fade-up cursor-pointer';
      card.style.animationDelay = `${index * 0.05}s`;
      card.addEventListener('click', () => window.location.href = `productDetail.html?id=${p._id}`);
      const isFeatured = Boolean(p.featured);

      // Get whatsapp link (nav.js exposes getWhatsAppLink)
      let whatsappLink = '#';
      if (typeof getWhatsAppLink === 'function') {
        try { whatsappLink = await getWhatsAppLink(p); } catch (e) { /* ignore */ }
      }

      const stockStatus = p.productStock > 10 ? 'In Stock' : p.productStock > 0 ? 'Low Stock' : 'Sold Out';
      const stockClass = p.productStock > 10 ? 'text-green-600' : p.productStock > 0 ? 'text-gold' : 'text-red-500';

      card.innerHTML = `
        <div class="image-container relative group">
          <img src="${p.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'}" 
               alt="${escapeHtml(p.productName)}"
               loading="lazy"
               class="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-300 cursor-pointer"
               onclick="window.location.href='./productDetail.html?id=${p._id}'">
          <div class="absolute top-4 right-4">
            <span class="bg-white px-3 py-1 text-xs font-medium shadow-md rounded-full ${stockClass}">
              ${stockStatus}
            </span>
          </div>
          ${isFeatured ? `
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
            <h3 class="product-name text-lg font-medium">${escapeHtml(p.productName)}</h3>
            <span class="product-price text-gold font-semibold">₵${(p.productPrice || 0).toFixed(2)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="product-category text-xs uppercase tracking-wider text-gray-500">
              ${escapeHtml(p.productCategory || 'Uncategorized')}
            </span>
          </div>
                      <span class="text-xs text-gray-400">
              ${p.productStock || 0} pieces
            </span>
          <a href="${whatsappLink}" target="_blank" onclick="event.stopPropagation();">
            <button class="w-full mt-6 py-3 border border-charcoal text-charcoal hover:bg-green-500 hover:text-white 
                  text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300">
              BUY NOW
            </button>
          </a>
        </div>
      `;

      return card;
    });

    const cards = await Promise.all(productPromises);
    relatedContainer.innerHTML = '';
    cards.forEach(card => relatedContainer.appendChild(card));

  } catch (err) {
    console.error("Error loading related products:", err);
    const relatedContainer = document.getElementById('relatedProducts');
    if (relatedContainer) relatedContainer.innerHTML = `
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