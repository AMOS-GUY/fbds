// Contact Us Page JavaScript

// WhatsApp Configuration
const WHATSAPP_NUMBER = '22667030730';
const EMAIL_ADDRESS = 'guyamos28@qq.com';

// DOM Elements
const contactForm = document.getElementById('contactForm');
const whatsappBtn = document.getElementById('whatsappBtn');
const newsletterForm = document.getElementById('newsletterForm');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');
const backToTop = document.getElementById('backToTop');
const toastNotification = document.getElementById('toastNotification');

// ==================== FORM SUBMISSION ====================
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    const sendCopy = document.getElementById('sendCopy').checked;
    
    // Validate form
    if (!name || !email || !subject || !message) {
        showToast('Please fill in all required fields!', 'error');
        return;
    }
    
    // Validate email
    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address!', 'error');
        return;
    }
    
    // Prepare email content
    const emailContent = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><strong>Sent from:</strong> Horizon Store Contact Form</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    `;
    
    // Simulate email sending (since we don't have a backend, we'll open email client)
    const mailtoLink = `mailto:${EMAIL_ADDRESS}?subject=Contact Form: ${subject}&body=Name: ${name}%0AEmail: ${email}%0APhone: ${phone || 'Not provided'}%0A%0AMessage:%0A${message}%0A%0A---%0ASent from Horizon Store Contact Form`;
    
    if (sendCopy) {
        // Send copy to user as well
        const userMailtoLink = `mailto:${email}?subject=Copy: Your message to Horizon Store&body=Thank you for contacting us! Here's a copy of your message:%0A%0AName: ${name}%0AEmail: ${email}%0APhone: ${phone || 'Not provided'}%0ASubject: ${subject}%0A%0AMessage:%0A${message}%0A%0AWe'll get back to you soon!`;
        window.open(userMailtoLink, '_blank');
    }
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Save to localStorage for admin reference
    saveContactMessage({
        id: Date.now(),
        name,
        email,
        phone,
        subject,
        message,
        date: new Date().toISOString(),
        status: 'unread'
    });
    
    showToast('Opening your email client... Please send the message!', 'success');
    
    // Reset form
    contactForm.reset();
}

// Save contact message to localStorage
function saveContactMessage(messageData) {
    const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
    messages.unshift(messageData);
    localStorage.setItem('contact_messages', JSON.stringify(messages));
}

// ==================== WHATSAPP CHAT ====================
function openWhatsApp() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    let whatsappMessage = `Hello Horizon Store!%0A%0A`;
    
    if (name) whatsappMessage += `*Name:* ${name}%0A`;
    if (email) whatsappMessage += `*Email:* ${email}%0A`;
    if (subject) whatsappMessage += `*Subject:* ${subject}%0A`;
    whatsappMessage += `%0A*Message:*%0A${message || 'I would like to get in touch with you.'}`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
    
    showToast('Opening WhatsApp...', 'success');
}

// ==================== NEWSLETTER SUBSCRIPTION ====================
function handleNewsletterSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address!', 'error');
        return;
    }
    
    // Save to localStorage
    const subscribers = JSON.parse(localStorage.getItem('newsletter_subscribers') || '[]');
    if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('newsletter_subscribers', JSON.stringify(subscribers));
        showToast('Successfully subscribed to our newsletter!', 'success');
        document.getElementById('newsletterEmail').value = '';
    } else {
        showToast('You are already subscribed!', 'info');
    }
}

// ==================== FAQ ACCORDION ====================
function setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// ==================== VALIDATION ====================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==================== NAVBAR ====================
function setupMobileMenu() {
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
        });
        
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', false);
            });
        });
    }
}

// ==================== BACK TO TOP ====================
function setupBackToTop() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'success') {
    if (!toastNotification) return;
    
    const icon = toastNotification.querySelector('i');
    const span = toastNotification.querySelector('span');
    
    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        toastNotification.style.borderLeftColor = '#28a745';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        toastNotification.style.borderLeftColor = '#dc3545';
    } else {
        icon.className = 'fas fa-info-circle';
        toastNotification.style.borderLeftColor = '#ff9800';
    }
    
    span.textContent = message;
    toastNotification.classList.add('show');
    
    setTimeout(() => {
        toastNotification.classList.remove('show');
    }, 3000);
}

// ==================== DEMO ALERT ====================
function setupDemoAlert() {
    const demoBtn = document.getElementById('demoAlertBtn');
    if (demoBtn) {
        demoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openWhatsApp();
        });
    }
}

// ==================== ANIMATIONS ====================
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.contact-info-card, .faq-item, .contact-form-container, .contact-map-container').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// ==================== INITIALIZATION ====================
function init() {
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', openWhatsApp);
    }
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmit);
    }
    
    setupMobileMenu();
    setupBackToTop();
    setupFaqAccordion();
    setupDemoAlert();
    setupScrollAnimations();
    
    console.log('Contact page initialized');
}

// Make functions global
window.openWhatsApp = openWhatsApp;

// Start the app
init();