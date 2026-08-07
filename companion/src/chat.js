/*
class ChatManager {
    async send(message) {
        console.log("User:", message);
        const request = {
            sessionId: sessionManager.getSessionId(),
            companion: currentCompanion.name,
            page: window.location.pathname,
            message: message
        };
        const response = await fetch("http://localhost:5000/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(request)
        });
        const data = await response.json();
        console.log(data);
    }

}

const chatManager = new ChatManager();
*/