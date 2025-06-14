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

  
    // Toggle dropdown function
    function toggleDropdown() {
      const dropdown = document.getElementById('checkboxMenu');
      const chevron = document.querySelector('.dropdown-btn i');
      
      dropdown.classList.toggle('hidden');
      chevron.classList.toggle('transform');
      chevron.classList.toggle('rotate-180');
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
      const dropdown = document.getElementById('checkboxMenu');
      const dropdownBtn = document.querySelector('.dropdown-btn');
      
      if (!dropdown.contains(event.target) && !dropdownBtn.contains(event.target)) {
        dropdown.classList.add('hidden');
        document.querySelector('.dropdown-btn i').classList.remove('transform', 'rotate-180');
      }
    });
    
    // Add item field
    function addItem() {
      const container = document.getElementById('itemsContainer');
      const newItem = document.createElement('div');
      newItem.className = 'relative';
      newItem.innerHTML = `
        <input type="text" name="items[]" placeholder="e.g., Laptops, Clothing, Electronics" 
               class="item-input w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200">
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <i class="fas fa-tags text-gray-400"></i>
        </div>
      `;
      container.appendChild(newItem);
    }
    
    // Remove item field
    function removeItem() {
      const container = document.getElementById('itemsContainer');
      if (container.children.length > 1) {
        container.removeChild(container.lastChild);
      }
    }
   
  document.addEventListener("DOMContentLoaded", function () {
  const storeForm = document.getElementById('storeForm');

  if (storeForm) {
    storeForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User not found in localStorage. Please log in.");
        return;
      }

      const formData = new FormData(storeForm); // ✅ grab everything
      formData.append("userId", user.id);       // ✅ add user ID manually

      try {
        const response = await fetch("http://localhost:3000/api/stores", {
          method: "POST",
           body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          alert("Store created successfully!");
          window.location.href = `dashboard.html`;
        } else {
          alert(result.message || "Failed to create store.");
        }
      } catch (error) {
        console.error("Store creation error:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  }
});
