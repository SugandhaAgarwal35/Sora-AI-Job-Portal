from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from auth.routes import auth_bp
from models.user_model import bcrypt
from jobs.routes import jobs_bp
"""from resumes.routes import resumes_bp"""
from resume.routes import resume_bp

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)
bcrypt.init_app(app)
JWTManager(app)

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(jobs_bp, url_prefix="/api/jobs")
"""app.register_blueprint(resumes_bp, url_prefix="/api/resumes")"""
app.register_blueprint(resume_bp, url_prefix="/api/resume")


@app.route("/")
def home():
    return {
        "project": "Sora",
        "tagline": "Where Your Future Begins",
        "status": "Auth system running"
    }
    
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask import request, jsonify
from db import users_collection, applications_collection, resumes_collection

@app.route("/api/profile", methods=["GET", "PUT"])
@jwt_required()
def profile():
    user_email = get_jwt_identity()
    user = users_collection.find_one({"email": user_email}, {"_id": 0, "password": 0})
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
        
    if request.method == "GET":
        return jsonify(user), 200
        
    if request.method == "PUT":
        data = request.json
        allowed_fields = ["name", "phone", "bio", "linkedin", "github", "portfolio"]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        
        users_collection.update_one({"email": user_email}, {"$set": update_data})
        user = users_collection.find_one({"email": user_email}, {"_id": 0, "password": 0})
        return jsonify(user), 200

@app.route("/api/user/analytics", methods=["GET"])
@jwt_required()
def user_analytics():
    user_email = get_jwt_identity()
    
    apps = list(applications_collection.find({"user_email": user_email}))
    applied = len(apps)
    shortlisted = sum(1 for app in apps if app.get("status") == "shortlisted")
    rejected = sum(1 for app in apps if app.get("status") == "rejected")
    
    # Generate mock learning streak/trend based on user's resume score to make it dynamic but persistent
    resume = resumes_collection.find_one({"user_id": user_email})
    current_score = resume.get("ats_data", {}).get("overall", 50) if resume else 50
    skill_count = len(resume.get("skills", [])) if resume else 0
    
    # Simulated historical ATS trend progressing up to their current score
    trends = [max(0, current_score - 20), max(0, current_score - 10), max(0, current_score - 5), current_score]
    
    # Simulated streak based on their skill count
    streak_days = min(skill_count, 14) # Up to 14 days streak
    
    return jsonify({
        "applications": {
            "total": applied,
            "shortlisted": shortlisted,
            "rejected": rejected
        },
        "streak_days": streak_days,
        "ats_trend": trends
    }), 200


if __name__ == "__main__":
    app.run(debug=True)
