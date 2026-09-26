// Login Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Check if already logged in
    checkAuth();
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validation
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // Get users from storage
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showToast('No account found with this email', 'error');
        return;
    }
    
    // Check password (in real app, use bcrypt or similar)
    if (user.password !== password) {
        showToast('Incorrect password', 'error');
        return;
    }
    
    // Login success
    const userData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        createdAt: user.createdAt
    };
    
    setCurrentUser(userData);
    
    // Set remember me (in real app, set cookie expiry)
    if (rememberMe) {
        localStorage.setItem('remember_me', 'true');
    }
    
    showToast('Login successful! Redirecting...', 'success');
    
    // Redirect to account page or previous page
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
}

// Password visibility toggle
window.togglePassword = function() {
    const passwordField = document.getElementById('password');
    const icon = document.querySelector('.toggle-password i');
    const button = document.querySelector('.toggle-password');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.className = 'fas fa-eye-slash';
        button.setAttribute('aria-label', 'Hide password');
    } else {
        passwordField.type = 'password';
        icon.className = 'fas fa-eye';
        button.setAttribute('aria-label', 'Show password');
    }
};