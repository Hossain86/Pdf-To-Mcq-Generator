import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

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
  const [questionType, setQuestionType] = useState<"mcq" | "narrative">("mcq"); // Toggle between MCQ & Narrative
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [narrativeQuestions, setNarrativeQuestions] = useState<Narrative[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  // Handle Question Generation
  const generateQuestions = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMcqs([]);
    setNarrativeQuestions([]);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);
      formData.append("question_type", questionType); // Send question type to backend

      const response = await axios.post(
        "http://127.0.0.1:5000/generate-questions",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.error) {
        setError(response.data.error);
      } else {
        if (questionType === "mcq") {
          setMcqs(response.data);
        } else {
          setNarrativeQuestions(response.data);
        }
      }
    } catch (error) {
      console.error("Error generating questions", error);
      setError("Failed to generate questions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4 mb-4 p-4 border shadow-sm">
      <h1 className="text-center mb-4">PDF to Question & Answer Generator</h1>

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
            className={`btn ${
              questionType === "mcq" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setQuestionType("mcq")}
          >
            MCQs
          </button>
          <button
            className={`btn ${
              questionType === "narrative"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => setQuestionType("narrative")}
          >
            Narrative Questions
          </button>
        </div>
      </div>

      <button
        onClick={generateQuestions}
        disabled={loading}
        className="btn btn-success w-100 mb-2"
      >
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {/* Render MCQs */}
      {mcqs.length > 0 && questionType === "mcq" && (
        <div className="mt-4">
          <h2>Generated MCQs:</h2>
          {mcqs.map((mcq, index) => (
            <div
              key={index}
              className="mb-4 p-3 border rounded shadow-sm bg-light"
            >
              <div className="mb-2">
                <strong>
                  {index + 1}. {mcq.question}
                </strong>
              </div>
              {mcq.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  className="btn btn-outline-secondary w-100 mb-2"
                >
                  {option.label}. {option.text}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 Fix: Render Narrative Questions Correctly */}
      {narrativeQuestions.length > 0 && questionType === "narrative" && (
        <div className="mt-4">
          <h2>Generated Narrative Questions:</h2>
          {narrativeQuestions.map((narrative, index) => (
            <div
              key={index}
              className="mb-4 p-3 bg-light  border rounded shadow-sm narrative-question"
            >
              <p className="fs-5">
                <strong>Q: {narrative.question}</strong>
              </p>
              <p className="fst-normal fs-6">A: {narrative.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionGenerator;
