window.addEventListener("DOMContentLoaded", () => {

  fetch("../../Resources/Layout/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);
    });

  fetch("../../Resources/Layout/footer.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    });

});