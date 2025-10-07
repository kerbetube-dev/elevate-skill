"""
Security monitoring and logging system for the ElevateSkill API
Provides comprehensive security event tracking and alerting
"""

import logging
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from collections import defaultdict, deque
from dataclasses import dataclass, asdict
from enum import Enum

logger = logging.getLogger(__name__)

class SecurityEventType(Enum):
    """Types of security events"""
    LOGIN_SUCCESS = "login_success"
    LOGIN_FAILURE = "login_failure"
    REGISTRATION_SUCCESS = "registration_success"
    REGISTRATION_FAILURE = "registration_failure"
    RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
    SUSPICIOUS_INPUT = "suspicious_input"
    SQL_INJECTION_ATTEMPT = "sql_injection_attempt"
    XSS_ATTEMPT = "xss_attempt"
    BRUTE_FORCE_ATTEMPT = "brute_force_attempt"
    UNAUTHORIZED_ACCESS = "unauthorized_access"
    TOKEN_EXPIRED = "token_expired"
    INVALID_TOKEN = "invalid_token"
    ACCOUNT_LOCKED = "account_locked"
    PASSWORD_CHANGE = "password_change"
    ADMIN_ACTION = "admin_action"

@dataclass
class SecurityEvent:
    """Security event data structure"""
    event_type: SecurityEventType
    timestamp: datetime
    ip_address: str
    user_agent: str
    user_id: Optional[str] = None
    details: Dict[str, Any] = None
    severity: str = "medium"  # low, medium, high, critical
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for logging"""
        data = asdict(self)
        data['event_type'] = self.event_type.value
        data['timestamp'] = self.timestamp.isoformat()
        return data

class SecurityMonitor:
    """Security monitoring and alerting system"""
    
    def __init__(self):
        self.events: deque = deque(maxlen=10000)  # Keep last 10k events
        self.suspicious_ips: Dict[str, int] = defaultdict(int)
        self.failed_logins: Dict[str, List[datetime]] = defaultdict(list)
        self.alert_thresholds = {
            'failed_logins_per_hour': 10,
            'suspicious_requests_per_hour': 20,
            'rate_limit_violations_per_hour': 50
        }
    
    def log_event(self, event: SecurityEvent):
        """Log a security event"""
        self.events.append(event)
        
        # Update suspicious IP tracking
        if event.event_type in [
            SecurityEventType.LOGIN_FAILURE,
            SecurityEventType.SUSPICIOUS_INPUT,
            SecurityEventType.SQL_INJECTION_ATTEMPT,
            SecurityEventType.XSS_ATTEMPT,
            SecurityEventType.BRUTE_FORCE_ATTEMPT
        ]:
            self.suspicious_ips[event.ip_address] += 1
        
        # Update failed login tracking
        if event.event_type == SecurityEventType.LOGIN_FAILURE:
            self.failed_logins[event.ip_address].append(event.timestamp)
            # Clean old failed logins (older than 1 hour)
            cutoff = datetime.utcnow() - timedelta(hours=1)
            self.failed_logins[event.ip_address] = [
                login_time for login_time in self.failed_logins[event.ip_address]
                if login_time > cutoff
            ]
        
        # Log to file
        self._log_to_file(event)
        
        # Check for alerts
        self._check_alerts(event)
    
    def _log_to_file(self, event: SecurityEvent):
        """Log event to file"""
        log_data = event.to_dict()
        
        if event.severity == "critical":
            logger.critical(f"SECURITY_EVENT: {json.dumps(log_data)}")
        elif event.severity == "high":
            logger.error(f"SECURITY_EVENT: {json.dumps(log_data)}")
        elif event.severity == "medium":
            logger.warning(f"SECURITY_EVENT: {json.dumps(log_data)}")
        else:
            logger.info(f"SECURITY_EVENT: {json.dumps(log_data)}")
    
    def _check_alerts(self, event: SecurityEvent):
        """Check if event should trigger an alert"""
        current_time = datetime.utcnow()
        
        # Check for brute force attempts
        if event.event_type == SecurityEventType.LOGIN_FAILURE:
            failed_count = len(self.failed_logins[event.ip_address])
            if failed_count >= self.alert_thresholds['failed_logins_per_hour']:
                self._trigger_alert(
                    "BRUTE_FORCE_DETECTED",
                    f"IP {event.ip_address} has {failed_count} failed login attempts in the last hour",
                    event.ip_address,
                    "high"
                )
        
        # Check for suspicious activity
        if event.event_type in [
            SecurityEventType.SQL_INJECTION_ATTEMPT,
            SecurityEventType.XSS_ATTEMPT,
            SecurityEventType.SUSPICIOUS_INPUT
        ]:
            self._trigger_alert(
                "SUSPICIOUS_ACTIVITY",
                f"IP {event.ip_address} attempted {event.event_type.value}",
                event.ip_address,
                "high"
            )
        
        # Check for rate limit violations
        if event.event_type == SecurityEventType.RATE_LIMIT_EXCEEDED:
            recent_violations = sum(
                1 for e in self.events
                if e.event_type == SecurityEventType.RATE_LIMIT_EXCEEDED
                and e.ip_address == event.ip_address
                and (current_time - e.timestamp).total_seconds() < 3600
            )
            
            if recent_violations >= self.alert_thresholds['rate_limit_violations_per_hour']:
                self._trigger_alert(
                    "RATE_LIMIT_ABUSE",
                    f"IP {event.ip_address} has {recent_violations} rate limit violations in the last hour",
                    event.ip_address,
                    "medium"
                )
    
    def _trigger_alert(self, alert_type: str, message: str, ip_address: str, severity: str):
        """Trigger a security alert"""
        alert_data = {
            "alert_type": alert_type,
            "message": message,
            "ip_address": ip_address,
            "severity": severity,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        logger.critical(f"SECURITY_ALERT: {json.dumps(alert_data)}")
        
        # In production, you would send this to a monitoring service
        # like Sentry, DataDog, or a custom alerting system
    
    def get_security_stats(self, hours: int = 24) -> Dict[str, Any]:
        """Get security statistics for the last N hours"""
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        recent_events = [e for e in self.events if e.timestamp > cutoff]
        
        stats = {
            "total_events": len(recent_events),
            "events_by_type": defaultdict(int),
            "events_by_severity": defaultdict(int),
            "top_suspicious_ips": [],
            "failed_logins": 0,
            "successful_logins": 0,
            "rate_limit_violations": 0
        }
        
        for event in recent_events:
            stats["events_by_type"][event.event_type.value] += 1
            stats["events_by_severity"][event.severity] += 1
            
            if event.event_type == SecurityEventType.LOGIN_FAILURE:
                stats["failed_logins"] += 1
            elif event.event_type == SecurityEventType.LOGIN_SUCCESS:
                stats["successful_logins"] += 1
            elif event.event_type == SecurityEventType.RATE_LIMIT_EXCEEDED:
                stats["rate_limit_violations"] += 1
        
        # Get top suspicious IPs
        ip_counts = defaultdict(int)
        for event in recent_events:
            if event.event_type in [
                SecurityEventType.LOGIN_FAILURE,
                SecurityEventType.SUSPICIOUS_INPUT,
                SecurityEventType.SQL_INJECTION_ATTEMPT,
                SecurityEventType.XSS_ATTEMPT
            ]:
                ip_counts[event.ip_address] += 1
        
        stats["top_suspicious_ips"] = sorted(
            ip_counts.items(), key=lambda x: x[1], reverse=True
        )[:10]
        
        return dict(stats)
    
    def is_ip_suspicious(self, ip_address: str) -> bool:
        """Check if an IP address is considered suspicious"""
        return self.suspicious_ips[ip_address] > 5
    
    def get_recent_events(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get recent security events"""
        recent_events = list(self.events)[-limit:]
        return [event.to_dict() for event in recent_events]


