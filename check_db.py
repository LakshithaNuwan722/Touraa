from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
import bcrypt
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend' / '.env')

async def check_db():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    users_count = await db.users.count_documents({})
    admins_count = await db.admins.count_documents({})
    
    print(f"Database: {db_name}")
    print(f"Users count: {users_count}")
    print(f"Admins count: {admins_count}")
    
    admin = await db.admins.find_one({"email": "admin@ceyloncab.com"})
    if admin:
        print(f"✅ Admin found: {admin['email']}")
        # Test password verification manually
        password = "ceyloncab_admin"
        hashed = admin['password']
        is_valid = bcrypt.checkpw(password.encode(), hashed.encode())
        print(f"Password verification: {'SUCCESS' if is_valid else 'FAILED'}")
    else:
        print("❌ Admin NOT found!")

    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
