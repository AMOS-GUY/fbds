// Session Manager for secure user sessions

class SessionManager {
    constructor() {
        this.sessionKey = 'horizon_secure_session';
        this.csrfKey = 'horizon_csrf_token';
        this.sessionTimeout = 3600000; // 1 hour
        this.init();
    }
    
    init() {
        // Check if session exists
        if (!this.getSession()) {
            this.createSession();
        }
        
        // Check session validity
        this.validateSession();
        
        // Generate CSRF token
        this.generateCSRFToken();
    }
    
    // Create new session
    createSession() {
        const session = {
            id: this.generateSessionId(),
            createdAt: Date.now(),
            lastActivity: Date.now(),
            ipAddress: this.getIPAddress(),
            userAgent: navigator.userAgent,
            fingerprint: this.generateFingerprint()
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        return session;
    }
    
    // Get current session
    getSession() {
        const session = localStorage.getItem(this.sessionKey);
        return session ? JSON.parse(session) : null;
    }
    
    // Validate session
    validateSession() {
        const session = this.getSession();
        if (!session) return false;
        
        // Check timeout
        if (Date.now() - session.lastActivity > this.sessionTimeout) {
            this.destroySession();
            return false;
        }
        
        // Update last activity
        session.lastActivity = Date.now();
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        
        return true;
    }
    
    // Destroy session
    destroySession() {
        localStorage.removeItem(this.sessionKey);
        localStorage.removeItem(this.csrfKey);
        this.createSession();
    }
    
    // Generate unique session ID
    generateSessionId() {
        return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
    }
    
    // Generate browser fingerprint
    generateFingerprint() {
        const components = [
            navigator.userAgent,
            navigator.language,
            screen.colorDepth,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            !!navigator.hardwareConcurrency
        ];
        return btoa(components.join('|'));
    }
    
    // Get IP address (simulated for client-side)
    getIPAddress() {
        // In production, get from server-side
        return 'client_' + Math.random().toString(36).substr(2, 8);
    }
    
    // Generate CSRF token
    generateCSRFToken() {
        let token = localStorage.getItem(this.csrfKey);
        if (!token) {
            token = 'csrf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 24);
            localStorage.setItem(this.csrfKey, token);
        }
        return token;
    }
    
    // Validate CSRF token
    validateCSRFToken(token) {
        const storedToken = localStorage.getItem(this.csrfKey);
        return token === storedToken;
    }
    
    // Get CSRF token for forms
    getCSRFToken() {
        return localStorage.getItem(this.csrfKey);
    }
}

// Create global instance
const sessionManager = new SessionManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = sessionManager;
}