function addItem() {
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