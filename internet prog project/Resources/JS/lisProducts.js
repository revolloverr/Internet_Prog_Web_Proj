const PRODUCTS_PATH = "../../data/data/products.json";
const CATEGORIES_PATH = "../../data/data/categories.xml";
const PER_PAGE = 30;

let PRODUCTS = [];
let currentPage = 1;
let selectedCategory = null;
let minPrice = 0;
let maxPrice = Infinity;
let sortMode = "az";

$(document).ready(function () {
  selectedCategory = getCategoryFromURL();
  loadProducts();
  loadCategoryFilters();

  document.getElementById("sort-select").addEventListener("change", e => {
    sortMode = e.target.value;
    applyFilters(1);
  });

  document.getElementById("apply-price").addEventListener("click", () => {
    minPrice = Number(document.getElementById("min-price").value) || 0;
    maxPrice = Number(document.getElementById("max-price").value) || Infinity;
    applyFilters(1);
  });
});

function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category");
}

function loadProducts() {
  fetch(PRODUCTS_PATH)
    .then(res => res.json())
    .then(data => {
      PRODUCTS = data;
      applyFilters(1);
    })
    .catch(err => console.error("failed to load products:", err));
}

function loadCategoryFilters() {
  $.ajax({
    url: CATEGORIES_PATH,
    dataType: "xml",
    success: function (xml) {
      const container = document.getElementById("category-filters");
      if (!container) return;

      container.innerHTML = "";

      const allLabel = document.createElement("label");
      const allInput = document.createElement("input");
      allInput.type = "radio";
      allInput.name = "category";
      allInput.checked = !selectedCategory;

      allInput.addEventListener("change", () => {
        selectedCategory = null;
        applyFilters(1);
      });

      allLabel.appendChild(allInput);
      allLabel.append(" all categories");
      container.appendChild(allLabel);

      $(xml).find("category").each(function () {
        const name = $(this).find("name").text();

        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = "radio";
        input.name = "category";
        input.value = name;
        input.checked = selectedCategory === name;

        input.addEventListener("change", () => {
          selectedCategory = name;
          applyFilters(1);
        });

        label.appendChild(input);
        label.append(" " + name);
        container.appendChild(label);
      });
    }
  });
}

function applyFilters(page) {
  let filtered = PRODUCTS.filter(p => {
    const price = Number(p.price);
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (price < minPrice || price > maxPrice) return false;
    return true;
  });

  if (sortMode === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "za") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortMode === "price-low") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortMode === "price-high") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  }

  currentPage = page;
  renderProducts(filtered);
}

function renderProducts(products) {
  const container = document.getElementById("products-container");
  const pagination = document.getElementById("pagination");

  container.innerHTML = "";

  if (!products.length) {
    container.innerHTML = "<p>No products found.</p>";
    pagination.style.display = "none";
    return;
  }

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = products.slice(start, start + PER_PAGE);

  pageItems.forEach(p => {
    container.innerHTML += `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>$${Number(p.price).toFixed(2)}</p>
        <a href="product.html?id=${p.id}">View</a>
      </div>
    `;
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  pagination.style.display = "flex";

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";

    btn.addEventListener("click", () => applyFilters(i));
    pagination.appendChild(btn);
  }
}
