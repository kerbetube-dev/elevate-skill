from typing import List, Optional
from datetime import datetime
import uuid
from uuid import UUID
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from .connection import get_async_session

# Import in-memory database as fallback
try:
    from ..dev_inmemory import InMemoryDatabase
    inmemory_db = InMemoryDatabase()
    USE_INMEMORY_FALLBACK = True
except ImportError:
    USE_INMEMORY_FALLBACK = False

class DatabaseOperations:
    """
    Database operations using PostgreSQL/Supabase
    Replaces the in-memory database
    """
    
    def __init__(self):
        pass
    
    # User operations
    async def create_user(self, user_data: dict) -> dict:
        """Create a new user"""
        # Try real database first, fallback to in-memory if not available
        try:
            user_id = str(uuid.uuid4())
            referral_code = f"ELEVATE{user_id[:8].upper()}"

            query = """
            INSERT INTO users (id, full_name, email, password, referral_code, referred_by, created_at, role, total_earnings)
            VALUES (:id, :full_name, :email, :password, :referral_code, :referred_by, :created_at, :role, :total_earnings)
            RETURNING *
            """

            values = {
                "id": user_id,
                "full_name": user_data["fullName"],
                "email": user_data["email"],
                "password": user_data["password"],
                "referral_code": referral_code,
                "referred_by": user_data.get("referralCode"),
                "created_at": datetime.utcnow(),
                "role": "student",
                "total_earnings": 0
            }

            async with get_async_session() as session:  # type: AsyncSession
                row = await session.execute(text(query), values)
                result = row.mappings().first()
                await session.commit()
            if result:
                result_dict = dict(result)
                # Convert UUID to string if present
                if 'id' in result_dict and result_dict['id']:
                    result_dict['id'] = str(result_dict['id'])
                return result_dict
            return None
        except Exception as e:
            print(f"Real database failed: {e}")
            if USE_INMEMORY_FALLBACK:
                print("Using in-memory database fallback")
                # Use in-memory database as fallback
                return self._create_user_inmemory(user_data)
            raise

    def _create_user_inmemory(self, user_data: dict) -> dict:
        """Create user in in-memory database (fallback)"""
        user_id = str(uuid.uuid4())
        referral_code = f"ELEVATE{user_id[:8].upper()}"

        user = {
            "id": user_id,
            "fullName": user_data["fullName"],
            "email": user_data["email"],
            "password": user_data["password"],  # In production, this should be hashed
            "referralCode": referral_code,
            "created_at": datetime.utcnow().isoformat(),
            "role": "student",
            "totalEarnings": 0
        }

        inmemory_db.users[user_id] = user
        return user

    def _create_referral_inmemory(self, referrer_id: str, referral_data: dict) -> dict:
        """Create referral in in-memory database (fallback)"""
        referral_id = str(uuid.uuid4())

        referral = {
            "id": referral_id,
            "referrer_id": referrer_id,
            "status": "pending",
            "reward_earned": 0,
            "date_referred": datetime.utcnow().isoformat(),
            **referral_data
        }

        inmemory_db.referrals[referral_id] = referral
        return referral

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email"""
        try:
            query = "SELECT * FROM users WHERE email = :email"
            async with get_async_session() as session:
                row = await session.execute(text(query), {"email": email})
                result = row.mappings().first()
            if result:
                result_dict = dict(result)
                # Convert UUID to string if present
                if 'id' in result_dict and result_dict['id']:
                    result_dict['id'] = str(result_dict['id'])
                return result_dict
            return None
        except Exception as e:
            print(f"Real database failed: {e}")
            if USE_INMEMORY_FALLBACK:
                print("Using in-memory database fallback")
                # Use in-memory database as fallback
                for user in inmemory_db.users.values():
                    if user["email"] == email:
                        return user
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID"""
        query = "SELECT * FROM users WHERE id = :user_id"
        async with get_async_session() as session:
            row = await session.execute(text(query), {"user_id": user_id})
            result = row.mappings().first()
        if result:
            result_dict = dict(result)
            # Convert UUID to string if present
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            return result_dict
        return None
    
    async def update_user(self, email: str, updates: dict) -> Optional[dict]:
        """Update user information"""
        set_clause = ", ".join([f"{key} = :{key}" for key in updates.keys()])
        query = f"UPDATE users SET {set_clause} WHERE email = :email RETURNING *"
        values = {**updates, "email": email}
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        return dict(result) if result else None
    
    # Course operations
    async def get_all_courses(self) -> List[dict]:
        """Get all courses"""
        import json
        
        query = "SELECT * FROM courses ORDER BY created_at DESC"
        async with get_async_session() as session:
            rows = await session.execute(text(query))
            courses = []
            for row in rows.mappings().all():
                course_dict = dict(row)
                # Convert UUID to string if present
                if 'id' in course_dict and course_dict['id']:
                    course_dict['id'] = str(course_dict['id'])
                
                # Parse JSON fields
                if 'outcomes' in course_dict and course_dict['outcomes']:
                    try:
                        course_dict['outcomes'] = json.loads(course_dict['outcomes'])
                    except (json.JSONDecodeError, TypeError):
                        course_dict['outcomes'] = []
                
                if 'curriculum' in course_dict and course_dict['curriculum']:
                    try:
                        course_dict['curriculum'] = json.loads(course_dict['curriculum'])
                    except (json.JSONDecodeError, TypeError):
                        course_dict['curriculum'] = []
                
                courses.append(course_dict)
            return courses
    
    async def get_course_by_id(self, course_id: str) -> Optional[dict]:
        """Get course by ID"""
        import json
        
        query = "SELECT * FROM courses WHERE id = :course_id"
        async with get_async_session() as session:
            row = await session.execute(text(query), {"course_id": course_id})
            result = row.mappings().first()
        if result:
            result_dict = dict(result)
            print(result_dict)
            # Convert UUID to string if present
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            
            # Parse JSON fields
            # if 'outcomes' in result_dict and result_dict['outcomes']:
            #     try:
            #         result_dict['outcomes'] = json.loads(result_dict['outcomes'])
            #     except (json.JSONDecodeError, TypeError):
            #         result_dict['outcomes'] = []
            
            # if 'curriculum' in result_dict and result_dict['curriculum']:
            #     try:
            #         result_dict['curriculum'] = json.loads(result_dict['curriculum'])
            #     except (json.JSONDecodeError, TypeError):
            #         result_dict['curriculum'] = []
            
            return result_dict
        return None
    
    async def create_course(self, course_data: dict) -> dict:
        """Create a new course"""
        course_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO courses (id, title, description, image, price, duration, students, rating, level, instructor, outcomes, curriculum, created_at)
        VALUES (:id, :title, :description, :image, :price, :duration, :students, :rating, :level, :instructor, :outcomes, :curriculum, :created_at)
        RETURNING *
        """
        
        values = {
            "id": course_id,
            "students": 0,
            "rating": 0.0,
            "created_at": datetime.utcnow(),
            **course_data
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        return dict(result) if result else None
    
    async def update_course(self, course_id: str, updates: dict) -> Optional[dict]:
        """Update course information"""
        set_clause = ", ".join([f"{key} = :{key}" for key in updates.keys()])
        query = f"UPDATE courses SET {set_clause} WHERE id = :course_id RETURNING *"
        values = {**updates, "course_id": course_id}
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        return dict(result) if result else None
    
    # Enrollment operations
    async def create_enrollment(self, user_id: str, enrollment_data: dict) -> dict:
        """Create a new enrollment"""
        enrollment_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress, status)
        VALUES (:id, :user_id, :course_id, :enrolled_at, :progress, :status)
        RETURNING *
        """
        
        values = {
            "id": enrollment_id,
            "user_id": user_id,
            "course_id": enrollment_data["course_id"],
            "enrolled_at": datetime.utcnow(),
            "progress": 0,
            "status": "active"
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
        if result:
            await session.execute(
                text("UPDATE courses SET students = students + 1 WHERE id = :course_id"),
                {"course_id": enrollment_data["course_id"]},
            )
        await session.commit()
        return dict(result) if result else None
    
    async def get_user_enrollments(self, user_id: str) -> List[dict]:
        """Get user's enrollments with course details"""
        query = """
        SELECT e.*, c.title, c.description, c.image, c.instructor, c.duration
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = :user_id
        ORDER BY e.enrolled_at DESC
        """
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            return [dict(m) for m in rows.mappings().all()]
    
    async def update_enrollment_progress(self, user_id: str, enrollment_id: str, progress: int) -> Optional[dict]:
        """Update enrollment progress"""
        status = "completed" if progress >= 100 else "active"
        
        query = """
        UPDATE enrollments 
        SET progress = :progress, status = :status 
        WHERE id = :enrollment_id AND user_id = :user_id 
        RETURNING *
        """
        
        values = {
            "progress": progress,
            "status": status,
            "enrollment_id": enrollment_id,
            "user_id": user_id
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        return dict(result) if result else None
    
    # Payment method operations
    async def create_payment_method(self, user_id: str, method_data: dict) -> dict:
        """Create a new payment method"""
        method_id = str(uuid.uuid4())
        
        # Check if this is the first payment method (make it default)
        count_query = "SELECT COUNT(*) as count FROM payment_methods WHERE user_id = :user_id"
        async with get_async_session() as session:
            count_row = await session.execute(text(count_query), {"user_id": user_id})
            count_result = count_row.mappings().first()
            is_default = (count_result or {}).get("count", 0) == 0
        
        query = """
        INSERT INTO payment_methods (id, user_id, type, account_number, holder_name, is_default, created_at)
        VALUES (:id, :user_id, :type, :account_number, :holder_name, :is_default, :created_at)
        RETURNING *
        """
        
        values = {
            "id": method_id,
            "user_id": user_id,
            "is_default": is_default,
            "created_at": datetime.utcnow(),
            **method_data
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        
        if result:
            result_dict = dict(result)
            # Convert UUID to string
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            # Convert datetime to string for JSON serialization
            if 'created_at' in result_dict and result_dict['created_at']:
                result_dict['created_at'] = result_dict['created_at'].isoformat()
            
            # Map database column names to response model field names
            return {
                'id': result_dict['id'],
                'type': result_dict['type'],
                'account_number': result_dict['account_number'],
                'holderName': result_dict['holder_name'],
                'isDefault': result_dict['is_default'],
                'created_at': result_dict['created_at']
            }
        return None
    
    async def get_user_payment_methods(self, user_id: str) -> List[dict]:
        """Get user's payment methods"""
        query = "SELECT * FROM payment_methods WHERE user_id = :user_id ORDER BY created_at DESC"
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                # Convert UUID to string
                if 'id' in result_dict and result_dict['id']:
                    result_dict['id'] = str(result_dict['id'])
                # Convert datetime to string for JSON serialization
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                
                # Map database column names to response model field names
                results.append({
                    'id': result_dict['id'],
                    'type': result_dict['type'],
                    'account_number': result_dict['account_number'],
                    'holderName': result_dict['holder_name'],
                    'isDefault': result_dict['is_default'],
                    'created_at': result_dict['created_at']
                })
            return results
    
    async def delete_payment_method(self, user_id: str, method_id: str) -> bool:
        """Delete a payment method"""
        query = "DELETE FROM payment_methods WHERE id = :method_id AND user_id = :user_id"
        async with get_async_session() as session:
            row = await session.execute(text(query), {"method_id": method_id, "user_id": user_id})
            await session.commit()
            return row.rowcount and row.rowcount > 0
    
    async def set_default_payment_method(self, user_id: str, method_id: str) -> bool:
        """Set a payment method as default"""
        # First, unset all defaults for this user
        async with get_async_session() as session:
            await session.execute(
                text("UPDATE payment_methods SET is_default = false WHERE user_id = :user_id"),
                {"user_id": user_id},
            )
            result = await session.execute(
                text("UPDATE payment_methods SET is_default = true WHERE id = :method_id AND user_id = :user_id"),
                {"method_id": method_id, "user_id": user_id},
            )
            await session.commit()
            return result.rowcount and result.rowcount > 0
    
    # Payment request operations
    async def create_payment_request(self, user_id: str, request_data: dict) -> dict:
        """Create a new payment request"""
        request_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO payment_requests (id, user_id, course_id, payment_account_id, amount, status, created_at)
        VALUES (:id, :user_id, :course_id, :payment_account_id, :amount, :status, :created_at)
        RETURNING *
        """
        
        values = {
            "id": request_id,
            "user_id": user_id,
            "status": "pending",
            "created_at": datetime.utcnow(),
            **request_data
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        
        if result:
            result_dict = dict(result)
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            # Convert database field names to API response format
            return {
                "id": str(result_dict['id']),
                "userId": result_dict['user_id'],
                "courseId": result_dict['course_id'],
                "paymentAccountId": result_dict['payment_account_id'],
                "amount": float(result_dict['amount']),
                "status": result_dict['status'],
                "created_at": result_dict['created_at'].isoformat()
            }
        return None
    
    async def get_payment_requests(self, status: str = None) -> List[dict]:
        """Get payment requests with optional status filter"""
        if status:
            query = """
            SELECT pr.*, u.full_name, u.email, c.title as course_title, 
                   apa.type as payment_type, apa.account_number
            FROM payment_requests pr
            JOIN users u ON pr.user_id = u.id
            JOIN courses c ON pr.course_id = c.id
            JOIN admin_payment_accounts apa ON pr.payment_account_id = apa.id
            WHERE pr.status = :status
            ORDER BY pr.created_at DESC
            """
            params = {"status": status}
        else:
            query = """
            SELECT pr.*, u.full_name, u.email, c.title as course_title, 
                   apa.type as payment_type, apa.account_number
            FROM payment_requests pr
            JOIN users u ON pr.user_id = u.id
            JOIN courses c ON pr.course_id = c.id
            JOIN admin_payment_accounts apa ON pr.payment_account_id = apa.id
            ORDER BY pr.created_at DESC
            """
            params = {}
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), params)
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                
                # UNIVERSAL UUID CONVERSION - Convert ALL UUIDs to strings immediately
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                
                # Convert datetime to string (after UUID conversion)
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
                
                results.append(result_dict)
            return results
    
    async def approve_payment_request(self, request_id: str, admin_id: str, admin_notes: str = None) -> bool:
        """Approve a payment request and create enrollment"""
        async with get_async_session() as session:
            # Update payment request status
            update_query = """
            UPDATE payment_requests 
            SET status = 'approved', approved_at = :approved_at, admin_notes = :admin_notes, approved_by = :admin_id
            WHERE id = :request_id
            """
            
            await session.execute(text(update_query), {
                "request_id": request_id,
                "approved_at": datetime.utcnow(),
                "admin_id": admin_id,
                "admin_notes": admin_notes
            })
            
            # Get payment request details
            get_query = "SELECT * FROM payment_requests WHERE id = :request_id"
            result = await session.execute(text(get_query), {"request_id": request_id})
            payment_request = result.mappings().first()
            
            if not payment_request:
                await session.rollback()
                return False
            
            # Create enrollment
            enrollment_data = {
                "course_id": payment_request["course_id"],
                "payment_account_id": payment_request["payment_account_id"],
                "payment_status": "approved"
            }
            
            enrollment = await self.create_enrollment(payment_request["user_id"], enrollment_data)
            
            if not enrollment:
                await session.rollback()
                return False
            
            # TODO: Implement referral system when referrals table is available
            # Update referral status if exists
            # referral_query = """
            # UPDATE referrals 
            # SET status = 'completed', reward_earned = 100, payment_request_id = :request_id
            # WHERE email = (SELECT email FROM users WHERE id = :user_id)
            # AND status = 'pending'
            # """
            
            # await session.execute(text(referral_query), {
            #     "request_id": request_id,
            #     "user_id": payment_request["user_id"]
            # })
            
            # # Update referrer's earnings
            # earnings_query = """
            # UPDATE users 
            # SET total_earnings = total_earnings + 100
            # WHERE id = (
            #     SELECT referrer_id FROM referrals 
            #     WHERE email = (SELECT email FROM users WHERE id = :user_id)
            #     AND status = 'completed'
            # )
            # """
            
            # await session.execute(text(earnings_query), {"user_id": payment_request["user_id"]})
            
            await session.commit()
            return True
    
    async def reject_payment_request(self, request_id: str, admin_id: str, rejection_reason: str) -> bool:
        """Reject a payment request"""
        query = """
        UPDATE payment_requests 
        SET status = 'rejected', approved_at = :rejected_at, rejection_reason = :rejection_reason, approved_by = :admin_id
        WHERE id = :request_id
        """
        
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "request_id": request_id,
                "rejected_at": datetime.utcnow(),
                "admin_id": admin_id,
                "rejection_reason": rejection_reason
            })
            await session.commit()
            return result.rowcount and result.rowcount > 0

    # Admin operations
    async def get_admin_by_email(self, email: str) -> Optional[dict]:
        """Get admin user by email"""
        query = "SELECT * FROM admin_users WHERE email = :email AND is_active = TRUE"
        async with get_async_session() as session:
            row = await session.execute(text(query), {"email": email})
            result = row.mappings().first()
        return dict(result) if result else None
    
    async def update_admin_last_login(self, admin_id: str) -> bool:
        """Update admin last login time"""
        query = "UPDATE admin_users SET last_login = :last_login WHERE id = :admin_id"
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "admin_id": admin_id,
                "last_login": datetime.utcnow()
            })
            await session.commit()
        return result.rowcount and result.rowcount > 0

    # Referral operations (updated to work with payment approval)
    async def create_referral(self, referrer_id: str, referral_data: dict) -> dict:
        """Create a new referral (status pending until payment approved)"""
        try:
            referral_id = str(uuid.uuid4())

            query = """
            INSERT INTO referrals (id, referrer_id, name, email, status, reward_earned, date_referred)
            VALUES (:id, :referrer_id, :name, :email, :status, :reward_earned, :date_referred)
            RETURNING *
            """

            values = {
                "id": referral_id,
                "referrer_id": referrer_id,
                "status": "pending",  # Changed from "completed" to "pending"
                "reward_earned": 0,   # Changed from 100 to 0
                "date_referred": datetime.utcnow(),
                **referral_data
            }

            async with get_async_session() as session:
                row = await session.execute(text(query), values)
                result = row.mappings().first()
                await session.commit()

            return dict(result) if result else None
        except Exception as e:
            print(f"Real database failed: {e}")
            if USE_INMEMORY_FALLBACK:
                print("Using in-memory database fallback")
                # Use in-memory database as fallback
                return self._create_referral_inmemory(referrer_id, referral_data)
            raise
    
    async def get_user_referrals(self, user_id: str) -> List[dict]:
        """Get user's referrals"""
        query = "SELECT * FROM referrals WHERE referrer_id = :user_id ORDER BY date_referred DESC"
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                
                # Convert UUIDs to strings
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                
                # Convert datetime to string
                if 'date_referred' in result_dict and result_dict['date_referred']:
                    if hasattr(result_dict['date_referred'], 'isoformat'):
                        result_dict['created_at'] = result_dict['date_referred'].isoformat()
                    else:
                        result_dict['created_at'] = str(result_dict['date_referred'])
                
                # Map field names to match Pydantic model
                result_dict['rewardEarned'] = result_dict.pop('reward_earned', 0)
                result_dict['referredUserName'] = result_dict.pop('name', 'Unknown User')
                
                # Add completedAt if referral is completed
                if result_dict.get('status') == 'completed' and result_dict.get('payment_request_id'):
                    # Get the approval date from the payment request
                    query_approval_date = """
                    SELECT approved_at FROM payment_requests WHERE id = :payment_request_id
                    """
                    approval_row = await session.execute(text(query_approval_date), {
                        "payment_request_id": result_dict['payment_request_id']
                    })
                    approval_result = approval_row.mappings().first()
                    if approval_result and approval_result['approved_at']:
                        result_dict['completedAt'] = approval_result['approved_at'].isoformat()
                
                # Remove fields not needed in response
                result_dict.pop('referrer_id', None)
                result_dict.pop('date_referred', None)
                result_dict.pop('payment_request_id', None)
                
                results.append(result_dict)
            return results
    
    async def find_user_by_referral_code(self, referral_code: str) -> Optional[dict]:
        """Find user by referral code"""
        try:
            query = "SELECT * FROM users WHERE referral_code = :referral_code"
            async with get_async_session() as session:
                row = await session.execute(text(query), {"referral_code": referral_code})
                result = row.mappings().first()
            return dict(result) if result else None
        except Exception as e:
            print(f"Real database failed: {e}")
            if USE_INMEMORY_FALLBACK:
                print("Using in-memory database fallback")
                # Use in-memory database as fallback
                for user in inmemory_db.users.values():
                    if user["referralCode"] == referral_code:
                        return user
            return None

    # User management operations
    async def get_all_users(self) -> List[dict]:
        """Get all users"""
        query = "SELECT * FROM users ORDER BY created_at DESC"
        async with get_async_session() as session:
            rows = await session.execute(text(query))
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                if 'id' in result_dict and result_dict['id']:
                    result_dict['id'] = str(result_dict['id'])
                # Convert datetime to string for JSON serialization
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                results.append(result_dict)
            return results

    async def update_user_status(self, user_id: str, is_active: bool) -> bool:
        """Update user active status"""
        query = "UPDATE users SET is_active = :is_active WHERE id = :user_id"
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "user_id": user_id,
                "is_active": is_active
            })
            await session.commit()
            return result.rowcount and result.rowcount > 0

    # Course management operations
    async def create_course(self, course_data: dict) -> dict:
        """Create a new course"""
        course_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO courses (id, title, description, instructor, price, duration, level, 
                           students, rating, image, created_at, updated_at)
        VALUES (:id, :title, :description, :instructor, :price, :duration, :level, 
                :students, :rating, :image, :created_at, :updated_at)
        RETURNING *
        """
        
        values = {
            "id": course_id,
            "students": 0,
            "rating": 0.0,
            "image": "/src/assets/placeholder-course.jpg",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            **course_data
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
        
        if result:
            result_dict = dict(result)
            if 'id' in result_dict and result_dict['id']:
                result_dict['id'] = str(result_dict['id'])
            # Convert datetime to string for JSON serialization
            if 'created_at' in result_dict and result_dict['created_at']:
                result_dict['created_at'] = result_dict['created_at'].isoformat()
            if 'updated_at' in result_dict and result_dict['updated_at']:
                result_dict['updated_at'] = result_dict['updated_at'].isoformat()
            return result_dict
        return None

    async def update_course(self, course_id: str, course_data: dict) -> bool:
        """Update a course"""
        # Add updated_at timestamp
        course_data["updated_at"] = datetime.utcnow()
        
        # Build dynamic update query
        set_clauses = []
        values = {"course_id": course_id}
        
        for key, value in course_data.items():
            if key != "id":  # Don't update the ID
                set_clauses.append(f"{key} = :{key}")
                values[key] = value
        
        if not set_clauses:
            return False
        
        query = f"UPDATE courses SET {', '.join(set_clauses)} WHERE id = :course_id"
        
        async with get_async_session() as session:
            result = await session.execute(text(query), values)
            await session.commit()
            return result.rowcount and result.rowcount > 0

    async def delete_course(self, course_id: str) -> bool:
        """Delete a course"""
        query = "DELETE FROM courses WHERE id = :course_id"
        async with get_async_session() as session:
            result = await session.execute(text(query), {"course_id": course_id})
            await session.commit()
            return result.rowcount and result.rowcount > 0

    async def update_course_status(self, course_id: str, is_active: bool) -> bool:
        """Update course active status"""
        query = "UPDATE courses SET is_active = :is_active, updated_at = :updated_at WHERE id = :course_id"
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "course_id": course_id,
                "is_active": is_active,
                "updated_at": datetime.utcnow()
            })
            await session.commit()
            return result.rowcount and result.rowcount > 0

    async def get_course_enrollments(self, course_id: str) -> List[dict]:
        """Get course enrollments"""
        query = """
        SELECT e.*, u.full_name as user_name, u.email as user_email
        FROM enrollments e
        JOIN users u ON e.user_id = u.id
        WHERE e.course_id = :course_id
        ORDER BY e.enrolled_at DESC
        """
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"course_id": course_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                if 'id' in result_dict and result_dict['id']:
                    result_dict['id'] = str(result_dict['id'])
                if 'user_id' in result_dict and result_dict['user_id']:
                    result_dict['user_id'] = str(result_dict['user_id'])
                if 'course_id' in result_dict and result_dict['course_id']:
                    result_dict['course_id'] = str(result_dict['course_id'])
                # Convert datetime to string for JSON serialization
                if 'enrolled_at' in result_dict and result_dict['enrolled_at']:
                    result_dict['enrolled_at'] = result_dict['enrolled_at'].isoformat()
                results.append(result_dict)
            return results

    async def get_course_stats(self, course_id: str) -> dict:
        """Get course statistics"""
        # Get total enrollments
        enrollments_query = "SELECT COUNT(*) as total_enrollments FROM enrollments WHERE course_id = :course_id"
        
        # Get active enrollments
        active_enrollments_query = "SELECT COUNT(*) as active_enrollments FROM enrollments WHERE course_id = :course_id AND status = 'active'"
        
        # Get completed enrollments
        completed_enrollments_query = "SELECT COUNT(*) as completed_enrollments FROM enrollments WHERE course_id = :course_id AND status = 'completed'"
        
        # Get total revenue
        revenue_query = """
        SELECT COALESCE(SUM(c.price), 0) as total_revenue
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.course_id = :course_id AND e.payment_status = 'approved'
        """
        
        async with get_async_session() as session:
            # Execute all queries
            total_enrollments = await session.execute(text(enrollments_query), {"course_id": course_id})
            active_enrollments = await session.execute(text(active_enrollments_query), {"course_id": course_id})
            completed_enrollments = await session.execute(text(completed_enrollments_query), {"course_id": course_id})
            revenue = await session.execute(text(revenue_query), {"course_id": course_id})
            
            return {
                "total_enrollments": total_enrollments.scalar() or 0,
                "active_enrollments": active_enrollments.scalar() or 0,
                "completed_enrollments": completed_enrollments.scalar() or 0,
                "total_revenue": float(revenue.scalar() or 0)
            }

    async def get_course_categories(self) -> List[str]:
        """Get all unique course categories (using level as category)"""
        query = "SELECT DISTINCT level FROM courses WHERE level IS NOT NULL ORDER BY level"
        async with get_async_session() as session:
            rows = await session.execute(text(query))
            return [row[0] for row in rows.fetchall()]

    # Analytics operations
    async def get_analytics_overview(self) -> dict:
        """Get comprehensive analytics overview"""
        # Get total counts
        total_users_query = "SELECT COUNT(*) FROM users"
        total_courses_query = "SELECT COUNT(*) FROM courses"
        total_enrollments_query = "SELECT COUNT(*) FROM enrollments"
        total_revenue_query = """
        SELECT COALESCE(SUM(c.price), 0) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.payment_status = 'approved'
        """
        
        # Get recent activity (last 30 days)
        recent_users_query = """
        SELECT COUNT(*) FROM users 
        WHERE created_at >= NOW() - INTERVAL '30 days'
        """
        recent_enrollments_query = """
        SELECT COUNT(*) FROM enrollments 
        WHERE enrolled_at >= NOW() - INTERVAL '30 days'
        """
        recent_revenue_query = """
        SELECT COALESCE(SUM(c.price), 0) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.payment_status = 'approved' 
        AND e.enrolled_at >= NOW() - INTERVAL '30 days'
        """
        
        async with get_async_session() as session:
            total_users = await session.execute(text(total_users_query))
            total_courses = await session.execute(text(total_courses_query))
            total_enrollments = await session.execute(text(total_enrollments_query))
            total_revenue = await session.execute(text(total_revenue_query))
            recent_users = await session.execute(text(recent_users_query))
            recent_enrollments = await session.execute(text(recent_enrollments_query))
            recent_revenue = await session.execute(text(recent_revenue_query))
            
            return {
                "total_users": total_users.scalar() or 0,
                "total_courses": total_courses.scalar() or 0,
                "total_enrollments": total_enrollments.scalar() or 0,
                "total_revenue": float(total_revenue.scalar() or 0),
                "recent_users": recent_users.scalar() or 0,
                "recent_enrollments": recent_enrollments.scalar() or 0,
                "recent_revenue": float(recent_revenue.scalar() or 0)
            }

    async def get_revenue_analytics(self, period: str) -> dict:
        """Get revenue analytics for specified period"""
        # Calculate date range based on period
        if period == "7d":
            days = 7
        elif period == "30d":
            days = 30
        elif period == "90d":
            days = 90
        elif period == "1y":
            days = 365
        else:
            days = 30
        
        # Get daily revenue for the period
        daily_revenue_query = """
        SELECT 
            DATE(e.enrolled_at) as date,
            COALESCE(SUM(c.price), 0) as revenue
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.payment_status = 'approved' 
        AND e.enrolled_at >= NOW() - INTERVAL '%s days'
        GROUP BY DATE(e.enrolled_at)
        ORDER BY date
        """ % days
        
        # Get total revenue for the period
        total_revenue_query = """
        SELECT COALESCE(SUM(c.price), 0) 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.payment_status = 'approved' 
        AND e.enrolled_at >= NOW() - INTERVAL '%s days'
        """ % days
        
        async with get_async_session() as session:
            daily_revenue = await session.execute(text(daily_revenue_query))
            total_revenue = await session.execute(text(total_revenue_query))
            
            daily_data = []
            for row in daily_revenue.fetchall():
                daily_data.append({
                    "date": row[0].isoformat() if row[0] else None,
                    "revenue": float(row[1] or 0)
                })
            
            return {
                "period": period,
                "total_revenue": float(total_revenue.scalar() or 0),
                "daily_revenue": daily_data
            }

    async def get_user_analytics(self, period: str) -> dict:
        """Get user growth and engagement analytics"""
        days = 30 if period == "30d" else 7 if period == "7d" else 90 if period == "90d" else 365
        
        # Get daily user registrations
        daily_users_query = """
        SELECT 
            DATE(created_at) as date,
            COUNT(*) as new_users
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '%s days'
        GROUP BY DATE(created_at)
        ORDER BY date
        """ % days
        
        # Get total users for the period
        total_users_query = """
        SELECT COUNT(*) 
        FROM users 
        WHERE created_at >= NOW() - INTERVAL '%s days'
        """ % days
        
        async with get_async_session() as session:
            daily_users = await session.execute(text(daily_users_query))
            total_users = await session.execute(text(total_users_query))
            
            daily_data = []
            for row in daily_users.fetchall():
                daily_data.append({
                    "date": row[0].isoformat() if row[0] else None,
                    "new_users": row[1] or 0
                })
            
            return {
                "period": period,
                "total_new_users": total_users.scalar() or 0,
                "daily_users": daily_data
            }

    async def get_course_analytics(self) -> dict:
        """Get course performance analytics"""
        # Get top performing courses
        top_courses_query = """
        SELECT 
            c.id,
            c.title,
            c.instructor,
            c.price,
            COUNT(e.id) as enrollments,
            COALESCE(SUM(c.price), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id AND e.payment_status = 'approved'
        GROUP BY c.id, c.title, c.instructor, c.price
        ORDER BY enrollments DESC
        LIMIT 10
        """
        
        # Get course completion rates
        completion_query = """
        SELECT 
            c.title,
            COUNT(e.id) as total_enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        GROUP BY c.id, c.title
        HAVING COUNT(e.id) > 0
        ORDER BY total_enrollments DESC
        """
        
        async with get_async_session() as session:
            top_courses = await session.execute(text(top_courses_query))
            completion_rates = await session.execute(text(completion_query))
            
            top_courses_data = []
            for row in top_courses.fetchall():
                top_courses_data.append({
                    "id": str(row[0]),
                    "title": row[1],
                    "instructor": row[2],
                    "price": float(row[3] or 0),
                    "enrollments": row[4] or 0,
                    "revenue": float(row[5] or 0)
                })
            
            completion_data = []
            for row in completion_rates.fetchall():
                total = row[1] or 0
                completed = row[2] or 0
                completion_rate = (completed / total * 100) if total > 0 else 0
                completion_data.append({
                    "title": row[0],
                    "total_enrollments": total,
                    "completed_enrollments": completed,
                    "completion_rate": round(completion_rate, 2)
                })
            
            return {
                "top_courses": top_courses_data,
                "completion_rates": completion_data
            }

    async def get_enrollment_analytics(self, period: str) -> dict:
        """Get enrollment trends and analytics"""
        days = 30 if period == "30d" else 7 if period == "7d" else 90 if period == "90d" else 365
        
        # Get daily enrollments
        daily_enrollments_query = """
        SELECT 
            DATE(enrolled_at) as date,
            COUNT(*) as enrollments
        FROM enrollments 
        WHERE enrolled_at >= NOW() - INTERVAL '%s days'
        GROUP BY DATE(enrolled_at)
        ORDER BY date
        """ % days
        
        # Get enrollment by course
        course_enrollments_query = """
        SELECT 
            c.title,
            COUNT(e.id) as enrollments
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id 
        AND e.enrolled_at >= NOW() - INTERVAL '%s days'
        GROUP BY c.id, c.title
        ORDER BY enrollments DESC
        LIMIT 10
        """ % days
        
        async with get_async_session() as session:
            daily_enrollments = await session.execute(text(daily_enrollments_query))
            course_enrollments = await session.execute(text(course_enrollments_query))
            
            daily_data = []
            for row in daily_enrollments.fetchall():
                daily_data.append({
                    "date": row[0].isoformat() if row[0] else None,
                    "enrollments": row[1] or 0
                })
            
            course_data = []
            for row in course_enrollments.fetchall():
                course_data.append({
                    "title": row[0],
                    "enrollments": row[1] or 0
                })
            
            return {
                "period": period,
                "daily_enrollments": daily_data,
                "course_enrollments": course_data
            }

    async def get_referral_analytics(self) -> dict:
        """Get referral program analytics"""
        # Get referral statistics
        referral_stats_query = """
        SELECT 
            COUNT(*) as total_referrals,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
            COALESCE(SUM(reward_earned), 0) as total_rewards_paid
        FROM referrals
        """
        
        # Get top referrers
        top_referrers_query = """
        SELECT 
            u.full_name,
            u.email,
            COUNT(r.id) as total_referrals,
            COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as successful_referrals,
            COALESCE(SUM(r.reward_earned), 0) as total_earnings
        FROM users u
        LEFT JOIN referrals r ON u.id = r.referrer_id
        GROUP BY u.id, u.full_name, u.email
        HAVING COUNT(r.id) > 0
        ORDER BY total_referrals DESC
        LIMIT 10
        """
        
        async with get_async_session() as session:
            referral_stats = await session.execute(text(referral_stats_query))
            top_referrers = await session.execute(text(top_referrers_query))
            
            stats = referral_stats.fetchone()
            stats_data = {
                "total_referrals": stats[0] or 0,
                "completed_referrals": stats[1] or 0,
                "pending_referrals": stats[2] or 0,
                "total_rewards_paid": float(stats[3] or 0)
            }
            
            top_referrers_data = []
            for row in top_referrers.fetchall():
                top_referrers_data.append({
                    "name": row[0],
                    "email": row[1],
                    "total_referrals": row[2] or 0,
                    "successful_referrals": row[3] or 0,
                    "total_earnings": float(row[4] or 0)
                })
            
            return {
                "statistics": stats_data,
                "top_referrers": top_referrers_data
            }

    async def get_financial_report(self, start_date: str = None, end_date: str = None) -> dict:
        """Generate financial report"""
        # Build date filter
        date_filter = ""
        if start_date and end_date:
            date_filter = f"AND e.enrolled_at >= '{start_date}' AND e.enrolled_at <= '{end_date}'"
        elif start_date:
            date_filter = f"AND e.enrolled_at >= '{start_date}'"
        elif end_date:
            date_filter = f"AND e.enrolled_at <= '{end_date}'"
        
        # Get revenue summary
        revenue_query = f"""
        SELECT 
            COALESCE(SUM(c.price), 0) as total_revenue,
            COUNT(e.id) as total_transactions,
            COALESCE(AVG(c.price), 0) as average_transaction_value
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE e.payment_status = 'approved'
        {date_filter}
        """
        
        # Get revenue by course
        course_revenue_query = f"""
        SELECT 
            c.title,
            c.instructor,
            COUNT(e.id) as enrollments,
            COALESCE(SUM(c.price), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id 
        AND e.payment_status = 'approved'
        {date_filter}
        GROUP BY c.id, c.title, c.instructor
        ORDER BY revenue DESC
        """
        
        async with get_async_session() as session:
            revenue_summary = await session.execute(text(revenue_query))
            course_revenue = await session.execute(text(course_revenue_query))
            
            summary = revenue_summary.fetchone()
            summary_data = {
                "total_revenue": float(summary[0] or 0),
                "total_transactions": summary[1] or 0,
                "average_transaction_value": float(summary[2] or 0)
            }
            
            course_data = []
            for row in course_revenue.fetchall():
                course_data.append({
                    "title": row[0],
                    "instructor": row[1],
                    "enrollments": row[2] or 0,
                    "revenue": float(row[3] or 0)
                })
            
            return {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "summary": summary_data,
                "course_revenue": course_data
            }

    async def get_user_report(self, start_date: str = None, end_date: str = None) -> dict:
        """Generate user activity report"""
        # Build date filter
        date_filter = ""
        if start_date and end_date:
            date_filter = f"AND u.created_at >= '{start_date}' AND u.created_at <= '{end_date}'"
        elif start_date:
            date_filter = f"AND u.created_at >= '{start_date}'"
        elif end_date:
            date_filter = f"AND u.created_at <= '{end_date}'"
        
        # Get user summary
        user_summary_query = f"""
        SELECT 
            COUNT(*) as total_users,
            COUNT(CASE WHEN u.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_users_30d,
            COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_users
        FROM users u
        WHERE 1=1 {date_filter}
        """
        
        # Get user activity
        user_activity_query = f"""
        SELECT 
            DATE(u.created_at) as date,
            COUNT(*) as new_users
        FROM users u
        WHERE 1=1 {date_filter}
        GROUP BY DATE(u.created_at)
        ORDER BY date
        """
        
        async with get_async_session() as session:
            user_summary = await session.execute(text(user_summary_query))
            user_activity = await session.execute(text(user_activity_query))
            
            summary = user_summary.fetchone()
            summary_data = {
                "total_users": summary[0] or 0,
                "new_users_30d": summary[1] or 0,
                "active_users": summary[2] or 0
            }
            
            activity_data = []
            for row in user_activity.fetchall():
                activity_data.append({
                    "date": row[0].isoformat() if row[0] else None,
                    "new_users": row[1] or 0
                })
            
            return {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "summary": summary_data,
                "daily_activity": activity_data
            }

    async def get_course_report(self, start_date: str = None, end_date: str = None) -> dict:
        """Generate course performance report"""
        # Build date filter
        date_filter = ""
        if start_date and end_date:
            date_filter = f"AND e.enrolled_at >= '{start_date}' AND e.enrolled_at <= '{end_date}'"
        elif start_date:
            date_filter = f"AND e.enrolled_at >= '{start_date}'"
        elif end_date:
            date_filter = f"AND e.enrolled_at <= '{end_date}'"
        
        # Get course performance
        course_performance_query = f"""
        SELECT 
            c.title,
            c.instructor,
            c.price,
            c.level,
            COUNT(e.id) as total_enrollments,
            COUNT(CASE WHEN e.payment_status = 'approved' THEN 1 END) as paid_enrollments,
            COUNT(CASE WHEN e.status = 'completed' THEN 1 END) as completed_enrollments,
            COALESCE(SUM(CASE WHEN e.payment_status = 'approved' THEN c.price ELSE 0 END), 0) as revenue
        FROM courses c
        LEFT JOIN enrollments e ON c.id = e.course_id
        {date_filter.replace('e.enrolled_at', 'e.enrolled_at') if date_filter else ''}
        GROUP BY c.id, c.title, c.instructor, c.price, c.level
        ORDER BY revenue DESC
        """
        
        async with get_async_session() as session:
            course_performance = await session.execute(text(course_performance_query))
            
            performance_data = []
            for row in course_performance.fetchall():
                total = row[4] or 0
                completed = row[6] or 0
                completion_rate = (completed / total * 100) if total > 0 else 0
                
                performance_data.append({
                    "title": row[0],
                    "instructor": row[1],
                    "price": float(row[2] or 0),
                    "level": row[3],
                    "total_enrollments": total,
                    "paid_enrollments": row[5] or 0,
                    "completed_enrollments": completed,
                    "completion_rate": round(completion_rate, 2),
                    "revenue": float(row[7] or 0)
                })
            
            return {
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "course_performance": performance_data
            }
    
    # ===================================
    # NEW PAYMENT SYSTEM OPERATIONS
    # ===================================
    
    # Payment Account Operations
    async def get_payment_accounts(self, active_only: bool = True) -> List[dict]:
        """Get all payment accounts, optionally filtered by active status"""
        query = """
        SELECT * FROM admin_payment_accounts
        WHERE (:active_only = false OR is_active = true)
        ORDER BY display_order ASC, created_at DESC
        """
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"active_only": active_only})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                # Convert UUIDs to strings
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime to string
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat() if hasattr(result_dict['created_at'], 'isoformat') else str(result_dict['created_at'])
                if 'updated_at' in result_dict and result_dict['updated_at']:
                    result_dict['updated_at'] = result_dict['updated_at'].isoformat() if hasattr(result_dict['updated_at'], 'isoformat') else str(result_dict['updated_at'])
                
                # Convert snake_case to camelCase for frontend
                result_dict['accountName'] = result_dict.pop('account_name')
                result_dict['account_number'] = result_dict.pop('account_number')
                result_dict['bankName'] = result_dict.pop('bank_name', None)
                result_dict['qrCodeUrl'] = result_dict.pop('qr_code_url', None)
                result_dict['isActive'] = result_dict.pop('is_active')
                result_dict['displayOrder'] = result_dict.pop('display_order')
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                
                results.append(result_dict)
            return results
    
    async def get_payment_account_by_id(self, account_id: str) -> Optional[dict]:
        """Get a specific payment account by ID"""
        query = """
        SELECT * FROM admin_payment_accounts WHERE id = :account_id
        """
        
        async with get_async_session() as session:
            row = await session.execute(text(query), {"account_id": account_id})
            result = row.mappings().first()
            if result:
                result_dict = dict(result)
                # Convert UUIDs to strings
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat() if hasattr(result_dict['created_at'], 'isoformat') else str(result_dict['created_at'])
                if 'updated_at' in result_dict and result_dict['updated_at']:
                    result_dict['updated_at'] = result_dict['updated_at'].isoformat() if hasattr(result_dict['updated_at'], 'isoformat') else str(result_dict['updated_at'])
                
                # Convert snake_case to camelCase
                result_dict['accountName'] = result_dict.pop('account_name')
                result_dict['account_number'] = result_dict.pop('account_number')
                result_dict['bankName'] = result_dict.pop('bank_name', None)
                result_dict['qrCodeUrl'] = result_dict.pop('qr_code_url', None)
                result_dict['isActive'] = result_dict.pop('is_active')
                result_dict['displayOrder'] = result_dict.pop('display_order')
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                
                return result_dict
            return None
    
    async def create_payment_account(self, data: dict) -> dict:
        """Create a new payment account"""
        account_id = str(uuid.uuid4())
        query = """
        INSERT INTO admin_payment_accounts 
        (id, type, account_name, account_number, bank_name, instructions, qr_code_url, is_active, display_order, created_at, updated_at)
        VALUES 
        (:id, :type, :account_name, :account_number, :bank_name, :instructions, :qr_code_url, :is_active, :display_order, :created_at, :updated_at)
        RETURNING *
        """
        
        values = {
            "id": account_id,
            "type": data["type"],
            "account_name": data["accountName"],
            "account_number": data["account_number"],
            "bank_name": data.get("bankName"),
            "instructions": data.get("instructions"),
            "qr_code_url": data.get("qrCodeUrl"),
            "is_active": data.get("isActive", True),
            "display_order": data.get("displayOrder", 0),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
            
            if result:
                result_dict = dict(result)
                result_dict['id'] = str(result_dict['id'])
                result_dict['created_at'] = result_dict['created_at'].isoformat() if hasattr(result_dict['created_at'], 'isoformat') else str(result_dict['created_at'])
                result_dict['updated_at'] = result_dict['updated_at'].isoformat() if hasattr(result_dict['updated_at'], 'isoformat') else str(result_dict['updated_at'])
                
                # Convert to camelCase
                result_dict['accountName'] = result_dict.pop('account_name')
                result_dict['account_number'] = result_dict.pop('account_number')
                result_dict['bankName'] = result_dict.pop('bank_name', None)
                result_dict['qrCodeUrl'] = result_dict.pop('qr_code_url', None)
                result_dict['isActive'] = result_dict.pop('is_active')
                result_dict['displayOrder'] = result_dict.pop('display_order')
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                
                return result_dict
        return None
    
    async def update_payment_account(self, account_id: str, data: dict) -> Optional[dict]:
        """Update a payment account"""
        # Build dynamic update query
        update_fields = []
        values = {"account_id": account_id, "updated_at": datetime.utcnow()}
        
        field_mapping = {
            "type": "type",
            "accountName": "account_name",
            "account_number": "account_number",
            "bankName": "bank_name",
            "instructions": "instructions",
            "qrCodeUrl": "qr_code_url",
            "isActive": "is_active",
            "displayOrder": "display_order"
        }
        
        for frontend_key, db_key in field_mapping.items():
            if frontend_key in data:
                update_fields.append(f"{db_key} = :{db_key}")
                values[db_key] = data[frontend_key]
        
        if not update_fields:
            return None
        
        update_fields.append("updated_at = :updated_at")
        
        query = f"""
        UPDATE admin_payment_accounts
        SET {', '.join(update_fields)}
        WHERE id = :account_id
        RETURNING *
        """
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
            
            if result:
                result_dict = dict(result)
                result_dict['id'] = str(result_dict['id'])
                result_dict['created_at'] = result_dict['created_at'].isoformat() if hasattr(result_dict['created_at'], 'isoformat') else str(result_dict['created_at'])
                result_dict['updated_at'] = result_dict['updated_at'].isoformat() if hasattr(result_dict['updated_at'], 'isoformat') else str(result_dict['updated_at'])
                
                # Convert to camelCase
                result_dict['accountName'] = result_dict.pop('account_name')
                result_dict['account_number'] = result_dict.pop('account_number')
                result_dict['bankName'] = result_dict.pop('bank_name', None)
                result_dict['qrCodeUrl'] = result_dict.pop('qr_code_url', None)
                result_dict['isActive'] = result_dict.pop('is_active')
                result_dict['displayOrder'] = result_dict.pop('display_order')
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                
                return result_dict
        return None
    
    async def delete_payment_account(self, account_id: str) -> bool:
        """Delete a payment account"""
        query = """
        DELETE FROM admin_payment_accounts WHERE id = :account_id
        """
        
        async with get_async_session() as session:
            result = await session.execute(text(query), {"account_id": account_id})
            await session.commit()
            return result.rowcount > 0
    
    # Payment Request Operations
    async def create_payment_request(self, data: dict) -> dict:
        """Create a new payment request"""
        request_id = str(uuid.uuid4())
        query = """
        INSERT INTO payment_requests 
        (id, user_id, course_id, payment_account_id, amount, transaction_screenshot_url, transaction_reference, status, created_at, updated_at)
        VALUES 
        (:id, :user_id, :course_id, :payment_account_id, :amount, :transaction_screenshot_url, :transaction_reference, :status, :created_at, :updated_at)
        RETURNING *
        """
        
        values = {
            "id": request_id,
            "user_id": data["user_id"],
            "course_id": data["course_id"],
            "payment_account_id": data["payment_account_id"],
            "amount": data["amount"],
            "transaction_screenshot_url": data["transaction_screenshot_url"],
            "transaction_reference": data.get("transaction_reference"),
            "status": data.get("status", "pending"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            await session.commit()
            
            if result:
                result_dict = dict(result)
                # Convert UUIDs
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                result_dict['created_at'] = result_dict['created_at'].isoformat() if hasattr(result_dict['created_at'], 'isoformat') else str(result_dict['created_at'])
                result_dict['updated_at'] = result_dict['updated_at'].isoformat() if hasattr(result_dict['updated_at'], 'isoformat') else str(result_dict['updated_at'])
                
                # Convert to camelCase
                result_dict['userId'] = result_dict.pop('user_id')
                result_dict['courseId'] = result_dict.pop('course_id')
                result_dict['paymentAccountId'] = result_dict.pop('payment_account_id')
                result_dict['transactionScreenshotUrl'] = result_dict.pop('transaction_screenshot_url')
                result_dict['transactionReference'] = result_dict.pop('transaction_reference', None)
                result_dict['admin_notes'] = result_dict.pop('admin_notes', None)
                result_dict['rejection_reason'] = result_dict.pop('rejection_reason', None)
                result_dict['approvedBy'] = result_dict.pop('approved_by', None)
                result_dict['approvedAt'] = result_dict.pop('approved_at', None)
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                
                return result_dict
        return None
    
    async def get_user_payment_requests(self, user_id: str) -> List[dict]:
        """Get all payment requests for a user"""
        query = """
        SELECT pr.*, c.title as course_title, apa.account_name as payment_account_name, apa.type as payment_account_type
        FROM payment_requests pr
        JOIN courses c ON pr.course_id = c.id
        JOIN admin_payment_accounts apa ON pr.payment_account_id = apa.id
        WHERE pr.user_id = :user_id
        ORDER BY pr.created_at DESC
        """
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                # Convert UUIDs
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                for date_field in ['created_at', 'updated_at', 'approved_at']:
                    if date_field in result_dict and result_dict[date_field]:
                        result_dict[date_field] = result_dict[date_field].isoformat() if hasattr(result_dict[date_field], 'isoformat') else str(result_dict[date_field])
                
                # Convert to camelCase
                result_dict['userId'] = result_dict.pop('user_id')
                result_dict['courseId'] = result_dict.pop('course_id')
                result_dict['paymentAccountId'] = result_dict.pop('payment_account_id')
                result_dict['transactionScreenshotUrl'] = result_dict.pop('transaction_screenshot_url')
                result_dict['transactionReference'] = result_dict.pop('transaction_reference', None)
                result_dict['admin_notes'] = result_dict.pop('admin_notes', None)
                result_dict['rejection_reason'] = result_dict.pop('rejection_reason', None)
                result_dict['approvedBy'] = result_dict.pop('approved_by', None)
                result_dict['approvedAt'] = result_dict.pop('approved_at', None)
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                result_dict['courseTitle'] = result_dict.pop('course_title')
                result_dict['paymentAccountName'] = result_dict.pop('payment_account_name')
                result_dict['paymentaccount_type'] = result_dict.pop('payment_account_type')
                
                results.append(result_dict)
            return results
    
    async def get_payment_request_by_id(self, request_id: str) -> Optional[dict]:
        """Get a specific payment request"""
        query = """
        SELECT pr.*, u.full_name as user_name, u.email as user_email, 
               c.title as course_title, apa.account_name as payment_account_name, apa.type as payment_account_type
        FROM payment_requests pr
        JOIN users u ON pr.user_id = u.id
        JOIN courses c ON pr.course_id = c.id
        JOIN admin_payment_accounts apa ON pr.payment_account_id = apa.id
        WHERE pr.id = :request_id
        """
        
        async with get_async_session() as session:
            row = await session.execute(text(query), {"request_id": request_id})
            result = row.mappings().first()
            
            if result:
                result_dict = dict(result)
                # Convert UUIDs
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                for date_field in ['created_at', 'updated_at', 'approved_at']:
                    if date_field in result_dict and result_dict[date_field]:
                        result_dict[date_field] = result_dict[date_field].isoformat() if hasattr(result_dict[date_field], 'isoformat') else str(result_dict[date_field])
                
                # Convert to camelCase
                result_dict['userId'] = result_dict.pop('user_id')
                result_dict['courseId'] = result_dict.pop('course_id')
                result_dict['paymentAccountId'] = result_dict.pop('payment_account_id')
                result_dict['transactionScreenshotUrl'] = result_dict.pop('transaction_screenshot_url')
                result_dict['transactionReference'] = result_dict.pop('transaction_reference', None)
                result_dict['admin_notes'] = result_dict.pop('admin_notes', None)
                result_dict['rejection_reason'] = result_dict.pop('rejection_reason', None)
                result_dict['approvedBy'] = result_dict.pop('approved_by', None)
                result_dict['approvedAt'] = result_dict.pop('approved_at', None)
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['updated_at'] = result_dict.pop('updated_at')
                result_dict['userName'] = result_dict.pop('user_name')
                result_dict['userEmail'] = result_dict.pop('user_email')
                result_dict['courseTitle'] = result_dict.pop('course_title')
                result_dict['paymentAccountName'] = result_dict.pop('payment_account_name')
                result_dict['paymentaccount_type'] = result_dict.pop('payment_account_type')
                
                return result_dict
        return None
    
    async def get_user_payment_for_course(self, user_id: str, course_id: str) -> Optional[dict]:
        """Check if user has a payment request for a specific course"""
        query = """
        SELECT * FROM payment_requests
        WHERE user_id = :user_id AND course_id = :course_id
        ORDER BY created_at DESC
        LIMIT 1
        """
        
        async with get_async_session() as session:
            row = await session.execute(text(query), {"user_id": user_id, "course_id": course_id})
            result = row.mappings().first()
            
            if result:
                result_dict = dict(result)
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                return result_dict
        return None
    
    async def approve_payment_and_enroll(self, request_id: str, admin_id: str, admin_notes: Optional[str] = None) -> dict:
        """
        CRITICAL FUNCTION: Approve payment and enroll user in course
        Also handles referral bonus distribution
        """
        async with get_async_session() as session:
            try:
                # 1. Get payment request details
                query_get_payment = """
                SELECT pr.*, u.referred_by, c.price as course_price
                FROM payment_requests pr
                JOIN users u ON pr.user_id = u.id
                JOIN courses c ON pr.course_id = c.id
                WHERE pr.id = :request_id AND pr.status = 'pending'
                """
                
                row = await session.execute(text(query_get_payment), {"request_id": request_id})
                payment = row.mappings().first()
                
                if not payment:
                    raise Exception("Payment request not found or already processed")
                
                payment_dict = dict(payment)
                user_id = str(payment_dict['user_id'])
                course_id = str(payment_dict['course_id'])
                referred_by = payment_dict.get('referred_by')
                course_price = float(payment_dict.get('course_price', 0))
                
                # 2. Update payment status
                query_update_payment = """
                UPDATE payment_requests
                SET status = 'approved', 
                    approved_by = :admin_id, 
                    approved_at = :approved_at,
                    admin_notes = :admin_notes,
                    updated_at = :updated_at
                WHERE id = :request_id
                """
                
                await session.execute(text(query_update_payment), {
                    "request_id": request_id,
                    "admin_id": admin_id,
                    "approved_at": datetime.utcnow(),
                    "admin_notes": admin_notes,
                    "updated_at": datetime.utcnow()
                })
                
                # 3. Create enrollment
                enrollment_id = str(uuid.uuid4())
                query_create_enrollment = """
                INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress, status)
                VALUES (:id, :user_id, :course_id, :enrolled_at, :progress, :status)
                """
                
                await session.execute(text(query_create_enrollment), {
                    "id": enrollment_id,
                    "user_id": user_id,
                    "course_id": course_id,
                    "enrolled_at": datetime.utcnow(),
                    "progress": 0,
                    "status": "active"
                })
                
                # 4. Handle referral bonus if user was referred
                referral_bonus_awarded = False
                referral_amount = 0
                
                if referred_by:
                    # Calculate referral bonus (10% of course price)
                    referral_bonus_percentage = 10
                    referral_amount = (course_price * referral_bonus_percentage) / 100
                    
                    # Find the referrer user ID by referral code
                    query_find_referrer = """
                    SELECT id FROM users WHERE referral_code = :referral_code
                    """
                    referrer_row = await session.execute(text(query_find_referrer), {"referral_code": referred_by})
                    referrer_result = referrer_row.mappings().first()
                    
                    if referrer_result:
                        referrer_id = str(referrer_result['id'])
                        
                        # Update the referrals table to mark as completed
                        query_update_referral = """
                        UPDATE referrals 
                        SET status = 'completed', reward_earned = :reward_amount, payment_request_id = :payment_request_id
                        WHERE referrer_id = :referrer_id AND email = (SELECT email FROM users WHERE id = :user_id)
                        """
                        
                        await session.execute(text(query_update_referral), {
                            "reward_amount": referral_amount,
                            "payment_request_id": request_id,
                            "referrer_id": referrer_id,
                            "user_id": user_id
                        })
                        
                        # Create referral earning record
                        referral_earning_id = str(uuid.uuid4())
                        query_create_referral = """
                        INSERT INTO referral_earnings 
                        (id, referrer_id, referred_user_id, enrollment_id, course_id, bonus_amount, status, created_at)
                        VALUES 
                        (:id, :referrer_id, :referred_user_id, :enrollment_id, :course_id, :bonus_amount, :status, :created_at)
                        """
                        
                        await session.execute(text(query_create_referral), {
                            "id": referral_earning_id,
                            "referrer_id": referrer_id,
                            "referred_user_id": user_id,
                            "enrollment_id": enrollment_id,
                            "course_id": course_id,
                            "bonus_amount": referral_amount,
                            "status": "completed",
                            "created_at": datetime.utcnow()
                        })
                        
                        # Update referrer's total earnings
                        query_update_earnings = """
                        UPDATE users
                        SET total_earnings = total_earnings + :bonus_amount
                        WHERE id = :referrer_id
                        """
                        
                        await session.execute(text(query_update_earnings), {
                            "bonus_amount": referral_amount,
                            "referrer_id": referrer_id
                        })
                        
                        referral_bonus_awarded = True
                
                # Commit all changes
                await session.commit()
                
                return {
                    "enrollment_id": enrollment_id,
                    "referral_bonus_awarded": referral_bonus_awarded,
                    "referral_amount": referral_amount
                }
                
            except Exception as e:
                await session.rollback()
                raise Exception(f"Failed to approve payment and enroll: {str(e)}")
    
    async def reject_payment_request(self, request_id: str, admin_id: str, rejection_reason: str) -> bool:
        """Reject a payment request"""
        query = """
        UPDATE payment_requests
        SET status = 'rejected',
            approved_by = :admin_id,
            rejection_reason = :rejection_reason,
            updated_at = :updated_at
        WHERE id = :request_id AND status = 'pending'
        """
        
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "request_id": request_id,
                "admin_id": admin_id,
                "rejection_reason": rejection_reason,
                "updated_at": datetime.utcnow()
            })
            await session.commit()
            return result.rowcount > 0
    
    # Enrollment Operations
    async def get_user_enrollments(self, user_id: str) -> List[dict]:
        """Get all enrollments (My Courses) for a user"""
        query = """
        SELECT e.*, c.title as course_title, c.description as course_description, 
               c.level as course_level, c.duration as course_duration, c.price as course_price
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = :user_id
        ORDER BY e.enrolled_at DESC
        """
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                # Convert UUIDs
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                for date_field in ['enrolled_at', 'completed_at']:
                    if date_field in result_dict and result_dict[date_field]:
                        result_dict[date_field] = result_dict[date_field].isoformat() if hasattr(result_dict[date_field], 'isoformat') else str(result_dict[date_field])
                
                # Convert to camelCase
                result_dict['userId'] = result_dict.pop('user_id')
                result_dict['courseId'] = result_dict.pop('course_id')
                result_dict['paymentRequestId'] = result_dict.pop('payment_request_id', None)
                result_dict['enrolledAt'] = result_dict.pop('enrolled_at')
                result_dict['completedAt'] = result_dict.pop('completed_at', None)
                result_dict['courseTitle'] = result_dict.pop('course_title')
                result_dict['courseDescription'] = result_dict.pop('course_description')
                result_dict['courseLevel'] = result_dict.pop('course_level')
                result_dict['courseDuration'] = result_dict.pop('course_duration')
                result_dict['coursePrice'] = float(result_dict.pop('course_price', 0))
                
                results.append(result_dict)
            return results
    
    async def is_user_enrolled(self, user_id: str, course_id: str) -> bool:
        """Check if a user is enrolled in a specific course"""
        query = """
        SELECT COUNT(*) as count FROM enrollments
        WHERE user_id = :user_id AND course_id = :course_id
        """
        
        async with get_async_session() as session:
            row = await session.execute(text(query), {"user_id": user_id, "course_id": course_id})
            result = row.mappings().first()
            return result['count'] > 0 if result else False
    
    async def get_referral_earnings(self, user_id: str) -> List[dict]:
        """Get all referral earnings for a user"""
        query = """
        SELECT re.*, u.full_name as referred_user_name, c.title as course_title
        FROM referral_earnings re
        JOIN users u ON re.referred_user_id = u.id
        JOIN courses c ON re.course_id = c.id
        WHERE re.referrer_id = :user_id
        ORDER BY re.created_at DESC
        """
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                # Convert UUIDs
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime
                for date_field in ['created_at', 'paid_at']:
                    if date_field in result_dict and result_dict[date_field]:
                        result_dict[date_field] = result_dict[date_field].isoformat() if hasattr(result_dict[date_field], 'isoformat') else str(result_dict[date_field])
                
                # Convert to camelCase
                result_dict['referrerId'] = result_dict.pop('referrer_id')
                result_dict['referredUserId'] = result_dict.pop('referred_user_id')
                result_dict['enrollmentId'] = result_dict.pop('enrollment_id')
                result_dict['courseId'] = result_dict.pop('course_id')
                result_dict['bonusAmount'] = float(result_dict.pop('bonus_amount'))
                result_dict['paidAt'] = result_dict.pop('paid_at', None)
                result_dict['created_at'] = result_dict.pop('created_at')
                result_dict['referredUserName'] = result_dict.pop('referred_user_name')
                result_dict['courseTitle'] = result_dict.pop('course_title')
                
                results.append(result_dict)
            return results

    async def get_referral_stats(self, user_id: str) -> dict:
        """Get user's referral statistics"""
        # Get user's referral code
        user_query = "SELECT referral_code FROM users WHERE id = :user_id"
        
        # Get referral statistics
        stats_query = """
        SELECT 
            COUNT(*) as total_referrals,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_referrals,
            COALESCE(SUM(reward_earned), 0) as total_earnings
        FROM referrals
        WHERE referrer_id = :user_id
        """
        
        async with get_async_session() as session:
            # Get referral code
            user_row = await session.execute(text(user_query), {"user_id": user_id})
            user_result = user_row.mappings().first()
            referral_code = user_result['referral_code'] if user_result else 'N/A'
            
            # Get stats
            stats_row = await session.execute(text(stats_query), {"user_id": user_id})
            stats_result = stats_row.mappings().first()
            
            return {
                "totalReferrals": stats_result['total_referrals'] or 0,
                "completedReferrals": stats_result['completed_referrals'] or 0,
                "pendingReferrals": stats_result['pending_referrals'] or 0,
                "totalEarnings": float(stats_result['total_earnings'] or 0),
                "referralCode": referral_code
            }

    async def get_user_referral_code(self, user_id: str) -> str:
        """Get user's referral code"""
        query = "SELECT referral_code FROM users WHERE id = :user_id"
        async with get_async_session() as session:
            row = await session.execute(text(query), {"user_id": user_id})
            result = row.mappings().first()
            return result['referral_code'] if result else 'N/A'

    # Withdrawal System Operations
    async def create_withdrawal_request(self, user_id: str, withdrawal_data: dict) -> dict:
        """Create a withdrawal request"""
        withdrawal_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO withdrawal_requests 
        (id, user_id, amount, account_type, account_number, account_holder_name, phone_number, status, created_at)
        VALUES (:id, :user_id, :amount, :account_type, :account_number, :account_holder_name, :phone_number, :status, :created_at)
        RETURNING *
        """
        
        values = {
            "id": withdrawal_id,
            "user_id": user_id,
            "amount": withdrawal_data["amount"],
            "account_type": withdrawal_data["account_type"],
            "account_number": withdrawal_data["account_number"],
            "account_holder_name": withdrawal_data["account_holder_name"],
            "phone_number": withdrawal_data.get("phone_number"),
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        
        async with get_async_session() as session:
            row = await session.execute(text(query), values)
            result = row.mappings().first()
            if result:
                result_dict = dict(result)
                # Convert UUIDs to strings and Decimal to float
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else float(value) if isinstance(value, Decimal) else value
                    for key, value in result_dict.items()
                }
                # Convert datetime to string
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                await session.commit()
                return result_dict
        return None

    async def get_user_withdrawal_requests(self, user_id: str) -> List[dict]:
        """Get user's withdrawal requests"""
        query = """
        SELECT * FROM withdrawal_requests 
        WHERE user_id = :user_id 
        ORDER BY created_at DESC
        """
        async with get_async_session() as session:
            rows = await session.execute(text(query), {"user_id": user_id})
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                
                # Convert UUIDs to strings and Decimal to float
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else float(value) if isinstance(value, Decimal) else value
                    for key, value in result_dict.items()
                }
                
                # Convert datetime to string
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                if 'processed_at' in result_dict and result_dict['processed_at']:
                    result_dict['processed_at'] = result_dict['processed_at'].isoformat()
                
                # Map field names to match API response
                result_dict['account_type'] = result_dict.pop('account_type', '')
                result_dict['account_number'] = result_dict.pop('account_number', '')
                result_dict['account_holder_name'] = result_dict.pop('account_holder_name', '')
                result_dict['phone_number'] = result_dict.pop('phone_number', None)
                result_dict['processed_at'] = result_dict.pop('processed_at', None)
                result_dict['processed_at'] = result_dict.pop('processed_by', None)
                result_dict['admin_notes'] = result_dict.pop('admin_notes', None)
                result_dict['rejection_reason'] = result_dict.pop('rejection_reason', None)
                
                results.append(result_dict)
            return results

    async def get_all_withdrawal_requests(self, status: str = None) -> List[dict]:
        """Get all withdrawal requests (admin)"""
        if status:
            query = """
            SELECT wr.*, u.full_name, u.email
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            WHERE wr.status = :status
            ORDER BY wr.created_at DESC
            """
            params = {"status": status}
        else:
            query = """
            SELECT wr.*, u.full_name, u.email
            FROM withdrawal_requests wr
            JOIN users u ON wr.user_id = u.id
            ORDER BY wr.created_at DESC
            """
            params = {}
        
        async with get_async_session() as session:
            rows = await session.execute(text(query), params)
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                
                # Convert UUIDs to strings
                result_dict = {
                    key: str(value) if isinstance(value, UUID) else value
                    for key, value in result_dict.items()
                }
                
                # Convert datetime to string
                if 'created_at' in result_dict and result_dict['created_at']:
                    result_dict['created_at'] = result_dict['created_at'].isoformat()
                if 'processed_at' in result_dict and result_dict['processed_at']:
                    result_dict['processed_at'] = result_dict['processed_at'].isoformat()
                
                # Map field names
                result_dict['account_type'] = result_dict.pop('account_type', '')
                result_dict['account_number'] = result_dict.pop('account_number', '')
                result_dict['account_holder_name'] = result_dict.pop('account_holder_name', '')
                result_dict['phone_number'] = result_dict.pop('phone_number', None)
                result_dict['processed_at'] = result_dict.pop('processed_at', None)
                result_dict['processed_at'] = result_dict.pop('processed_by', None)
                result_dict['admin_notes'] = result_dict.pop('admin_notes', None)
                result_dict['rejection_reason'] = result_dict.pop('rejection_reason', None)
                result_dict['userName'] = result_dict.pop('full_name', '')
                result_dict['userEmail'] = result_dict.pop('email', '')
                
                results.append(result_dict)
            return results

    async def approve_withdrawal_request(self, withdrawal_id: str, admin_id: str, admin_notes: str = None) -> bool:
        """Approve a withdrawal request"""
        async with get_async_session() as session:
            try:
                # Get withdrawal request details
                query_get = """
                SELECT wr.*, u.total_earnings
                FROM withdrawal_requests wr
                JOIN users u ON wr.user_id = u.id
                WHERE wr.id = :withdrawal_id AND wr.status = 'pending'
                """
                
                row = await session.execute(text(query_get), {"withdrawal_id": withdrawal_id})
                withdrawal = row.mappings().first()
                
                if not withdrawal:
                    return False
                
                withdrawal_dict = dict(withdrawal)
                amount = float(withdrawal_dict['amount'])
                user_id = str(withdrawal_dict['user_id'])
                current_earnings = float(withdrawal_dict['total_earnings'])
                
                # Check if user has enough earnings
                if current_earnings < amount:
                    return False
                
                # Update withdrawal request status
                query_update = """
                UPDATE withdrawal_requests 
                SET status = 'approved', processed_at = :processed_at, processed_by = :admin_id, admin_notes = :admin_notes
                WHERE id = :withdrawal_id
                """
                
                await session.execute(text(query_update), {
                    "withdrawal_id": withdrawal_id,
                    "processed_at": datetime.utcnow(),
                    "admin_id": admin_id,
                    "admin_notes": admin_notes
                })
                
                # Deduct amount from user's earnings
                query_deduct = """
                UPDATE users 
                SET total_earnings = total_earnings - :amount
                WHERE id = :user_id
                """
                
                await session.execute(text(query_deduct), {
                    "amount": amount,
                    "user_id": user_id
                })
                
                await session.commit()
                return True
                
            except Exception as e:
                await session.rollback()
                raise Exception(f"Failed to approve withdrawal: {str(e)}")

    async def reject_withdrawal_request(self, withdrawal_id: str, admin_id: str, rejection_reason: str) -> bool:
        """Reject a withdrawal request"""
        async with get_async_session() as session:
            try:
                query = """
                UPDATE withdrawal_requests 
                SET status = 'rejected', processed_at = :processed_at, processed_by = :admin_id, rejection_reason = :rejection_reason
                WHERE id = :withdrawal_id AND status = 'pending'
                """
                
                await session.execute(text(query), {
                    "withdrawal_id": withdrawal_id,
                    "processed_at": datetime.utcnow(),
                    "admin_id": admin_id,
                    "rejection_reason": rejection_reason
                })
                
                await session.commit()
                return True
                
            except Exception as e:
                await session.rollback()
                raise Exception(f"Failed to reject withdrawal: {str(e)}")

# Global database operations instance
db_ops = DatabaseOperations()