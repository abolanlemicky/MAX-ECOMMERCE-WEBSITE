// MAX auth.js module.
var authConfig = {
  mode: 'demo',
  apiBaseUrl: '/api',
  demoEmail: 'nia@example.com',
  demoPassword: 'MaxDemo123',
};

function getAuthProvider() {
  return authConfig.mode === 'api' ? 'backend-api' : 'demo-only';
}

function renderDemoAuthNotice() {
  document.querySelectorAll('[data-auth-form]').forEach((form) => {
    if (form.querySelector('[data-demo-security-notice]')) return;
    form.insertAdjacentHTML('afterbegin', '<p class="form-note" data-demo-security-notice>Demo mode only. Do not enter a real password. Authentication is not secure until a backend API is connected.</p>');
  });
}

function handleAuthSubmit(form) {
  const formData = new FormData(form); const mode = form.dataset.authForm; const message = form.querySelector('[data-form-message]');
  const showMessage = (text, type = 'error') => { if (message) { message.textContent = text; message.className = `form-message ${type}`; } };
  const email = String(formData.get('email') || '').trim().toLowerCase(); const password = String(formData.get('password') || '');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showMessage('Enter a valid email address.'); return; }
  if (password.length < 8) { showMessage('Password must contain at least 8 characters.'); return; }
  if (mode === 'register') {
    const name = String(formData.get('fullName') || '').trim(); const confirmPassword = String(formData.get('confirmPassword') || ''); const phone = String(formData.get('phone') || '').trim();
    if (name.length < 2) { showMessage('Enter your full name.'); return; } if (!phone) { showMessage('Enter your phone number.'); return; } if (password !== confirmPassword) { showMessage('Passwords do not match.'); return; }
    saveToStorage(ACCOUNT_STORAGE_KEYS.account, { name, email, phone, city: '', memberSince: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) });
  } else {
    const account = getAccount();
    const isDemoLogin = email === authConfig.demoEmail && password === authConfig.demoPassword;
    if (!isDemoLogin || email !== String(account.email).toLowerCase()) { showMessage('Demo login details are incorrect.'); return; }
  }
  saveToStorage(ACCOUNT_STORAGE_KEYS.session, { email, remember: formData.get('remember') === 'on' }); showMessage(mode === 'register' ? 'Account created. Redirecting to your dashboard...' : 'Login successful. Redirecting...', 'success');
  setTimeout(() => { window.location.href = 'account.html'; }, 350);
}
