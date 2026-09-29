from db import resumes_collection, applications_collection

def get_ranked_candidates(job, applications, sort_type="ats", limit=50):
    results = []
    
    # Pre-parse job parameters
    job_skills = set([str(s).lower() for s in job.get("skills", [])])
    job_exp_min = int(job.get("experience_min") or 0)
    
    for app in applications:
        email = app["user_email"]
        candidate_resume = resumes_collection.find_one({"user_id": email})
        
        # Defaults
        ats_score = 50
        exp_years = 0
        skills_match_pct = 50
        candidate_skills = []
        combo_score = 0
        
        if candidate_resume:
            ats_score = candidate_resume.get("ats_data", {}).get("overall", 50)
            
            # Simple simulation of experience from resume text if available, or just fallback
            # Since real experience parsing would require complex NLP on the resume 'sections', we'll simulate based on sections
            has_exp_section = "experience" in candidate_resume.get("sections", {}).keys()
            exp_years = 3 if has_exp_section else 0
            
            if "skills" in candidate_resume:
                candidate_skills = candidate_resume["skills"]
                cand_skills_set = set([str(s).lower() for s in candidate_skills])
                matched = cand_skills_set.intersection(job_skills)
                skills_match_pct = int((len(matched) / len(job_skills)) * 100) if job_skills else 50
                
        # Combo Score: 60% ATS, 40% Skills Match (can adjust)
        combo_score = (ats_score * 0.6) + (skills_match_pct * 0.4)
        
        # Penalize slightly if experience doesn't meet minimum
        if exp_years < job_exp_min:
            combo_score -= 10
            
        results.append({
            "applicant_email": email,
            "status": app.get("status"),
            "recruiter_notes": app.get("recruiter_notes", ""),
            "ats_score": round(ats_score),
            "skills_match": round(skills_match_pct),
            "experience": exp_years,
            "combo_score": round(combo_score),
            "top_skills": candidate_skills[:5],
            "resume_data": {
                "skills": candidate_skills,
                "sections": candidate_resume.get("sections", {}) if candidate_resume else {},
                "filename": candidate_resume.get("filename", "") if candidate_resume else ""
            }
        })
        
    # Sort
    if sort_type == "experience":
        results.sort(key=lambda x: x["experience"], reverse=True)
    elif sort_type == "skills":
        results.sort(key=lambda x: x["skills_match"], reverse=True)
    elif sort_type == "combo":
        results.sort(key=lambda x: x["combo_score"], reverse=True)
    else:
        # Default ATS
        results.sort(key=lambda x: x["ats_score"], reverse=True)
        
    return results[:limit]
