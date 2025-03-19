from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from google import genai
from flask_cors import CORS
import re

# Load API key from .env file
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Gemini API Client
client = genai.Client(api_key=API_KEY)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def extractText(pdf_path):
    """Extract full text from a given PDF file."""
    # Open the PDF file using PyMuPDF's fitz library
    doc = fitz.open(pdf_path)

    # Iterate over each page in the PDF and extract the text using the get_text() method
    # Join the extracted text from each page into a single string, separating pages with a newline character
    text = "\n".join([page.get_text("text") for page in doc])

    # Remove leading and trailing whitespace from the extracted text
    return text.strip()


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

def generateOpenEnded(text):
    """Generate numbered OpenEnded-style questions and answers."""
    prompt = (
        "Analyze the text and Generate 5 questions based on the following text with OpenEnded answer. Make sure to number the questions. Each answer should contail minimum 50 words and maximum 200 words. Prefers explanations simillar to the given text with emojis. If possible give an example for each. \n"
        "Each question should be formatted like this:\n\n"
        "1. What is AI?\n"
        "✅ Answer: AI, or Artificial Intelligence, refers to the simulation of human intelligence in machines. "
        "These machines can perform tasks like speech recognition, decision-making, and language translation. "
        "Examples include Siri, Alexa, and self-driving cars.\n\n"
        "Now generate 5 questions and answers from the following text:\n\n"
        f"{text}"
    )
    response = client.models.generate_content(
        model="gemini-2.0-flash", contents=prompt
    )
    if not response or not response.text:
        return {"error": "Failed to generate OpenEnded questions."}
    # Regex pattern to extract numbered questions and answers
    pattern = re.compile(r'(\d+)\.\s*(.*?)\n\s*✅ Answer:\s*(.*?)(?:\n|$)', re.DOTALL)
    qa_pairs = pattern.findall(response.text)

    # Format the output with numbers
    return [
        {"number": int(num), "question": q.strip(), "answer": a.strip()}
        for num, q, a in qa_pairs
    ]

@app.route("/generate-questions", methods=["POST"])
def generate_questions():
    """API endpoint to generate MCQs or OpenEnded Questions from an uploaded PDF."""
    
    if 'pdf' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['pdf']
    question_type = request.form.get("question_type", "mcq")

    if pdf_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    pdf_path = "temp.pdf"
    pdf_file.save(pdf_path)
    extracted_text = extractText(pdf_path)

    if not extracted_text.strip():
        return jsonify({"error": "No text found in PDF"}), 400

    print(f"Received request for {question_type}")  # Debug log

    result = generateMCQ(extracted_text) if question_type == "mcq" else generateOpenEnded(extracted_text)

    os.remove(pdf_path)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
