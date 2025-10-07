"""
Security monitoring endpoints for admin users
Provides security statistics and monitoring capabilities
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from typing import Dict, Any, List
from datetime import datetime, timedelta

from .admin import get_current_admin
from security_monitor import security_monitor, SecurityEventType, log_security_event
from exceptions import create_authorization_error

router = APIRouter(prefix="/security", tags=["Security"])

@router.get("/stats")
async def get_security_stats(
    hours: int = 24,
    current_admin: dict = Depends(get_current_admin)
):
    """Get security statistics for the last N hours"""
    try:
        stats = security_monitor.get_security_stats(hours)
        return {
            "success": True,
            "data": stats,
            "period_hours": hours,
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security stats: {str(e)}"
        )

@router.get("/events")
async def get_security_events(
    limit: int = 100,
    event_type: str = None,
    severity: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get recent security events with optional filtering"""
    try:
        events = security_monitor.get_recent_events(limit)
        
        # Apply filters
        if event_type:
            events = [e for e in events if e.get('event_type') == event_type]
        
        if severity:
            events = [e for e in events if e.get('severity') == severity]
        
        return {
            "success": True,
            "data": events,
            "total": len(events),
            "filters": {
                "event_type": event_type,
                "severity": severity
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security events: {str(e)}"
        )

@router.get("/suspicious-ips")
async def get_suspicious_ips(
    current_admin: dict = Depends(get_current_admin)
):
    """Get list of suspicious IP addresses"""
    try:
        stats = security_monitor.get_security_stats(24)
        suspicious_ips = stats.get('top_suspicious_ips', [])
        
        return {
            "success": True,
            "data": suspicious_ips,
            "total": len(suspicious_ips)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get suspicious IPs: {str(e)}"
        )

@router.post("/test-alert")
async def test_security_alert(
    request: Request,
    current_admin: dict = Depends(get_current_admin)
):
    """Test security alerting system (admin only)"""
    try:
        # Log a test security event
        log_security_event(
            event_type=SecurityEventType.ADMIN_ACTION,
            ip_address=request.client.host,
            user_agent=request.headers.get('user-agent', ''),
            user_id=current_admin.get('id'),
            details={
                "action": "test_alert",
                "admin_email": current_admin.get('email')
            },
            severity="low"
        )
        
        return {
            "success": True,
            "message": "Test alert generated successfully",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate test alert: {str(e)}"
        )

@router.get("/health")
async def security_health_check(
    current_admin: dict = Depends(get_current_admin)
):
    """Get security system health status"""
    try:
        # Get recent stats
        stats = security_monitor.get_security_stats(1)  # Last hour
        
        # Calculate health score
        total_events = stats.get('total_events', 0)
        failed_logins = stats.get('failed_logins', 0)
        rate_violations = stats.get('rate_limit_violations', 0)
        
        # Simple health scoring
        health_score = 100
        if failed_logins > 10:
            health_score -= 20
        if rate_violations > 20:
            health_score -= 30
        if total_events > 1000:
            health_score -= 10
        
        health_status = "healthy"
        if health_score < 70:
            health_status = "warning"
        if health_score < 50:
            health_status = "critical"
        
        return {
            "success": True,
            "data": {
                "health_score": max(0, health_score),
                "health_status": health_status,
                "metrics": {
                    "total_events_last_hour": total_events,
                    "failed_logins_last_hour": failed_logins,
                    "rate_violations_last_hour": rate_violations
                },
                "timestamp": datetime.utcnow().isoformat()
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security health: {str(e)}"
        )

@router.get("/dashboard")
async def get_security_dashboard(
    current_admin: dict = Depends(get_current_admin)
):
    """Get comprehensive security dashboard data"""
    try:
        # Get stats for different time periods
        stats_1h = security_monitor.get_security_stats(1)
        stats_24h = security_monitor.get_security_stats(24)
        stats_7d = security_monitor.get_security_stats(24 * 7)
        
        # Get recent events
        recent_events = security_monitor.get_recent_events(50)
        
        # Calculate trends
        login_success_rate = 0
        if stats_24h.get('failed_logins', 0) + stats_24h.get('successful_logins', 0) > 0:
            login_success_rate = (
                stats_24h.get('successful_logins', 0) / 
                (stats_24h.get('failed_logins', 0) + stats_24h.get('successful_logins', 0))
            ) * 100
        
        return {
            "success": True,
            "data": {
                "overview": {
                    "total_events_24h": stats_24h.get('total_events', 0),
                    "failed_logins_24h": stats_24h.get('failed_logins', 0),
                    "successful_logins_24h": stats_24h.get('successful_logins', 0),
                    "login_success_rate": round(login_success_rate, 2),
                    "rate_violations_24h": stats_24h.get('rate_limit_violations', 0)
                },
                "trends": {
                    "events_1h": stats_1h.get('total_events', 0),
                    "events_24h": stats_24h.get('total_events', 0),
                    "events_7d": stats_7d.get('total_events', 0)
                },
                "top_threats": stats_24h.get('top_suspicious_ips', [])[:5],
                "recent_events": recent_events[:10],
                "event_distribution": dict(stats_24h.get('events_by_type', {})),
                "severity_distribution": dict(stats_24h.get('events_by_severity', {}))
            },
            "generated_at": datetime.utcnow().isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security dashboard: {str(e)}"
        )
