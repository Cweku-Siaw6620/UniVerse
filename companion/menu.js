/*
const menuHTML = `
<!-- Companion Menu -->
<div id="companion-menu" class="companion-menu hidden">

    <div class="menu-header">
        <img id="menu-avatar" src="../images/kal/kal_idle.png" alt="Companion">
        <div>
            <h3 id="menu-name">Kal</h3>
            <span class="menu-status">● Online</span>
        </div>
    </div>

    <div class="menu-options">
        <button id="chat-btn">
            💬 Chat
        </button>
        <button id="switch-btn">
            👥 Switch Companion
        </button>
        <button disabled>
            🎤 Voice (Coming Soon)
        </button>
        <button id="settings-btn">
            ⚙️ Settings
        </button>
        <button id="close-menu-btn">
            ✖ Close
        </button>
    </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", menuHTML);

function openCompanionMenu(companion){
    document.getElementById("companion-menu").classList.remove("hidden");
    document.getElementById("menu-name").textContent = companion.name;
    document.getElementById("menu-avatar").src = companion.images.idle;
}

function closeCompanionMenu(){
    document.getElementById("companion-menu").classList.add("hidden");
}
*/