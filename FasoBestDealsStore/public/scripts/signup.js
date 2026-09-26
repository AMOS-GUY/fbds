// Signup Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const passwordField = document.getElementById('password');
    const confirmField = document.getElementById('confirmPassword');
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (passwordField) {
        passwordField.addEventListener('input', checkPasswordStrength);
        passwordField.addEventListener('input', checkPasswordsMatch);
    }
    
    if (confirmField) {
        confirmField.addEventListener('input', checkPasswordsMatch);
    }
    
    // Check if already logged in
    checkAuth();
});

function handleSignup(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsChecked = document.getElementById('termsCheckbox').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    if (phone && !validatePhone(phone)) {
        showToast('Please enter a valid phone number', 'error');
        return;
    }
    
    if (!validatePassword(password)) {
        showToast('Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    if (!termsChecked) {
        showToast('Please agree to the Terms of Service and Privacy Policy', 'error');
        return;
    }
    
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        showToast('An account with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone || '',
        password: password, // In real app, hash this!
        createdAt: new Date().toISOString(),
        orders: [],
        wishlist: [],
        addresses: []
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Auto-login after signup
    const userData = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        createdAt: newUser.createdAt
    };
    
    setCurrentUser(userData);
    
    showToast('Account created successfully! Redirecting...', 'success');
    
    // Redirect to account page
    setTimeout(() => {
        window.location.href = 'account.html';
    }, 1500);
}

function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthDiv = document.getElementById('passwordStrength');
    
    if (!strengthDiv) return;
    
    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }
    
    const strength = getPasswordStrength(password);
    let message = '';
    let className = '';
    
    switch(strength) {
        case 'weak':
            message = '⚠️ Weak password - add uppercase, numbers, or special characters';
            className = 'strength-weak';
            break;
        case 'medium':
            message = '🟡 Medium password - add special characters for more security';
            className = 'strength-medium';
            break;
        case 'strong':
            message = '✅ Strong password!';
            className = 'strength-strong';
            break;
    }
    
    strengthDiv.innerHTML = `<span class="${className}">${message}</span>`;
}

function checkPasswordsMatch() {
    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirmPassword').value;
    const confirmField = document.getElementById('confirmPassword');
    
    if (confirm && password !== confirm) {
        confirmField.style.borderColor = '#dc3545';
    } else if (confirm) {
        confirmField.style.borderColor = '#28a745';
    }
}

// Password visibility toggle
window.togglePassword = function(fieldId) {
    const field = document.getElementById(fieldId);
    const button = field.parentElement.querySelector('.toggle-password');
    const icon = button.querySelector('i');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
};