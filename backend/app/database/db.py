import os
from pathlib import Path
from pymongo import MongoClient, ASCENDING
from pymongo.collection import Collection
from pymongo.database import Database
from dotenv import load_dotenv


backend_dir = Path(__file__).parent.parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

MONGODB_URL = os.getenv("MONGODB_URL")
MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME")

# global db instance
_db: Database | None = None
_client: MongoClient | None = None


def get_mongodb_client() -> MongoClient:
    """Get MongoDB client instance"""
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URL)
        try:
            _client.admin.command("ping")
            print("Connected to MongoDB successfully")
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            raise
    return _client


def get_database() -> Database:
    """Get database instance"""
    global _db
    if _db is None:
        client = get_mongodb_client()
        _db = client[MONGODB_DB_NAME]
    return _db


def close_database():
    """Close MongoDB connection"""
    global _client, _db
    if _client is not None:
        _client.close()
        _client = None
        _db = None
        print("MongoDB connection closed")


def init_collections():
    """Initialize collections and create indexes"""
    db = get_database()

    # Users collection
    if "users" not in db.list_collection_names():
        db.create_collection("users")
        print("Created 'users' collection")
    
    users_collection = db["users"]
    users_collection.create_index("email", unique=True)
    print("Created index on users.email (unique)")

    # Financial records collection
    if "financial_records" not in db.list_collection_names():
        db.create_collection("financial_records")
        print(" Created 'financial_records' collection")
    
    records_collection = db["financial_records"]
    records_collection.create_index([("user_id", ASCENDING)])
    records_collection.create_index([("date", ASCENDING)])
    records_collection.create_index([("category", ASCENDING)])
    records_collection.create_index([("user_id", ASCENDING), ("date", ASCENDING)])
    print("Created indexes on financial_records (user_id, date, category)")


def get_users_collection() -> Collection:
    """Get users collection"""
    return get_database()["users"]


def get_records_collection() -> Collection:
    """Get financial records collection"""
    return get_database()["financial_records"]
