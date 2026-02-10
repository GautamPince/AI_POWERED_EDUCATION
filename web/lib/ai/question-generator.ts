/**
 * AI Question Generator Service
 * Handles communication with Google AI (Gemini) for question generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    QuestionGenerationRequest,
    QuestionContent,
    MCQQuestion,
    NumericalQuestion,
    QuestionValidationResult,
    AIPromptTemplate,
    SYSTEM_PROMPT as SYSTEM_PROMPT_TYPE
} from '../types/questions';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const SYSTEM_PROMPT = `You are an AI Question Generator for Indian competitive examinations.

Your responsibility is to generate exam-accurate, syllabus-aligned questions at runtime.

STRICT RULES:
- Generate questions ONLY from the provided syllabus and topic
- Match the exact exam pattern and difficulty
- Use clear, simple language suitable for Tier 2/3 learners
- Do NOT invent topics, formulas, or rules
- Do NOT provide motivational or teaching explanations unless explicitly asked
- Do NOT predict exams or claim guarantees
- Maintain fairness, neutrality, and accuracy

You must behave like an official test-setter, not a tutor.`;

// ============================================================================
// Blocked Content Filters
// ============================================================================

const BLOCKED_WORDS = [
    'guaranteed',
    'sure question',
    'leak',
    'confirmed',
    'will definitely come',
    '100% sure',
    'confirmed question',
    'inside information'
];

function containsBlockedContent(text: string): boolean {
    const lowerText = text.toLowerCase();
    return BLOCKED_WORDS.some(word => lowerText.includes(word));
}

// ============================================================================
// Prompt Templates
// ============================================================================

function buildMCQPrompt(request: QuestionGenerationRequest): string {
    return `Generate ${request.count} Multiple Choice Question(s) for ${request.exam_name}.

Subject: ${request.subject}
Topic: ${request.topic}
Difficulty: ${request.difficulty}
Language: ${request.language}

Constraints:
- 4 options only
- Options must be similar in length
- No obvious eliminations (avoid "none of the above", "all of the above" unless standard)
- Correct answer position must vary randomly
- Use exam-appropriate language and terminology

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Clear question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 2,
      "explanation": "Brief explanation of correct answer"
    }
  ]
}`;
}

function buildNumericalPrompt(request: QuestionGenerationRequest): string {
    return `Generate ${request.count} Numerical/Calculation question(s) for ${request.exam_name}.

Subject: ${request.subject}
Topic: ${request.topic}
Difficulty: ${request.difficulty}
Language: ${request.language}

Rules:
- Provide clear numerical values
- Use standard formulas only (no advanced/uncommon formulas)
- Include appropriate units
- Questions should be solvable in 45-60 seconds
- Avoid ambiguous wording

Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question": "Calculate the simple interest on ₹5000 at 10% per annum for 2 years",
      "answer": "1000",
      "unit": "₹",
      "explanation": "SI = (P × R × T)/100 = (5000 × 10 × 2)/100 = ₹1000"
    }
  ]
}`;
}

function buildReasoningPrompt(request: QuestionGenerationRequest): string {
    return `Generate ${request.count} Reasoning/Logical question(s) for ${request.exam_name}.

Subject: ${request.subject}
Topic: ${request.topic}
Difficulty: ${request.difficulty}
Language: ${request.language}

Rules:
- Use standard exam-style reasoning patterns
- Avoid puzzles requiring complex diagrams
- Keep question length moderate (2-4 lines)
- Reasoning should be clear and unambiguous

Return ONLY valid JSON (MCQ format with 4 options):
{
  "questions": [
    {
      "question": "A is the brother of B. B is the sister of C. How is C related to A?",
      "options": ["Sister", "Brother", "Cannot be determined", "Cousin"],
      "correct_answer_index": 2,
      "explanation": "Gender of C is not specified"
    }
  ]
}`;
}

function buildComprehensionPrompt(request: QuestionGenerationRequest): string {
    return `Generate ONE comprehension passage followed by ${request.count} questions.

Exam: ${request.exam_name}
Topic: ${request.topic}
Difficulty: ${request.difficulty}
Language: ${request.language}

Rules:
- Passage must be 150-200 words
- Questions strictly based on passage content
- No outside knowledge required
- Mix of direct and inference questions

Return ONLY valid JSON:
{
  "passage": "Passage text here...",
  "questions": [
    {
      "question": "According to the passage...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer_index": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;
}

// ============================================================================
// Main Generation Function
// ============================================================================

export async function generateQuestions(
    request: QuestionGenerationRequest
): Promise<QuestionContent[]> {
    try {
        // Build appropriate prompt based on question type
        let userPrompt: string;

        switch (request.question_type) {
            case 'mcq':
                userPrompt = buildMCQPrompt(request);
                break;
            case 'numerical':
                userPrompt = buildNumericalPrompt(request);
                break;
            case 'reasoning':
                userPrompt = buildReasoningPrompt(request);
                break;
            case 'comprehension':
                userPrompt = buildComprehensionPrompt(request);
                break;
            default:
                throw new Error(`Unsupported question type: ${request.question_type}`);
        }

        // Generate with system context
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in AI response');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate and extract questions
        let questions: QuestionContent[];

        if (request.question_type === 'comprehension') {
            // Comprehension returns passage + questions
            questions = [{
                passage: parsed.passage,
                questions: parsed.questions
            }];
        } else {
            questions = parsed.questions || [];
        }

        // Validate content safety
        for (const question of questions) {
            const questionText = JSON.stringify(question);
            if (containsBlockedContent(questionText)) {
                throw new Error('Generated content contains blocked words');
            }
        }

        return questions;

    } catch (error) {
        console.error('Question generation error:', error);
        throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// ============================================================================
// Question Validation
// ============================================================================

export function validateQuestion(question: QuestionContent): QuestionValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;

    // Type guard for MCQ
    if ('options' in question) {
        const mcq = question as MCQQuestion;

        // Check options count
        if (mcq.options.length !== 4) {
            issues.push('MCQ must have exactly 4 options');
            qualityScore -= 30;
        }

        // Check option length variance (should be similar)
        if (mcq.options.length === 4) {
            const lengths = mcq.options.map(opt => opt.length);
            const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
            const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;

            if (variance > 100) {
                warnings.push('Option lengths are too dissimilar');
                qualityScore -= 10;
            }
        }

        // Check correct answer index validity
        if (mcq.correct_answer_index < 0 || mcq.correct_answer_index >= mcq.options.length) {
            issues.push('Invalid correct answer index');
            qualityScore -= 40;
        }

        // Check for "All of the above" / "None of the above" in easy questions
        const hasAllNone = mcq.options.some(opt =>
            opt.toLowerCase().includes('all of the above') ||
            opt.toLowerCase().includes('none of the above')
        );
        if (hasAllNone) {
            warnings.push('Contains "all/none of the above" option');
            qualityScore -= 5;
        }
    }

    // Check question length
    const questionText = 'question' in question ? question.question : '';
    if (questionText.length < 20) {
        warnings.push('Question text is too short');
        qualityScore -= 10;
    }
    if (questionText.length > 500) {
        warnings.push('Question text is too long');
        qualityScore -= 10;
    }

    // Check for explanation
    if (!('explanation' in question) || !question.explanation) {
        warnings.push('Missing explanation');
        qualityScore -= 5;
    }

    // Check for blocked content
    if (containsBlockedContent(questionText)) {
        issues.push('Contains blocked/promotional content');
        qualityScore -= 50;
    }

    const valid = issues.length === 0;
    qualityScore = Math.max(0, Math.min(100, qualityScore));

    return {
        valid,
        quality_score: qualityScore,
        issues,
        warnings
    };
}

// ============================================================================
// Difficulty Adjustment
// ============================================================================

export async function adjustQuestionDifficulty(
    question: QuestionContent,
    targetDifficulty: 'easy' | 'medium' | 'hard'
): Promise<QuestionContent> {
    const promptText = 'question' in question ? question.question : '';

    const adjustPrompt = `Adjust the following question to ${targetDifficulty} difficulty level.

Original Question: ${promptText}

Rules:
- Keep the same topic and question type
- Only modify complexity, not the core concept
- Maintain exam pattern

Return adjusted question in the same JSON format.`;

    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\n${adjustPrompt}`);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON in adjustment response');
    }

    return JSON.parse(jsonMatch[0]);
}

// ============================================================================
// Language Translation
// ============================================================================

export async function translateQuestion(
    question: QuestionContent,
    targetLanguage: string
): Promise<QuestionContent> {
    const translatePrompt = `Translate the following question to ${targetLanguage}.

Question: ${JSON.stringify(question, null, 2)}

Rules:
- Preserve exact meaning
- Use simple, exam-appropriate words
- Keep technical terms standard
- Avoid regional slang

Return translated question in the same JSON format.`;

    const result = await model.generateContent(translatePrompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No valid JSON in translation response');
    }

    return JSON.parse(jsonMatch[0]);
}
