  let phoneVerified = false;
  let verifiedPhoneNumber = null;
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
  const sellerNumberInput = document.getElementById("sellerNumber");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpSection = document.getElementById("otpSection");
  const phoneOtpInput = document.getElementById("phoneOtp");
  const verifyOtpBtn = document.getElementById("verifyOtpBtn");
  const otpStatus = document.getElementById("otpStatus");

  if (!sendOtpBtn) return;

  sendOtpBtn.addEventListener("click", async function () {
    const phoneNumber = sellerNumberInput.value.trim();

    if (!phoneNumber) {
      showNotification("Please enter your phone number.", "error");
      return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";

    try {
      const response = await fetch(
        "https://api.universeweb.co/api/verification/send-phone-otp",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ phoneNumber })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showNotification(
          result.message || "Failed to send OTP.",
          "error"
        );
        sendOtpBtn.disabled = false;
        sendOtpBtn.textContent = "Verify Number";
        return;
      }

      showNotification("OTP sent to your phone.", "success");

      otpSection.classList.remove("hidden");
      sendOtpBtn.textContent = "OTP Sent";

    } catch (error) {
      console.error("Send OTP error:", error);
      showNotification("Could not send OTP. Please try again.", "error");

      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Verify Number";
    }
  });

  verifyOtpBtn.addEventListener("click", async function () {
    const phoneNumber = sellerNumberInput.value.trim();
    const otp = phoneOtpInput.value.trim();

    if (!otp || otp.length !== 6) {
      showNotification("Please enter the 6-digit OTP.", "error");
      return;
    }

    verifyOtpBtn.disabled = true;
    verifyOtpBtn.textContent = "Verifying...";

    try {
      const response = await fetch(
        "https://api.universeweb.co/api/verification/verify-phone-otp",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phoneNumber,
            otp
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        showNotification(
          result.message || "Invalid OTP.",
          "error"
        );

        verifyOtpBtn.disabled = false;
        verifyOtpBtn.textContent = "Verify";
        return;
      }

      phoneVerified = true;
      verifiedPhoneNumber = phoneNumber;

      otpStatus.textContent = "✓ Phone number verified";
      otpStatus.className = "text-sm mt-2 text-green-600 font-medium";

      sellerNumberInput.disabled = true;
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.textContent = "Verified";
      sendOtpBtn.textContent = "Number Verified";

      showNotification( "Phone number verified successfully!", "success");
    } catch (error) {
      console.error("Verify OTP error:", error);
      showNotification( "Verification failed. Please try again.", "error");
      verifyOtpBtn.disabled = false;
      verifyOtpBtn.textContent = "Verify";
    }
  });
});

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
      if (!phoneVerified) {
        showNotification("Please verify your phone number before creating your store.","error");
        return;
      }

      const formData = new FormData(storeForm);

      // DO NOT send userId anymore
      // formData.append("userId", user.id);

      createBtn.disabled = true;
      createBtn.classList.add(
        "opacity-60",
        "cursor-not-allowed",
        "blur-[1px]"
      );
      createBtn.textContent = "Creating...";

      try {
        const response = await fetch(
          "https://api.universeweb.co/api/stores",
          {
            method: "POST",
            credentials: "include",
            body: formData,
          }
        );

        const result = await response.json();

        if (response.ok) {
          showNotification("Store created successfully!", "success");

          try {
            localStorage.setItem("store", JSON.stringify(result));
          } catch (err) {
            console.error("Failed to save store to localStorage:", err);
          }

          setTimeout(
            () => (window.location.href = "dashboard.html"),
            2000
          );

        } else {
          showNotification(
            result.message || "Failed to create store.",
            "error"
          );

          createBtn.disabled = false;
          createBtn.classList.remove(
            "opacity-60",
            "cursor-not-allowed",
            "blur-[1px]"
          );
          createBtn.textContent = "Create Store";
        }

      } catch (error) {
        console.error("Store creation error:", error);

        showNotification(
          "Something went wrong. Please try again.",
          "error"
        );

        createBtn.disabled = false;
        createBtn.classList.remove(
          "opacity-60",
          "cursor-not-allowed",
          "blur-[1px]"
        );
        createBtn.textContent = "Create Store";
      }
    });
  }
});