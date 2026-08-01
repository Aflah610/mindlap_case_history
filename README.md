# Mindlap Case History Management System - Full Stack Web Application

A full-stack mental health therapy management web application built for Mindlap to securely manage clients, case histories, appointments, therapy sessions, and clinical PDF evaluations.

## 🛠️ Technology Stack
- **Frontend**: React.js (TypeScript), Tailwind CSS, Axios, Lucide React, Chart.js / React-Chartjs-2, Vite.
- **Backend**: Django 5.x, Django REST Framework (DRF), SimpleJWT (JWT Authentication with token refresh), ReportLab (Clinical PDF Exporter), PostgreSQL / SQLite.
- **DevOps**: Docker, `docker-compose.yml`, `.env.example`.

---

## 🚀 Quick Start Guide

### Option 1: Run via Docker Compose (Recommended)
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend REST API: `http://localhost:8000/api/`

---

### Option 2: Run Local Development Servers

#### 1. Backend Setup (Django REST Framework)
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Start Django backend server
python manage.py runserver 8000
```

#### 2. Frontend Setup (React TypeScript + Tailwind)
```bash
cd frontend

# Install node dependencies
npm install

# Start Vite React dev server
npm run dev
```

---

## 🔒 Security & Data Confidentiality Enforcement

1. **Role-Based Access Control (RBAC)**:
   - **Admin**: Complete CRUD permissions over users, clients, case histories, appointments, documents, and audit logs.
   - **CCD Staff**: Can register clients and schedule appointments. **Strict Confidentiality**: Access to `/api/case-history/` and `/api/session-notes/` returns `HTTP 403 Forbidden`. The UI displays a **CCD Confidentiality Protection Banner**.
   - **Psychologists**: Data isolated. Can view ONLY clients assigned to them (`assigned_psychologist__user = request.user`). Attempting to query other psychologists' clients returns filtered or empty querysets.

2. **Automated Security Audit Log**:
   - `AuditLogMiddleware` automatically records all POST, PUT, PATCH, DELETE API operations and PDF downloads with timestamp, actor name, role, action type, and IP address.
