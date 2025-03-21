import re
import os
from google import genai
from dotenv import load_dotenv

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini API Client
client = genai.Client(api_key=API_KEY)

def generateOpenEnded(text):
    """Generate 10 numbered OpenEnded questions and answers."""
    prompt = (
        "Generate 10 OpenEnded questions from the text below with detailed answers (50-150 words). "
        "Keep the text's explanation style and include examples if possible.\n\n"
        "Format:\n"
        "1. What is AI?\n"
        "✅ Answer: AI (Artificial Intelligence) simulates human intelligence in machines, enabling tasks like speech recognition and decision-making. "
        "Examples: Siri, Alexa, self-driving cars.\n\n"
        f"Text:\n{text}"
    )
    
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    
    if not response or not response.text:
        return {"error": "Failed to generate OpenEnded questions."}
    
    # Extract questions and answers with numbers
    pattern = re.compile(r'(\d+)\.\s*(.*?)\n\s*✅ Answer:\s*(.*?)(?:\n|$)', re.DOTALL)
    qa_pairs = pattern.findall(response.text)

    return [
        {"number": int(num), "question": q.strip(), "answer": a.strip()}
        for num, q, a in qa_pairs
    ]
