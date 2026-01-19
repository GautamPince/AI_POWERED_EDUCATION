# Implementation Plan - AI-Powered Vernacular Education Platform

## Goal Description
Build a premium, high-trust educational platform tailored for India's Tier 2/3 cities. The platform leverages AI to generate personalized study plans in native languages (Hindi, Tamil, etc.) and connects users with verified mentors.
**Key Differentiator:** Uncompromising focus on **TRUST**. Every element of the UI must answer "Why should I trust this?"

## User Review Required
> [!IMPORTANT]
> **Trust Mechanism Strategy**: We are implementing a "Triple-Lock Trust System":
> 1. **Identity Verification**: UI for mentors to upload credentials.
> 2. **Outcome Transparency**: A dedicated section showing real placement stats (mocked for MVP).
> 3. **Risk-Free Trial**: Prominent "No Credit Card Required" AI assessment.

## Proposed Changes

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + Shadcn/UI (for clean, professional look)
- **Animation**: Framer Motion (to create a "Premium" feel, moving away from static government-style portals)
- **Icons**: Lucide React

### Directory Structure (New)
We will initialize the project in `E:\react js\algo\picture_creating\AI_POWERED_EDUCATION`.

#### [NEW] /components/trust
Specialized components to build credibility:
- `VerifiedBadge.tsx`: Visual indicator of checked credentials.
- `SuccessTicker.tsx`: "Rohan from Patna just got a job at..."
- `MentorCard.tsx`: Highlights "Years of Experience" and "Language Fluency".

#### [NEW] /app/[lang]/
- Dynamic routing for language support (e.g., /hi/ for Hindi, /ta/ for Tamil).

### Key Features to Implement First

#### 1. The "Trust-First" Landing Page
- **Hero Section**: Not just a generic tagline, but a promise. "Verified Skills. Real Jobs. In Your Language."
- **Social Proof**: Logos of hiring partners, scrolling ticker of student wins.
- **Language Switcher**: Prominently placed, not hidden in a footer.

#### 2. AI Study Planner (The "Hook")
- Simple wizard: "What do you want to become?" (e.g., Bank PO, Python Dev) -> "What language?" -> **AI Generates Roadmap**.
- *Trust Factor*: The roadmap explains *why* each step is needed.

#### 3. Mentor Verification Flow
- A dedicated page showing *how* we verify mentors (Interview process, ID check transparency).

## Verification Plan

### Automated Tests
- Build verification: `npm run build`
- Lint checks: `npm run lint`

### Manual Verification
- **Visual Trust Check**: Does the design look "scammy" or "premium"? (Subjective review of colors/typography).
- **Responsiveness**: Check on simulated low-end Android devices (common in target demographic).
- **Language Flow**: Ensure switching languages doesn't break the layout.
