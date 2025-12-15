const PRODUCTS_PATH = "data/data/products.json";
const PER_PAGE = 15;
let PRODUCTS = [];
let currentPage = 1;

let initialCategory = null;

//url per category thing

function getUrlCategoryOnce() {
  if (initialCategory !== null) return null;

  const params = new URLSearchParams(window.location.search);
  const cat = params.get("category");

  if (cat) {
    initialCategory = cat;
    history.replaceState({}, "", "products.html");
    return cat;
  }

  return null;
}

// featured products
fetch(PRODUCTS_PATH)
  .then(res => res.json())
  .then(data => {

    PRODUCTS = data;

    if (document.getElementById("featuredProducts")) {
      renderFeatured(PRODUCTS);
    }

    if (document.getElementById("productList")) {
      hookFilters();
      renderProductsPage(1);
    }
  })
  .catch(err => console.error("Failed to load products:", err));

//create the feature product box
function createProductCard(product) {
  return `
    <div class="card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p><strong>$${Number(product.price).toFixed(2)}</strong></p>
      <p style="font-size:12px;color:#666;">${product.category}</p>
      <a href="product.html?id=${product.id}" class="btn">View</a>
    </div>
  `;
}

//feature product in home
function renderFeatured(products) {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  container.innerHTML = "";
  products.slice(0, 5).forEach(p => {
    container.innerHTML += createProductCard(p);
  });
}

