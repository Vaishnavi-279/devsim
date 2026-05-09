from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client = None
database = None

async def connect_db():
    global client, database
    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client.devsim
    print("✅ Connected to MongoDB!")

async def close_db():
    global client
    if client:
        client.close()
        print("❌ MongoDB connection closed!")

def get_database():
    return database