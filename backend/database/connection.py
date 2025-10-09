import os
from dotenv import load_dotenv, find_dotenv
from pathlib import Path
from typing import Optional
from urllib.parse import quote, urlsplit, urlunsplit, parse_qsl, urlencode
from supabase import create_client, Client
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine, async_sessionmaker, AsyncSession


load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def _append_sslmode_require(url: str) -> str:
    parts = urlsplit(url)
    query_pairs = dict(parse_qsl(parts.query))
    if query_pairs.get("sslmode") != "require":
        query_pairs["sslmode"] = "require"
    new_query = urlencode(query_pairs)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, new_query, parts.fragment))


def _to_async_url(url: Optional[str]) -> Optional[str]:
    if not url:
        return None
    # If the URL already looks async, return as-is
    if "+psycopg" in url or url.startswith("postgresql+psycopg"):
        return url
    # Convert postgresql:// to postgresql+psycopg:// and ensure credentials are URL-encoded
    if url.startswith("postgresql://"):
        # Parse components
        parts = urlsplit(url)
        scheme = "postgresql+psycopg"
        netloc = parts.netloc
        # If credentials exist, encode password safely
        if "@" in netloc and ":" in netloc.split("@", 1)[0]:
            creds, hostport = netloc.rsplit("@", 1)
            username, password = creds.split(":", 1)
            safe_netloc = f"{username}:{quote(password)}@{hostport}"
        else:
            safe_netloc = netloc
        rebuilt = urlunsplit((scheme, safe_netloc, parts.path, parts.query, parts.fragment))
        return _append_sslmode_require(rebuilt)
    # Not starting with postgresql:// but still return with sslmode=require appended if applicable
    return _append_sslmode_require(url)


ASYNC_DATABASE_URL = _to_async_url(DATABASE_URL)

# Async SQLAlchemy engine and session factory
async_engine: Optional[AsyncEngine] = (
    create_async_engine(
        ASYNC_DATABASE_URL,
        future=True,
        echo=False,
        connect_args={"sslmode": "require"},
    )
    if ASYNC_DATABASE_URL
    else None
)
async_session_factory: Optional[async_sessionmaker[AsyncSession]] = (
    async_sessionmaker(bind=async_engine, expire_on_commit=False)
    if async_engine else None
)

# Supabase client (optional)
supabase: Optional[Client] = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        # Supabase client is optional; log and continue
        supabase = None


async def connect_db():
    
    """Validate DB connectivity (no persistent connection needed)."""
    if not async_engine:
        print("❌ Database connection not configured")
        return
    try:
        async with async_engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("✅ Connected to PostgreSQL database (async)")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")


async def disconnect_db():
    """Dispose engine on shutdown."""
    if async_engine:
        await async_engine.dispose()
        print("✅ Disposed async engine")


def get_async_session() -> AsyncSession:
    if not async_session_factory:
        print("⚠️  Database not configured, using in-memory fallback")
        # For development, we'll use a mock session that doesn't actually connect
        # In production, this should raise an error
        raise RuntimeError("Database not configured. Please set DATABASE_URL environment variable.")
    return async_session_factory()


