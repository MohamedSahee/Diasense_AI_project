# DiaSense AI – Intelligent Diabetes Prediction System

DiaSense AI is an **AI-powered healthcare web application** that predicts diabetes risk using machine learning models. The system analyzes patient health data and provides risk predictions, health recommendations, chatbot assistance, and doctor consultation features to support early diabetes detection and health management.

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Machine Learning Model](#machine-learning-model)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- Diabetes risk prediction using machine learning
- Health data analysis and prediction results
- Personalized health recommendations
- AI chatbot for diabetes-related questions
- Doctor browsing and appointment booking
- Admin dashboard for system monitoring
- Prediction history tracking
- Wound image prediction and analysis

---

## Technology Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Machine Learning Service
- Python
- FastAPI
- TensorFlow / Scikit-learn

### Database
- MongoDB

---

## System Architecture

The system follows a multi-layer architecture where the frontend communicates with the backend API, and the backend communicates with the machine learning service and MongoDB.

```text
User
  │
  ▼
Frontend (React)
  │
  ▼
Backend API (Node.js / Express)
  │
  ├── MongoDB Database
  │
  ▼
ML Service (Python FastAPI)
