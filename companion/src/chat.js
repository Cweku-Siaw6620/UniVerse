
class ChatManager {
    async send(message) {
        console.log("User:", message);

        const request = {
            sessionId: sessionManager.getSessionId(),
            companion: currentCompanion.name,
            page: window.location.pathname,
            message: message
        };

        const response = await fetch(
            "https://uni-verse-api.vercel.app/api/ai/chat",
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
        expressAndSpeak("happy", data.text);

        // Handle AI action
        if (data.action) {
            handleAIAction(data.action);
        }
    }
}

function handleAIAction(action) {

    if (!action) return;

    if (action.type === "NAVIGATE") {
        navigateAI(action.destination);
    }
}

const chatManager = new ChatManager();
