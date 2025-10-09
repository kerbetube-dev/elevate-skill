# UUID Display Issue - Files for ChatGPT

## Problem Description

The payment requests API endpoint returns a Pydantic validation error because
the `approvedBy` field contains a UUID object instead of a string. The error
occurs when displaying payment requests that have been approved/rejected.

Error:
`{'type': 'string_type', 'loc': ('response', 0, 'approvedBy'), 'msg': 'Input should be a valid string', 'input': UUID('46b3478a-17e1-4bcc-a365-a0f949de8404')}`

## Files Involved

### 1. backend/routes/admin.py (lines 90-135)

```python
@router.get("/payments", response_model=List[PaymentRequestResponse])
async def get_payment_requests(
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all payment requests"""
    requests = await db_ops.get_payment_requests(status)
    
    print(f"DEBUG: Received {len(requests)} payment requests from database")
    for i, req in enumerate(requests):
        print(f"DEBUG: Request {i}: approved_by = {req.get('approved_by')} (type: {type(req.get('approved_by'))})")
    
    # Convert to response format
    response = []
    for req in requests:
        # Ensure approved_by is converted to string
        approved_by = None
        if req.get("approved_by") is not None:
            try:
                approved_by = str(req["approved_by"])
            except Exception as e:
                print(f"Warning: Failed to convert approved_by: {e}")
                approved_by = None
        
        response.append({
            "id": req["id"],
            "userId": req["user_id"],
            "courseId": req["course_id"],
            "paymentMethodId": req["payment_method_id"],
            "amount": float(req["amount"]),
            "status": req["status"],
            "admin_notes": req.get("admin_notes"),
            "created_at": req["created_at"],
            "approvedAt": req["approved_at"] if req["approved_at"] else None,
            "approvedBy": approved_by,
            "rejection_reason": req.get("rejection_reason"),
            # Additional info
            "userName": req["full_name"],
            "userEmail": req["email"],
            "courseTitle": req["course_title"],
            "paymentType": req["payment_type"],
            "account_number": req["account_number"]
        })
    
    return response
```

### 2. backend/database/operations.py (lines 415-422)

```python
# Convert approved_by UUID to string
if 'approved_by' in result_dict and result_dict['approved_by'] is not None:
    try:
        result_dict['approved_by'] = str(result_dict['approved_by'])
    except Exception as e:
        print(f"Warning: Failed to convert approved_by UUID: {e}")
        result_dict['approved_by'] = None
results.append(result_dict)
```

### 3. backend/models.py (lines 65-76)

```python
class PaymentRequestResponse(BaseModel):
    id: str
    userId: str
    courseId: str
    paymentMethodId: str
    amount: float
    status: PaymentStatus
    admin_notes: Optional[str] = None
    created_at: str
    approvedAt: Optional[str] = None
    approvedBy: Optional[str] = None
    rejection_reason: Optional[str] = None
```

## Current Status

- Database operations show UUIDs are converted to strings correctly
- Admin route has conversion logic but still receives UUID objects
- Pydantic model expects string but receives UUID
- The conversion in the admin route is not working as expected

## Expected Behavior

The `approvedBy` field should be a string representation of the UUID (e.g.,
"46b3478a-17e1-4bcc-a365-a0f949de8404") or None if not set.

## Test Command

```bash
curl -X GET "http://localhost:8003/admin/payments" -H "Authorization: Bearer $ADMIN_TOKEN"
```

This should return a JSON array of payment requests with `approvedBy` as
strings, not UUID objects.
