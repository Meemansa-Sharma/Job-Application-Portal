# 🚀 HireConnect – AI-Powered Job Application Portal

![License](https://img.shields.io/badge/License-Academic-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-success)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![AI](https://img.shields.io/badge/AI-Groq-purple)

## 📌 Overview

HireConnect is a full-stack AI-powered Job Application Portal developed to simplify and modernize the recruitment process by connecting job seekers and employers through a centralized digital platform.

The platform enables employers to post and manage job openings while allowing job seekers to search for jobs, submit applications, upload resumes, and monitor their application status. In addition to traditional recruitment features, HireConnect integrates the Groq Large Language Model (LLM) to intelligently analyze candidate skills against job requirements.

The AI module generates a compatibility score, identifies matched and missing skills, provides personalized improvement suggestions, and summarizes the candidate's suitability for a specific role. To ensure uninterrupted functionality, the system automatically falls back to a rule-based skill matching algorithm whenever the AI service is unavailable.

---

# ✨ Features

## 👨‍💼 Job Seeker

* Secure Registration & Login
* JWT Authentication
* Browse Available Jobs
* Search & Filter Jobs
* View Job Details
* Apply for Jobs
* Resume Upload
* Track Submitted Applications
* Profile Management
* AI Skill Match Analysis
* Notifications

---

## 🏢 Employer

* Employer Registration & Login
* Create Job Listings
* Edit Existing Jobs
* Delete Job Posts
* View Posted Jobs
* Manage Applicants
* Review Candidate Profiles
* AI-Based Candidate Skill Evaluation

---

## 🛡️ Admin

* Secure Admin Authentication
* User Management
* Employer Management
* Job Monitoring
* Platform Administration

---

# 🤖 AI-Powered Skill Match Analysis

One of the key highlights of HireConnect is its AI integration using the Groq API.

The AI module analyzes candidate profiles against job requirements and provides:

* Skill compatibility score (0–100)
* Matched skills
* Missing skills
* Candidate suitability summary
* Personalized improvement suggestions
* Intelligent recruitment assistance

If the AI service is temporarily unavailable, the system automatically switches to a rule-based matching algorithm to ensure uninterrupted operation.

---

# 🛠️ Tech Stack

## Frontend

* HTML5
* CSS3
* JavaScript (Vanilla JS)

## Backend

* Node.js
* Express.js

## Database

* MongoDB
* Mongoose

## Authentication

* JSON Web Token (JWT)
* bcrypt

## AI Integration

* Groq API
* OpenAI GPT-OSS Model

## File Upload

* Multer

## Additional Packages

* dotenv
* cors
* nodemon

---

# 📂 Project Structure

```text
Job-Application-Portal
│
├── Backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── seed
│   ├── services
│   ├── uploads
│   ├── package.json
│   └── server.js
│
├
├── js
├── pages
├── index.html
├── login.html
├── register.html
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/Meemansa-Sharma/Job-Application-Portal.git
```

---

## 2. Navigate to the Project

```bash
cd Job-Application-Portal
```

---

## 3. Install Backend Dependencies

```bash
cd Backend
npm install
```

---

## 4. Configure Environment Variables

Create a `.env` file inside the **Backend** directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

---

## 5. Start the Backend

```bash
npm run dev
```

or

```bash
nodemon server.js
```

---

## 6. Run the Frontend

Launch the frontend using **Live Server** in Visual Studio Code or any local web server.

---

# 🔐 Authentication & Security

* JWT-based Authentication
* Password Hashing using bcrypt
* Protected Routes
* Role-Based Access Control
* Secure API Architecture
* Environment Variable Configuration

---

# 📡 Backend API Modules

* Authentication
* Users
* Jobs
* Applications
* Notifications
* Admin
* AI Skill Matching

---

# 📸 Application Screens

* Home Page
* Login
* Registration
* Browse Jobs
* Job Details
* Employer Dashboard
* Admin Dashboard
* User Profile
* My Applications
* AI Skill Match Results

---

# 🚀 Future Enhancements

* Email Verification
* Password Reset
* Interview Scheduling
* Saved Jobs
* Company Profiles
* AI Resume Improvement Suggestions
* AI Career Guidance
* AI Interview Preparation
* Resume Parsing
* Analytics Dashboard
* Real-Time Chat
* Email Notifications

---

# 👩‍💻 Team Members

* **Meemansa Sharma**
* **Krishika**
* **Harsh Thakur**
---

# 🎓 Academic Information

**Project Title:** HireConnect – AI-Powered Job Application Portal

**Developed As:** Project for course completion 'AI Driven Full Stack Development'

**University:** Lovely Professional University (LPU)

**Program:** B.Tech CSE

---

# 🙏 Acknowledgements

We sincerely thank our project guide, faculty members, and Lovely Professional University for their valuable guidance and support throughout the successful completion of this project.

We also acknowledge the open-source community and the developers of Node.js, Express.js, MongoDB, Groq, and other technologies used in this project.

---

# 📄 License

This project has been developed solely for academic and educational purposes as part of the Bachelor of Technology curriculum at Lovely Professional University.
