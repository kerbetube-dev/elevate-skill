"""
Create an admin user in the database
"""
import asyncio
import sys
import os
from dotenv import load_dotenv

# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database.operations import db_ops
from secure_auth import secure_auth

async def create_admin_user():
    """Create an admin user"""
    try:
        # Admin user details
        admin_email = "admin@elevateskill.com"
        admin_password = "Admin1234"
        admin_name = "Admin User"
        
        print(f"🔧 Creating admin user: {admin_email}")
        
        # Check if admin already exists
        existing_admin = await db_ops.get_admin_by_email(admin_email)
        if existing_admin:
            print(f"⚠️  Admin user already exists!")
            print(f"   Email: {admin_email}")
            print(f"   Password: {admin_password}")
            return
        
        # Hash the password
        hashed_password = secure_auth.hash_password(admin_password)
        
        # Create admin user directly in admin_users table
        from database.connection import get_async_session
        from sqlalchemy import text
        import uuid
        from datetime import datetime
        
        admin_id = str(uuid.uuid4())
        query = """
        INSERT INTO admin_users (id, email, password, full_name, role, is_active, created_at)
        VALUES (:id, :email, :password, :full_name, :role, :is_active, :created_at)
        RETURNING *
        """
        
        async with get_async_session() as session:
            result = await session.execute(text(query), {
                "id": admin_id,
                "email": admin_email,
                "password": hashed_password,
                "full_name": admin_name,
                "role": "admin",
                "is_active": True,
                "created_at": datetime.utcnow()
            })
            await session.commit()
            admin_user = result.mappings().first()
        
        print(f"✅ Admin user created successfully!")
        print(f"\n📋 Admin Credentials:")
        print(f"   Email: {admin_email}")
        print(f"   Password: {admin_password}")
        print(f"\n🔗 Admin Login URL: http://localhost:8083/admin/login")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    load_dotenv()
    asyncio.run(create_admin_user())
