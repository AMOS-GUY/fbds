// Rate Limiter to prevent abuse

class RateLimiter {
    constructor() {
        this.requestsKey = 'horizon_rate_limits';
        this.maxRequests = 100; // Max requests per minute
        this.timeWindow = 60000; // 1 minute
        this.blockDuration = 600000; // 10 minutes
        this.init();
    }
    
    init() {
        if (!localStorage.getItem(this.requestsKey)) {
            localStorage.setItem(this.requestsKey, JSON.stringify({}));
        }
    }
    
    // Check if request is allowed
    isAllowed(action, identifier = 'default') {
        const key = `${action}_${identifier}`;
        let limits = JSON.parse(localStorage.getItem(this.requestsKey));
        
        // Check if blocked
        if (limits[key] && limits[key].blockedUntil && limits[key].blockedUntil > Date.now()) {
            return {
                allowed: false,
                reason: 'Rate limit exceeded. Please try again later.',
                remainingTime: Math.ceil((limits[key].blockedUntil - Date.now()) / 1000)
            };
        }
        
        // Initialize if not exists
        if (!limits[key]) {
            limits[key] = {
                count: 0,
                windowStart: Date.now(),
                blockedUntil: null
            };
        }
        
        const currentWindow = limits[key];
        
        // Reset window if time has passed
        if (Date.now() - currentWindow.windowStart > this.timeWindow) {
            currentWindow.count = 0;
            currentWindow.windowStart = Date.now();
        }
        
        // Check if over limit
        if (currentWindow.count >= this.maxRequests) {
            currentWindow.blockedUntil = Date.now() + this.blockDuration;
            localStorage.setItem(this.requestsKey, JSON.stringify(limits));
            
            return {
                allowed: false,
                reason: 'Too many requests. Please wait 10 minutes.',
                remainingTime: Math.ceil(this.blockDuration / 1000)
            };
        }
        
        // Increment count
        currentWindow.count++;
        localStorage.setItem(this.requestsKey, JSON.stringify(limits));
        
        return {
            allowed: true,
            remaining: this.maxRequests - currentWindow.count,
            resetTime: Math.ceil((currentWindow.windowStart + this.timeWindow - Date.now()) / 1000)
        };
    }
    
    // Reset limits for an action
    resetLimit(action, identifier = 'default') {
        const key = `${action}_${identifier}`;
        let limits = JSON.parse(localStorage.getItem(this.requestsKey));
        delete limits[key];
        localStorage.setItem(this.requestsKey, JSON.stringify(limits));
    }
    
    // Get current status
    getStatus(action, identifier = 'default') {
        const key = `${action}_${identifier}`;
        const limits = JSON.parse(localStorage.getItem(this.requestsKey));
        
        if (!limits[key]) {
            return { allowed: true, remaining: this.maxRequests };
        }
        
        const current = limits[key];
        return {
            allowed: current.count < this.maxRequests,
            remaining: Math.max(0, this.maxRequests - current.count),
            resetTime: Math.ceil((current.windowStart + this.timeWindow - Date.now()) / 1000)
        };
    }
}

const rateLimiter = new RateLimiter();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = rateLimiter;
}