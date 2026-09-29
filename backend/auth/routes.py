from flask import Blueprint, request, jsonify
import re
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token
from models.user_model import hash_password, check_password
from db import users_collection, otp_collection
from .utils import generate_otp, send_otp_email



auth_bp = Blueprint("auth", __name__)

# Temporary in-memory database


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")  # 👈 NEW

    if not email or not password or not role:
        return jsonify({"msg": "Missing fields"}), 400

    if not re.match(r"^[a-zA-Z0-9._%+-]+@gmail\.com$", email):
        return jsonify({"msg": "Email must be a valid @gmail.com address"}), 400
        
    if not re.match(r"^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?\":{}|<>]).{8,16}$", password):
        return jsonify({"msg": "Password must be 8-16 characters long, contain at least 1 uppercase letter, and 1 special character"}), 400

    if role not in ["jobseeker", "recruiter"]:
        return jsonify({"msg": "Invalid role"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 400

    # Insert user directly
    users_collection.insert_one({
        "email": email,
        "password": hash_password(password),
        "role": role
    })

    return jsonify({"msg": "User registered successfully"}), 201

# The verify-otp endpoint is retained temporarily just in case but forms aren't going to hit it anymore
@auth_bp.route("/verify-otp", methods=["POST"])
def verify_otp():
    data = request.json
    email = data.get("email")
    otp_code = data.get("otp")

    if not email or not otp_code:
        return jsonify({"msg": "Missing fields"}), 400

    otp_record = otp_collection.find_one({"email": email, "otp": otp_code})
    
    if not otp_record:
        return jsonify({"msg": "Invalid OTP"}), 400
        
    if datetime.utcnow() > otp_record["expires_at"]:
        return jsonify({"msg": "OTP expired"}), 400

    # Move to users collection
    users_collection.insert_one({
        "email": otp_record["email"],
        "password": otp_record["password"],
        "role": otp_record["role"]
    })

    # Cleanup OTP
    otp_collection.delete_many({"email": email})

    return jsonify({"msg": "User registered successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if not user or not check_password(user["password"], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=email)

    return jsonify({
        "access_token": token,
        "role": user["role"]   # 👈 NEW
    }), 200

