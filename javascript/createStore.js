  //Logo Handling
  document.addEventListener("DOMContentLoaded", function () {
  const storeLogoInput = document.getElementById('storeLogo');
  const preview = document.getElementById('logoPreview');

  if (storeLogoInput && preview) {
    storeLogoInput.addEventListener('change', function (event) {
      const file = event.target.files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.classList.remove('hidden');
        };

        reader.readAsDataURL(file);
      } else {
        preview.src = '';
        preview.classList.add('hidden');
      }
    });
  }
});

// ✅ Toast Notification Utility
function showNotification(message, type = "success") {
  const existingToast = document.querySelector(".toast");
  if (existingToast) existingToast.remove(); // remove existing toasts

  const toast = document.createElement("div");
  toast.className = `
    toast fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-white 
    ${type === "success" ? "bg-green-600" : "bg-red-600"} 
    flex items-center space-x-2 animate-fade-in-up
  `;
  toast.innerHTML = `
    <i class="fa-solid ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  // remove after 4 seconds
  setTimeout(() => toast.remove(), 4000);
}


document.addEventListener("DOMContentLoaded", function () {
  const storeForm = document.getElementById("storeForm");
  const createBtn = document.querySelector("#storeForm button[type='submit']");

  if (storeForm) {
    storeForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      let user = null;
      try {
        const userData = localStorage.getItem("user");
        user = userData ? JSON.parse(userData) : null;
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
      
      if (!user || !user.id) {
        showNotification("User not found. Please log in first.", "error");
        window.location.href = "/components/login.html";
        return;
      }

      const formData = new FormData(storeForm);
      formData.append("userId", user.id);

      // ✅ Disable and blur the button
      createBtn.disabled = true;
      createBtn.classList.add("opacity-60", "cursor-not-allowed", "blur-[1px]");
      createBtn.textContent = "Creating...";

      try {
        const response = await fetch("https://universe-api-u0rj.onrender.com/api/stores", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          showNotification("Store created successfully!", "success");
          try {
            localStorage.setItem("store", JSON.stringify(result));
          } catch (err) {
            console.error("Failed to save store to localStorage:", err);
          }

          // ✅ Keep button blurred until redirect
          setTimeout(() => (window.location.href = "dashboard.html"), 2000);
        } else {
          showNotification(result.message || "Failed to create store.", "error");
          // ✅ Re-enable if failed
          createBtn.disabled = false;
          createBtn.classList.remove("opacity-60", "cursor-not-allowed", "blur-[1px]");
          createBtn.textContent = "Create Store";
        }
      } catch (error) {
        console.error("Store creation error:", error);
        showNotification("Something went wrong. Please try again.", "error");

        // ✅ Re-enable on error
        createBtn.disabled = false;
        createBtn.classList.remove("opacity-60", "cursor-not-allowed", "blur-[1px]");
        createBtn.textContent = "Create Store";
      }
    });
  }
});