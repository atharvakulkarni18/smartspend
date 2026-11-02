# 💰 SmartSpend — AI-Powered Personal Finance Intelligence

<div align="center">

![SmartSpend Banner](https://img.shields.io/badge/SmartSpend-AI%20Finance-6366f1?style=for-the-badge&logo=java&logoColor=white)

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen?style=flat-square&logo=spring)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat-square&logo=python)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?style=flat-square&logo=github-actions)](https://github.com/features/actions)

**A production-grade full-stack platform that uses AI/ML to automatically categorize expenses, detect fraudulent transactions, and predict future spending — built with Java Spring Boot, React, and Python FastAPI microservices.**

[🚀 Live Demo](#) · [📖 API Docs](#api-documentation) · [🐳 Quick Start](#quick-start-docker)

</div>

---

## ✨ Key Features

| Feature | Description | Tech Used |
|---|---|---|
| 🔐 **JWT Authentication** | Secure login/register with refresh tokens | Spring Security, JJWT |
| 🏦 **Multi-Account Management** | Savings, Current, Credit, Cash accounts | Spring Data JPA, PostgreSQL |
| 🤖 **AI Auto-Categorization** | Automatically tags transactions (Food, Travel, etc.) | Python FastAPI, NLP |
| 🚨 **Fraud Detection** | Isolation Forest ML model flags suspicious transactions | scikit-learn |
| 📈 **Spending Predictions** | Forecasts next month's expenses by category | Linear Regression |
| 📊 **Interactive Dashboard** | Income vs Expense charts, category breakdown | React, Chart.js |
| 💡 **Smart Budget Alerts** | Email/in-app alerts when budget threshold exceeded | Spring Mail, Redis |
| 📄 **PDF Report Generation** | Download professional monthly financial reports | iText7 |
| 📤 **CSV Import** | Bulk import transactions from bank statements | OpenCSV |
| 🐳 **Fully Dockerized** | One-command deployment with Docker Compose | Docker |
| 🔄 **CI/CD Pipeline** | Automated testing and build on every push | GitHub Actions |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  React 18 + Chart.js + React Router + Axios                 │
│  (Port 3000 → served via nginx in production)               │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND LAYER                             │
│  Spring Boot 3.2 (Java 17)                                  │
│  Spring Security + JWT | Spring Data JPA | WebClient        │
│  REST API Endpoints → (Port 8080)                           │
│  Swagger UI: /swagger-ui.html                               │
└──────────┬──────────────────────┬───────────────────────────┘
           │                      │
           ▼                      ▼
┌─────────────────┐    ┌───────────────────────────────────┐
│  PostgreSQL 15  │    │    Python AI Microservice         │
│  (Port 5432)    │    │    FastAPI 0.104 (Port 8000)       │
│                 │    │    • /categorize (NLP)            │
│  Redis Cache    │    │    • /detect-anomaly (IsoForest)  │
│  (Port 6379)    │    │    • /predict-spending (LinReg)   │
└─────────────────┘    └───────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend (Java)
- **Java 17** + **Spring Boot 3.2** — Core framework
- **Spring Security** + **JJWT** — JWT authentication & authorization
- **Spring Data JPA** + **Hibernate** — ORM & database access
- **Spring WebFlux WebClient** — Async HTTP calls to AI service
- **Spring Data Redis** — Caching for performance
- **Spring Mail** — Email notifications
- **OpenAPI/Swagger** — Auto-generated API documentation
- **iText7** — PDF report generation
- **OpenCSV** — CSV file parsing
- **Lombok** — Boilerplate reduction

### AI Microservice (Python)
- **FastAPI** — High-performance async REST framework
- **scikit-learn** — Isolation Forest, Linear Regression
- **Pandas + NumPy** — Data manipulation
- **Custom NLP Engine** — Keyword-based transaction categorization (Indian context)

### Frontend (React)
- **React 18** + **React Router 6** — SPA with routing
- **Chart.js** + **react-chartjs-2** — Interactive charts
- **Axios** — HTTP client with interceptors
- **react-hot-toast** — Notifications
- **Context API** — Global state management

### DevOps
- **Docker** + **Docker Compose** — Containerization & orchestration
- **nginx** — Production frontend serving + API proxy
- **GitHub Actions** — CI/CD pipeline

---

## 🚀 Quick Start (Docker)

**Prerequisites:** Docker & Docker Compose installed

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/smartspend.git
cd smartspend

# 2. Start all services with one command
docker-compose up --build

# Services will start at:
# Frontend:    http://localhost:3000
# Backend API: http://localhost:8080
# AI Service:  http://localhost:8000
# Swagger UI:  http://localhost:8080/swagger-ui.html
```

---

## 💻 Local Development Setup

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- Python 3.11+
- PostgreSQL 15
- Redis

### 1. Database Setup
```sql
CREATE DATABASE smartspend;
CREATE USER smartspend_user WITH PASSWORD 'smartspend_password';
GRANT ALL PRIVILEGES ON DATABASE smartspend TO smartspend_user;
```

### 2. Start AI Service
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Docs at: http://localhost:8000/docs
```

### 3. Start Backend
```bash
cd backend
mvn spring-boot:run
# API at: http://localhost:8080
# Swagger: http://localhost:8080/swagger-ui.html
```

### 4. Start Frontend
```bash
cd frontend
npm install
npm start
# App at: http://localhost:3000
```

---

## 📡 API Documentation

Full Swagger UI available at: `http://localhost:8080/swagger-ui.html`

### Core Endpoints

#### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/refresh-token` | Refresh JWT |

#### 💳 Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List transactions (paginated, filterable) |
| POST | `/api/transactions` | Create transaction (auto-categorized by AI) |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| POST | `/api/transactions/import-csv` | Bulk import from CSV |

#### 📊 Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get full dashboard data |

#### 🤖 AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/categorize` | Categorize a transaction |
| POST | `/api/ai/predict-spending` | Get spending predictions |
| GET | `/api/ai/anomalies` | Get detected anomalies |

#### 📄 Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | Download PDF monthly report |

---

## 🗃️ Database Schema

```sql
Users         → accounts (1:N)
Accounts      → transactions (1:N)
Users         → budgets (1:N)
Users         → notifications (1:N)
```

---

## 🧪 Running Tests

```bash
# Backend unit tests
cd backend
mvn test

# Backend with coverage
mvn test jacoco:report

# AI service test
cd ai-service
curl http://localhost:8000/health
curl -X POST http://localhost:8000/categorize \
  -H "Content-Type: application/json" \
  -d '{"description": "Zomato order", "amount": 350}'
```

---

## 📂 Project Structure

```
smartspend/
├── 📁 backend/                    # Java Spring Boot application
│   ├── src/main/java/com/smartspend/
│   │   ├── config/               # Security, WebClient configs
│   │   ├── controller/           # 8 REST controllers
│   │   ├── dto/                  # Request/Response DTOs
│   │   ├── entity/               # 5 JPA entities
│   │   ├── repository/           # Spring Data repos with custom queries
│   │   ├── security/             # JWT filter, UserDetails
│   │   ├── service/              # Business logic layer
│   │   └── exception/            # Global error handling
│   └── pom.xml
│
├── 📁 ai-service/                 # Python FastAPI AI microservice
│   ├── main.py                   # All AI endpoints
│   ├── Dockerfile
│   └── requirements.txt
│
├── 📁 frontend/                   # React.js application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # 8 application pages
│   │   ├── context/              # Auth context
│   │   └── services/             # API service layer
│   ├── Dockerfile
│   └── nginx.conf
│
├── 📁 .github/workflows/          # GitHub Actions CI/CD
└── docker-compose.yml             # Full-stack orchestration
```

---

## 🔮 Future Enhancements

- [ ] Google OAuth2 / Social Login
- [ ] Mobile app (React Native)
- [ ] WhatsApp bot for expense tracking
- [ ] UPI transaction auto-import
- [ ] Multi-language support (Hindi, Marathi)
- [ ] Advanced ML models (deep learning)
- [ ] Expense splitting (like Splitwise)

---

## 👨‍💻 About

Built by **[Your Name]** — Fresher from Pune, India 🇮🇳

This project demonstrates proficiency in:
- Full-stack Java development (Spring Boot ecosystem)
- Microservices architecture
- AI/ML integration in production applications  
- React.js modern patterns
- DevOps with Docker & GitHub Actions
- FinTech domain knowledge

📧 Email: your.email@example.com  
🔗 LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com)  
🐙 GitHub: [github.com/yourusername](https://github.com)

---

<div align="center">
⭐ Star this repo if you found it helpful!
</div>
