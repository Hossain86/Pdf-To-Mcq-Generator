import re
import os
from google import genai
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini API Client
client = genai.Client(api_key=API_KEY)

def generateMCQ(text):
    """Generate multiple-choice questions (MCQs) from extracted text."""
    prompt = (
        "Generate 10 multiple-choice questions with 4 options each. "
        "Format each question like this:\n\n"
        "1: What is AI?\n"
        "   a) A fruit\n"
        "   b) A technology\n"
        "   c) A planet\n"
        "   d) A language\n"
        "Answer: b) A technology\n\n"
        "Now generate MCQs from the following text:\n\n"
        f"{text}"
    )

    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )

    if not response or not response.text:
        return {"error": "Failed to generate MCQs."}

    mcq_text = response.text

    # Extract questions and answers using regex
    pattern = re.compile(r'(\d+): (.*?)\n\s*a\) (.*?)\n\s*b\) (.*?)\n\s*c\) (.*?)\n\s*d\) (.*?)\nAnswer: (.*?)\n', re.DOTALL)
    mcqs = []

    for match in pattern.finditer(mcq_text):
        mcqs.append({
            "question": match.group(2).strip(),
            "options": [
                {"label": "a", "text": match.group(3).strip()},
                {"label": "b", "text": match.group(4).strip()},
                {"label": "c", "text": match.group(5).strip()},
                {"label": "d", "text": match.group(6).strip()},
            ],
            "answer": match.group(7).strip()
        })

    return mcqs
