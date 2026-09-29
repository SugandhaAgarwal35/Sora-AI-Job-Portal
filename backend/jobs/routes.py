from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
from db import jobs_collection, users_collection, applications_collection
from datetime import datetime, timezone

jobs_bp = Blueprint("jobs", __name__)

from .utils import recommend_jobs
from db import resumes_collection
from ai.candidate_ranking import get_ranked_candidates

# 🔹 Recruiter creates job
@jobs_bp.route("/create", methods=["POST"])
@jwt_required()
def create_job():
    email = get_jwt_identity()  # THIS IS EMAIL

    user = users_collection.find_one({"email": email})
    if not user or user.get("role") != "recruiter":
        return jsonify({"msg": "Unauthorized"}), 401

    data = request.json

    job = {
        "title": data.get("title", "").strip(),
        "company": data.get("company", "TechCorp Inc").strip(),
        "department": data.get("department", "").strip(),
        "description": data.get("description", "").strip(),
        "requirements": data.get("requirements", "").strip(),
        "skills": [s.strip() for s in data.get("skillsReq", "").split(",") if s.strip()],
        "preferred_skills": [s.strip() for s in data.get("skillsPref", "").split(",") if s.strip()],
        "experience_min": data.get("expMin", 0),
        "experience_max": data.get("expMax", 0),
        "salary_min": data.get("salaryMin", 0),
        "salary_max": data.get("salaryMax", 0),
        "location": data.get("location", "").strip(),
        "job_type": data.get("jobType", "Full-Time"),
        "work_mode": data.get("workMode", "Hybrid"),
        "recruiter_email": email,
        "application_deadline": data.get("deadline", "")
    }

    # Validation
    if not job["title"] or not job["description"] or not job["skills"] or not job["job_type"] or not job["work_mode"] or not job["application_deadline"]:
        return jsonify({"msg": "Missing mandatory fields (Title, Description, Skills, Job Type, Work Mode, Deadline)."}), 400
        
    if not job["salary_min"] or int(job["salary_min"]) <= 0:
        return jsonify({"msg": "Minimum salary is mandatory and must be > 0."}), 400
        
    if job["work_mode"] != "Remote" and not job["location"]:
        return jsonify({"msg": "Location is mandatory for non-remote jobs."}), 400

    jobs_collection.insert_one(job)
    email = get_jwt_identity()
    print("JWT identity:", email)

    user = users_collection.find_one({"email": email})
    print("User from DB:", user)


    return jsonify({"msg": "Job created"}), 201


# 🔹 Recruiter job list
@jobs_bp.route("/recruiter", methods=["GET"])
@jwt_required()
def recruiter_jobs():
    email = get_jwt_identity()

    jobs = list(
        jobs_collection.find({"recruiter_email": email})
    )
    # Append is_expired and stringify id
    now = datetime.now(timezone.utc)
    for j in jobs:
        j["job_id"] = str(j["_id"])
        del j["_id"]
        try:
            deadline = datetime.fromisoformat(j.get("application_deadline", "").replace("Z", "+00:00"))
            j["is_expired"] = now > deadline
        except:
            j["is_expired"] = False
            
    return jsonify({"jobs": jobs}), 200

# 🔹 Recommend jobs to jobseeker
@jobs_bp.route("/recommend", methods=["POST"])
@jwt_required()
def recommend_user_jobs():
    email = get_jwt_identity()
    user_resume = resumes_collection.find_one({"user_id": email})
    
    if not user_resume or "skills" not in user_resume:
        return jsonify({"msg": "No skills found. Please upload your resume first."}), 400
        
    user_skills = user_resume["skills"]
    filters = request.json or {}
    search = filters.get("search", "").lower()
    location = filters.get("location", "").lower()
    exp_level = filters.get("experience", "")
    job_types = filters.get("jobTypes", [])
    salary = filters.get("salary", "Any salary")
    
    # Pre-filter all jobs
    all_jobs = list(jobs_collection.find({}))
    filtered_jobs = []
    
    for j in all_jobs:
        job_loc = j.get("location") or ""
        if search and search not in j.get("title", "").lower() and search not in j.get("company", "").lower():
            continue
        if location and location not in job_loc.lower():
            continue
        if job_types and j.get("job_type") not in job_types:
            continue
        
        # Simple experience mapping hack (can be more robust in prod)
        j_exp_min = int(j.get("experience_min") or 0)
        if exp_level == "Entry level" and j_exp_min > 2: continue
        if exp_level == "Mid level" and (j_exp_min < 2 or j_exp_min > 5): continue
        if exp_level == "Senior level" and j_exp_min < 5: continue
        
        # Salary Filter
        if salary != "Any salary":
            j_sal = int(j.get("salary_min") or 0)
            if salary == "Under $50k" and j_sal > 50000: continue
            if salary == "$50k - $100k" and (j_sal < 50000 or j_sal > 100000): continue
            if salary == "Above $100k" and (j_sal > 0 and j_sal < 100000): continue
            
        filtered_jobs.append(j)

    recommendations = recommend_jobs(user_skills, filtered_jobs)
    
    # Calculate is_expired
    now = datetime.now(timezone.utc)
    for j in recommendations:
        try:
            deadline = datetime.fromisoformat(j.get("application_deadline", "").replace("Z", "+00:00"))
            j["is_expired"] = now > deadline
        except:
            j["is_expired"] = False
            
    return jsonify(recommendations), 200

