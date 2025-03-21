import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { generateQuestions, extractText } from "../api"; // Import API function
import ShowQandA from "../components/ShowQandA"; // Import Q&A component

// Define types for MCQ and Narrative Questions
type Option = {
  label: string;
  text: string;
};

type MCQ = {
  question: string;
  options: Option[];
  answer: string;
};

type Narrative = {
  question: string;
  answer: string;
};

const QuestionGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [questionType, setQuestionType] = useState<"mcq" | "narrative">("mcq");
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [narrativeQuestions, setNarrativeQuestions] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  // Handle Question Generation
  const handleGenerateQuestions = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMcqs([]);
    setNarrativeQuestions([]);
    setError(null);

    try {
      const text = await extractText(selectedFile);
      setExtractedText(text); 

      const data = await generateQuestions(selectedFile, questionType);
      if (questionType === "mcq") {
        setMcqs(data);
      } else {
        setNarrativeQuestions(data);
      }
      console.log(data);
    } catch (error) {
      console.error("Error generating questions", error);
      setError("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText).then(
        () => {
          alert("Text copied to clipboard!"); // Optionally, show a message
        },
        (err) => {
          console.error("Error copying text: ", err);
          alert("Failed to copy text.");
        }
      );
    }
  };

  return (
    <div className="container mt-4 mb-4 p-4 border shadow-sm">
      <h2 className="text-center mb-4">PDF to Question & Answer Generator</h2>

      <div className="mb-3">
        <input
          type="file"
          accept="application/pdf"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      {/* Select Question Type */}
      <div className="mb-3">
        <label className="form-label">Select Question Type:</label>
        <div className="btn-group w-100">
          <button
            className={`btn ${questionType === "mcq" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setQuestionType("mcq")}
          >
            MCQs
          </button>
          <button
            className={`btn ${questionType === "narrative" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setQuestionType("narrative")}
          >
            Narrative Questions
          </button>
        </div>
      </div>

      <button onClick={handleGenerateQuestions} disabled={loading} className="btn btn-success w-100 mb-2">
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {extractedText && (
        <div className="mb-2">
          <h5>Extracted Text:</h5>
          <textarea
            value={extractedText}
            readOnly
            className="form-control extractedText"
            rows={6}
          />
           <button
            onClick={handleCopyText}
            className="btn btn-info mt-2 w-100"
          >
            Copy Text
          </button>
        </div>
      )}

      {/* Display Questions using the new component */}
      <ShowQandA questionType={questionType} mcqs={mcqs} narrativeQuestions={narrativeQuestions} />
    </div>
  );
};

export default QuestionGenerator;
