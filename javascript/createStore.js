/*function addItem() {
    const container = document.getElementById("itemsContainer");
    const input = document.createElement("input");
    input.type = "text";
    input.name = "items[]";
    input.placeholder = "e.g., More products...";
    input.className = "item-input";
    container.appendChild(input);
  };

  function removeItem() {
    const container = document.getElementById("itemsContainer");
    const inputs = container.querySelectorAll("input");
    
    if (inputs.length > 1) {
      container.removeChild(inputs[inputs.length - 1]);
    }
  };

  function toggleDropdown() {
    const menu = document.getElementById("checkboxMenu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  }
  
  document.addEventListener("click", function(event) {
    const dropdown = document.querySelector(".dropdown");
    if (!dropdown.contains(event.target)) {
      document.getElementById("checkboxMenu").style.display = "none";
    }
  });

  //handling the createStore button
  document.getElementById('storeForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const storeName = document.getElementById('storeName').value;
    const storeDescription = document.getElementById('storeDescription').value;
    const sellerName = document.getElementById('sellerName').value;
    const password = document.getElementById('password').value;
    const storeLogo = document.getElementById('storeName').value;
    const sellerNumber = document.getElementById('sellerNumber').value;
  
    // Collect all items
    const items = Array.from(document.querySelectorAll('input[name="items[]"]'))
                       .map(input => input.value)
                       .filter(val => val.trim() !== "");

    const checkedRegions = Array.from(document.querySelectorAll('input[name="regions"]:checked'))
                                .map(input => input.value);


    const storeData = {
      storeName,
      sellerName,
      password,
      storeLogo,
      sellerNumber,
      storeDescription,
      items,
      checkedRegions
      // Store logo will not be stored in localStorage directly
      // Consider uploading it or previewing it on this page only
    };
  
    localStorage.setItem('storeData', JSON.stringify(storeData));
  
    // Redirect to next page
    window.location.href = 'addProducts.html';
  });
  */

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
    
    // Form submission
    document.addEventListener("DOMContentLoaded", function () {
  const storeForm = document.getElementById('storeForm');

  if (storeForm) {
    storeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      // Your form submission logic here


    const storeName = document.getElementById('storeName').value;
    const storeDescription = document.getElementById('storeDescription').value;
    const sellerName = document.getElementById('sellerName').value;
    const storeLogo = document.getElementById('storeLogo').value;
    const sellerNumber = document.getElementById('sellerNumber').value;
  
    // Collect all items
    const items = Array.from(document.querySelectorAll('input[name="items[]"]'))
                       .map(input => input.value)
                       .filter(val => val.trim() !== "");

    const checkedRegions = Array.from(document.querySelectorAll('input[name="regions"]:checked'))
                                .map(input => input.value);


    const storeData = {
      storeName,
      sellerName,
      storeLogo,
      sellerNumber,
      storeDescription,
      items,
      checkedRegions
      // Store logo will not be stored in localStorage directly
      // Consider uploading it or previewing it on this page only
    };
  
    localStorage.setItem('storeData', JSON.stringify(storeData));
  
    // Redirect to next page
    window.location.href = 'dashboard.html';
      // Here you would normally handle the form submission
  

          });
  }
    });
  