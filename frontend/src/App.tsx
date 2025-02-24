import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

// Define types for MCQ and options
type Option = {
  label: string;
  text: string;
};

type MCQ = {
  question: string;
  options: Option[];
  answer: string; // Correct answer
};

const MCQGenerator = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mcqs, setMcqs] = useState<MCQ[]>([]); // Array to hold MCQs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<string[]>([]); // Array to hold user's answers
  const [quizFinished, setQuizFinished] = useState(false); // Track if quiz is finished

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  // Handle MCQ generation
  const generateMCQs = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMcqs([]);
    setError(null);
    setQuizFinished(false);
    setUserAnswers([]);

    try {
      const formData = new FormData();
      formData.append("pdf", selectedFile);

      const response = await axios.post(
        "http://127.0.0.1:5000/generate-mcqs",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.error) {
        setError(response.data.error);
        setMcqs([]); // Reset to empty array on error
      } else {
        setMcqs(response.data); // Assuming mcqs are returned as an array of MCQ objects
      }
    } catch (error) {
      console.error("Error generating MCQs", error);
      setError("Failed to generate MCQs.");
    } finally {
      setLoading(false);
    }
  };

  // Handle user answer selection
  const handleAnswerSelection = (
    questionIndex: number,
    selectedOption: string
  ) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[questionIndex] = selectedOption;
    setUserAnswers(updatedAnswers);
  };

  // Check if the quiz is finished
  const checkAnswers = () => {
    setQuizFinished(true);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">PDF to MCQ Generator</h1>

      <div className="mb-3">
        <input
          type="file"
          accept="application/pdf"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      <button
        onClick={generateMCQs}
        disabled={loading}
        className="btn btn-primary"
      >
        {loading ? "Generating..." : "Generate MCQs"}
      </button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {mcqs.length > 0 && (
        <div className="mt-4">
          <h2>Generated Questions:</h2>
          {mcqs.map((mcq, index) => (
            <div key={index} className="mb-4">
              <div className="mb-2">
                <strong>
                  {index + 1}. {mcq.question}
                </strong>
              </div>
              {mcq.options.map((option, optionIndex) => {
                const isSelected =
                  userAnswers[index] === option.label; // Check if this option is selected
                const isCorrect = mcq.answer === option.label; // Check if it's the correct answer
                const isIncorrect = isSelected && !isCorrect; // If selected but incorrect

                return (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerSelection(index, option.label)}
                    className={`btn w-100 mb-2 ${quizFinished ? 
                      isCorrect ? "btn-success" : 
                      isIncorrect ? "btn-danger" : 
                      "" : 
                      isSelected ? "btn-info" : "btn-outline-secondary"}`}
                  >
                    {option.label}. {option.text}
                  </button>
                );
              })}
            </div>
          ))}
          {!quizFinished && (
            <button
              onClick={checkAnswers}
              className="btn btn-success mt-3 w-100"
            >
              Submit Answers
            </button>
          )}
          {quizFinished && (
            <div className="mt-4 text-center">
              <p className="h4">Quiz Finished! Review your answers.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MCQGenerator;
