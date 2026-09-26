// Complete Authentication System

// Storage keys
const USERS_KEY = 'horizon_users';
const CURRENT_USER_KEY = 'horizon_current_user';
const REMEMBER_ME_KEY = 'horizon_remember_token';

// API endpoint (update with your server URL)
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8888/backend/api/send-email.php'
    : 'https://yourdomain.com/backend/api/send-email.php';

// ==================== USER MANAGEMENT ====================
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    // Check session storage first
    let user = sessionStorage.getItem(CURRENT_USER_KEY);
    if (user) return JSON.parse(user);
    
    // Check remember me token
    const token = localStorage.getItem(REMEMBER_ME_KEY);
    if (token) {
        const users = getUsers();
        user = users.find(u => u.rememberToken === token);
        if (user) {
            setCurrentUser(user, false);
            return user;
        }
    }
    
    return null;
}

function setCurrentUser(user, remember = false) {
    // Store in session
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    // Store remember me token if requested
    if (remember) {
        const token = generateToken();
        user.rememberToken = token;
        localStorage.setItem(REMEMBER_ME_KEY, token);
        
        // Update user in database
        const users = getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index].rememberToken = token;
            saveUsers(users);
        }
    }
}

function logout() {
    // Clear tokens
    const user = getCurrentUser();
    if (user) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            delete users[index].rememberToken;
            saveUsers(users);
        }
    }
    
    sessionStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    window.location.href = '../pages/home.html';
}

function generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==================== VALIDATION ====================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return re.test(password);
}

function validatePhone(phone) {
    if (!phone) return true;
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// ==================== EMAIL VERIFICATION ====================
async function sendVerificationCode(email) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'send_verification',
                email: email
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error sending code:', error);
        // Fallback for development - generate fake code
        if (window.location.hostname === 'localhost') {
            const fakeCode = Math.floor(100000 + Math.random() * 900000);
            console.log('Development code:', fakeCode);
            sessionStorage.setItem('dev_verification_code', fakeCode);
            return { success: true, message: 'Development mode: Check console for code' };
        }
        return { success: false, message: 'Failed to send verification code' };
    }
}

async function verifyCode(code) {
    // Check development mode
    if (window.location.hostname === 'localhost') {
        const devCode = sessionStorage.getItem('dev_verification_code');
        if (devCode && parseInt(devCode) === parseInt(code)) {
            sessionStorage.removeItem('dev_verification_code');
            return { success: true, message: 'Code verified' };
        }
        return { success: false, message: 'Invalid code' };
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'verify_code',
                code: code
            })
        });
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error verifying code:', error);
        return { success: false, message: 'Verification failed' };
    }
}

// ==================== GOOGLE LOGIN (Simulated) ====================
function simulateGoogleLogin() {
    // Since Google services are blocked in China, we simulate with email input
    const email = prompt('Enter your email address for Google login:');
    if (email && validateEmail(email)) {
        return {
            success: true,
            user: {
                id: generateUserId(),
                email: email,
                firstName: email.split('@')[0],
                lastName: '',
                provider: 'google',
                emailVerified: true,
                status: 'active',
                createdAt: new Date().toISOString()
            }
        };
    }
    return { success: false, message: 'Invalid email address' };
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    
    const icon = toast.querySelector('i');
    const span = toast.querySelector('span');
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toast.style.borderLeftColor = '#28a745';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toast.style.borderLeftColor = '#dc3545';
    } else {
        icon.className = 'fas fa-info-circle';
        toast.style.borderLeftColor = '#ff9800';
    }
    
    span.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ==================== VERIFICATION CODE TIMER ====================
function startTimer(button, seconds = 60) {
    let remaining = seconds;
    button.disabled = true;
    const originalText = button.textContent;
    
    const timer = setInterval(() => {
        remaining--;
        button.textContent = `Resend in ${remaining}s`;
        
        if (remaining <= 0) {
            clearInterval(timer);
            button.disabled = false;
            button.textContent = originalText;
        }
    }, 1000);
}

