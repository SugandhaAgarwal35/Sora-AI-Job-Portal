import spacy
from PyPDF2 import PdfReader

nlp = spacy.load("en_core_web_sm")

SKILLS = [
    "python", "java", "c++", "machine learning", "deep learning",
    "flask", "django", "react", "sql", "mongodb", "aws"
]

def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()

def extract_skills(text):
    found_skills = []
    for skill in SKILLS:
        if skill in text:
            found_skills.append(skill)
    return list(set(found_skills))

def parse_resume(pdf_path):
    text = extract_text(pdf_path)
    skills = extract_skills(text)
    return skills
