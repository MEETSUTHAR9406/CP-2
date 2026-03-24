from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import asyncio

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def seed_data():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri)
    db = client.queryquill_db
    
    # Check if users already exist
    existing = await db.users.find_one({"email": "teacher@test.com"})
    if existing:
        print("Test users already exist.")
        return

    users = [
        {
            "name": "Test Student",
            "email": "student@test.com",
            "hashed_password": get_password_hash("password"),
            "role": "student"
        },
        {
            "name": "Test Teacher",
            "email": "teacher@test.com",
            "hashed_password": get_password_hash("password"),
            "role": "teacher"
        }
    ]
    
    result = await db.users.insert_many(users)
    print(f"Successfully seeded {len(result.inserted_ids)} users.")

if __name__ == "__main__":
    asyncio.run(seed_data())
