from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB Connection URL
MONGO_URL = "mongodb://localhost:27017"

client = AsyncIOMotorClient(MONGO_URL)
db = client.queryquill_db
