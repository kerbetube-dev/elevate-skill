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

async def update_user_earnings():
    user_id = "ca295209-08c6-4434-8744-90c4bd46934d"  # withdrawal@test.com
    new_earnings = 500.0  # Give them 500 ETB
    
    query = """
    UPDATE users 
    SET total_earnings = :earnings 
    WHERE id = :user_id
    """
    
    try:
        async with get_async_session() as session:
            await session.execute(text(query), {
                "earnings": new_earnings,
                "user_id": user_id
            })
            await session.commit()
            print(f"✅ Updated user earnings to {new_earnings} ETB")
            
    except Exception as e:
        print(f"❌ Failed to update earnings: {e}")

if __name__ == "__main__":
    asyncio.run(update_user_earnings())
