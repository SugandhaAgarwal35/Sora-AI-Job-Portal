from db import jobs_collection

jobs = [
    {
        "title": "Software Engineer",
        "company": "Google",
        "skills": ["python", "machine learning", "docker", "kubernetes"],
        "location": "Remote",
        "job_type": "Full-time"
    },
    {
        "title": "Frontend Developer",
        "company": "Amazon",
        "skills": ["react", "javascript", "html", "css", "next.js"],
        "location": "Seattle, WA",
        "job_type": "Full-time"
    },
    {
        "title": "Data Scientist",
        "company": "Meta",
        "skills": ["python", "pandas", "sql", "machine learning"],
        "location": "Menlo Park, CA",
        "job_type": "Contract"
    },
    {
        "title": "Cloud Architect",
        "company": "Microsoft",
        "skills": ["aws", "azure", "docker", "kubernetes", "cloud"],
        "location": "Redmond, WA",
        "job_type": "Full-time"
    }
]

if jobs_collection.count_documents({}) == 0:
    jobs_collection.insert_many(jobs)
    print("Jobs seeded successfully!")
else:
    print("Jobs already exist. No seeding necessary.")
