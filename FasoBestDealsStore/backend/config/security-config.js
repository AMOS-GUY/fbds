// Security Configuration
const SECURITY_CONFIG = {
    // Session settings
    session: {
        lifetime: 3600000, // 1 hour in milliseconds
        maxIdleTime: 1800000, // 30 minutes
        regenerateOnLogin: true
    },
    
    // Rate limiting
    rateLimit: {
        maxRequests: 100, // Max requests per minute
        blockDuration: 600000, // 10 minutes block
        whitelistIPs: [] // Add your IP for testing
    },
    
    // Order validation
    orderValidation: {
        maxQuantityPerItem: 99,
        maxItemsPerOrder: 50,
        minOrderAmount: 1,
        maxOrderAmount: 10000
    },
    
    // Security headers
    headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
    },
    
    // CSP Directives
    csp: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
        'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        'font-src': ["'self'", "https://fonts.gstatic.com"],
        'img-src': ["'self'", "data:", "https:", "http:"],
        'connect-src': ["'self'"]
    }
};

// Security Headers to add to HTML
function addSecurityHeaders() {
    // Add CSP meta tag
    let cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = Object.entries(SECURITY_CONFIG.csp)
        .map(([key, values]) => `${key} ${values.join(' ')};`)
        .join(' ');
    document.head.appendChild(cspMeta);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SECURITY_CONFIG;
}