# LearnSync — Adaptive Learning Management System (ALMS)

LearnSync is a next-generation, premium Adaptive Learning Management System (ALMS) built using a modern full-stack architecture. It adapts to student performance, providing automated revision suggestions and unlocking content dynamically, while offering teachers a comprehensive panel with AI-powered quiz generation.

## ✨ Features

- 🔐 **Multi-User JWT Authentication**: Role-based routing separates Student and Teacher workflows securely.
- 🌙 **Premium Glassmorphic UI**: High-end aesthetic featuring a cohesive dark mode theme (`#080c18`), responsive grids, elegant layouts, custom animations, and Google Fonts (`Outfit` & `Inter`).
- 📈 **Dynamic Student Dashboard**: Personalized progress tracking, live mastery completion rates, and adaptive topic workflows.
- 🧑‍🏫 **Teacher Admin Panel**: Create subjects, manage topics, add quiz questions manually, or generate them instantly using AI.
- 🤖 **AI-Powered Quiz Generation**: Generate multiple-choice questions for any topic with one click, integrated with **OpenRouter** (supports Gemini 2.5 Flash, LLaMA 3, etc.).
- 📊 **Adaptive Evaluation Engine**: Evaluates student scores. Students scoring $\ge 65\%$ advance; others receive instant feedback and targeted study suggestions.
- 🔄 **Cross-Database Compatibility**: Works seamlessly with **SQLite** for rapid local development and **PostgreSQL** for scalable production environments.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router DOM, Axios, Context API (Auth).
- **Backend**: Node.js, Express, JSON Web Tokens (JWT), BCryptJS.
- **Database**: PostgreSQL (Production) / SQLite (Local Dev).
- **AI Engine**: OpenRouter API.

---

## 🚀 Setup & Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (optional for local deployment, required for production)

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_signing_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=google/gemini-2.5-flash # Optional, defaults to gemini-2.5-flash
   
   # For Local Dev (SQLite)
   # Leave DATABASE_URL empty/unset to auto-fallback to SQLite
   
   # For Production/PostgreSQL (Render)
   DATABASE_URL=postgres://user:password@host/dbname
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

---

### 3. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend/` folder:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the frontend Vite development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🔑 Demo Access & Seeding

To quickly populate the database with topics, quizzes, and demo accounts, run the following:

- **Local Seeding**: Visit `http://localhost:5000/api/seed` in your browser.
- **Production Seeding**: Visit `https://your-backend-app.onrender.com/api/seed` in your browser.

Once seeded, log in with the following demo credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **🎓 Student** | `student@alms.com` | `student123` |
| **🧑‍🏫 Teacher** | `teacher@alms.com` | `teacher123` |

---

## 📋 Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email
        string password_hash
        string role
    }
    SUBJECTS {
        int id PK
        string name
    }
    TOPICS {
        int id PK
        int subject_id FK
        int order_index
        string title
        string content
    }
    QUIZZES {
        int id PK
        int topic_id FK
        string question
        string options
        string correct_answer
    }
    QUIZ_ATTEMPTS {
        int id PK
        int user_id FK
        int topic_id FK
        float score
        boolean passed
        timestamp created_at
    }
    PROGRESS_TRACKING {
        int user_id PK, FK
        int topic_id PK, FK
        string status
    }

    SUBJECTS ||--o{ TOPICS : contains
    TOPICS ||--o{ QUIZZES : contains
    USERS ||--o{ QUIZ_ATTEMPTS : performs
    TOPICS ||--o{ QUIZ_ATTEMPTS : targeted_by
    USERS ||--o{ PROGRESS_TRACKING : tracks
    TOPICS ||--o{ PROGRESS_TRACKING : tracked_by
```
