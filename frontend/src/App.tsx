import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; 
import QuestionGenerator from "./components/QuestionGenerator";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import HomePage from "./components/HomePage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/pdfToqa" element={
          <div className="app-container"> 
            <QuestionGenerator />
          </div>} />
          <Route path="/" element={<HomePage/>}/>
      </Routes>
    </Router>
  );
};

export default App;
