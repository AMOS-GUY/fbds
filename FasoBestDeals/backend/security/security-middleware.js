// Security Middleware for additional protection

class SecurityMiddleware {
    constructor() {
        this.blockedIPs = this.loadBlockedIPs();
        this.suspiciousPatterns = [
            { pattern: /<script|javascript:/i, action: 'block', message: 'XSS attempt detected' },
            { pattern: /(\%27)|(\')|(\-\-)|(\%23)/i, action: 'log', message: 'SQL injection attempt' },
            { pattern: /(union.*select|select.*from)/i, action: 'block', message: 'SQL injection attempt' }
        ];
    }

    loadBlockedIPs() {
        return JSON.parse(localStorage.getItem('horizon_blocked_ips') || '[]');
    }

    // Validate request
    validateRequest(requestData) {
        const violations = [];
        
        // Check for malicious patterns
        const stringData = JSON.stringify(requestData);
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.pattern.test(stringData)) {
                violations.push({
                    type: pattern.action,
                    message: pattern.message,
                    data: requestData
                });
            }
        }
        
        return {
            isValid: violations.length === 0,
            violations: violations
        };
    }

    // Sanitize input
    sanitizeInput(input) {
        if (typeof input === 'string') {
            return input
                .replace(/[<>]/g, '')
                .replace(/javascript:/gi, '')
                .replace(/onload=/gi, '')
                .replace(/onerror=/gi, '');
        }
        return input;
    }

    // Block IP
    blockIP(ip, reason, duration = 3600000) { // Default 1 hour
        const blocked = {
            ip: ip,
            reason: reason,
            timestamp: Date.now(),
            expires: Date.now() + duration
        };
        
        this.blockedIPs.push(blocked);
        localStorage.setItem('horizon_blocked_ips', JSON.stringify(this.blockedIPs));
        
        addSecurityLog('ip_blocked', { ip: ip, reason: reason, duration: duration }, 'critical');
    }

    // Check if IP is blocked
    isIPBlocked(ip) {
        const now = Date.now();
        this.blockedIPs = this.blockedIPs.filter(b => b.expires > now);
        localStorage.setItem('horizon_blocked_ips', JSON.stringify(this.blockedIPs));
        return this.blockedIPs.some(b => b.ip === ip);
    }

    // Generate secure token
    generateSecureToken() {
        return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 32);
    }

    // Validate token
    validateToken(token, expectedToken) {
        if (!token || !expectedToken) return false;
        return token === expectedToken && token.startsWith('token_');
    }
}

const securityMiddleware = new SecurityMiddleware();