document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    const API_BASE = 'https://uni-verse-api.vercel.app';

    // Get user and store data from localStorage
    function getAuthData() {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const store = JSON.parse(localStorage.getItem('store') || '{}');
            return { user, store };
        } catch (err) {
            console.error("Failed to parse auth data:", err);
            return { user: {}, store: {} };
        }
    }

    // Show notification
    function showNotification(title, message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) {
            console.warn('Notification element not found');
            return;
        }

        const icon = document.getElementById('notification-icon');
        const iconIcon = document.getElementById('notification-icon-icon');
        
        if (type === 'success') {
            if (icon) icon.className = 'w-8 h-8 flex items-center justify-center bg-green-100 rounded-full mr-3';
            if (iconIcon) iconIcon.className = 'ri-check-line text-green-500';
        } else if (type === 'error') {
            if (icon) icon.className = 'w-8 h-8 flex items-center justify-center bg-red-100 rounded-full mr-3';
            if (iconIcon) iconIcon.className = 'ri-close-line text-red-500';
        } else if (type === 'warning') {
            if (icon) icon.className = 'w-8 h-8 flex items-center justify-center bg-yellow-100 rounded-full mr-3';
            if (iconIcon) iconIcon.className = 'ri-alert-line text-yellow-500';
        }
        
        const titleEl = document.getElementById('notification-title');
        const messageEl = document.getElementById('notification-message');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        notification.classList.remove('translate-x-full');
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
        }, 5000);
    }

    // ============================================
    // STORE INFO DISPLAY (Header)
    // ============================================

    async function fetchStoreData() {
        try {
            const { user } = getAuthData();
            
            if (!user || !user.id) {
                console.error("User not found. Please log in first.");
                window.location.href = "/components/login.html";
                return;
            }

            const userId = user.id;
            const res = await fetch(`${API_BASE}/api/stores/${encodeURIComponent(userId)}`);
            
            if (!res.ok) throw new Error("Failed to fetch store");

            const store = await res.json();
            
            // Try to get verification status
            let verification = { isVerified: false };
            try {
                if (window.uniVerseVerification && typeof window.uniVerseVerification.fetchVerificationStatus === 'function') {
                    verification = await window.uniVerseVerification.fetchVerificationStatus(userId);
                }
            } catch (err) {
                console.warn('Verification check failed:', err);
            }
            
            updateStoreInfo(store, verification);
            
            // Also load full store data for settings page
            await loadStoreData();
            
        } catch (error) {
            console.error('Failed to get store:', error);
        }
    }

    function updateStoreInfo(store, verification = { isVerified: false }) {
        const storeInfoContainer = document.getElementById('store-info');
        if (!storeInfoContainer) return;

        // Check if store exists and has data
        if (!store || !store.storeName) {
            storeInfoContainer.innerHTML = `
                <div class="flex items-center space-x-4 p-2 bg-white rounded-lg shadow-sm">
                    <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden">
                        <i class="ri-store-2-line text-gray-400 text-xl"></i>
                    </div>
                    <div class="hidden md:block">
                        <div class="text-sm font-semibold text-gray-900">No Store</div>
                        <div class="text-xs text-gray-500">Create a store to get started</div>
                    </div>
                </div>
            `;
            return;
        }

        // Get verified badge HTML safely
        let badgeHtml = '';
        if (verification.isVerified && window.uniVerseVerification && 
            typeof window.uniVerseVerification.getVerifiedBadgeHtml === 'function') {
            badgeHtml = window.uniVerseVerification.getVerifiedBadgeHtml();
        }

        storeInfoContainer.innerHTML = `
            <div class="flex items-center space-x-4 p-2 bg-white rounded-lg shadow-sm">
                <!-- Store Logo -->
                <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                    ${store.storeLogo ? 
                        `<img src="${store.storeLogo}" alt="${store.storeName}" class="w-full h-full object-cover">` : 
                        `<i class="ri-store-2-line text-gray-400 text-xl"></i>`
                    }
                </div>

                <!-- Store Info -->
                <div class="hidden md:block flex-1 min-w-0">
                    <div class="text-sm font-semibold text-gray-900 truncate">${store.storeName || 'Unnamed Store'}</div>
                    <div class="text-xs text-gray-500 flex items-center gap-2 flex-wrap">
                        ${store.sellerName || 'Unknown Seller'}
                        ${badgeHtml}
                    </div>
                </div>

                <!-- Private Website Button -->
                ${store.personalWebsite ? `
                    <a href="${store.personalWebsite}" target="_blank" rel="noopener noreferrer"
                        class="ml-auto text-sm bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-200 ease-in-out flex-shrink-0">
                        <i class="ri-external-link-line mr-1"></i> Website
                    </a>
                ` : ''}
            </div>
        `;
    }

    // ============================================
    // MAIN SETTINGS PAGE FUNCTIONALITY
    // ============================================

    async function loadStoreData() {
        try {
            const { user, store } = getAuthData();
            
            if (!user || !user.id) {
                showNotification('Error', 'User not found. Please login again.', 'error');
                return;
            }

            // If we don't have store ID but have user ID, fetch store
            let storeId = store.id || store._id;
            
            if (!storeId) {
                try {
                    const response = await fetch(`${API_BASE}/api/stores/${user.id}`);
                    if (response.ok) {
                        const storeData = await response.json();
                        if (storeData && storeData._id) {
                            storeId = storeData._id;
                            localStorage.setItem('store', JSON.stringify(storeData));
                        }
                    }
                } catch (err) {
                    console.warn('Could not fetch store by user ID:', err);
                }
            }

            if (!storeId) {
                const nameEl = document.getElementById('store-name');
                if (nameEl) nameEl.textContent = 'No store found';
                
                const sellerEl = document.getElementById('seller-name');
                if (sellerEl) sellerEl.textContent = 'Create a store first';
                
                const headerName = document.getElementById('header-store-name');
                if (headerName) headerName.textContent = 'No store';
                
                const headerSeller = document.getElementById('header-seller-name');
                if (headerSeller) headerSeller.textContent = '';
                
                const badge = document.getElementById('store-status-badge');
                if (badge) {
                    badge.textContent = '⚠️ No Store';
                    badge.className = 'text-sm text-yellow-500 mt-2 md:mt-0';
                }
                return;
            }

            // Fetch full store details from API
            const response = await fetch(`${API_BASE}/api/stores/storeID/${storeId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch store data');
            }

            const storeData = await response.json();
            
            // Update localStorage with fresh data
            localStorage.setItem('store', JSON.stringify(storeData));

            // Helper to safely set text content
            function setText(id, value, fallback = 'Not set') {
                const el = document.getElementById(id);
                if (el) el.textContent = value || fallback;
            }

            // Helper to safely set value
            function setValue(id, value, fallback = '') {
                const el = document.getElementById(id);
                if (el) el.value = value || fallback;
            }

            // Update UI
            const storeIdInput = document.getElementById('store-id');
            if (storeIdInput) storeIdInput.value = storeData._id;

            setText('store-name', storeData.storeName);
            setText('seller-name', storeData.sellerName);
            setText('seller-phone', storeData.sellerNumber, 'Not provided');
            setText('store-category', storeData.storeCategory, 'Not specified');
            setText('store-description', storeData.storeDescription, 'No description');
            
            // Store logo
            const logoImg = document.getElementById('store-logo-preview');
            const logoText = document.getElementById('store-logo-text');
            
            if (storeData.storeLogo && logoImg) {
                logoImg.src = storeData.storeLogo;
                logoImg.classList.remove('hidden');
                if (logoText) logoText.classList.add('hidden');
            } else if (logoImg) {
                logoImg.classList.add('hidden');
                if (logoText) logoText.classList.remove('hidden');
            }

            // Store link
            const slugLink = document.getElementById('store-slug');
            if (slugLink) {
                if (storeData.slug) {
                    slugLink.href = `${API_BASE}/stores/${storeData.slug}`;
                    slugLink.textContent = `${API_BASE}/stores/${storeData.slug}`;
                } else {
                    slugLink.href = '#';
                    slugLink.textContent = 'Not available';
                }
            }

            // Personal website
            const websiteLink = document.getElementById('personal-website');
            if (websiteLink) {
                if (storeData.personalWebsite) {
                    websiteLink.href = storeData.personalWebsite;
                    websiteLink.textContent = storeData.personalWebsite;
                } else {
                    websiteLink.href = '#';
                    websiteLink.textContent = 'Not provided';
                }
            }

            // Plan
            const plan = storeData.plan || 'free';
            const planEl = document.getElementById('store-plan');
            if (planEl) planEl.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
            
            const planBadge = document.getElementById('plan-badge');
            if (planBadge) {
                if (plan === 'organizational') {
                    planBadge.className = 'px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full';
                    planBadge.textContent = '🏢 Organizational';
                } else if (plan === 'premium') {
                    planBadge.className = 'px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full';
                    planBadge.textContent = '⭐ Premium';
                } else {
                    planBadge.className = 'px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full';
                    planBadge.textContent = 'Free';
                }
            }

            // Plan expiry
            const expirySpan = document.getElementById('plan-expiry');
            if (expirySpan) {
                if (storeData.planExpiresAt && plan !== 'free') {
                    const expiryDate = new Date(storeData.planExpiresAt);
                    const daysLeft = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    expirySpan.textContent = `(Expires in ${daysLeft} days)`;
                    expirySpan.className = daysLeft < 7 ? 'text-sm text-red-500 ml-2' : 'text-sm text-gray-500 ml-2';
                } else {
                    expirySpan.textContent = '';
                }
            }

            // Header
            const headerName = document.getElementById('header-store-name');
            if (headerName) headerName.textContent = storeData.storeName || 'Store';
            
            const headerSeller = document.getElementById('header-seller-name');
            if (headerSeller) headerSeller.textContent = storeData.sellerName || '';

            // Status badge
            const statusBadge = document.getElementById('store-status-badge');
            if (statusBadge) {
                statusBadge.textContent = '✅ Store Active';
                statusBadge.className = 'text-sm text-green-500 mt-2 md:mt-0';
            }

            // Pre-fill edit form
            setValue('edit-store-name', storeData.storeName);
            setValue('edit-seller-name', storeData.sellerName);
            setValue('edit-seller-phone', storeData.sellerNumber);
            setValue('edit-store-category', storeData.storeCategory);
            setValue('edit-store-description', storeData.storeDescription);
            setValue('edit-personal-website', storeData.personalWebsite);
            
            const editLogoPreview = document.getElementById('edit-logo-preview');
            if (editLogoPreview && storeData.storeLogo) {
                editLogoPreview.src = storeData.storeLogo;
            }

            return storeData;

        } catch (error) {
            console.error('Error loading store:', error);
            showNotification('Error', 'Failed to load store data. Please refresh.', 'error');
            
            const nameEl = document.getElementById('store-name');
            if (nameEl) nameEl.textContent = 'Error loading';
            
            const badge = document.getElementById('store-status-badge');
            if (badge) {
                badge.textContent = '❌ Error';
                badge.className = 'text-sm text-red-500 mt-2 md:mt-0';
            }
        }
    }

    // ============================================
    // UPDATE & DELETE FUNCTIONS
    // ============================================

    async function updateStore(storeId, formData) {
        try {
            const response = await fetch(`${API_BASE}/api/stores/${storeId}`, {
                method: 'PUT',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update store');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            throw error;
        }
    }

    async function deleteStore(storeId) {
        try {
            const response = await fetch(`${API_BASE}/api/stores/${storeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete store');
            }

            const result = await response.json();
            return result;
        } catch (error) {
            throw error;
        }
    }

    // ============================================
    // EVENT LISTENERS & UI INTERACTIONS
    // ============================================

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (mobileMenuToggle && sidebar && sidebarOverlay) {
        mobileMenuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', function() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    // ============================================
    // EDIT STORE MODAL
    // ============================================

    const editBtn = document.getElementById('edit-store-btn');
    const editModal = document.getElementById('edit-modal');
    const closeEditModal = document.getElementById('close-edit-modal');
    const cancelEdit = document.getElementById('cancel-edit');
    const editForm = document.getElementById('edit-store-form');

    if (editBtn && editModal) {
        editBtn.addEventListener('click', () => {
            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeEdit() {
        if (editModal) {
            editModal.classList.add('hidden');
            editModal.classList.remove('flex');
        }
        document.body.style.overflow = '';
    }

    if (closeEditModal) closeEditModal.addEventListener('click', closeEdit);
    if (cancelEdit) cancelEdit.addEventListener('click', closeEdit);
    
    // Close modal on outside click
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeEdit();
        });
    }

    // Preview logo on file select
    const logoInput = document.getElementById('edit-store-logo');
    if (logoInput) {
        logoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('edit-logo-preview');
                    if (preview) preview.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Edit form submission
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const storeId = document.getElementById('store-id')?.value;
            if (!storeId) {
                showNotification('Error', 'Store ID not found', 'error');
                return;
            }

            const editSubmitBtn = document.getElementById('edit-submit-btn');
            const editBtnText = document.getElementById('edit-btn-text');
            const editBtnLoading = document.getElementById('edit-btn-loading');

            // Show loading state
            if (editBtnText) editBtnText.classList.add('hidden');
            if (editBtnLoading) editBtnLoading.classList.remove('hidden');
            if (editSubmitBtn) editSubmitBtn.disabled = true;

            try {
                const formData = new FormData();
                const logoFile = document.getElementById('edit-store-logo')?.files[0];
                
                if (logoFile) {
                    formData.append('storeLogo', logoFile);
                }
                
                const storeName = document.getElementById('edit-store-name')?.value?.trim() || '';
                const sellerName = document.getElementById('edit-seller-name')?.value?.trim() || '';
                const sellerNumber = document.getElementById('edit-seller-phone')?.value?.trim() || '';
                const storeCategory = document.getElementById('edit-store-category')?.value || '';
                const storeDescription = document.getElementById('edit-store-description')?.value?.trim() || '';
                const personalWebsite = document.getElementById('edit-personal-website')?.value?.trim() || '';
                
                formData.append('storeName', storeName);
                formData.append('sellerName', sellerName);
                formData.append('sellerNumber', sellerNumber);
                formData.append('storeCategory', storeCategory);
                formData.append('storeDescription', storeDescription);
                formData.append('personalWebsite', personalWebsite);

                const result = await updateStore(storeId, formData);
                
                if (result.success) {
                    // Update localStorage
                    localStorage.setItem('store', JSON.stringify(result.store));
                    await loadStoreData();
                    await fetchStoreData(); // Update header too
                    closeEdit();
                    showNotification('Success', 'Store updated successfully!');
                } else {
                    throw new Error(result.message || 'Failed to update store');
                }
            } catch (error) {
                console.error('Update error:', error);
                showNotification('Error', error.message || 'Failed to update store', 'error');
            } finally {
                if (editBtnText) editBtnText.classList.remove('hidden');
                if (editBtnLoading) editBtnLoading.classList.add('hidden');
                if (editSubmitBtn) editSubmitBtn.disabled = false;
            }
        });
    }

    // ============================================
    // DELETE STORE MODAL
    // ============================================

    const deleteBtn = document.getElementById('delete-store-btn');
    const deleteModal = document.getElementById('delete-modal');
    const cancelDelete = document.getElementById('cancel-delete');
    const confirmDelete = document.getElementById('confirm-delete');

    if (deleteBtn && deleteModal) {
        deleteBtn.addEventListener('click', () => {
            deleteModal.classList.remove('hidden');
            deleteModal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeDelete() {
        if (deleteModal) {
            deleteModal.classList.add('hidden');
            deleteModal.classList.remove('flex');
        }
        document.body.style.overflow = '';
    }

    if (cancelDelete) cancelDelete.addEventListener('click', closeDelete);
    
    if (deleteModal) {
        deleteModal.addEventListener('click', (e) => {
            if (e.target === deleteModal) closeDelete();
        });
    }

    if (confirmDelete) {
        confirmDelete.addEventListener('click', async () => {
            const storeId = document.getElementById('store-id')?.value;
            if (!storeId) {
                showNotification('Error', 'Store ID not found', 'error');
                return;
            }

            const deleteBtnText = document.getElementById('delete-btn-text');
            const deleteBtnLoading = document.getElementById('delete-btn-loading');

            // Show loading state
            if (deleteBtnText) deleteBtnText.classList.add('hidden');
            if (deleteBtnLoading) deleteBtnLoading.classList.remove('hidden');
            if (confirmDelete) confirmDelete.disabled = true;

            try {
                const result = await deleteStore(storeId);
                
                if (result.message) {
                    // Clear localStorage
                    localStorage.removeItem('store');
                    showNotification('Store Deleted', 'Your store has been deleted successfully.', 'warning');
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 2000);
                } else {
                    throw new Error('Failed to delete store');
                }
            } catch (error) {
                console.error('Delete error:', error);
                showNotification('Error', error.message || 'Failed to delete store', 'error');
                closeDelete();
            } finally {
                if (deleteBtnText) deleteBtnText.classList.remove('hidden');
                if (deleteBtnLoading) deleteBtnLoading.classList.add('hidden');
                if (confirmDelete) confirmDelete.disabled = false;
            }
        });
    }

    // ============================================
    // NOTIFICATION CLOSE
    // ============================================

    const closeNotification = document.getElementById('close-notification');
    if (closeNotification) {
        closeNotification.addEventListener('click', () => {
            const notification = document.getElementById('notification');
            if (notification) notification.classList.add('translate-x-full');
        });
    }

    // ============================================
    // INITIALIZE
    // ============================================

    // Load store data for header
    fetchStoreData();
});