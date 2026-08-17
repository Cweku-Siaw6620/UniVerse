const menuHTML = `
<div id="companion-backdrop" class="companion-backdrop hidden"></div>

<div id="companion-menu" class="companion-menu hidden" role="dialog" aria-modal="true">
    <div class="menu-glow-aura"></div>
    <div class="menu-drag-handle"></div>
    
    <div class="menu-header">
        <div class="avatar-container">
            <div class="avatar-glow"></div>
            <img id="menu-avatar" src="../images/kal/kal_idle.png" alt="Companion Avatar">
            <span class="pulse-indicator"></span>
        </div>
        <div class="profile-meta">
            <h3 id="menu-name">Kal</h3>
            <span class="status-pill">
                <span class="dot"></span> Online
            </span>
        </div>
        <button id="close-menu-btn" class="aesthetic-close-btn" aria-label="Close menu">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    </div>

    <div class="menu-options">
        <button id="chat-btn" class="aesthetic-card">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <div class="card-text">
                <span class="title">Chat</span>
                <span class="subtitle">Start a conversation</span>
            </div>
        </button>
        
        <button id="switch-btn" class="aesthetic-card">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="card-text">
                <span class="title">Switch Companion</span>
                <span class="subtitle">Select another AI</span>
            </div>
        </button>
        
        <button class="aesthetic-card disabled" disabled>
            <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
            </div>
            <div class="card-text">
                <span class="title">Voice Chat</span>
                <span class="subtitle">Real-time speech</span>
            </div>
            <span class="glow-badge">Soon</span>
        </button>
        
        <button id="settings-btn" class="aesthetic-card">
            <div class="icon-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <div class="card-text">
                <span class="title">Settings</span>
                <span class="subtitle">Preferences & controls</span>
            </div>
        </button>
    </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", menuHTML);

const menuEl = document.getElementById("companion-menu");
const backdropEl = document.getElementById("companion-backdrop");

function openCompanionMenu() {
    if (!menuEl.classList.contains("hidden")) return;
    if (typeof currentCompanion !== "undefined") {
        document.getElementById("menu-name").textContent = currentCompanion.name;
        document.getElementById("menu-avatar").src = currentCompanion.images.idle;
    }
    updateSwitchButton();

    menuEl.classList.remove("hidden");
    backdropEl.classList.remove("hidden");
}

function closeCompanionMenu() {
    menuEl.classList.add("hidden");
    backdropEl.classList.add("hidden");
}

function updateSwitchButton() {
    const switchBtn = document.getElementById("switch-btn");
    const switchTitle = switchBtn.querySelector(".title");
    if (currentCompanion.name === "Kal") {
        switchTitle.textContent = "Switch to Rei";
    } else {
        switchTitle.textContent = "Switch to Kal";
    }
}

document.getElementById("close-menu-btn").addEventListener("click", closeCompanionMenu);
backdropEl.addEventListener("click", closeCompanionMenu);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCompanionMenu());

document.getElementById("chat-btn").addEventListener("click", () => {
    // Close the companion menu
    closeCompanionMenu();
    chatMode = true;
    // Don't create another input if one already exists
    if (document.getElementById("companion-chat-input")) {
        return;
    }
    const chatInputHTML = `
        <div id="companion-chat-input">
            <input
                type="text"
                id="companion-message-input"
                placeholder="Talk to ${currentCompanion.name}"
                autocomplete="off"
            >
            <button id="companion-action-btn" type="button">×</button>
        </div>
    `;
    document.body.insertAdjacentHTML("beforeend", chatInputHTML);

    const input = document.getElementById("companion-message-input");
    const actionButton = document.getElementById("companion-action-btn");
    input.focus();
    // Change × to ➤ when the user types
    input.addEventListener("input", () => {
        if (input.value.trim() === "") {
            actionButton.textContent = "×";
        } else {
            actionButton.textContent = "➤";
        }
    });
    // × closes the chat input
    actionButton.addEventListener("click", async () => {
        const message = input.value.trim();
        // Empty input = close chat
        if (message === "") {
            document.getElementById("companion-chat-input").remove();
            chatMode = false;
            // Restart the normal speech-bubble timer
            clearTimeout(speechBubbleTimer);
            speechBubbleTimer = setTimeout(() => {
                bubble.style.opacity = "0";
                bubble.style.transform = "translateY(10px)";
                bubble.style.visibility = "hidden";
            }, 4000);
            return;
        }
        input.value = "";
        actionButton.textContent = "×";
        await chatManager.send(message);
    });
});

document.getElementById("switch-btn").addEventListener("click", () => {
    if (currentCompanion.name === "Kal") {
        switchCompanion("rei");
    } else {
        switchCompanion("kal");
    }
    updateSwitchButton();
    closeCompanionMenu();
});