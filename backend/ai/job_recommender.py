def recommend_jobs(user_skills, jobs):
    recommendations = []
    
    user_skills_set = set([str(s).lower() for s in user_skills])

    for job in jobs:
        # Convert _id to string for JSON serialization
        if "_id" in job:
            job["job_id"] = str(job["_id"])
            del job["_id"]
            
        job_skills = [str(skill).lower() for skill in job.get("skills", [])]
        if not job_skills:
            # If a job expects no skills, it's a 100% match? Or maybe ignore. Let's say 50%.
            match_percentage = 50
            matched = []
        else:
            matched = user_skills_set.intersection(set(job_skills))
            match_percentage = int((len(matched) / len(job_skills)) * 100)

        # Only recommend if there is at least some match, or if job requires no specific skills
        if match_percentage >= 20 or not job_skills:
            job_copy = dict(job)
            job_copy["matched_skills"] = list(matched)
            job_copy["match_score"] = match_percentage
            recommendations.append(job_copy)

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
