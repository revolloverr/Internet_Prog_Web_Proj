window.addEventListener("DOMContentLoaded", () => {

  
  fetch("Resources/Layout/navbar.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);

     
      const cartLink = document.querySelector('.nav-right a[href="shoppingcart.html"]');
      if (cartLink) {
        let badge = cartLink.querySelector('.cart-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'cart-badge';
          badge.style.cssText = 'background:#e3bd5b;color:#121b42;padding:2px 6px;border-radius:12px;margin-left:6px;font-weight:700;';
          cartLink.appendChild(badge);
        }
        function updateBadge(){
          try{
            const cart = JSON.parse(localStorage.getItem('cart')||'[]');
            const total = cart.reduce((s,i)=>s+(i.qty||0),0);
            badge.textContent = total>0?total:'0';
          }catch(e){ badge.textContent = '0'; }
        }
        updateBadge();
        
        window.addEventListener('storage', updateBadge);
        
        window.addEventListener('cartChanged', updateBadge);
      }

      
      const accountLink = document.querySelector('.nav-right a[href="useraccount.html"]') || document.querySelector('.nav-right a.icon');
      const cartIconLink = document.querySelector('.nav-right a[href="shoppingcart.html"]');
      function getCookieValue(name){ const m=document.cookie.match('(^|;)\\s*'+name+'\\s*=\\s*([^;]+)'); return m?JSON.parse(decodeURIComponent(m[2])):null; }

      function updateAuthLinks(){
        try{
          const prof = getCookieValue('profile_data');
          const auth = getCookieValue('auth_token');
          if(accountLink){ accountLink.href = (prof && prof.email) ? 'useraccount.html' : 'login.html?from=account'; }
          if(cartIconLink){ cartIconLink.href = (auth && auth.token) ? 'shoppingcart.html' : 'login.html?from=cart'; }
        }catch(e){ /* ignore */ }
      }
      updateAuthLinks();
      window.addEventListener('authChanged', updateAuthLinks);

      // load search behavior after navbar is inserted
      try{
        const s = document.createElement('script');
        s.src = 'Resources/JS/search.js';
        document.body.appendChild(s);
      }catch(e){/* ignore */}

    }).catch(()=>{/* ignore */});

  fetch("Resources/Layout/footer.html")
    .then(res => res.text())
    .then(html => {
      document.body.insertAdjacentHTML("beforeend", html);
    }).catch(()=>{/* ignore */});

});