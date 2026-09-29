import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from .utils import extract_text_from_pdf, extract_skills, parse_resume_sections, calculate_ats_score
from db import resumes_collection

resume_bp = Blueprint("resume", __name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@resume_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_resume():
    user_id = get_jwt_identity()

    if "resume" not in request.files:
        return jsonify({"msg": "No file uploaded"}), 400

    file = request.files["resume"]

    if file.filename == "":
        return jsonify({"msg": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    text = extract_text_from_pdf(file_path)
    skills = extract_skills(text)
    sections = parse_resume_sections(text)
    ats_data = calculate_ats_score(text, sections, skills)

    resumes_collection.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "user_id": user_id,
                "filename": filename,
                "skills": skills,
                "sections": sections,
                "ats_data": ats_data
            }
        },
        upsert=True
    )

    return jsonify({
        "msg": "Resume uploaded successfully",
        "skills": skills,
        "sections": sections,
        "ats_data": ats_data
    }), 200

@resume_bp.route("/results", methods=["GET"])
@jwt_required()
def get_resume_results():
    user_id = get_jwt_identity()
    resume = resumes_collection.find_one({"user_id": user_id}, {"_id": 0})
    if resume:
        return jsonify(resume), 200
    return jsonify({"msg": "No resume found"}), 404

@resume_bp.route("/match-jd", methods=["POST"])
@jwt_required()
def match_jd():
    user_id = get_jwt_identity()
    data = request.json
    jd_text = data.get("jd_text", "").lower()
    
    if not jd_text:
        return jsonify({"msg": "No Job Description provided"}), 400
        
    resume = resumes_collection.find_one({"user_id": user_id})
    if not resume:
        return jsonify({"msg": "Please upload a resume first"}), 400
        
    resume_skills = set(resume.get("skills", []))
    jd_skills = set(extract_skills(jd_text))
    
    if not jd_skills:
        return jsonify({
            "match_score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "suggestions": ["No technical skills detected in the Job Description."]
        }), 200
        
    matched_skills = list(jd_skills.intersection(resume_skills))
    missing_skills = list(jd_skills.difference(resume_skills))
    
    match_score = int((len(matched_skills) / len(jd_skills)) * 100)
    
    suggestions = []
    if missing_skills:
        suggestions.append(f"Consider learning or adding these missing skills: {', '.join(missing_skills[:5])}")
    if match_score < 70:
        suggestions.append("Your skills lack strong alignment with this JD. Highlight transferable skills if applying.")
    elif match_score >= 80:
        suggestions.append("Strong match! You should definitely apply.")
        
    return jsonify({
        "match_score": match_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "suggestions": suggestions
    }), 200

@resume_bp.route("/insights", methods=["GET"])
@jwt_required()
def get_insights():
    user_id = get_jwt_identity()
    resume = resumes_collection.find_one({"user_id": user_id})
    user_skills = set(resume.get("skills", [])) if resume else set()
    
    high_demand = ["kubernetes", "aws", "docker", "react", "python", "machine learning", "sql"]
    
    skill_gaps = []
    courses = []
    
    for skill in high_demand:
        if skill not in user_skills:
            skill_gaps.append({
                "name": skill.title(),
                "priority": "high" if skill in ["aws", "kubernetes", "python"] else "medium",
                "current": 10,
                "target": 85
            })
            courses.append({
                "title": f"{skill.title()} Masterclass",
                "desc": f"Master {skill} with hands-on projects.",
                "link": f"https://www.udemy.com/courses/search/?q={skill}"
            })
            
    if not skill_gaps:
        # User has all high demand skills
        skill_gaps.append({"name": "System Design", "priority": "medium", "current": 50, "target": 90})
        courses.append({"title": "System Design Interview", "desc": "Learn to design scalable systems.", "link": "#"})
        
    return jsonify({
        "skillGaps": skill_gaps[:5],
        "courses": courses[:3]
    }), 200
