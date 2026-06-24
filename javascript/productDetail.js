document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    showError("No product found!");
    return;
  }

  try {
    const product = await fetchProductDetails(productId);
    const store = await fetchStoreDetails(product.storeId);

    updateProductDisplay(product, store);
    updateSellerCard(product, store);
    updateSpecs(product);
    updateBreadcrumb(product);
    setupButtonActions(product, store);
    await fetchRelatedProducts(product.productCategory, productId);
    setupShareFunctionality(product);

    // Track for recently viewed (localStorage-based, not analytics)
    trackProductView(product);

    // Track product view for Tier 2 analytics
    // Skip if the logged-in user is the store owner
    UniTracker.productView(
      typeof product.storeId === 'object' ? product.storeId._id || product.storeId : product.storeId,
      product._id,
      store.owner?._id || store.owner
    );

  } catch (err) {
    console.error("Error loading product:", err);
    showError("Failed to load product details. Please try again.");
  }
});

// ── FETCH ─────────────────────────────────────────
async function fetchProductDetails(productId) {
  const res = await fetch(`https://uni-verse-api.vercel.app/api/products/id/${productId}`);
  if (!res.ok) throw new Error("Failed to fetch product");
  return await res.json();
}

async function fetchStoreDetails(storeId) {
  const res = await fetch(`https://uni-verse-api.vercel.app/api/stores/storeID/${storeId}`);
  if (!res.ok) throw new Error("Failed to fetch store");
  const store = await res.json();
  const ownerId = store.owner?._id || store.owner;
  const verification = window.uniVerseVerification && ownerId
    ? await window.uniVerseVerification.fetchVerificationStatus(ownerId)
    : { isVerified: false };
  return { ...store, ownerVerified: verification.isVerified };
}

// ── UPDATE PRODUCT DISPLAY ────────────────────────
function updateProductDisplay(product, store) {
  const container = document.getElementById('mainImageContainer');
  if (container) {
    container.innerHTML = `
      <img src="${product.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop'}" 
           alt="${escapeHtml(product.productName)}" 
           class="w-full h-full object-cover"
           id="mainProductImage">
    `;
  }

  const stockBadge = document.getElementById('stockBadge');
  if (stockBadge) {
    if (product.productStock <= 5 && product.productStock > 0) {
      stockBadge.classList.remove('hidden');
      stockBadge.querySelector('span').textContent = `Only ${product.productStock} left`;
      stockBadge.querySelector('span').className = 'bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm';
    } else if (product.productStock === 0) {
      stockBadge.classList.remove('hidden');
      stockBadge.querySelector('span').textContent = 'Sold Out';
      stockBadge.querySelector('span').className = 'bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm';
    } else {
      stockBadge.classList.add('hidden');
    }
  }

  const featuredBadge = document.getElementById('featuredBadge');
  if (featuredBadge) {
    featuredBadge.classList.toggle('hidden', !product.featured);
  }

  const catTag = document.getElementById('productCategoryTag');
  if (catTag) {
    catTag.innerHTML = `
      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer"
            onclick="window.location.href='../homeScreens/allProducts.html?category=${encodeURIComponent(product.productCategory || '')}'">
        ${escapeHtml(product.productCategory || 'General')}
      </span>
    `;
  }

  const title = document.getElementById('productTitle');
  if (title) title.textContent = escapeHtml(product.productName);

  const price = document.getElementById('productPrice');
  if (price) price.textContent = `GH₵ ${(product.productPrice || 0).toFixed(2)}`;

  const stockText = document.getElementById('productStock');
  if (stockText) {
    const status = product.productStock > 10 ? 'In Stock' : product.productStock > 0 ? 'Low Stock' : 'Out of Stock';
    const color  = product.productStock > 10 ? 'text-emerald-600' : product.productStock > 0 ? 'text-amber-600' : 'text-red-600';
    stockText.innerHTML = `<span class="${color}">${status}</span> · ${product.productStock || 0} available`;
  }

  const desc = document.getElementById('productDescription');
  if (desc) desc.textContent = escapeHtml(product.productDescription || 'No description available.');
}

// ── UPDATE SELLER CARD ────────────────────────────
function updateSellerCard(product, store) {
  const avatar           = document.getElementById('sellerAvatar');
  const name             = document.getElementById('sellerName');
  const storeName        = document.getElementById('sellerStore');
  const verifiedBadge    = document.getElementById('verifiedBadge');
  const verificationChip = document.getElementById('verificationChip');
  const affiliationText  = document.getElementById('affiliationText');
  const affiliationBadge = document.getElementById('affiliationBadge');

  if (avatar) {
    avatar.src = store.storeLogo || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop';
    avatar.alt = escapeHtml(store.storeName || 'Store');
  }
  if (name)      name.textContent      = escapeHtml(store.sellerName  || 'Unknown');
  if (storeName) storeName.textContent = escapeHtml(store.storeName   || 'Unknown Store');

  if (verifiedBadge)    verifiedBadge.classList.toggle('hidden', !store.ownerVerified);
  if (verificationChip) verificationChip.classList.toggle('hidden', !store.ownerVerified);

  // ── Affiliation — student only ────────────────
  if (affiliationText && affiliationBadge) {
    const owner       = store.owner;
    const affiliation = typeof owner?.affiliation === 'string' ? owner.affiliation.toLowerCase() : '';
    const isStudent   = affiliation.includes('student');
    const university  = owner?.university || null;

    // Build label: "Student" or "Student · KNUST" etc.
    let label = isStudent ? 'Student Seller' : 'Seller';
    if (university) label += ` · ${university}`;

    affiliationText.textContent = label;

    // Badge styling — consistent green for student, neutral gray for others
    const badgeClass = isStudent
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-gray-50 text-gray-600 border-gray-200';

    affiliationBadge.className = `mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badgeClass}`;

    const iconEl = affiliationBadge.querySelector('i');
    if (iconEl) {
      iconEl.setAttribute('data-feather', isStudent ? 'graduation-cap' : 'user');
    }
  }

  // ── Re-run feather AFTER DOM is updated ───────
  // Important: feather.replace() must run AFTER all innerHTML changes,
  // otherwise icons injected by JS never render.
  if (typeof feather !== 'undefined') feather.replace();
}

