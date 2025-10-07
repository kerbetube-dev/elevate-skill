import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv

# Add backend directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))

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

async def test_get_withdrawals():
    user_id = "ca295209-08c6-4434-8744-90c4bd46934d"  # withdrawal@test.com
    
    try:
        print("Testing get_user_withdrawal_requests...")
        withdrawals = await db_ops.get_user_withdrawal_requests(user_id)
        print(f"✅ Found {len(withdrawals)} withdrawals:")
        for w in withdrawals:
            print(f"   - {w['id']}: {w['amount']} ETB ({w['status']})")
        
    except Exception as e:
        print(f"❌ Failed to get withdrawals: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_get_withdrawals())
