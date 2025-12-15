$(document).ready(function () {
  loadCategories();
});

function loadCategories() {
  $.ajax({
    url: "../../data/data/categories.xml",
    dataType: "xml",
    success: function (xmlData) {

      const grid = document.getElementById("categoryGrid");
      if (!grid) return;

      grid.innerHTML = "";

      $(xmlData).find("category").each(function () {
        const name = $(this).find("name").text();
        const imagePath = $(this).find("image").text();
        const slug = encodeURIComponent(name);

        grid.innerHTML += `
          <a href="productList.html?category=${slug}" class="category-card">
            <img src="${imagePath}" alt="${name}">
            <span>${name}</span>
          </a>
        `;
      });
    },
    error: function () {
      console.error("failed to load categories.xml");
    }
  });
}