# 🔹 Toggle Bookmark for jobseeker
@jobs_bp.route("/bookmark", methods=["POST"])
@jwt_required()
def toggle_bookmark():
    email = get_jwt_identity()
    job_id = request.json.get("job_id")
    
    if not job_id:
        return jsonify({"msg": "Missing job_id"}), 400
        
    user = users_collection.find_one({"email": email})
    saved_jobs = user.get("saved_jobs", [])
    
    if job_id in saved_jobs:
        saved_jobs.remove(job_id)
        msg = "Job removed from bookmarks"
    else:
        saved_jobs.append(job_id)
        msg = "Job bookmarked"
        
    users_collection.update_one({"email": email}, {"$set": {"saved_jobs": saved_jobs}})
    return jsonify({"msg": msg, "saved_jobs": saved_jobs}), 200

# 🔹 Get bookmarked jobs
@jobs_bp.route("/bookmarked", methods=["GET"])
@jwt_required()
def get_bookmarked():
    email = get_jwt_identity()
    user = users_collection.find_one({"email": email})
    saved_jobs = user.get("saved_jobs", [])
    return jsonify({"saved_jobs": saved_jobs}), 200

# 🔹 Jobseeker applies for a job
@jobs_bp.route("/apply", methods=["POST"])
@jwt_required()
def apply_job():
    email = get_jwt_identity()
    data = request.json
    job_id = data.get("job_id")
    
    if not job_id:
        return jsonify({"msg": "Missing job_id"}), 400
        
    existing = applications_collection.find_one({"user_email": email, "job_id": job_id})
    if existing:
        return jsonify({"msg": "You have already applied for this job."}), 400
        
    applications_collection.insert_one({
        "user_email": email,
        "job_id": job_id,
        "status": "applied"
    })
    
    
    return jsonify({"msg": "Successfully applied for the job!"}), 200

# 🔹 Get Applied Jobs for jobseeker
@jobs_bp.route("/applied", methods=["GET"])
@jwt_required()
def get_applied_jobs():
    email = get_jwt_identity()
    apps = list(applications_collection.find({"user_email": email}))
    
    results = []
    for app in apps:
        job = jobs_collection.find_one({"_id": ObjectId(app["job_id"])}) if len(app["job_id"]) == 24 else None
        if job:
            is_expired = False
            try:
                deadline = datetime.fromisoformat(job.get("application_deadline", "").replace("Z", "+00:00"))
                is_expired = datetime.now(timezone.utc) > deadline
            except:
                pass
                
            results.append({
                "job_id": str(job["_id"]),
                "title": job.get("title"),
                "company": job.get("company"),
                "status": app.get("status", "applied"),
                "is_expired": is_expired
            })
            
    return jsonify(results), 200

# 🔹 Get Applicants for recruiter jobs
@jobs_bp.route("/applicants", methods=["GET"])
@jwt_required()
def get_job_applicants():
    email = get_jwt_identity()
    # Find all jobs posted by this recruiter
    recruiter_jobs = list(jobs_collection.find({"recruiter_email": email}))
    job_ids = [str(job["_id"]) for job in recruiter_jobs]
    
    # Find all applications for these jobs
    apps = list(applications_collection.find({"job_id": {"$in": job_ids}}))
    
    results = []
    for app in apps:
        job_match = next((j for j in recruiter_jobs if str(j["_id"]) == app["job_id"]), None)
        
        # Default fallback values
        match_score = 0
        top_skills = []
        resume_data = None
        
        if job_match:
            # Query candidate's resume
            candidate_resume = resumes_collection.find_one({"user_id": app["user_email"]})
            if candidate_resume and "skills" in candidate_resume:
                candidate_skills = candidate_resume["skills"]
                job_skills = [str(s).lower() for s in job_match.get("skills", [])]
                candidate_skills_set = set([str(s).lower() for s in candidate_skills])
                matched = candidate_skills_set.intersection(set(job_skills))
                top_skills = list(matched)[:3] # Take top 3 matched for the table
                if not top_skills:
                    top_skills = candidate_skills[:3] # Failing that, just show their top skills
                    
                match_score = int((len(matched) / len(job_skills)) * 100) if job_skills else 50
                resume_data = {
                    "skills": candidate_resume.get("skills", []),
                    "sections": candidate_resume.get("sections", {}),
                    "filename": candidate_resume.get("filename", "")
                }
                
        results.append({
            "applicant_email": app["user_email"],
            "job_title": job_match["title"] if job_match else "Unknown",
            "status": app.get("status"),
            "match_score": match_score,
            "top_skills": top_skills,
            "resume_data": resume_data
        })
        
    return jsonify(results), 200

