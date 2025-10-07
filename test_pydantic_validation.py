#!/usr/bin/env python3
"""
Test script to debug Pydantic validation issue
"""

import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from models import PaymentRequestResponse
from uuid import UUID

def test_pydantic_validation():
    """Test Pydantic validation with different data types"""
    
    print("🔍 Testing Pydantic validation...")
    
    # Test with string (should work)
    try:
        data1 = {
            "id": "test-id",
            "userId": "test-user-id",
            "courseId": "test-course-id",
            "paymentMethodId": "test-payment-method-id",
            "amount": 100.0,
            "status": "pending",
            "adminNotes": None,
            "createdAt": "2025-10-03T23:00:00Z",
            "approvedAt": None,
            "approvedBy": "46b3478a-17e1-4bcc-a365-a0f949de8404",  # String
            "rejectionReason": None
        }
        response1 = PaymentRequestResponse(**data1)
        print("✅ String approvedBy works:", response1.approvedBy)
    except Exception as e:
        print("❌ String approvedBy failed:", e)
    
    # Test with UUID object (should fail)
    try:
        data2 = {
            "id": "test-id",
            "userId": "test-user-id",
            "courseId": "test-course-id",
            "paymentMethodId": "test-payment-method-id",
            "amount": 100.0,
            "status": "pending",
            "adminNotes": None,
            "createdAt": "2025-10-03T23:00:00Z",
            "approvedAt": None,
            "approvedBy": UUID("46b3478a-17e1-4bcc-a365-a0f949de8404"),  # UUID object
            "rejectionReason": None
        }
        response2 = PaymentRequestResponse(**data2)
        print("✅ UUID approvedBy works:", response2.approvedBy)
    except Exception as e:
        print("❌ UUID approvedBy failed:", e)
    
    # Test with None (should work)
    try:
        data3 = {
            "id": "test-id",
            "userId": "test-user-id",
            "courseId": "test-course-id",
            "paymentMethodId": "test-payment-method-id",
            "amount": 100.0,
            "status": "pending",
            "adminNotes": None,
            "createdAt": "2025-10-03T23:00:00Z",
            "approvedAt": None,
            "approvedBy": None,  # None
            "rejectionReason": None
        }
        response3 = PaymentRequestResponse(**data3)
        print("✅ None approvedBy works:", response3.approvedBy)
    except Exception as e:
        print("❌ None approvedBy failed:", e)

if __name__ == "__main__":
    test_pydantic_validation()
