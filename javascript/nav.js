  document.addEventListener('DOMContentLoaded', async function () {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user && user.picture) {
      const nav = document.querySelector('nav');
      const loginLink = nav.querySelector('a[href*="login.html"]');

      // Create wrapper for profile & dropdown
      const profileWrapper = document.createElement("div");
      profileWrapper.className = "relative";

      // Create profile image
      const profileImg = document.createElement("img");
      profileImg.src = user.picture;
      profileImg.alt = user.name;
      profileImg.title = user.name;
      profileImg.className = "h-10 w-10 rounded-full object-cover cursor-pointer";

      // Create dropdown menu
      const dropdown = document.createElement("div");
      dropdown.className = "hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50";

      // Fetch whether user has a store
      let hasStore = false;
      try {
        const res = await fetch(`http://localhost:3000/api/stores/${encodeURIComponent(user.id)}/exists`);
        const result = await res.json();
        hasStore = result.hasStore;
      } catch (err) {
        console.error("Failed to check store existence:", err);
      }

      // Dropdown menu HTML
      dropdown.innerHTML = `
        <a href="${hasStore ? '/components/dashboard.html' : '/components/createStore.html'}"  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
          ${hasStore ?  "Open Store" :"Create Your Store"}
        </a>
        <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
          Logout
        </button>
      `;

      // Show/hide dropdown on click
      profileImg.addEventListener('click', () => {
        dropdown.classList.toggle('hidden');
      });

      // Handle logout
      dropdown.querySelector('#logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = './components/login.html';
      });

      profileWrapper.appendChild(profileImg);
      profileWrapper.appendChild(dropdown);

      if (loginLink) {
        loginLink.replaceWith(profileWrapper);
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!profileWrapper.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      });
    }
  });


