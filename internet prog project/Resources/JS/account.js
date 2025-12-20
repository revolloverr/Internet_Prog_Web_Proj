
(function(){
  const API_LOGIN = 'https://reqres.in/api/login';
  const API_REGISTER = 'https://reqres.in/api/register';
  const API_USER = 'https://reqres.in/api/users/2';

  function setCookie(name, value, days){
    const d = new Date(); d.setTime(d.getTime() + (days||7)*24*60*60*1000);
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) + ';path=/;expires=' + d.toUTCString();
  }
  function getCookie(name){
    const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? JSON.parse(decodeURIComponent(m[2])) : null;
  }
  function eraseCookie(name){ document.cookie = name+'=; Max-Age=0; path=/'; }

  function el(html){ const div=document.createElement('div'); div.innerHTML=html.trim(); return div.firstChild; }

  function renderRoot(){
    const main = document.querySelector('main');
    main.innerHTML = '';
    const path = (location.pathname||'').toLowerCase();
    const mainWrap = document.createElement('div');
    mainWrap.className = 'account-wrap';

   
    if (path.endsWith('login.html')){
      mainWrap.innerHTML = `
        <div class="account-card">
          <nav class="account-tabs">
            <button data-view="login" class="tab-btn">Login</button>
            <button data-view="register" class="tab-btn">Register</button>
          </nav>
          <div id="account-content"></div>
        </div>`;
      main.appendChild(mainWrap);
      mainWrap.querySelectorAll('.tab-btn').forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));
     
      const params = new URLSearchParams(location.search);
      const fromAccount = params.get('from') === 'account';
      const registered = getCookie('profile_data');
      if(fromAccount || !registered){
       
        const banner = document.createElement('div');
        banner.className = 'account-alert';
        banner.textContent = 'You are not logged in — please login or register to view your account.';
        main.insertBefore(banner, main.firstChild);
      }
      showView('login');
      return;
    }

   
    if (path.endsWith('useraccount.html')){
      mainWrap.innerHTML = `
        <div class="account-card">
          <div id="account-content"></div>
        </div>`;
      main.appendChild(mainWrap);
      showView('profile');
      return;
    }

    mainWrap.innerHTML = `
      <div class="account-card">
        <nav class="account-tabs">
          <button data-view="login" class="tab-btn">Login</button>
          <button data-view="register" class="tab-btn">Register</button>
          <button data-view="profile" class="tab-btn">Profile</button>
        </nav>
        <div id="account-content"></div>
      </div>`;
    main.appendChild(mainWrap);
    mainWrap.querySelectorAll('.tab-btn').forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));
    const token = getCookie('auth_token');
    showView(token ? 'profile' : 'login');
  }

  function showView(name){
    const content = document.getElementById('account-content');
    if(!content) return;
    content.innerHTML = '';
    if(name === 'login') return renderLogin(content);
    if(name === 'register') return renderRegister(content);
    if(name === 'profile') return renderProfile(content);
  }

  function renderLogin(root){
    root.innerHTML = `
      <h2>Login</h2>
      <form id="login-form" class="account-form">
        <label>Email<input name="email" type="email" required></label>
        <label>Password<input name="password" type="password" required></label>
        <div class="form-actions"><button type="submit" class="primary">Sign in</button></div>
        <div class="account-msg" id="login-msg"></div>
      </form>
    `;
    const form = document.getElementById('login-form');
    form.onsubmit = function(e){
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value;
      if(!email || !password) return showMsg('login-msg','Please fill both fields');
     
      const registered = getCookie('profile_data');
      if(!registered || String(registered.email).toLowerCase() !== String(email).toLowerCase()){
        return showMsg('login-msg','No account found. Please register first.');
      }
      if(registered.password !== password){
        return showMsg('login-msg','Invalid credentials');
      }
     
      const savedAuth = getCookie('auth_token');
      const token = savedAuth && savedAuth.token ? savedAuth.token : ('mock-' + Date.now());
      setCookie('auth_token', { token: token, email: registered.email }, 7);
      showMsg('login-msg','Login successful');
      window.dispatchEvent(new Event('authChanged'));
      setTimeout(()=> showView('profile'), 400);
    };
  }

  function renderRegister(root){
    root.innerHTML = `
      <h2>Register</h2>
      <form id="register-form" class="account-form">
        <label>Name<input name="name" required></label>
        <label>Email<input name="email" type="email" required></label>
        <label>Phone<input name="phone" type="tel"></label>
        <label>Password<input name="password" type="password" required></label>
        <label>Confirm Password<input name="confirm" type="password" required></label>
        <div class="form-actions"><button type="submit" class="primary">Create account</button></div>
        <div class="account-msg" id="register-msg"></div>
      </form>
    `;
    const form = document.getElementById('register-form');
    form.onsubmit = function(e){
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const phone = form.phone.value.trim();
      const password = form.password.value;
      const confirm = form.confirm.value;
      if(!name||!email||!password) return showMsg('register-msg','Please fill required fields');
      if(password !== confirm) return showMsg('register-msg','Passwords do not match');
      
      const profile = { name: name, email: email, phone: phone, password: password };
      setCookie('profile_data', profile, 365);
      
      fetch(API_REGISTER, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email, password}) })
        .then(r=>r.json().then(j=>({ok:r.ok, body:j})))
        .then(res=>{
          
          const token = (res.ok && res.body && res.body.token) ? res.body.token : ('mock-' + Date.now());
          setCookie('auth_token', { token: token, email }, 7);
          window.dispatchEvent(new Event('authChanged'));
        }).catch(()=>{
          setCookie('auth_token', { token: ('mock-' + Date.now()), email }, 7);
          window.dispatchEvent(new Event('authChanged'));
        }).finally(()=>{
          showMsg('register-msg','Registration saved (local).');
          setTimeout(()=> showView('profile'), 400);
        });
    };
  }

  function renderProfile(root){
    const auth = getCookie('auth_token');
    const stored = getCookie('profile_data');
    root.innerHTML = '<h2>Profile</h2>';
    const box = document.createElement('div');
    box.className = 'profile-card';
    box.innerHTML = `<div class="profile-body">Loading...</div>`;
    root.appendChild(box);

    function showProfile(data){
      const name = escapeHtml(data.name || data.first_name || '');
      const email = escapeHtml(data.email || '');
      const phone = escapeHtml(data.phone || '');
      box.innerHTML = `
        <div class="profile-body">
          <div><strong>Name:</strong> <span class="profile-val">${name}</span></div>
          <div><strong>Email:</strong> <span class="profile-val">${email}</span></div>
          <div><strong>Phone:</strong> <span class="profile-val">${phone}</span></div>
          <div style="margin-top:12px;"><button id="logout" class="primary">Logout</button></div>
        </div>
      `;
      document.getElementById('logout').onclick = function(e){ e.preventDefault(); eraseCookie('auth_token'); eraseCookie('profile_data'); window.dispatchEvent(new Event('authChanged')); showView('login'); };
    }

    if(stored){
      showProfile(stored);
      return;
    }
    
    showProfile({ name: '', email: auth&&auth.email||'', phone: '' });
  }

  function showMsg(id, txt){ const el = document.getElementById(id); if(!el) return; el.textContent = txt; el.style.color=''; }

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[c]); }


  document.addEventListener('DOMContentLoaded', ()=>{
    renderRoot();
  });

})();
