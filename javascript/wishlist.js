/**
 * UniVerse Wishlist
 *
 * Drop this file in /javascript/ and include it (after tracker.js) on any page that shows products:
 *   <script src="/javascript/tracker.js"></script>
 *   <script src="/javascript/wishlist.js"></script>
 *
 * What it does on its own:
 *   - adds a heart to every product card that uses the .overlay-card markup
 *   - keeps the saved list in this browser (localStorage), so guests can use it
 *   - keeps any element with [data-wl-count] showing how many items are saved
 *
 * Floating wishlist button (a draggable circle that expands on hover). Opt in per page with:
 *   <body data-wishlist-fab>
 *
 * For the product detail page:
 *   UniWishlist.mountDetailHeart(buttonElement, product, store)
 *
 * Sharing (used by components/wishlist.html):
 *   UniWishlist.share.toWhatsApp({ title, displayName })
 *   UniWishlist.share.copyLink({ title, displayName })
 *   UniWishlist.share.stop()
 */

const UniWishlist = (() => {
    const API          = 'https://api.universeweb.co';
    const PAGE_URL     = '/components/wishlist.html';
    const LIST_KEY     = 'uv_wishlist';           // [{ id, storeId, ownerId }], newest first
    const SHARE_KEY    = 'uv_wishlist_share';     // { shareId, editKey, title, displayName }
    const COUNTED_KEY  = 'uv_wishlist_counted';   // product IDs already reported as a "save"
    const MAX_ITEMS    = 30;
    const DEFAULT_TITLE = 'My UniVerse wishlist';
    const ID_RE        = /^[a-f0-9]{24}$/i;
    const CARD_ID_RE   = /[?&]id=([a-f0-9]{24})/i;

    // ── Storage helpers (all wrapped, storage can be blocked) ──
    function read(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }
    function write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
    }
    function remove(key) {
        try { localStorage.removeItem(key); } catch { /* ignore */ }
    }

    const esc = (v) => String(v ?? '')
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // ── The list ───────────────────────────────────────────
    function getAll() {
        const list = read(LIST_KEY, []);
        return Array.isArray(list) ? list.filter(i => i && ID_RE.test(String(i.id))) : [];
    }
    const ids   = () => getAll().map(i => String(i.id));
    const has   = (id) => ids().includes(String(id));
    const count = () => getAll().length;

    // Returns true (saved), false (removed) or null (list full)
    function toggle(item) {
        const id = String(item.id);
        const list = getAll();
        const index = list.findIndex(i => String(i.id) === id);

        if (index > -1) {
            list.splice(index, 1);
            write(LIST_KEY, list);
            changed();
            return false;
        }
        if (list.length >= MAX_ITEMS) {
            toast(`Your wishlist is full (${MAX_ITEMS} items). Remove one to add another.`);
            return null;
        }
        const entry = { id, storeId: item.storeId || '', ownerId: item.ownerId || '' };
        list.unshift(entry);
        write(LIST_KEY, list);
        changed();
        reportSave(entry);
        return true;
    }

    function removeById(id) {
        const list = getAll().filter(i => String(i.id) !== String(id));
        write(LIST_KEY, list);
        changed();
    }

    // Used to quietly drop products that no longer exist
    function pruneMissing(missingIds) {
        if (!Array.isArray(missingIds) || !missingIds.length) return;
        const missing = new Set(missingIds.map(String));
        const list = getAll().filter(i => !missing.has(String(i.id)));
        write(LIST_KEY, list);
        changed();
    }

    function clear() {
        write(LIST_KEY, []);
        changed();
    }

    // Report a save to seller analytics, once per product per browser.
    // Cards that did not carry store info get it looked up first.
    async function reportSave(entry) {
        if (typeof UniTracker === 'undefined' || !UniTracker.wishlistSave) return;
        const counted = read(COUNTED_KEY, []);
        if (counted.includes(entry.id)) return;

        try {
            if (!entry.storeId) {
                const res = await fetch(`${API}/api/products/id/${entry.id}`);
                if (!res.ok) return;
                const p = await res.json();
                entry.storeId = String((p.storeId && p.storeId._id) || p.storeId || '');
                entry.ownerId = String((p.owner && p.owner._id) || p.owner || '');

                const list = getAll();
                const stored = list.find(i => String(i.id) === entry.id);
                if (stored) {
                    stored.storeId = entry.storeId;
                    stored.ownerId = entry.ownerId;
                    write(LIST_KEY, list);
                }
            }
            if (!entry.storeId) return;
            UniTracker.wishlistSave(entry.storeId, entry.id, entry.ownerId);
            counted.push(entry.id);
            write(COUNTED_KEY, counted.slice(-300));
        } catch { /* tracking is best effort */ }
    }

    // ── Heart button ───────────────────────────────────────
    const HEART_SVG =
        '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">' +
        '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

    function heartHTML(prod, opts = {}) {
        const id = String((prod && (prod._id || prod.id)) || '');
        if (!ID_RE.test(id)) return '';

        const storeId = prod.storeId && typeof prod.storeId === 'object' ? (prod.storeId._id || '') : (prod.storeId || '');
        const owner   = prod.owner || prod.ownerId || '';
        const ownerId = typeof owner === 'object' ? (owner._id || '') : owner;
        const name    = prod.productName || 'this product';
        const saved   = has(id);
        const cls     = ['uv-heart', opts.inline ? 'uv-heart-inline' : '', opts.className || ''].filter(Boolean).join(' ');

        return `<button type="button" class="${cls}" data-wl-id="${esc(id)}" data-wl-store="${esc(storeId)}" ` +
               `data-wl-owner="${esc(ownerId)}" data-wl-name="${esc(name)}" aria-pressed="${saved}" ` +
               `aria-label="${saved ? 'Remove' : 'Save'} ${esc(name)} ${saved ? 'from' : 'to'} wishlist">${HEART_SVG}</button>`;
    }

    function refresh(root = document) {
        root.querySelectorAll('[data-wl-id]').forEach(btn => {
            const saved = has(btn.dataset.wlId);
            btn.setAttribute('aria-pressed', String(saved));
            const name = btn.dataset.wlName || 'this product';
            btn.setAttribute('aria-label', `${saved ? 'Remove' : 'Save'} ${name} ${saved ? 'from' : 'to'} wishlist`);
        });
    }

    function syncCounts() {
        const n = count();
        document.querySelectorAll('[data-wl-count]').forEach(el => {
            // Only touch the DOM when something changed, otherwise the MutationObserver would loop
            if (el.textContent !== String(n)) el.textContent = n;
            const display = n ? '' : 'none';
            if (el.style.display !== display) el.style.display = display;
        });
    }

    // Finds the product ID for a card: its own or a nearby parent's link / onclick
    // (productDetail.html?id=...), or a data-product-id / data-id attribute.
    function findProductId(card) {
        let el = card;
        for (let depth = 0; el && depth < 4; depth++, el = el.parentElement) {
            const fromAttr = (el.getAttribute('onclick') || '').match(CARD_ID_RE) ||
                             (el.getAttribute('href') || '').match(CARD_ID_RE);
            if (fromAttr) return fromAttr[1];
            const data = el.dataset && (el.dataset.productId || el.dataset.id);
            if (data && ID_RE.test(data)) return data;
        }
        const link = card.querySelector('a[href]');
        const fromLink = link && (link.getAttribute('href') || '').match(CARD_ID_RE);
        return fromLink ? fromLink[1] : null;
    }

    // Adds a heart to every .overlay-card that does not have one yet.
    function decorate(root = document) {
        root.querySelectorAll('.overlay-card').forEach(card => {
            if (card.querySelector('[data-wl-id]')) return;
            const holder = card.querySelector('.overlay-card-image');
            if (!holder) return;

            const id = findProductId(card);
            if (!id) return;

            const nameEl = card.querySelector('.overlay-card-name');
            const html = heartHTML({ _id: id, productName: nameEl ? nameEl.textContent.trim() : '' });
            if (!html) return;

            if (getComputedStyle(holder).position === 'static') holder.style.position = 'relative';
            holder.insertAdjacentHTML('beforeend', html);
        });
    }

    // Heart for the product detail page, placed just after the given element
    function mountDetailHeart(anchor, product, store) {
        if (!anchor || !product || document.querySelector('.uv-heart-detail')) return;
        const html = heartHTML({
            _id: product._id,
            productName: product.productName,
            storeId: product.storeId,
            owner: store && store.owner
        }, { inline: true, className: 'uv-heart-detail' });
        if (!html) return;
        anchor.insertAdjacentHTML('afterend', html);
        refresh();
    }

    // ── Toast ──────────────────────────────────────────────
    let toastTimer = null;
    function toast(message, action) {
        let el = document.getElementById('uvWishlistToast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'uvWishlistToast';
            el.className = 'uv-toast';
            el.setAttribute('role', 'status');
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        el.innerHTML = `<span>${esc(message)}</span>` +
            (action ? ` <a href="${esc(action.href)}">${esc(action.label)}</a>` : '');
        el.classList.add('uv-toast-show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('uv-toast-show'), 3200);
    }

    // ── Sharing ────────────────────────────────────────────
    async function api(path, options = {}) {
        const res = await fetch(API + path, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        let data = null;
        try { data = await res.json(); } catch { /* no body */ }
        return { ok: res.ok, status: res.status, data };
    }

    const shareState = () => read(SHARE_KEY, null);

    // Creates the shared list the first time, updates it afterwards. Returns { url, shareId, title }.
    async function publish(opts = {}) {
        const list = ids();
        if (!list.length) throw new Error('Save at least one item before sharing.');

        const prev  = shareState() || {};
        const title = String(opts.title ?? prev.title ?? DEFAULT_TITLE).trim() || DEFAULT_TITLE;
        const displayName = String(opts.displayName ?? prev.displayName ?? '').trim();

        if (prev.shareId && prev.editKey) {
            const r = await api(`/api/wishlists/${prev.shareId}`, {
                method: 'PUT',
                body: JSON.stringify({ editKey: prev.editKey, title, displayName, productIds: list })
            });
            if (r.ok) {
                write(SHARE_KEY, { ...prev, title, displayName });
                return { url: r.data.url, shareId: prev.shareId, title };
            }
            // 404 or 403 means the old list is gone, so fall through and create a new one
            if (r.status !== 404 && r.status !== 403) {
                throw new Error((r.data && r.data.message) || 'Could not update your shared wishlist.');
            }
        }

        const r = await api('/api/wishlists', {
            method: 'POST',
            body: JSON.stringify({ title, displayName, productIds: list })
        });
        if (!r.ok) throw new Error((r.data && r.data.message) || 'Could not create your shared wishlist.');

        write(SHARE_KEY, { shareId: r.data.shareId, editKey: r.data.editKey, title, displayName });
        return { url: r.data.url, shareId: r.data.shareId, title };
    }

    function shareMessage(title, url) {
        const n = count();
        return `Here is my wishlist on UniVerse (${n} item${n === 1 ? '' : 's'}). Tap to see what I am eyeing:\n${url}`;
    }

    async function toWhatsApp(opts = {}) {
        // Open the tab straight away (inside the tap) so mobile browsers do not block it
        const popup = window.open('about:blank', '_blank');
        try {
            const { url, title } = await publish(opts);
            const link = `https://wa.me/?text=${encodeURIComponent(shareMessage(title, url))}`;
            if (popup) { popup.opener = null; popup.location.href = link; }
            else { window.location.href = link; }
            return url;
        } catch (err) {
            if (popup) popup.close();
            throw err;
        }
    }

    async function copyLink(opts = {}) {
        const { url } = await publish(opts);
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            window.prompt('Copy your wishlist link:', url);
        }
        return url;
    }

    async function stop() {
        const state = shareState();
        if (!state || !state.shareId) return true;
        const r = await api(`/api/wishlists/${state.shareId}`, {
            method: 'DELETE',
            body: JSON.stringify({ editKey: state.editKey })
        });
        // 404 (already gone) and 403 (key no longer valid) both mean there is nothing left we can manage
        if (r.ok || r.status === 404 || r.status === 403) {
            remove(SHARE_KEY);
            return true;
        }
        throw new Error((r.data && r.data.message) || 'Could not stop sharing right now.');
    }

    // Keep an already shared list up to date when items are added or removed
    let syncTimer = null;
    function scheduleSync() {
        const state = shareState();
        if (!state || !state.shareId || !state.editKey) return;
        clearTimeout(syncTimer);
        syncTimer = setTimeout(() => {
            api(`/api/wishlists/${state.shareId}`, {
                method: 'PUT',
                body: JSON.stringify({ editKey: state.editKey, productIds: ids() })
            }).catch(() => { /* try again on the next change */ });
        }, 1500);
    }

    // ── Floating wishlist button ───────────────────────────
    // Draggable: drag it anywhere, it snaps to the nearest side edge and remembers where you left it.
    const FAB_KEY    = 'uv_wishlist_fab';   // { side: 'left' | 'right', y: 0..1 }
    const FAB_SIZE   = 56;
    const FAB_MARGIN = 16;
    const FAB_DRAG_THRESHOLD = 6;           // px of movement before a press counts as a drag

    function mountFab() {
        if (document.getElementById('uvWishlistFab')) return;

        const wrap = document.createElement('div');
        wrap.id = 'uvWishlistFab';
        wrap.className = 'uv-fab';
        wrap.innerHTML =
            `<a class="uv-fab-link" href="${PAGE_URL}" aria-label="My wishlist" draggable="false">` +
                `<span class="uv-fab-icon">${HEART_SVG.replace('width="18" height="18"', 'width="24" height="24"')}</span>` +
                `<span class="uv-fab-label">My wishlist</span>` +
            `</a>` +
            `<span class="uv-fab-badge" data-wl-count style="display:none" aria-hidden="true">0</span>`;
        document.body.appendChild(wrap);

        const link = wrap.querySelector('.uv-fab-link');
        const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));
        const vw = () => document.documentElement.clientWidth;
        const vh = () => window.innerHeight;

        // Where the button lives: which edge, and how far down (0 = top, 1 = bottom)
        let place = read(FAB_KEY, null);
        if (!place || (place.side !== 'left' && place.side !== 'right') || typeof place.y !== 'number') {
            place = { side: 'left', y: (vh() - FAB_SIZE - 20) / (vh() - FAB_SIZE) };   // bottom-left
        }
        place.y = clamp(place.y, 0, 1);

        const topFor = (y) => clamp(Math.round(y * (vh() - FAB_SIZE)), 8, vh() - FAB_SIZE - 8);

        function applyPlace() {
            wrap.classList.toggle('uv-fab-right', place.side === 'right');
            wrap.style.top = topFor(place.y) + 'px';
            if (place.side === 'right') { wrap.style.left = 'auto'; wrap.style.right = FAB_MARGIN + 'px'; }
            else                        { wrap.style.right = 'auto'; wrap.style.left = FAB_MARGIN + 'px'; }
        }
        applyPlace();
        window.addEventListener('resize', applyPlace);

        // ── Drag ──
        let drag = null;
        let suppressClick = false;

        link.addEventListener('dragstart', (e) => e.preventDefault());

        link.addEventListener('pointerdown', (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            const r = wrap.getBoundingClientRect();
            drag = { id: e.pointerId, startX: e.clientX, startY: e.clientY, offX: e.clientX - r.left, offY: e.clientY - r.top, moved: false };
            try { link.setPointerCapture(e.pointerId); } catch { /* older browsers */ }
        });

        link.addEventListener('pointermove', (e) => {
            if (!drag || e.pointerId !== drag.id) return;
            if (!drag.moved) {
                if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < FAB_DRAG_THRESHOLD) return;
                drag.moved = true;
                wrap.classList.remove('uv-fab-snap');
                wrap.classList.add('uv-fab-dragging');
                // Switch to plain left/top so it follows the finger
                const r = wrap.getBoundingClientRect();
                wrap.style.right = 'auto';
                wrap.style.left = r.left + 'px';
                wrap.style.top = r.top + 'px';
            }
            wrap.style.left = clamp(e.clientX - drag.offX, 0, vw() - FAB_SIZE) + 'px';
            wrap.style.top  = clamp(e.clientY - drag.offY, 8, vh() - FAB_SIZE - 8) + 'px';
            e.preventDefault();
        });

        function endDrag(e) {
            if (!drag || e.pointerId !== drag.id) return;
            const finished = drag;
            drag = null;
            try { link.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
            if (!finished.moved) return;

            // A drag must not count as a click on the link
            suppressClick = true;
            setTimeout(() => { suppressClick = false; }, 0);

            const r = wrap.getBoundingClientRect();
            place = {
                side: (r.left + FAB_SIZE / 2) < vw() / 2 ? 'left' : 'right',
                y: clamp(r.top / (vh() - FAB_SIZE), 0, 1)
            };
            write(FAB_KEY, place);

            // Glide to the edge, then hand positioning back to the normal anchored layout
            wrap.classList.remove('uv-fab-dragging');
            wrap.classList.add('uv-fab-snap');
            wrap.style.left = (place.side === 'left' ? FAB_MARGIN : vw() - FAB_SIZE - FAB_MARGIN) + 'px';
            wrap.style.top = topFor(place.y) + 'px';
            setTimeout(() => { wrap.classList.remove('uv-fab-snap'); applyPlace(); }, 240);
        }
        link.addEventListener('pointerup', endDrag);
        link.addEventListener('pointercancel', endDrag);

        link.addEventListener('click', (e) => {
            if (suppressClick) { e.preventDefault(); e.stopPropagation(); }
        });

        // ── Count, label and pop animation ──
        let lastCount = count();

        function update() {
            const n = count();
            link.setAttribute('aria-label', n ? `My wishlist, ${n} item${n === 1 ? '' : 's'}` : 'My wishlist');
            wrap.classList.toggle('uv-fab-has-items', n > 0);
            if (n > lastCount) {
                wrap.classList.remove('uv-fab-pop');
                void wrap.offsetWidth;            // restart the animation
                wrap.classList.add('uv-fab-pop');
            }
            lastCount = n;
        }
        update();
        window.addEventListener('uniwishlist:change', update);
        syncCounts();
    }

    // ── Wiring ─────────────────────────────────────────────
    function changed() {
        syncCounts();
        refresh();
        window.dispatchEvent(new CustomEvent('uniwishlist:change'));
        scheduleSync();
    }

    function injectStyles() {
        if (document.getElementById('uvWishlistStyles')) return;
        const style = document.createElement('style');
        style.id = 'uvWishlistStyles';
        style.textContent = `
            .uv-heart{position:absolute;top:10px;right:10px;z-index:5;width:36px;height:36px;border-radius:9999px;border:0;
                background:rgba(255,255,255,.94);color:#6b7280;display:flex;align-items:center;justify-content:center;
                box-shadow:0 2px 8px rgba(0,0,0,.18);cursor:pointer;padding:0;transition:transform .15s ease,color .15s ease}
            .uv-heart:hover{transform:scale(1.08);color:#B9812E}
            .uv-heart:focus-visible{outline:2px solid #B9812E;outline-offset:2px}
            .uv-heart svg{fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:fill .15s ease}
            .uv-heart[aria-pressed="true"]{color:#D9822B}
            .uv-heart[aria-pressed="true"] svg{fill:currentColor}
            .uv-heart-inline{position:static;flex:none;width:44px;height:44px;border:1px solid #e5e7eb;box-shadow:none;background:#fff;margin-right:8px}
            .uv-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,20px);opacity:0;pointer-events:none;z-index:9999;
                max-width:calc(100vw - 32px);background:#FFF8EB;color:#7A4E12;border:1px solid #F1D9A8;border-radius:12px;
                padding:10px 16px;font:600 14px/1.3 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.15);
                transition:opacity .2s ease,transform .2s ease}
            .uv-toast a{color:#9A5B0F;text-decoration:underline;margin-left:8px}
            .uv-toast-show{opacity:1;pointer-events:auto;transform:translate(-50%,0)}
            /* Floating wishlist button */
            .uv-fab{position:fixed;left:16px;top:0;z-index:9000;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
            .uv-fab-snap{transition:left .22s ease,top .22s ease}
            .uv-fab-link{box-sizing:border-box;display:flex;align-items:center;width:56px;height:56px;border-radius:9999px;overflow:hidden;white-space:nowrap;
                background:#fff;color:#B9812E;border:1px solid #F1D9A8;text-decoration:none;
                cursor:grab;-webkit-user-drag:none;
                box-shadow:0 8px 24px rgba(122,78,18,.22);transition:width .25s ease,background .2s ease,color .2s ease,box-shadow .2s ease}
            .uv-fab-icon{flex:none;width:54px;height:54px;display:flex;align-items:center;justify-content:center}
            .uv-fab-icon svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:fill .2s ease}
            .uv-fab-label{font:600 14px/1 system-ui,sans-serif;padding-right:20px;opacity:0;transition:opacity .15s ease}
            .uv-fab-link:focus-visible{outline:3px solid #E3A94F;outline-offset:3px}
            .uv-fab-has-items .uv-fab-icon svg{fill:currentColor}
            .uv-fab-badge{position:absolute;top:-4px;left:34px;min-width:22px;height:22px;padding:0 6px;border-radius:9999px;
                background:#1f2937;color:#fff;font:700 12px/22px system-ui,sans-serif;text-align:center;
                box-shadow:0 0 0 2px #fff;pointer-events:none}
            .uv-fab-right .uv-fab-link{flex-direction:row-reverse}
            .uv-fab-right .uv-fab-label{padding-right:0;padding-left:20px}
            .uv-fab-right .uv-fab-badge{left:auto;right:-2px}
            .uv-fab-dragging .uv-fab-link{cursor:grabbing;width:56px !important;background:#fff !important;color:#B9812E !important;
                border-color:#F1D9A8 !important;box-shadow:0 14px 34px rgba(122,78,18,.38);transform:scale(1.06)}
            .uv-fab-dragging .uv-fab-label{opacity:0 !important}
            .uv-fab-pop{animation:uvFabPop .45s ease}
            @keyframes uvFabPop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
            @media (hover:hover){
                .uv-fab-link:hover,.uv-fab-link:focus-visible{width:172px;background:linear-gradient(135deg,#E3A94F,#B9812E);color:#fff;border-color:transparent;box-shadow:0 10px 28px rgba(122,78,18,.35)}
                .uv-fab-link:hover .uv-fab-label,.uv-fab-link:focus-visible .uv-fab-label{opacity:1}
            }
            body[data-wishlist-fab] .uv-toast{bottom:92px}
            @media print{.uv-fab{display:none}}
            @media (prefers-reduced-motion:reduce){.uv-heart,.uv-toast,.uv-fab-link,.uv-fab-label{transition:none}.uv-fab-pop{animation:none}}
        `;
        document.head.appendChild(style);
    }

    // Capture phase so the heart works inside cards that navigate on click
    document.addEventListener('click', (e) => {
        const btn = e.target.closest && e.target.closest('[data-wl-id]');
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();

        const result = toggle({
            id: btn.dataset.wlId,
            storeId: btn.dataset.wlStore,
            ownerId: btn.dataset.wlOwner
        });
        if (result === true) toast('Saved to your wishlist', { label: 'View', href: PAGE_URL });
        else if (result === false) toast('Removed from your wishlist');
    }, true);

    // Another tab changed the list
    window.addEventListener('storage', (e) => {
        if (e.key === LIST_KEY) {
            syncCounts();
            refresh();
            window.dispatchEvent(new CustomEvent('uniwishlist:change'));
        }
    });

    function init() {
        injectStyles();
        if (document.body.hasAttribute('data-wishlist-fab')) mountFab();
        decorate();
        refresh();
        syncCounts();

        let queued = false;
        new MutationObserver(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                decorate();
                refresh();
                syncCounts();
            });
        }).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return {
        MAX_ITEMS,
        DEFAULT_TITLE,
        getAll, ids, has, count, toggle, remove: removeById, pruneMissing, clear,
        heartHTML, refresh, syncCounts, decorate, mountDetailHeart, mountFab, toast,
        share: { getState: shareState, publish, toWhatsApp, copyLink, stop }
    };
})();