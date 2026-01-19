# API SPECIFICATION (MVP)

## 1. Authentication
* `POST /auth/login` - Request OTP
* `POST /auth/verify-otp` - Verify and getToken
* `GET /auth/me` - Get current session user

## 2. User & Profile
* `GET /users/{id}` - Get profile details
* `PUT /users/{id}` - Update profile (language, target exam)

## 3. Exams & Content
* `GET /exams` - List available exams
* `GET /exams/{id}/topics` - Get taxonomy
* `GET /topics/{id}/content` - Get learning materials

## 4. Diagnostics & Study Plans
* `POST /diagnostic/start` - Initiate test session
* `POST /diagnostic/submit` - Submit answers, calc score
* `GET /diagnostic/result/{userId}` - Get baseline
* `POST /study-plan/generate` - **AI Engine Trigger**
* `GET /study-plan/{userId}` - Get current daily schedule
* `GET /study-plan/{id}/items` - Get specific day tasks

## 5. Mock Tests
* `GET /mock-tests` - List available mocks
* `POST /mock-tests/{id}/attempt` - Start/Submit attempt
* `GET /mock-tests/{id}/result/{userId}` - Detailed analysis

## 6. Mentor System
* `GET /mentor/assigned/{userId}` - Get my mentor info
* `GET /mentor/students/{mentorId}` - Mentor View: My students
* `POST /mentor/session` - Log session notes
* `POST /mentor/session/feedback` - Student rates session

## 7. Progress & Analytics
* `GET /progress/{userId}` - History and trends
* `GET /mentor/dashboard/{mentorId}` - Aggregate stats for mentor

## 8. Payments
* `POST /subscription/create` - Init Razorpay order
* `GET /subscription/status/{userId}` - Check active sub
