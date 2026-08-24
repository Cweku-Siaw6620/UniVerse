const AI_NAVIGATION = {
    home: "/index.html",
    stores: "/stores.html",
    allProducts: "/homeScreens/allProducts.html",
    featured: "/homeScreens/featured.html",
    storeDetail: "/components/displayStore.html",
    productDetail: "/components/productDetail.html"
};

function navigateAI(destination) {
    const path = AI_NAVIGATION[destination];
    if (!path) {
        console.warn("AI navigation destination not found:", destination);
        return;
    }
    window.location.href = path;
}