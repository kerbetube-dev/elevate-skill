import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import text

# Add backend directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from database.connection import get_async_session
from database.operations import db_ops

# Load environment variables from nearest .env up the tree
try:
    env_path = find_dotenv()
    if env_path:
        load_dotenv(env_path)
    project_root = Path(__file__).resolve().parents[0] # This script is in root
    explicit_env = project_root / ".env"
    if explicit_env.exists():
        load_dotenv(explicit_env)
    backend_env = Path(__file__).resolve().parent / "backend" / ".env"
    if backend_env.exists():
        load_dotenv(backend_env)
except Exception:
    pass

async def test_withdrawal_creation():
    user_id = "ca295209-08c6-4434-8744-90c4bd46934d"  # withdrawal@test.com
    
    withdrawal_data = {
        "amount": 300,
        "account_type": "CBE",
        "account_number": "1000123456789",
        "account_holder_name": "Test Withdrawal User",
        "phone_number": "0912345678"
    }
    
    try:
        print("Testing withdrawal creation...")
        result = await db_ops.create_withdrawal_request(user_id, withdrawal_data)
        print(f"✅ Withdrawal created successfully: {result}")
        
    except Exception as e:
        print(f"❌ Failed to create withdrawal: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_withdrawal_creation())
