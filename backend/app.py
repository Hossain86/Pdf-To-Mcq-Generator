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

def extract_text_from_pdf(pdf_path):
    """Extract full text from a given PDF file."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
    return text.strip()

def generate_mcq(text):
    """Generate multiple-choice questions (MCQs) from extracted text."""
    prompt = (
        "Generate 10 multiple-choice questions with 4 options each. "
        "Format each question like this:\n\n"
        "1: What is AI?\n"
        "   a) A fruit\n"
        "   b) A technology\n"
        "   c) A planet\n"
        "   d) A language\n"
        "✅ Answer: b) A technology\n\n"
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
    pattern = re.compile(r'(\d+): (.*?)\n\s*a\) (.*?)\n\s*b\) (.*?)\n\s*c\) (.*?)\n\s*d\) (.*?)\n✅ Answer: (.*?)\n', re.DOTALL)
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

    return mcqs  # Ensure it's an array of MCQs, not a string


@app.route("/generate-mcqs", methods=["POST"])
def generate_mcqs():
    """API endpoint to generate MCQs from an uploaded PDF."""
    
    if 'pdf' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['pdf']

    if pdf_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Save the file temporarily
    pdf_path = "temp.pdf"
    pdf_file.save(pdf_path)

    # Extract text
    extracted_text = extract_text_from_pdf(pdf_path)

    if not extracted_text.strip():
        return jsonify({"error": "No text found in PDF"}), 400

    # Generate MCQs
    mcqs = generate_mcq(extracted_text)

    # Remove the temporary file
    os.remove(pdf_path)

    return jsonify(mcqs)

if __name__ == "__main__":
    app.run(debug=True)


# prompt = (
    #     "Generate 50 multiple-choice questions with 4 options each. "
    #     "Clearly format each question like this:\n"
    #     "1: What is AI?\n"
    #     "   a) A fruit\n"
    #     "   b) A technology\n"
    #     "   c) A planet\n"
    #     "   d) A language\n"
    #     "✅ Answer: b) A technology\n\n"
    #     "Now generate MCQs from the following text:\n\n"
    #     f"{text}"  # Send full extracted text to Gemini
    # )
    # prompt = (
    #     "Generate 10 narrative questions. "
    #     "Clearly format each question like this:\n"
    #     "1: Explain and give example of AI?\n"
    #     "✅ Answer: AI, or Artificial Intelligence, refers to the simulation of human intelligence in machines that are programmed to think and learn like humans. "
    #     "These machines can perform tasks that typically require human intelligence, such as visual perception, speech recognition, decision-making, and language translation. "
    #     "Examples of AI include virtual assistants like Siri and Alexa, recommendation systems like those used by Netflix and Amazon, and autonomous vehicles.\n\n"
    #     "Now generate Questions from the following text:\n\n"
    #     f"{text}"
    # )