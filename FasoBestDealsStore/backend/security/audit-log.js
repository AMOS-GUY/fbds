// Audit Log for tracking all important actions

class AuditLog {
    constructor() {
        this.logKey = 'horizon_audit_log';
        this.maxLogs = 1000; // Keep last 1000 logs
        this.init();
    }
    
    init() {
        if (!localStorage.getItem(this.logKey)) {
            localStorage.setItem(this.logKey, JSON.stringify([]));
        }
    }
    
    // Add log entry
    addLog(action, details, severity = 'info') {
        const log = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            action: action,
            details: details,
            severity: severity,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId()
        };
        
        let logs = this.getLogs();
        logs.unshift(log);
        
        // Trim logs if too many
        if (logs.length > this.maxLogs) {
            logs = logs.slice(0, this.maxLogs);
        }
        
        localStorage.setItem(this.logKey, JSON.stringify(logs));
        
        // Also send to server if critical
        if (severity === 'critical') {
            this.sendToServer(log);
        }
        
        return log;
    }
    
    // Get all logs
    getLogs() {
        const logs = localStorage.getItem(this.logKey);
        return logs ? JSON.parse(logs) : [];
    }
    
    // Get logs by severity
    getLogsBySeverity(severity) {
        return this.getLogs().filter(log => log.severity === severity);
    }
    
    // Get logs by action
    getLogsByAction(action) {
        return this.getLogs().filter(log => log.action === action);
    }
    
    // Clear logs
    clearLogs() {
        localStorage.setItem(this.logKey, JSON.stringify([]));
        this.addLog('logs_cleared', 'Audit logs were cleared', 'warning');
    }
    
    // Export logs
    exportLogs() {
        const logs = this.getLogs();
        const dataStr = JSON.stringify(logs, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security_logs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Get session ID
    getSessionId() {
        const session = localStorage.getItem('horizon_secure_session');
        if (session) {
            return JSON.parse(session).id;
        }
        return 'no_session';
    }
    
    // Send critical logs to server
    sendToServer(log) {
        // In production, send to backend API
        console.log('Critical log sent to server:', log);
        
        // Example fetch to backend
        /*
        fetch('/api/security-log.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        }).catch(console.error);
        */
    }
    
    // Track specific events
    trackOrderCreation(orderDetails) {
        this.addLog('order_created', {
            orderId: orderDetails.orderId,
            total: orderDetails.total,
            itemCount: orderDetails.itemCount
        }, 'info');
    }
    
    trackOrderStatusChange(orderId, oldStatus, newStatus) {
        this.addLog('order_status_changed', {
            orderId: orderId,
            from: oldStatus,
            to: newStatus
        }, 'info');
    }
    
    trackFailedOrderAttempt(reason) {
        this.addLog('failed_order_attempt', { reason: reason }, 'warning');
    }
    
    trackSuspiciousActivity(activity, details) {
        this.addLog('suspicious_activity', { activity: activity, details: details }, 'critical');
    }
    
    trackAdminAction(adminName, action, target) {
        this.addLog('admin_action', {
            admin: adminName,
            action: action,
            target: target
        }, 'info');
    }
    
    trackLoginAttempt(email, success, reason) {
        this.addLog('login_attempt', {
            email: email,
            success: success,
            reason: reason || null
        }, success ? 'info' : 'warning');
    }
}

// Create global instance
const auditLog = new AuditLog();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = auditLog;
}