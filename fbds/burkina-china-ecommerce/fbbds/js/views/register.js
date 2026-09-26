import { api } from '../api.js';
import { showToast } from '../components.js';

export function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-6">
      <h2 class="text-2xl font-bold mb-2">Create Account 🇧🇫</h2>
      <p class="text-gray-500 mb-6">Join Faso Best Deals today</p>
      
      <form id="reg-form" class="space-y-4">
        <input name="name" placeholder="Full Name *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        <input name="email" type="email" placeholder="Email *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        <input name="password" type="password" placeholder="Password *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        <input name="phone" placeholder="Phone (+226...) *" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">Register</button>
      </form>
      
      <p class="mt-6 text-center text-sm">
        Already have an account? <a href="#login" class="text-primary-600 hover:underline">Login</a>
      </p>
    </div>
  `;

  document.getElementById('reg-form').onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api.register({
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value,
        phone: e.target.phone.value
      });
      showToast('Registration successful! Check your email to verify.');
      setTimeout(() => location.hash = '#login', 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}