import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import Accordion from "react-bootstrap/Accordion";
import './ShowQandA.css'

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

// Props for the component
type Props = {
  questionType: "mcq" | "narrative";
  mcqs: MCQ[];
  narrativeQuestions: Narrative[];
};

const ShowQandA: React.FC<Props> = ({ questionType, mcqs, narrativeQuestions }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | null }>({});

  const handleOptionClick = (questionIndex: number, selectedLabel: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedLabel,
    }));
  };
  
  return (
    <div>
      {/* Render MCQs */}
      {mcqs.length > 0 && questionType === "mcq" && (
        <div className="mt-4">
          <h3>Generated MCQs:</h3>
          {mcqs.map((mcq, index) => {
            const correctLabel = mcq.answer.split(")")[0].trim(); // Extract correct option label (e.g., 'b' from 'b) The count or percentage')

            return (
              <div key={index} className="mb-4 p-3 border rounded shadow-sm">
                <div className="mcq-header">
                  <strong>
                    <p>{index + 1}. {mcq.question}</p>
                  </strong>
                </div>
                {mcq.options.map((option, optionIndex) => {
                  const isCorrect = option.label === correctLabel;
                  const isSelected = selectedAnswers[index] === option.label;

                  return (
                    <button
                      key={optionIndex}
                      className="options"
                      style={{
                        backgroundColor: isSelected ? (isCorrect ? "lightgreen" : "salmon") : "",
                      }}
                      onClick={() => handleOptionClick(index, option.label)}
                    >
                      {option.label}. <p className="ms-2 mb-0">{option.text}</p>
                    </button>
                  );
                })}
                <Accordion>
                  <Accordion.Item eventKey={index.toString()}>
                    <Accordion.Header>See Answer</Accordion.Header>
                    <Accordion.Body>
                      <strong>✅ Correct Answer:</strong> {mcq.answer}
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            );
          })}
        </div>
      )}


      {/* Render Narrative Questions */}
      {narrativeQuestions.length > 0 && questionType === "narrative" && (
        <div className="mt-4 narrativeQuestions">
          <h2>Generated Narrative Questions:</h2>
          {narrativeQuestions.map((narrative, index) => (
            <div key={index} className="narrative">
              <div className="fs-5">
                <p className="d-flex mb-0"><p style={{ width: '70px' }}>Q-{index + 1}:</p>
                <ReactMarkdown>{narrative.question}</ReactMarkdown></p>
              </div>
              <div className="narrative-answer">
              <b>Answer:</b> <ReactMarkdown>{narrative.answer}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowQandA;
 