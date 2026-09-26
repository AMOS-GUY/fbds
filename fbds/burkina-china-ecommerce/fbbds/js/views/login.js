import { api } from '../api.js';
import { showToast } from '../components.js';

export function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="max-w-md mx-auto bg-white rounded-xl shadow p-6 mt-8">
      <h2 class="text-2xl font-bold mb-2">Welcome Back 👋</h2>
      <p class="text-gray-500 mb-6">Login to manage your orders</p>
      
      <form id="login-form" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" placeholder="you@example.com" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Password</label>
          <input name="password" type="password" placeholder="••••••••" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" required>
        </div>
        <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">Login</button>
      </form>
      
      <p class="mt-6 text-center text-sm">
        No account? <a href="#register" class="text-primary-600 hover:underline">Create one</a>
      </p>
      
      <div class="mt-4 text-center text-xs text-gray-400">
        <p>💡 Test accounts:</p>
        <p>User: user@test.com / password</p>
        <p>Admin: admin@faso.com / admin123</p>
      </div>
    </div>
  `;

  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.user.role);
      localStorage.setItem('userName', res.user.name);
      showToast('Login successful!');
      location.hash = '#products';
    } catch (err) {
      showToast(err.message, 'error');
    }
  };
}