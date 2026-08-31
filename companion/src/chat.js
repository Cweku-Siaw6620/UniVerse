class ChatManager {
    async send(message) {
        //console.log("User:", message);
        setState("thinking");
        setExpression("thinking");

        const request = {
            sessionId: sessionManager.getSessionId(),
            companion: currentCompanion.name,
            page: window.location.pathname,
            message: message
        };
        const response = await fetch(
            "https://api.universeweb.co/api/ai/chat",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(request)
            }
        );
        const data = await response.json();

        // Kal/Rei speaks
        setState("idle");
        console.log("AI RESPONSE:", data);
        expressAndSpeak(
            data.emotion || "happy",
            data.text
        );

        // Handle AI action
        if (data.action) {
            if (data.action.type === "NAVIGATE") {
                handleAIAction(data.action);
            }
            if (data.action.type === "SEARCH_PRODUCTS") {
                searchProductsAI(data.action.query, data.action.sort);
            }
            if (data.action.type === "FILTER_PRODUCTS") {
                filterProductsAI(data.action.category);
            }
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

const chatManager = new ChatManager();
