import sys
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure, ServerSelectionTimeoutError

try:
    print("Attempting to connect to MongoDB...")
    client = MongoClient(
        "mongodb+srv://sorauser:sorapassword@cluster0.qb99ikc.mongodb.net/?appName=Cluster0",
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    
    # Ping to test network
    client.admin.command('ping')
    print("Ping successful! Network connection is established.")
    
    # Test DB Auth
    db = client["sora_db"]
    count = db.users.count_documents({})
    print(f"Auth successful! Found {count} users.")
except ServerSelectionTimeoutError as e:
    print(f"Timeout Error: {e}")
except OperationFailure as e:
    print(f"Authentication Error: {e}")
except Exception as e:
    print(f"Other Error: {e.__class__.__name__}: {e}")
