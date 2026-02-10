# AI Question Generation - Setup & Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies

Already done! The package `@google/generative-ai` has been installed.

### 2. Set Up Environment Variables

Add to your `.env.local` file:

```bash
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

**Get your API key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy and paste into `.env.local`

### 3. Run Database Migrations

Execute the SQL migration on your Supabase database:

```sql
-- Run this in your Supabase SQL Editor:
-- File: lib/supabase/migrations/003_ai_questions.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 4. Test the API

```bash
# Start dev server (already running)
npm run dev

# Test question generation
curl -X POST http://localhost:3000/api/questions/generate \
  -H "Content-Type: application/json" \
  -d '{
    "exam_name": "Banking PO (IBPS)",
    "subject": "Quantitative Aptitude",
    "topic": "Number Systems",
    "difficulty": "medium",
    "question_type": "mcq",
    "language": "english",
    "count": 3
  }'
```

---

## 📂 What Was Created

### Backend Files

1. **Database Schema**
   - `lib/supabase/migrations/003_ai_questions.sql`
   - 5 new tables with RLS policies

2. **TypeScript Types**
   - `lib/types/questions.ts`
   - Complete type definitions + exam configurations

3. **AI Generator Service**
   - `lib/ai/question-generator.ts`
   - Gemini integration with safety filters

4. **Caching Layer**
   - `lib/cache/question-cache.ts`
   - Intelligent caching with TTL strategies

5. **API Routes**
   - `/api/questions/generate/route.ts` - Main generation endpoint
   - `/api/questions/review/pending/route.ts` - Get pending reviews
   - `/api/questions/review/approve/route.ts` - Approve questions
   - `/api/questions/review/reject/route.ts` - Reject questions

### Frontend Components

1. **AIQuestion Component**
   - `components/AIQuestion.tsx`
   - Reusable question display with validation

2. **Mentor Review Dashboard**
   - `app/mentor/review-questions/page.tsx`
   - Full review interface for mentors

---

## 🎯 How to Use

### In Diagnostic Test

```tsx
import { QuestionLoader } from '@/components/AIQuestion';

<QuestionLoader
  examName="Banking PO (IBPS)"
  subject="Quantitative Aptitude"
  topic="Number Systems"
  difficulty="medium"
  count={5}
  onComplete={(correct, total) => {
    console.log(`Score: ${correct}/${total}`);
  }}
/>
```

### In Study Plan

```tsx
import { QuestionLoader } from '@/components/AIQuestion';

<QuestionLoader
  examName={userExam}
  subject={currentSubject}
  topic={identifiedWeakness}
  difficulty="easy"
  count={10}
/>
```

---

## 🔒 Security & Safety

### Implemented Protections

✅ **Content Filtering** - Blocks promotional/misleading language  
✅ **Rate Limiting** - 10 requests per minute per user  
✅ **Quality Validation** - Auto-scores questions 0-100  
✅ **Mentor Review** - Pending questions require approval  
✅ **User Authentication** - All endpoints protected  
✅ **RLS Policies** - Row-level security on all tables

---

## 💰 Cost Management

### Estimated Costs (Google AI Free Tier)

- **Free Tier**: 60 requests/minute
- **Paid**: ₹0.50 per 1000 characters generated

### Cost Optimization Features

1. **Aggressive Caching** (Target: 75% hit rate)
2. **TTL by Difficulty** (Easy cached longest)
3. **Fallback to Pre-seeded** questions
4. **Batch Generation** (Generate 20, use 5)

**Expected monthly cost**: ₹500-1000 for 10,000 active users

---

## 📊 Monitoring & Analytics

### Track These Metrics

Dashboard at `/mentor/analytics`:

- Questions generated (total)
- Cache hit rate
- Average quality score
- API cost savings
- User completion rates

---

## 🧪 Testing Checklist

### Before Production Deploy

- [ ] Get Google AI API key
- [ ] Run database migrations
- [ ] Test question generation for all exam types
- [ ] Verify caching is working
- [ ] Test mentor review workflow
- [ ] Seed 100-200 fallback questions
- [ ] Set up error monitoring
- [ ] Configure Vercel environment variables

---

## 🚢 Deployment to Vercel

### Add Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `GOOGLE_AI_API_KEY` with your API key
3. Redeploy

### Database Migration

Run the SQL file in Supabase SQL Editor:
```sql
-- Copy contents of lib/supabase/migrations/003_ai_questions.sql
-- Paste and execute in Supabase Dashboard → SQL Editor
```

---

## 🎓 Usage Example

```typescript
// Generate 5 medium MCQ questions
const response = await fetch('/api/questions/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    exam_name: 'Banking PO (IBPS)',
    subject: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'medium',
    question_type: 'mcq',
    language: 'english',
    count: 5,
    use_cache: true // Enable caching
  })
});

const data = await response.json();
// data.questions contains AIGeneratedQuestion[]
```

---

## 🆘 Troubleshooting

### "Failed to generate questions"
- Check `GOOGLE_AI_API_KEY` is set correctly
- Verify API key is valid at Google AI Studio
- Check if free tier limit exceeded

### "No questions available"
- Seed fallback questions in database
- Check RLS policies allow reading approved questions

### "Rate limit exceeded"
- Reduce requests or increase `RATE_LIMIT_REQUESTS_PER_MINUTE`
- Ensure caching is enabled

---

## 📈 Next Steps

### Phase 4: Advanced Features

1. **Multi-language Support** - Hindi, Tamil, Telugu questions
2. **Adaptive Difficulty** - Auto-adjust based on user performance
3. **Question Analytics** - Track which questions are most effective
4. **Batch Generation** - Pre-warm cache during off-peak hours
5. **A/B Testing** - Test different question styles

---

## ✅ System Status

- ✅ Database schema ready
- ✅ API routes implemented
- ✅ Components created
- ⏳ Env variables (need API key)
- ⏳ Database migration (need to run SQL)
- ⏳ Seed data (optional)

**Ready for testing once Google AI API key is configured!**
