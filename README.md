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

<img width="828" height="784" alt="image" src="https://github.com/user-attachments/assets/8a271055-9f64-47f3-93ed-a74c3d579244" />

<img width="817" height="641" alt="image" src="https://github.com/user-attachments/assets/06332ba4-d1d4-46f1-aacb-2a2372a83821" />

<img width="895" height="644" alt="image" src="https://github.com/user-attachments/assets/cbbe5b53-6240-4e25-afaf-8ac36d3800d9" />

##Contributing
This project was developed as a final year software engineering project. Contributions and suggestions for improvement are welcome.

##License
This project is created for academic and educational purposes.

##Author
Mohammed Shaki 
BSc Software Engineering
Final Year Project – DiaSense AI

<img width="822" height="490" alt="image" src="https://github.com/user-attachments/assets/089ec3f5-1820-4712-a9e9-25338972254f" />
