import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
from sqlalchemy import text

# Add backend directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

from database.connection import get_async_session

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

async def check_all_withdrawals():
    query = """
    SELECT id, user_id, amount, status, created_at 
    FROM withdrawal_requests 
    ORDER BY created_at DESC
    """
    
    try:
        async with get_async_session() as session:
            result = await session.execute(text(query))
            rows = result.mappings().all()
            print(f"✅ Found {len(rows)} withdrawal requests in database:")
            for row in rows:
                print(f"   - {row['id']}: {row['amount']} ETB ({row['status']}) - User: {row['user_id']}")
            
    except Exception as e:
        print(f"❌ Failed to check withdrawals: {e}")

if __name__ == "__main__":
    asyncio.run(check_all_withdrawals())
