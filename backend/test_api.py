import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:5000/api/auth/register"
data = json.dumps({"email":"test10@example.com", "password":"password123", "role":"jobseeker"}).encode("utf-8")
req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

try:
    with urllib.request.urlopen(req) as response:
        print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError {e.code}:")
    print(e.read().decode())
except Exception as e:
    print(f"Error: {e}")
