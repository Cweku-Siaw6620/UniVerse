/*
class SessionManager {
    constructor() {
        this.storageKey = "universe-ai-session";
    }
    getSessionId() {
        let sessionId = sessionStorage.getItem(this.storageKey);
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(this.storageKey, sessionId);
        }
        return sessionId;
    }
}
const sessionManager = new SessionManager();

window.sessionManager = sessionManager;
*/