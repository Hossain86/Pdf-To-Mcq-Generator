from flask import Flask, request, jsonify
import fitz  # PyMuPDF
import os
from dotenv import load_dotenv
from flask_cors import CORS
from mcq_generator import generateMCQ
from narrative_generator import generateOpenEnded

# Load API key from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def extractText(pdf_path):
    """Extract full text from a given PDF file."""
    doc = fitz.open(pdf_path)
    text = "\n".join([page.get_text("text") for page in doc])
    return text.strip()

@app.route('/')
def home():
    return "<h1>Welcome to the PDF Question Generator API!</h1>"

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

@app.route("/extract-text", methods=["POST"])
def extract_text_endpoint():
    """API endpoint to extract and return the text from an uploaded PDF."""
    
    if 'pdf' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files['pdf']

    if pdf_file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    pdf_path = "temp.pdf"
    pdf_file.save(pdf_path)
    extracted_text = extractText(pdf_path)

    os.remove(pdf_path)

    if not extracted_text.strip():
        return jsonify({"error": "No text found in PDF"}), 400

    return jsonify({"extracted_text": extracted_text})

if __name__ == "__main__":
    app.run(debug=True)