// ==================== CHECK AUTH ON PAGE LOAD ====================
function checkAuth() {
    const user = getCurrentUser();
    const publicPages = ['login.html', 'signup.html', 'forgot-password.html', 'verify-email.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!publicPages.includes(currentPage) && !user) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (publicPages.includes(currentPage) && user) {
        window.location.href = 'account.html';
        return false;
    }
    
    return true;
}
// Login handler - add to auth.js or create login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }
        
        const users = getUsers();
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showToast('No account found with this email', 'error');
            return;
        }
        
        if (user.status === 'suspended') {
            showToast('Your account has been suspended. Contact support.', 'error');
            return;
        }
        
        if (user.password !== password) {
            showToast('Incorrect password', 'error');
            return;
        }
        
        if (!user.emailVerified) {
            showToast('Please verify your email first. Check your inbox.', 'warning');
            return;
        }
        
        // Login success
        const userData = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            provider: user.provider
        };
        
        setCurrentUser(userData, rememberMe);
        showToast('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = '../pages/home.html';
        }, 1500);
    });
    
    // Google login button
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            const result = simulateGoogleLogin();
            if (result.success) {
                // Check if user exists
                const users = getUsers();
                let existingUser = users.find(u => u.email === result.user.email);
                
                if (!existingUser) {
                    // Create new user
                    result.user.password = 'google_oauth_' + Math.random().toString(36);
                    result.user.emailVerified = true;
                    result.user.status = 'active';
                    users.push(result.user);
                    saveUsers(users);
                    existingUser = result.user;
                }
                
                setCurrentUser(existingUser, false);
                showToast('Google login successful!', 'success');
                setTimeout(() => {
                    window.location.href = '../pages/home.html';
                }, 1500);
            } else {
                showToast(result.message, 'error');
            }
        });
    }
});
// Signup handler
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const sendCodeBtn = document.getElementById('sendCodeBtn');
    const verificationCodeInput = document.getElementById('verificationCode');
    let isCodeVerified = false;
    
    if (!signupForm) return;
    
    // Send verification code
    if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value;
            
            if (!email || !validateEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            const result = await sendVerificationCode(email);
            if (result.success) {
                showToast('Verification code sent to your email!', 'success');
                startTimer(sendCodeBtn);
            } else {
                showToast(result.message, 'error');
            }
        });
    }
    
    // Verify code on input
    if (verificationCodeInput) {
        verificationCodeInput.addEventListener('input', async () => {
            const code = verificationCodeInput.value;
            if (code.length === 6) {
                const result = await verifyCode(code);
                if (result.success) {
                    isCodeVerified = true;
                    document.getElementById('signupBtn').disabled = false;
                    showToast('Code verified!', 'success');
                } else {
                    isCodeVerified = false;
                    document.getElementById('signupBtn').disabled = true;
                }
            } else {
                isCodeVerified = false;
                document.getElementById('signupBtn').disabled = true;
            }
        });
    }
    
    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsChecked = document.getElementById('termsCheckbox').checked;
        
        if (!firstName || !lastName || !email || !password) {
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
            showToast('Password must be at least 8 characters with uppercase, lowercase, and number', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        if (!termsChecked) {
            showToast('Please agree to the Terms of Service', 'error');
            return;
        }
        
        if (!isCodeVerified) {
            showToast('Please verify your email first', 'error');
            return;
        }
        
        // Check if user exists
        const users = getUsers();
        if (users.find(u => u.email === email)) {
            showToast('An account with this email already exists', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: generateUserId(),
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone || '',
            password: password,
            provider: 'email',
            emailVerified: true,
            status: 'active',
            createdAt: new Date().toISOString(),
            orders: [],
            wishlist: []
        };
        
        users.push(newUser);
        saveUsers(users);
        
        // Auto login
        const userData = {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            phone: newUser.phone,
            provider: newUser.provider
        };
        
        setCurrentUser(userData, false);
        showToast('Account created successfully! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = '../pages/home.html';
        }, 1500);
    });
});
// Add this to your auth.js - Development mode with fake verification

// ==================== DEVELOPMENT MODE - NO EMAIL REQUIRED ====================
async function sendVerificationCode(email) {
    // Generate a fake 6-digit code
    const fakeCode = Math.floor(100000 + Math.random() * 900000);
    
    // Store in sessionStorage for verification
    sessionStorage.setItem('dev_verification_code', fakeCode);
    sessionStorage.setItem('dev_verification_email', email);
    sessionStorage.setItem('dev_verification_expires', Date.now() + 600000); // 10 minutes
    
    // Show the code in a popup (for testing)
    alert(`📧 DEVELOPMENT MODE\n\nYour verification code is: ${fakeCode}\n\n(Check console for code as well)`);
    
    // Also log to console
    console.log('=========================================');
    console.log('VERIFICATION CODE:', fakeCode);
    console.log('For email:', email);
    console.log('=========================================');
    
    // Show toast notification
    showToast(`Development mode: Your code is ${fakeCode}`, 'info');
    
    return { success: true, message: 'Verification code generated (development mode)' };
}

async function verifyCode(code) {
    const savedCode = sessionStorage.getItem('dev_verification_code');
    const expires = sessionStorage.getItem('dev_verification_expires');
    
    if (!savedCode) {
        showToast('Please request a verification code first', 'error');
        return { success: false, message: 'No code requested' };
    }
    
    if (Date.now() > parseInt(expires)) {
        sessionStorage.removeItem('dev_verification_code');
        sessionStorage.removeItem('dev_verification_email');
        sessionStorage.removeItem('dev_verification_expires');
        showToast('Verification code has expired. Please request a new one.', 'error');
        return { success: false, message: 'Code expired' };
    }
    
    if (parseInt(savedCode) === parseInt(code)) {
        // Clear the used code
        sessionStorage.removeItem('dev_verification_code');
        sessionStorage.removeItem('dev_verification_email');
        sessionStorage.removeItem('dev_verification_expires');
        return { success: true, message: 'Code verified successfully' };
    }
    
    showToast('Invalid verification code. Please try again.', 'error');
    return { success: false, message: 'Invalid code' };
}

// Make functions global
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.logout = logout;
window.showToast = showToast;
window.checkAuth = checkAuth;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.validatePhone = validatePhone;
window.sendVerificationCode = sendVerificationCode;
window.verifyCode = verifyCode;
window.startTimer = startTimer;
window.simulateGoogleLogin = simulateGoogleLogin;