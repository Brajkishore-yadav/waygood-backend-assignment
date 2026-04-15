# 🚀 Waygood Backend Assignment - Production Ready

## 📌 Overview

This project implements a scalable MERN backend for a study-abroad platform enabling:

* Student authentication & profile management
* University & program discovery with advanced filtering
* Personalized recommendation engine using MongoDB aggregation
* Complete application lifecycle management

---

## 🧠 Architecture Decisions

### 🔐 Authentication & Security

* JWT-based authentication (stateless)
* Password hashing using bcrypt
* Protected routes via `requireAuth` middleware (`req.student`)
* Input validation and secure error handling

---

### 🎓 University & Program Discovery

* Dynamic filtering (country, partnerType, field, intake)
* Full-text search (name, country, city, tags)
* Pagination & sorting (popular, ranking, name)
* Optimized MongoDB queries

---

### 🤖 Recommendation Engine

* Built using MongoDB Aggregation Pipeline
* Scoring logic:

  * Country match → 35%
  * Field match → 30%
  * Budget compatibility → 20%
  * Intake match → 10%
  * IELTS score → 5%
* Sorted recommendations based on computed score

---

### 📄 Application Workflow

* Apply to programs
* Duplicate application prevention (unique index)
* Status lifecycle:

  * Applied → Reviewed → Accepted / Rejected
* Status history tracking (timeline)

---

### ⚡ Performance & Optimization

* In-memory caching (`cacheService`)
* Indexed queries for faster lookups
* Lean queries for reduced overhead

---

## ⚙️ Setup Instructions

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

👉 Server runs at:

```
http://localhost:8000
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

```
PORT=8000
MONGODB_URI=mongodb://127.0.0.1:27017/waygood-evaluation
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CACHE_TTL_SECONDS=300
```

---

## 📡 API Endpoints

### 🔐 Auth

* `POST /api/auth/register` → Register user
* `POST /api/auth/login` → Login & get token
* `GET /api/auth/me` → Get profile (protected)

---

### 🎓 Universities

* `GET /api/universities`
* Filters:

  ```
  ?country=Canada&field=CS&intake=Fall&page=1&limit=10&sortBy=popular
  ```

---

### 📚 Programs

* `GET /api/programs`
* Example:

  ```
  ?country=UK&field=CS&maxTuition=30000
  ```

---

### 🤖 Recommendations

* `GET /api/recommendations`
* Requires:

  ```
  Authorization: Bearer <token>
  ```

---

### 📄 Applications

* `GET /api/applications`
* `POST /api/applications`
* `PATCH /api/applications/:id/status`

---

## 🧪 Testing

```bash
npm test
```

---

## 🗄️ Database Indexing

```js
db.programs.createIndex({ country: 1, field: 1, tuitionFeeUsd: 1 });

db.applications.createIndex(
  { student: 1, program: 1, intake: 1 },
  { unique: true }
);
```

---

## 🚀 Key Highlights

* Clean modular architecture
* Scalable backend design
* Real-world workflow implementation
* Optimized queries & caching
* Production-ready code structure

---

