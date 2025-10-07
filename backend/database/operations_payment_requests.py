# Complete get_payment_requests method from database/operations.py
# This is the relevant section for the UUID issue

async def get_payment_requests(self, status: str = None) -> List[dict]:
    """Get payment requests with optional status filter"""
    if status:
        query = """
        SELECT pr.*, u.full_name, u.email, c.title as course_title, pm.type as payment_type, pm.account_number
        FROM payment_requests pr
        JOIN users u ON pr.user_id = u.id
        JOIN courses c ON pr.course_id = c.id
        JOIN payment_methods pm ON pr.payment_method_id = pm.id
        WHERE pr.status = :status
        ORDER BY pr.created_at DESC
        """
        params = {"status": status}
    else:
        query = """
        SELECT pr.*, u.full_name, u.email, c.title as course_title, pm.type as payment_type, pm.account_number
        FROM payment_requests pr
        JOIN users u ON pr.user_id = u.id
        JOIN courses c ON pr.course_id = c.id
        JOIN payment_methods pm ON pr.payment_method_id = pm.id
        ORDER BY pr.created_at DESC
        """
        params = {}
    
    async with get_async_session() as session:
        rows = await session.execute(text(query), params)
        results = []
        for row in rows.mappings().all():
            result_dict = dict(row)
            # Convert UUIDs to strings
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            if 'user_id' in result_dict and result_dict['user_id']:
                result_dict['user_id'] = str(result_dict['user_id'])
            if 'course_id' in result_dict and result_dict['course_id']:
                result_dict['course_id'] = str(result_dict['course_id'])
            if 'payment_method_id' in result_dict and result_dict['payment_method_id']:
                result_dict['payment_method_id'] = str(result_dict['payment_method_id'])
            # Convert datetime to string
            if 'created_at' in result_dict and result_dict['created_at']:
                if hasattr(result_dict['created_at'], 'isoformat'):
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                else:
                    result_dict['created_at'] = str(result_dict['created_at'])
            if 'approved_at' in result_dict and result_dict['approved_at']:
                if hasattr(result_dict['approved_at'], 'isoformat'):
                    result_dict['approved_at'] = result_dict['approved_at'].isoformat()
                else:
                    result_dict['approved_at'] = str(result_dict['approved_at'])
            # Convert approved_by UUID to string
            if 'approved_by' in result_dict and result_dict['approved_by'] is not None:
                try:
                    result_dict['approved_by'] = str(result_dict['approved_by'])
                except Exception as e:
                    print(f"Warning: Failed to convert approved_by UUID: {e}")
                    result_dict['approved_by'] = None
            results.append(result_dict)
        return results
