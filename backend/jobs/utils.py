def recommend_jobs(user_skills, jobs_db):
    recommendations = []
    user_skills_set = set([s.lower().strip() for s in user_skills if s])

    for job in jobs_db:
        # Skills might be a comma separated string from recruiter or a list
        job_skills = job.get("skills", "")
        if isinstance(job_skills, str):
            job_skills = [s.strip() for s in job_skills.split(",") if s.strip()]
        
        job_skills_set = set([s.lower() for s in job_skills])
        
        match_count = len(user_skills_set & job_skills_set)
        score = match_count / len(job_skills_set) if len(job_skills_set) > 0 else 0

        recommendations.append({
            "job_id": str(job.get("_id", "")),
            "title": job.get("title", "Unknown Role"),
            "company": job.get("company", "Unknown Company"),
            "matched_skills": list(user_skills_set & job_skills_set),
            "match_score": round(score * 100, 2)
        })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
