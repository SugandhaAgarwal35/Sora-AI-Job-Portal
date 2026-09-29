import re
import pdfplumber

SKILLS = [
    "python", "java", "c++", "machine learning", "deep learning",
    "flask", "django", "react", "sql", "mongodb", "aws", "docker",
    "javascript", "html", "css", "node.js", "kubernetes", "linux",
    "excel", "data analysis", "devops", "typescript", "graphql", "next.js",
    "agile", "scrum", "git", "ci/cd", "cloud", "azure", "gcp", "tableau", "power bi",
    "pandas", "numpy", "tensorflow", "pytorch", "go", "rust", "ruby", "php"
]

def extract_text_from_pdf(path):
    text = ""
    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception as e:
        print("Error reading PDF with pdfplumber:", e)
    return text.lower()

def extract_skills(text):
    found = []
    # Use word boundary to avoid false positives (like 'go' in algorithm)
    for skill in SKILLS:
        if re.search(r'\b' + re.escape(skill) + r'\b', text):
            found.append(skill)
    return list(set(found))

def parse_resume_sections(text):
    sections = {
        "summary": "",
        "education": "",
        "experience": "",
        "projects": "",
        "certifications": "",
        "skills": ""
    }
    
    current_section = "summary"
    lines = text.split("\n")
    
    for line in lines:
        stripped = line.strip()
        if not stripped: continue
            
        # Heuristic for detecting headers
        if len(stripped) < 40:
            if re.match(r'^(education|academic background)', stripped):
                current_section = "education"
                continue
            elif re.match(r'^(experience|employment|work history|professional experience)', stripped):
                current_section = "experience"
                continue
            elif re.match(r'^(projects|personal projects)', stripped):
                current_section = "projects"
                continue
            elif re.match(r'^(certifications|licenses|courses)', stripped):
                current_section = "certifications"
                continue
            elif re.match(r'^(skills|technical skills|core competencies)', stripped):
                current_section = "skills"
                continue
            
        sections[current_section] += stripped + "\n"
        
    return sections

def _analyze_grammar(text):
    score = 100
    suggestions = []
    
    words = text.split()
    if len(words) > 50:
        word_counts = {}
        for w in words:
            if len(w) > 4: 
                word_counts[w] = word_counts.get(w, 0) + 1
        
        repeated = [w for w, c in word_counts.items() if c > len(words)*0.04]
        if repeated:
            score -= 15
            suggestions.append("Avoid repeating the same words excessively (e.g., " + ", ".join(repeated[:3]) + ")")
            
    return max(0, score), suggestions

def calculate_ats_score(text, parsed_sections, skills):
    score_breakdown = {
        "formatting": 85,
        "keyword_match": 80,
        "skill_completeness": 70,
        "experience_relevance": 75,
        "grammar_quality": 100
    }
    
    suggestions = []
    working_well = [
        "PDF format is ATS friendly"
    ]
    
    # Analyze sections
    if len(parsed_sections["education"]) > 20:
        working_well.append("Education section detected")
    else:
        score_breakdown["formatting"] -= 15
        suggestions.append("Add a formal Education section")
        
    if len(parsed_sections["experience"]) > 50:
        working_well.append("Experience section is detailed")
        score_breakdown["experience_relevance"] = 95
    else:
        score_breakdown["experience_relevance"] = 40
        suggestions.append("Experience section is too short or missing.")
        
    if len(parsed_sections["certifications"]) > 10:
        working_well.append("Certifications included")
    else:
        suggestions.append("Consider adding relevant certifications to stand out")
        
    # Skills logic
    skill_count = len(skills)
    if skill_count > 10:
        score_breakdown["skill_completeness"] = 95
        score_breakdown["keyword_match"] = 90
        working_well.append(f"Strong technical skill coverage ({skill_count} skills detected)")
    elif skill_count > 5:
        score_breakdown["skill_completeness"] = 80
        score_breakdown["keyword_match"] = 80
    else:
        score_breakdown["skill_completeness"] = 55
        score_breakdown["keyword_match"] = 60
        suggestions.append("Add more industry-relevant tools and keywords")
        
    grammar_score, g_suggestions = _analyze_grammar(text)
    score_breakdown["grammar_quality"] = grammar_score
    suggestions.extend(g_suggestions)
    if grammar_score >= 90:
        working_well.append("Good grammar and varied vocabulary")
        
    # Cap values at 100
    for k in score_breakdown:
        score_breakdown[k] = min(100, score_breakdown[k])
        
    overall_score = sum(score_breakdown.values()) // len(score_breakdown)
    
    return {
        "overall": overall_score,
        "breakdown": score_breakdown,
        "suggestions": suggestions,
        "working_well": working_well
    }
