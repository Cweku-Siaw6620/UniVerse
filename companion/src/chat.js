class ChatManager {
    async send(message) {
        // Limit excessively long messages
        const MAX_MESSAGE_LENGTH = 1000;

        message = message.trim();

        if (message.length > MAX_MESSAGE_LENGTH) {

            const messageLimitResponse =
                currentCompanion.name === "Rei"
                    ? "Whoa, that's a lot to read at once 😅💗. Try shortening that a little."
                    : "Whoa, that's a lot to read at once 😅. Try shortening that a little.";

            expressAndSpeak(
                "thinking",
                messageLimitResponse
            );

            return;
        }
        setState("thinking");
        setExpression("thinking");

        const request = {
            sessionId: sessionManager.getSessionId(),
            companion: currentCompanion.name,
            page: window.location.pathname,
            message: message
        };

        if (window.currentUniVerseStore) {
            request.storeContext = {
                id: window.currentUniVerseStore._id,
                name: window.currentUniVerseStore.storeName,
                description: window.currentUniVerseStore.storeDescription,
                sellerName: window.currentUniVerseStore.sellerName,
                location: window.currentUniVerseStore.location,
                categories:
                    window.currentUniVerseStore.categories ||
                    window.currentUniVerseStore.tags ||
                    [],
                additionalInfo: window.currentUniVerseStore.additionalInfo,
                mission: window.currentUniVerseStore.mission,
                university:
                    window.currentUniVerseStore.university ||
                    window.currentUniVerseStore.owner?.university ||
                    null
            };

            request.storeProducts =
                (window.currentUniVerseStoreProducts || []).map(product => ({
                    id: product._id,
                    name: product.productName,
                    price: product.productPrice,
                    featured: product.featured
                }));
        }

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 10000);

            const response = await fetch(
                "http://localhost:5000/api/ai/chat",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(request),
                    signal: controller.signal
                }
            );
            clearTimeout(timeout);

            if (!response.ok) { 
                if (response.status === 429) {
                    const data = await response.json();
                    setState("idle");
                    expressAndSpeak("thinking", data.message);
                    return;
                }
                throw new Error(`AI request failed: ${response.status}`);
            }
            const data = await response.json();

            if (!data || !data.success || !data.text) {
                throw new Error("Invalid AI response received.");
            }

            setState("idle");

            //console.log("AI RESPONSE:", data);

            expressAndSpeak(
                data.emotion || "happy",
                data.text
            );

            if (data.action) {
                if (data.action.type === "NAVIGATE") {
                    handleAIAction(data.action);
                }
                if (data.action.type === "SEARCH_PRODUCTS") {
                    searchProductsAI(
                        data.action.query,
                        data.action.sort
                    );
                }
                if (data.action.type === "FILTER_PRODUCTS") {
                    filterProductsAI(data.action.category);
                }
                if (data.action.type === "SEARCH_STORES") {
                    searchStoresAI(data.action.query);
                }

                if (data.action.type === "FILTER_STORES") {
                    filterStoresAI(data.action.university);
                }
            }
        } catch (error) {
            console.error("AI CHAT ERROR:", error);

            setState("idle");

            let fallbackMessage;

            if (error.name === "AbortError") {

                fallbackMessage =
                    currentCompanion.name === "Rei"
                        ? "Aww... that took too long to reach me. 💗 Let's try again."
                        : "Hmm... you're catching me on a slow connection. Let's try that again.";

            } else {

                // Normal connection/server failure
                fallbackMessage =
                    currentCompanion.name === "Rei"
                        ? "Oops... I can't reach my AI brain right now. 💗 Try again in a moment."
                        : "Hmm... I'm having a little trouble connecting right now. Give me a moment and try again.";
            }

            // Show a natural reaction instead of breaking silently
            expressAndSpeak("thinking", fallbackMessage);
        }
    }
}

function handleAIAction(action) {
    if (!action) return;
    if (action.type === "NAVIGATE") {
        navigateAI(action.destination);
    }
}

function searchProductsAI(query, sort) {
    if (!query) return;
    const params = new URLSearchParams();
    params.set("search", query.trim());
    if (sort) {
        params.set("sort", sort);
    }
    sessionStorage.setItem("aiNavigation", "true");
    window.location.href =
        `/homeScreens/allProducts.html?${params.toString()}`;
}

function filterProductsAI(category) {
    if (!category) return;
    const encodedCategory = encodeURIComponent(category.trim());
    sessionStorage.setItem("aiNavigation", "true");
    window.location.href =
        `/homeScreens/allProducts.html?category=${encodedCategory}`;
}

function searchStoresAI(query) {
    if (!query) return;

    const params = new URLSearchParams();
    params.set("search", query.trim());

    sessionStorage.setItem("aiNavigation", "true");

    window.location.href =
        `/stores.html?${params.toString()}`;
}

function filterStoresAI(university) {
    if (!university) return;

    const params = new URLSearchParams();
    params.set("university", university.trim());

    sessionStorage.setItem("aiNavigation", "true");

    window.location.href =
        `/stores.html?${params.toString()}`;
}

const chatManager = new ChatManager();
