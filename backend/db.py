from pymongo import MongoClient
import certifi

client = MongoClient(
    "mongodb+srv://sorauser:sorapassword@cluster0.qb99ikc.mongodb.net/?appName=Cluster0",
    tlsCAFile=certifi.where()
)

db = client["sora_db"]

users_collection = db["users"]
jobs_collection = db["jobs"]
resumes_collection = db["resumes"]
applications_collection = db["applications"]
otp_collection = db["otps"]
