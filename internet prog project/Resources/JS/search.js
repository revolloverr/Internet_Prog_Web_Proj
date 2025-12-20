(function(){
  const PRODUCTS_PATH = 'data/data/products.json';
  let PRODUCTS = [];

  function escapeRegExp(s){
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(text, query){
    if(!query) return text;
    try{
      const re = new RegExp('('+escapeRegExp(query)+')','ig');
      return text.replace(re, '<mark class="search-highlight">$1</mark>');
    }catch(e){ return text; }
  }

  function init(){
    try{ console.debug('search.js: init'); }catch(e){}
    const input = document.querySelector('.search-input');
    if(!input){
      const obs = new MutationObserver((m, o) => {
        const el = document.querySelector('.search-input');
        if(el){ o.disconnect(); setTimeout(init, 0); }
      });
      obs.observe(document.body, { childList:true, subtree:true });
      return;
    }

    const navRight = document.querySelector('.nav-right');
    if(navRight) navRight.style.position = navRight.style.position || 'relative';

    const suggBox = document.createElement('div');
    suggBox.className = 'search-suggestions';
    suggBox.style.display = 'none';
    navRight.appendChild(suggBox);

    let debounceTimer = null;

    input.addEventListener('input', e => {
      clearTimeout(debounceTimer);
      const q = e.target.value.trim();
      debounceTimer = setTimeout(()=> updateSuggestions(q), 180);
    });

    input.addEventListener('keydown', e => {
      if(e.key === 'Enter'){
        const q = input.value.trim();
        if(q) window.location.href = 'productList.html?search=' + encodeURIComponent(q);
      }
    });

    suggBox.addEventListener('click', e => {
      const it = e.target.closest('.search-suggestion-item');
      if(it){
        const id = it.dataset.id;
        if(id){
          window.location.href = 'pdp.html?id=' + encodeURIComponent(id);
          return;
        }
        const q = it.dataset.q || it.textContent.trim();
        window.location.href = 'productList.html?search=' + encodeURIComponent(q);
      }
    });

    document.addEventListener('click', e => {
      if(!suggBox.contains(e.target) && e.target !== input){
        suggBox.style.display = 'none';
      }
    });

    fetch(PRODUCTS_PATH).then(r=>r.json()).then(d=>{ PRODUCTS = d || []; }).catch(()=>{ PRODUCTS = []; });

    function updateSuggestions(q){
      if(!q){ suggBox.style.display = 'none'; suggBox.innerHTML = ''; return; }
      const low = q.toLowerCase();
      const matches = PRODUCTS.filter(p => (p.name && p.name.toLowerCase().includes(low)) || (p.category && p.category.toLowerCase().includes(low))).slice(0,6);
      if(!matches.length){ suggBox.innerHTML = '<div class="no-results">No matches</div>'; suggBox.style.display = 'block'; return; }
      suggBox.innerHTML = '';
      matches.forEach(p => {
        const div = document.createElement('div');
        div.className = 'search-suggestion-item';
        div.dataset.q = q;
        div.dataset.id = p.id;
        const img = document.createElement('img');
        img.src = (p.image||'') + '?id=' + p.id;
        img.alt = '';
        div.appendChild(img);
        const meta = document.createElement('div');
        meta.className = 'meta';
        const name = document.createElement('div');
        name.className = 'name';
        name.innerHTML = highlight(p.name || '', q);
        const cat = document.createElement('div');
        cat.className = 'cat';
        cat.textContent = p.category || '';
        meta.appendChild(name);
        meta.appendChild(cat);
        div.appendChild(meta);
        suggBox.appendChild(div);
      });
      suggBox.style.display = 'block';
    }
  }

  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 20));
  } else {
    setTimeout(init, 20);
  }
})();
