const PRODUCTS_PATH = "data/data/products.json";

function formatMoney(n){return `$${Number(n).toFixed(2)}`}

function getCart(){return JSON.parse(localStorage.getItem('cart')||'[]');}
function saveCart(c){localStorage.setItem('cart', JSON.stringify(c));}

function findProductById(products, id){return products.find(p=>String(p.id)===String(id));}

function renderCartPage(){
  fetch(PRODUCTS_PATH).then(r=>r.json()).then(products=>{
    const cart = getCart();
    const root = document.querySelector('#cart-root') || document.querySelector('main');
    if(!root) return;
    root.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'container-product';

    const list = document.createElement('div');
    list.className = 'cart-list';

    if(cart.length===0){
      list.innerHTML = '<p>Your cart is empty. <a href="productList.html">Browse products</a></p>';
    }

    cart.forEach(item=>{
      const prod = findProductById(products, item.id) || {name:'(missing)', price:0, image:''};
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <img src="${prod.image}" class="cart-img">
        <div class="cart-title">${prod.name}</div>
        <div class="cart-price">${formatMoney(prod.price)}</div>
        <div class="cart-qty"><button class="dec">-</button><input type="number" value="${item.qty}" min="1" class="qty-input"><button class="inc">+</button></div>
        <button class="remove">Remove</button>
      `;
      
      row.querySelector('.dec').onclick = ()=>{ changeQty(item.id, Math.max(1, +row.querySelector('.qty-input').value-1)); };
      row.querySelector('.inc').onclick = ()=>{ changeQty(item.id, +row.querySelector('.qty-input').value+1); };
      row.querySelector('.qty-input').onchange = (e)=>{ changeQty(item.id, +e.target.value); };
      row.querySelector('.remove').onclick = ()=>{ removeItem(item.id); };

      list.appendChild(row);
    });

    container.appendChild(list);

    const summary = document.createElement('div');
    summary.className = 'cart-summary';
    summary.innerHTML = `
      <div>Subtotal: <span id="subtotal">${formatMoney(0)}</span></div>
      <div>Tax (8%): <span id="tax">${formatMoney(0)}</span></div>
      <div>Total: <strong id="total">${formatMoney(0)}</strong></div>
      <a href="productList.html">Continue shopping</a>
      <button id="to-checkout">Proceed to checkout</button>
    `;
    container.appendChild(summary);

    root.appendChild(container);
    updateSummary();

   
    if(cart.length>0 && list.children.length===0){
      const dbg = document.createElement('pre');
      dbg.style.padding='12px'; dbg.style.background='#fee'; dbg.textContent = 'Cart data:\n'+JSON.stringify(cart, null, 2);
      root.appendChild(dbg);
    }

    const toCheckout = document.getElementById('to-checkout');
    if(toCheckout) toCheckout.onclick = ()=>{ window.location.href = 'checkout.html'; };

  }).catch(err=>{console.error(err); const root = document.querySelector('#cart-root') || document.querySelector('main'); if(root) root.textContent='Failed to load cart';});
}

function changeQty(id, qty){
  const cart = getCart();
  const it = cart.find(i=>String(i.id)===String(id));
  if(!it) return;
  it.qty = qty;
  saveCart(cart);
  renderCartPage();
  window.dispatchEvent(new CustomEvent('cartChanged'));
}

function removeItem(id){
  let cart = getCart();
  cart = cart.filter(i=>String(i.id)!==String(id));
  saveCart(cart);
  renderCartPage();
  window.dispatchEvent(new CustomEvent('cartChanged'));
}

function updateSummary(){
  fetch(PRODUCTS_PATH).then(r=>r.json()).then(products=>{
    const cart = getCart();
    let subtotal = 0;
    cart.forEach(i=>{ const p = findProductById(products,i.id); if(p) subtotal += Number(p.price)*i.qty; });
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const s = document.getElementById('subtotal');
    const t = document.getElementById('tax');
    const to = document.getElementById('total');
    if(s) s.textContent = formatMoney(subtotal);
    if(t) t.textContent = formatMoney(tax);
    if(to) to.textContent = formatMoney(total);
  });
}


function renderCheckoutPage(){
  fetch(PRODUCTS_PATH).then(r=>r.json()).then(products=>{
    const main = document.querySelector('main');
    main.innerHTML = '';
    const cart = getCart();
    const summary = document.createElement('div');
    summary.className = 'checkout-wrap';
    summary.innerHTML = `
      <h2>Checkout</h2>
      <form id="checkout-form">
        <label>Name<input name="name" required></label>
        <label>Email<input name="email" type="email" required></label>
        <label>Phone<input name="phone" required></label>
        <label>Address<textarea name="address" required></textarea></label>
        <label>Delivery<option><select name="delivery"><option value="standard">Standard</option><option value="express">Express</option></select></label>
        <div id="checkout-summary"></div>
        <button type="submit">Place Order</button>
      </form>
    `;
    main.appendChild(summary);

    const cs = document.getElementById('checkout-summary');
    let subtotal = 0;
    cart.forEach(i=>{ const p=findProductById(products,i.id); if(p) subtotal += Number(p.price)*i.qty; });
    const tax = subtotal*0.08;
    cs.innerHTML = `<div>Items: ${cart.length}</div><div>Subtotal: ${formatMoney(subtotal)}</div><div>Tax: ${formatMoney(tax)}</div><div>Total: ${formatMoney(subtotal+tax)}</div>`;

    document.getElementById('checkout-form').onsubmit = function(e){
      e.preventDefault();
      const form = e.target;
      if(!form.checkValidity()) { alert('Please fill required fields'); return; }
      const order = {
        id: 'ORD' + Date.now(),
        date: new Date().toISOString(),
        items: cart,
        customer: {name:form.name.value, email:form.email.value, phone:form.phone.value, address:form.address.value},
        totals: {subtotal:subtotal, tax:tax, total:subtotal+tax}
      };
      localStorage.setItem('lastOrder', JSON.stringify(order));
      localStorage.removeItem('cart');
      window.location.href = 'orderconfirmation.html';
    };
  });
}

function renderConfirmationPage(){
  const data = JSON.parse(localStorage.getItem('lastOrder')||'null');
  const main = document.querySelector('body');
  if(!data){ document.body.innerHTML = '<p>No order found.</p>'; return; }
  document.body.innerHTML = `
    <main class="order-confirm">
      <div class="confirm-card">
        <h1>Thank you!</h1>
        <p>Your order has been placed.</p>
        <span class="order-id">${data.id}</span>
        <div class="summary">
          <div>Items: ${data.items.length}</div>
          <div>Subtotal: ${formatMoney(data.totals.subtotal)}</div>
          <div>Tax: ${formatMoney(data.totals.tax)}</div>
          <div>Total: ${formatMoney(data.totals.total)}</div>
        </div>
        <p style="margin-top:12px;"><a href="home.html">Return to Home</a></p>
      </div>
    </main>
  `;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const p = location.pathname.toLowerCase();

  if (document.querySelector('#cart-root') || p.endsWith('shoppingcart.html')) renderCartPage();
  if (p.endsWith('checkout.html')) renderCheckoutPage();
  if (p.endsWith('orderconfirmation.html')) renderConfirmationPage();

  window.addEventListener('cartChanged', renderCartPage);
});
