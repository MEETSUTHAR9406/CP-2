from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    uri = "mongodb://localhost:27017"
    client = AsyncIOMotorClient(uri)
    try:
        # The ismaster command is cheap and does not require auth.
        await client.admin.command('ismaster')
        print("Successfully connected to MongoDB at localhost:27017")
        
        db = client.queryquill_db
        collections = await db.list_collection_names()
        print(f"Connected to database: {db.name}")
        print(f"Collections: {collections}")
        
    except Exception as e:
        print(f"Could not connect to MongoDB: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
