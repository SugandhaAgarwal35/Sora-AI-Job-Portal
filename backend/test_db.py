from db import users_collection

users = users_collection.find().limit(5).sort([("_id", -1)])
for u in users:
    print(u["email"], u["password"], u.get("role"))
