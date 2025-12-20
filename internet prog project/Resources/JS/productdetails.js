const PRODUCTS_PATH = "data/data/products.json";

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function loadProduct() {
  const id = getQueryParam('id');
  if (!id) return renderNotFound();

  fetch(PRODUCTS_PATH)
    .then(r => r.json())
    .then(products => {
      const p = products.find(x => String(x.id) === String(id));
      if (!p) return renderNotFound();
      renderProduct(p, products);
    })
    .catch(err => {
      console.error('Failed to load products', err);
      renderNotFound();
    });
}

function renderNotFound() {
  document.getElementById('product-title').textContent = 'Product not found';
}

function renderProduct(product, allProducts) {
  const titleEl = document.getElementById('product-title');
  const descEl = document.getElementById('product-description');
  const priceEl = document.getElementById('product-price');
  const skuEl = document.getElementById('product-sku');
  const availEl = document.getElementById('product-availability');
  if(titleEl) titleEl.textContent = product.name;
  if(descEl) descEl.innerHTML = `<p>${product.description || ''}</p>`;
  if(priceEl) priceEl.textContent = `$${Number(product.price).toFixed(2)}`;
  if(skuEl) skuEl.textContent = product.sku || product.id || '-';
  if(availEl) availEl.textContent = product.stock && product.stock>0 ? 'In Stock' : 'Out of Stock';

  const mainImg = document.getElementById('main-product-image');
  if (mainImg && product.image) mainImg.src = product.image;

  const thumbs = document.getElementById('thumbnail-grid');
  if (thumbs) thumbs.innerHTML = '';

  const images = [];
  if (Array.isArray(product.images)) images.push(...product.images);
  if (product.image) images.push(product.image);
  const seen = new Set();
  images.forEach(src => {
    if (!src) return;
    if (seen.has(src)) return; 
    seen.add(src);
    const img = document.createElement('img');
    img.src = src + "?id=" + product.id;
    img.className = 'thumb';
    img.onclick = () => { if(mainImg) mainImg.src = src; };
    if(thumbs) thumbs.appendChild(img);
  });


  const avg = product.rating || (product.reviews ? (product.reviews.reduce((s,r)=>s+(r.rating||0),0)/product.reviews.length) : 0);
  const avgEl = document.getElementById('average-rating');
  if(avgEl) avgEl.textContent = avg ? avg.toFixed(1) : '0.0';


  fetch('data/data/reviews.json').then(r=>r.json()).then(allReviews=>{
   
    const entry = allReviews.find(e=>String(e.product_id)===String(product.id));
    const reviewsFor = entry && Array.isArray(entry.reviews) ? entry.reviews : [];
    
    const mapped = reviewsFor.map(rv=>({ author: rv.user||rv.author, rating: rv.rating, comment: rv.comment||rv.text||rv.title }));
    renderReviews(mapped);
  }).catch(()=>{
    
    const fallback = (product.reviews||[]).map(rv=>({ author: rv.user||rv.author, rating: rv.rating, comment: rv.comment||rv.text||rv.title }));
    renderReviews(fallback);
  });

  const relContainer = document.getElementById('related-products');
  if(relContainer){
    relContainer.innerHTML = '';
    const related = allProducts.filter(p=>String(p.category).trim().toLowerCase() === String(product.category).trim().toLowerCase() && String(p.id)!==String(product.id)).slice(0,6);
    related.forEach(rp=>{
      const card = document.createElement('div');
      card.className = 'related-card';
      card.innerHTML = `
        <img src="${rp.image}?id=${rp.id} alt="${rp.name}">
        <h4>${rp.name}</h4>
        <div>$${Number(rp.price).toFixed(2)}</div>
        <a href="pdp.html?id=${rp.id}">View</a>
      `;
      relContainer.appendChild(card);
    });
  }

  const input = document.getElementById('quantity-input');
  const dec = document.getElementById('qty-decrease');
  const inc = document.getElementById('qty-increase');
  dec.onclick = () => { if (+input.value>1) input.value = +input.value-1; };
  inc.onclick = () => { input.value = +input.value+1; };


  document.getElementById('add-to-cart-btn').onclick = () => {
    addToCart(product.id, +input.value);
    alert('Added to cart');
  };
}

function renderReviews(reviews) {
  const list = document.getElementById('reviews-list');
  list.innerHTML = '';
  if (!reviews || !reviews.length) {
    list.innerHTML = '<p>No reviews yet.</p>';
    return;
  }
  reviews.forEach(r=>{
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `<strong>${r.author||'Anonymous'}</strong> <span class="rating">${r.rating||0}/5</span><p>${r.comment||''}</p>`;
    list.appendChild(div);
  });
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')||'[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(productId, qty) {
  const cart = getCart();
  const item = cart.find(i=>String(i.id)===String(productId));
  if (item) item.qty = (item.qty||0)+qty; else cart.push({id:productId, qty});
  saveCart(cart);
  try{ window.dispatchEvent(new CustomEvent('cartChanged')); }catch(e){}
}

if (document.body && document.body.classList) {
  document.addEventListener('DOMContentLoaded', loadProduct);
}