# 🔹 Get specific job by ID for job details page
@jobs_bp.route("/<job_id>", methods=["GET"])
@jwt_required()
def get_job_by_id(job_id):
    if len(job_id) != 24:
        return jsonify({"msg": "Invalid job ID format"}), 400
        
    job = jobs_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        return jsonify({"msg": "Job not found"}), 404
        
    job["job_id"] = str(job["_id"])
    del job["_id"]
    
    try:
        deadline = datetime.fromisoformat(job.get("application_deadline", "").replace("Z", "+00:00"))
        job["is_expired"] = datetime.now(timezone.utc) > deadline
    except:
        job["is_expired"] = False
    
    # Calculate dummy match score if not provided via post, frontend can handle it or we can pass skills
    return jsonify(job), 200

# 🔹 Delete Job
@jobs_bp.route("/<job_id>", methods=["DELETE"])
@jwt_required()
def delete_job(job_id):
    email = get_jwt_identity()
    if len(job_id) != 24:
        return jsonify({"msg": "Invalid job ID format"}), 400

    job = jobs_collection.find_one({"_id": ObjectId(job_id), "recruiter_email": email})
    if not job:
        return jsonify({"msg": "Job not found or unauthorized to delete"}), 404

    jobs_collection.delete_one({"_id": ObjectId(job_id)})
    
    # Optional: Delete associated applications (for relational integrity)
    applications_collection.delete_many({"job_id": job_id})

    return jsonify({"msg": "Job deleted successfully"}), 200


# 🔹 Get Ranked Candidates for a specific Job
@jobs_bp.route("/<job_id>/ranked_candidates", methods=["GET"])
@jwt_required()
def ranked_candidates(job_id):
    email = get_jwt_identity()
    sort_type = request.args.get("sort_type", "ats")
    try:
        limit = int(request.args.get("limit", 50))
    except (ValueError, TypeError):
        limit = 50

    if len(job_id) != 24:
        return jsonify({"msg": "Invalid job ID format"}), 400

    job = jobs_collection.find_one({"_id": ObjectId(job_id), "recruiter_email": email})
    if not job:
        return jsonify({"msg": "Job not found or unauthorized"}), 404

    apps = list(applications_collection.find({"job_id": job_id}))
    
    ranked = get_ranked_candidates(job, apps, sort_type, limit)
    return jsonify(ranked), 200


# 🔹 Recruiter Add Note to Candidate
@jobs_bp.route("/notes", methods=["POST"])
@jwt_required()
def add_recruiter_note():
    email = get_jwt_identity()
    data = request.json
    job_id = data.get("job_id")
    candidate_email = data.get("candidate_email")
    note = data.get("note", "").strip()

    if not job_id or not candidate_email:
        return jsonify({"msg": "Missing job_id or candidate_email"}), 400

    job = jobs_collection.find_one({"_id": ObjectId(job_id), "recruiter_email": email})
    if not job:
        return jsonify({"msg": "Unauthorized or missing job"}), 401

    applications_collection.update_one(
        {"job_id": job_id, "user_email": candidate_email},
        {"$set": {"recruiter_notes": note}}
    )
    
    return jsonify({"msg": "Note saved successfully"}), 200

# 🔹 Bulk Shortlist Candidates
@jobs_bp.route("/shortlist_bulk", methods=["POST"])
@jwt_required()
def bulk_shortlist():
    email = get_jwt_identity()
    data = request.json
    job_id = data.get("job_id")
    candidate_emails = data.get("candidate_emails", [])

    if not job_id or not candidate_emails:
        return jsonify({"msg": "Missing job_id or candidate_emails"}), 400

    job = jobs_collection.find_one({"_id": ObjectId(job_id), "recruiter_email": email})
    if not job:
        return jsonify({"msg": "Unauthorized or missing job"}), 401

    applications_collection.update_many(
        {"job_id": job_id, "user_email": {"$in": candidate_emails}},
        {"$set": {"status": "shortlisted"}}
    )
    
    return jsonify({"msg": f"Successfully shortlisted {len(candidate_emails)} candidates"}), 200
