/**
 * UniVerse Event Tracker
 * Drop this file in /javascript/ and include it on any page that needs tracking.
 * Usage:
 *   UniTracker.storeView(storeId, ownerId)
 *   UniTracker.productView(storeId, productId, ownerId)
 *   UniTracker.whatsappClick(storeId, productId, ownerId)
 *
 * ownerId — the store owner's user ID. If the logged-in user matches,
 * the event is silently skipped so owners don't inflate their own stats.
 */

const UniTracker = (() => {
    const API = 'https://uni-verse-api.vercel.app';

    function getCurrentUserId() {
        try {
            const userData = localStorage.getItem('user');
            if (!userData) return null;
            const user = JSON.parse(userData);
            return user?.id || user?._id || null;
        } catch {
            return null;
        }
    }

    function isOwner(ownerId) {
        if (!ownerId) return false;
        const currentUserId = getCurrentUserId();
        if (!currentUserId) return false;
        return String(currentUserId) === String(ownerId);
    }

    async function fire(payload) {
        try {
            await fetch(`${API}/api/events/track`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(payload)
            });
        } catch {
            // Tracking failures are silent — never surface to user
        }
    }

    return {
        storeView(storeId, ownerId) {
            if (!storeId || isOwner(ownerId)) return;
            fire({ type: 'store_view', storeId });
        },

        productView(storeId, productId, ownerId) {
            if (!storeId || !productId || isOwner(ownerId)) return;
            fire({ type: 'product_view', storeId, productId });
        },

        whatsappClick(storeId, productId, ownerId) {
            if (!storeId || !productId || isOwner(ownerId)) return;
            fire({ type: 'whatsapp_click', storeId, productId });
        }
    };
})();