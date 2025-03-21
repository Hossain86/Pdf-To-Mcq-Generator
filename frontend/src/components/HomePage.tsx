import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FileText, ClipboardList } from "lucide-react"; // Alternative icons
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Container className="text-center">
        <header className="hero-section">
          <h1 className="hero-title">📚 Your Study Helper</h1>
          <p className="hero-subtitle">
            Boost your learning with AI-powered tools for MCQs, assignments, and more!
          </p>
        </header>

        <Row className="mt-5">
          <Col md={6} className="mb-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="feature-icon"><FileText size={50} /></div>
                <Card.Title>PDF to MCQ & Narrative Generator</Card.Title>
                <Card.Text>
                  Convert study materials into multiple-choice questions and
                  structured answers effortlessly.
                </Card.Text>
                <Button variant="primary" onClick={() => navigate(`/pdfToqa`)}>Try Now</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} className="mb-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="feature-icon"><ClipboardList size={50} /></div>
                <Card.Title>Assignment Generator</Card.Title>
                <Card.Text>
                  Generate high-quality assignments in minutes with AI-powered assistance.
                </Card.Text>
                <Button variant="success" onClick={() => navigate(`/pdfToqa`)}>Generate Assignment</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer Section */}
      <footer className="footer mt-5">
        <Container>
          <Row className="text-center">
            <Col md={12}>
              <p className="footer-text">
                &copy; {new Date().getFullYear()} Your Study Helper. All Rights Reserved.
              </p>
              <p className="footer-links">
                <a href="/about">About</a> | <a href="/contact">Contact</a> | <a href="/privacy">Privacy Policy</a>
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Home;
