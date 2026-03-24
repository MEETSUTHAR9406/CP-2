from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def check_users():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri)
    db = client.queryquill_db
    users = await db.users.find().to_list(length=100)
    print(f"Total users in DB: {len(users)}")
    for user in users:
        print(f"Email: {user.get('email')}, Name: {user.get('name')}, Role: {user.get('role')}")

if __name__ == "__main__":
    asyncio.run(check_users())
