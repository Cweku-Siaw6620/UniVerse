
class AIManager {
    async ask(message) {
        console.log("AI received:", message);

        // Fake AI for now
        return {
            text: "Hello! I'm still learning, but soon I'll be able to help you shop on UniVerse.",
            emotion: "happy",
            actions: [],
            memory: []
        };
    }
}
const aiManager = new AIManager();
