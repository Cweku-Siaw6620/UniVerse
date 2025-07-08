//Will use very soon.
export async function createStoreCard(userId) {
    const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        alert("User not found in localStorage. Please log in.");
        return;
     }
  try {
    const res = await fetch(`http://localhost:3000/api/stores/${userId}`);
    const store = await res.json();

    const card = document.createElement("div");
    card.className = "store-card";
    card.innerHTML = `
      <img src="${store.storeImage}" alt="${store.storeName}" />
      <h2>${store.storeName}</h2>
      <p><strong>Seller:</strong> ${store.sellerName}</p>
      <p><strong>Contact:</strong> ${store.sellerNumber}</p>
      <p>${store.storeDescription}</p>
    `;
    return card;
  } catch (err) {
    console.error("Failed to load store:", err);
  }
}
