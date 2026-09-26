import { api } from './api.js';
import { showToast } from './components.js';

export function renderLogin() {
  document.getElementById('app').innerHTML = `
    <div class="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-10">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <form id="login-form" class="space-y-4">
        <input name="email" type="email" placeholder="Email" class="w-full p-3 border rounded-lg" required>
        <input name="password" type="password" placeholder="Password" class="w-full p-3 border rounded-lg" required>
        <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Login</button>
      </form>
      <p class="mt-4 text-center text-sm">No account? <a href="#register" class="text-primary-600 hover:underline">Register</a></p>
    </div>
  `;
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.login({ email: e.target.email.value, password: e.target.password.value });
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.user.role);
      showToast('Logged in successfully');
      location.hash = '#products';
    } catch (err) { showToast(err.message, 'error'); }
  };
}

export function renderRegister() {
  document.getElementById('app').innerHTML = `
    <div class="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-6">
      <h2 class="text-2xl font-bold mb-4">Create Account</h2>
      <form id="reg-form" class="space-y-4">
        <input name="name" placeholder="Full Name" class="w-full p-3 border rounded-lg" required>
        <input name="email" type="email" placeholder="Email" class="w-full p-3 border rounded-lg" required>
        <input name="password" type="password" placeholder="Password" class="w-full p-3 border rounded-lg" required>
        <input name="phone" placeholder="Phone (+226...)" class="w-full p-3 border rounded-lg" required>
        <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Register</button>
      </form>
      <p class="mt-4 text-center text-sm">Already have an account? <a href="#login" class="text-primary-600 hover:underline">Login</a></p>
    </div>
  `;
  document.getElementById('reg-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api.register({ name: e.target.name.value, email: e.target.email.value, password: e.target.password.value, phone: e.target.phone.value });
      showToast('Check your email to verify');
      location.hash = '#login';
    } catch (err) { showToast(err.message, 'error'); }
  };
}

export function renderVerify(token) {
  // Handled by backend redirect or manual API call
  document.getElementById('app').innerHTML = `<p class="text-center py-10">Verifying email... <span id="verify-status"></span></p>`;
  // In production, you'd auto-call /auth/verify/${token} and redirect
}