class SecurityMiddleware:
    """Middleware for security monitoring"""
    
    def __init__(self, monitor: SecurityMonitor):
        self.monitor = monitor
    
    async def log_request(self, request, response, processing_time: float):
        """Log request details for security monitoring"""
        # Extract request information
        ip_address = request.client.host
        user_agent = request.headers.get('user-agent', '')
        method = request.method
        path = request.url.path
        status_code = response.status_code
        
        # Check for suspicious patterns
        if status_code == 429:  # Rate limited
            event = SecurityEvent(
                event_type=SecurityEventType.RATE_LIMIT_EXCEEDED,
                timestamp=datetime.utcnow(),
                ip_address=ip_address,
                user_agent=user_agent,
                details={
                    "method": method,
                    "path": path,
                    "status_code": status_code,
                    "processing_time": processing_time
                },
                severity="medium"
            )
            self.monitor.log_event(event)
        
        elif status_code >= 400:
            # Check for potential attacks
            if any(pattern in path.lower() for pattern in ['admin', 'login', 'register']):
                event = SecurityEvent(
                    event_type=SecurityEventType.UNAUTHORIZED_ACCESS,
                    timestamp=datetime.utcnow(),
                    ip_address=ip_address,
                    user_agent=user_agent,
                    details={
                        "method": method,
                        "path": path,
                        "status_code": status_code
                    },
                    severity="medium"
                )
                self.monitor.log_event(event)


# Global security monitor instance
security_monitor = SecurityMonitor()

def log_security_event(
    event_type: SecurityEventType,
    ip_address: str,
    user_agent: str,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    severity: str = "medium"
):
    """Convenience function to log security events"""
    event = SecurityEvent(
        event_type=event_type,
        timestamp=datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent,
        user_id=user_id,
        details=details or {},
        severity=severity
    )
    security_monitor.log_event(event)
