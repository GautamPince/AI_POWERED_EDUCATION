# MVP Architecture Plan - AI-Powered Vernacular Exam Prep

## 1. Architecture Principles
- **Outcome-first**: Every feature must drive score improvement.
- **Manual > Automated**: Don't build what can be done manually first.
- **Replaceable Components**: No vendor lock-in.
- **WhatsApp-compatible**: Core communication happens where users are.

## 2. High-Level System Architecture
```mermaid
graph TD
    User[Learner (Mobile)] --> WebApp[Next.js PWA]
    WebApp --> API[Backend API Layer]
    API --> DB[(Supabase/Postgres)]
    API --> AI[AI Services (LLM)]
    API --> Content[Content & Video]
    Mentor[Mentor Dashboard] --> API
```

## 3. Database Schema (PostgreSQL/Supabase)

### Core Entities
- **USER**: `id, name, phone, language, role`
- **EXAM**: `id, name, level, state`
- **TOPIC**: `id, exam_id, name, difficulty`
- **CONTENT**: `id, topic_id, type (video/pdf), url`
- **DIAGNOSTIC_RESULT**: `id, user_id, score, topic_breakdown (JSON)`
- **STUDY_PLAN**: `id, user_id, start_date, status`
- **STUDY_PLAN_ITEM**: `id, plan_id, topic_id, content_id, day_number`
- **MENTOR_ASSIGNMENT**: `id, mentor_id, user_id`
- **MENTOR_SESSION**: `id, mentor_id, user_id, notes, rating`

**Key Rule**: `Exam → Topic → Content → Score Outcome` mapping is mandatory.

## 4. API Specification (MVP)

### Authentication
- `POST /auth/login` (Mobile/OTP)
- `GET /auth/me`

### Diagnostics & Plans
- `POST /diagnostic/submit`: Ingests test results.
- `POST /study-plan/generate`: Triggers AI Plan Engine.
- `GET /study-plan/{userId}`: Returns current daily tasks.

### Mentor System
- `GET /mentor/students/{mentorId}`: List of assigned learners.
- `POST /mentor/session`: Log session outcomes.

## 5. Technology Stack
- **Frontend**: Next.js 14 (App Router)
- **Backend/DB**: Supabase (Auth + Postgres)
- **AI**: OpenAI API (for Plan Generation)
- **Deployment**: Vercel

## 6. Implementation Stages (See task.md for tracking)
1. **Setup**: Project init & DB Schema migration.
2. **Core Flow**: Diagnostic -> AI Plan Gen -> Dashboard View.
3. **Content**: Video/PDF Viewer integration.
4. **Mentor Ops**: Dashboard for mentors to view student progress.
