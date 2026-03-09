# DiaSense AI – Intelligent Diabetes Prediction System

DiaSense AI is an **AI-powered healthcare web application** that predicts diabetes risk using machine learning models. The system analyzes patient health data and provides risk predictions, health recommendations, chatbot assistance, and doctor consultation features to support early diabetes detection and health management.

"This Repository is Part Of My Individual CourseWork. Unauthorized Copying or Reuse Is Strictly Prohibited." This Code Is Original Work By " Mohamed Shaki " for Academic Purpose.

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

## Project Stucure 
DiaSense-AI
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── lib
│
├── backend
│   ├── routes
│   ├── models
│   ├── controllers
│   └── middleware
│
├── ml-service
│   ├── models
│   ├── artifacts
│   ├── main.py
│   └── requirements.txt
│
├── admin-dashboard
│   ├── src
│   └── components
│
└── README.md

##Installation
1. Clone the repository
git clone https://github.com/your-username/diasense-ai.git
cd diasense-ai

2. Install frontend
cd frontend
npm install
npm run dev

3. Install backend
cd backend
npm install
npm run dev

4. Install ML service
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload

##Contributing
This project was developed as a final year software engineering project. Contributions and suggestions for improvement are welcome.

##License
This project is created for academic and educational purposes.

##Author
Mohammed Shaki 
BSc Software Engineering
Final Year Project – DiaSense AI