// ── UPDATE SPECS ──────────────────────────────────
function updateSpecs(product) {
  const cat   = document.getElementById('specCategory');
  const cond  = document.getElementById('specCondition');
  const stock = document.getElementById('specStock');
  const date  = document.getElementById('specDate');

  if (cat)   cat.textContent   = escapeHtml(product.productCategory || 'General');
  if (cond)  cond.textContent  = escapeHtml(product.condition || 'New');
  if (stock) stock.textContent = `${product.productStock || 0} units`;
  if (date) {
    const created = product.createdAt ? new Date(product.createdAt) : new Date();
    date.textContent = created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// ── UPDATE BREADCRUMB ─────────────────────────────
function updateBreadcrumb(product) {
  const crumb = document.getElementById('breadcrumbProduct');
  if (crumb) crumb.textContent = escapeHtml(product.productName);
}

// ── BUTTON ACTIONS ────────────────────────────────
function setupButtonActions(product, store) {
  const visitBtn   = document.getElementById('visitStoreBtn');
  const contactBtn = document.getElementById('contactSellerBtn');
  const shareBtn   = document.getElementById('shareProductBtn');

  if (visitBtn) {
    // FIX: use store.slug not store.storeSlug — that field doesn't exist
    visitBtn.onclick = () => {
      window.location.href = `displayStore.html?slug=${store.slug || store._id}`;
    };
  }

  if (contactBtn && store.sellerNumber) {
    contactBtn.onclick = () => {
      const clean = store.sellerNumber.replace(/\D/g, '');
      const msg   = encodeURIComponent(
        `Hi, I'm interested in your product: *${product.productName}*\n\nPrice: ₵${(product.productPrice || 0).toFixed(2)}\n\nCan you provide more details?`
      );
      // Track WhatsApp click for analytics before opening
      UniTracker.whatsappClick(
        typeof product.storeId === 'object' ? product.storeId._id || product.storeId : product.storeId,
        product._id,
        store.owner?._id || store.owner
      );
      window.open(`https://api.whatsapp.com/send?phone=233${clean}&text=${msg}`, '_blank');
    };
  }

  if (shareBtn) {
    shareBtn.onclick = () => shareProduct(product);
  }
}

// ── SHARE ─────────────────────────────────────────
function setupShareFunctionality(product) {
  window.shareProduct = function(product) {
    const shareData = {
      title: `${product.productName} - UniVerse`,
      text:  `Check out ${product.productName} on UniVerse for ₵${(product.productPrice || 0).toFixed(2)}`,
      url:   window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareData.url)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => {});
    }
  };
}

// ── RELATED PRODUCTS ──────────────────────────────
async function fetchRelatedProducts(category, currentProductId) {
  try {
    const res = await fetch(`https://uni-verse-api.vercel.app/api/products/category/${encodeURIComponent(category)}`);
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    const products  = data.products || data;
    const container = document.getElementById('relatedProducts');
    const filtered  = products.filter(p => p._id !== currentProductId).slice(0, 4);

    if (!filtered.length) {
      container.innerHTML = '<p class="col-span-full text-center text-gray-400 py-8">No related products found</p>';
      return;
    }

    container.innerHTML = '';
    filtered.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'group cursor-pointer fade-up';
      card.style.animationDelay = `${i * 0.05}s`;
      card.onclick = () => window.location.href = `productDetail.html?id=${p._id}`;
      card.innerHTML = `
        <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
          <img src="${p.productImage || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=533&fit=crop'}" 
               alt="${escapeHtml(p.productName)}"
               loading="lazy"
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
        <h3 class="font-medium text-gray-900 text-sm mb-1 truncate">${escapeHtml(p.productName)}</h3>
        <p class="text-gray-900 font-semibold">₵${(p.productPrice || 0).toFixed(2)}</p>
      `;
      container.appendChild(card);
    });

    // Re-run feather after related products are injected
    if (typeof feather !== 'undefined') feather.replace();

  } catch (err) {
    console.error("Related products error:", err);
  }
}

// ── TRACK PRODUCT VIEW (localStorage — recently viewed) ──
function trackProductView(product) {
  try {
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    viewed = viewed.filter(p => p._id !== product._id);
    viewed.unshift({
      _id:             product._id,
      productName:     product.productName,
      productPrice:    product.productPrice,
      productImage:    product.productImage,
      productCategory: product.productCategory,
      productStock:    product.productStock,
      storeId:         product.storeId,
      featured:        product.featured
    });
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed.slice(0, 12)));
  } catch (e) {
    console.error("Track view error:", e);
  }
}

// ── ERROR ─────────────────────────────────────────
function showError(message) {
  const div = document.createElement('div');
  div.className = 'fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-lg z-50 max-w-sm flex items-center gap-3';
  div.innerHTML = `
    <i data-feather="alert-circle" class="w-5 h-5 flex-shrink-0"></i>
    <p class="text-sm font-medium">${escapeHtml(message)}</p>
  `;
  document.body.appendChild(div);
  if (typeof feather !== 'undefined') feather.replace();
  setTimeout(() => div.remove(), 5000);
}

// ── UTIL ──────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}