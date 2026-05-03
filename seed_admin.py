from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import bcrypt
import uuid
from datetime import datetime, timezone
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

async def seed_admin():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url:
        print("❌ Error: MONGO_URL not found in .env")
        return

    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    admin_email = "admin@touraa.com"
    admin_password = "touraa_admin"
    
    # Check if admin already exists
    existing = await db.admins.find_one({"email": admin_email})
    if existing:
        print(f"ℹ️ Admin user {admin_email} already exists. Updating password...")
        await db.admins.update_one(
            {"email": admin_email},
            {"$set": {"password": hash_password(admin_password), "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        admin_doc = {
            "id": str(uuid.uuid4()),
            "name": "System Admin",
            "email": admin_email,
            "password": hash_password(admin_password),
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.admins.insert_one(admin_doc)
        print(f"✅ Admin user {admin_email} created successfully!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_admin())
