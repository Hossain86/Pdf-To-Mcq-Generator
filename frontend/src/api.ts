import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

// Function to extract text from PDF
export const extractText = async (file: File) => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await axios.post(`${API_URL}/extract-text`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.extracted_text;
  } catch (error) {
    console.error("Error extracting text", error);
    throw new Error("Failed to extract text from PDF.");
  }
};

// Function to generate questions (MCQ or Narrative)
export const generateQuestions = async (file: File, questionType: "mcq" | "narrative") => {
  const formData = new FormData();
  formData.append("pdf", file);
  formData.append("question_type", questionType);

  try {
    const response = await axios.post(`${API_URL}/generate-questions`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    console.error("Error generating questions", error);
    throw new Error("Failed to generate questions.");
  }
};
