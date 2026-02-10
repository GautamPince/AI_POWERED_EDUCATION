/**
 * TypeScript Types for AI Question Generation System
 * Defines all interfaces and types for questions, generation requests, and responses
 */

// ============================================================================
// Core Question Types
// ============================================================================

export type QuestionType = 'mcq' | 'numerical' | 'reasoning' | 'comprehension';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionStatus = 'pending' | 'approved' | 'rejected';
export type ReviewStatus = 'approved' | 'rejected' | 'needs_revision';

// ============================================================================
// Question Content Structures
// ============================================================================

export interface MCQQuestion {
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation?: string;
}

export interface NumericalQuestion {
    question: string;
    answer: string | number;
    unit?: string;
    explanation?: string;
}

export interface ReasoningQuestion extends MCQQuestion {
    reasoning_type?: 'blood_relations' | 'series' | 'coding_decoding' | 'syllogism' | 'direction';
}

export interface ComprehensionQuestion {
    passage: string;
    questions: MCQQuestion[];
}

export type QuestionContent = MCQQuestion | NumericalQuestion | ReasoningQuestion | ComprehensionQuestion;

// ============================================================================
// Database Models
// ============================================================================

export interface AIGeneratedQuestion {
    id: string;
    exam_name: string;
    subject: string;
    topic: string;
    question_type: QuestionType;
    difficulty: Difficulty;
    language: string;
    content: QuestionContent;
    status: QuestionStatus;
    reviewed_by?: string;
    reviewed_at?: string;
    quality_score?: number;
    times_used: number;
    times_correct: number;
    avg_time_taken?: number;
    created_at: string;
    updated_at: string;
    created_by?: string;
}

export interface QuestionGenerationCache {
    id: string;
    cache_key: string;
    question_ids: string[];
    hit_count: number;
    expires_at: string;
    request_params?: Record<string, any>;
    created_at: string;
}

export interface UserQuestionAttempt {
    id: string;
    user_id: string;
    question_id: string;
    selected_answer_index?: number;
    selected_answer_text?: string;
    is_correct: boolean;
    time_taken: number;
    diagnostic_id?: string;
    study_session_id?: string;
    created_at: string;
}

export interface MentorQuestionReview {
    id: string;
    question_id: string;
    mentor_id: string;
    status: ReviewStatus;
    feedback?: string;
    suggested_changes?: Record<string, any>;
    created_at: string;
}

export interface AIGenerationAudit {
    id: string;
    request_params: Record<string, any>;
    user_id?: string;
    success: boolean;
    questions_generated: number;
    error_message?: string;
    cache_hit: boolean;
    generation_time_ms: number;
    estimated_cost?: number;
    created_at: string;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface QuestionGenerationRequest {
    exam_name: string;
    subject: string;
    topic: string;
    difficulty: Difficulty;
    question_type: QuestionType;
    language: string;
    count: number;
    use_cache?: boolean;
}

export interface QuestionGenerationResponse {
    success: boolean;
    questions: AIGeneratedQuestion[];
    metadata: {
        source: 'cache' | 'ai' | 'fallback';
        generation_time_ms: number;
        cached: boolean;
        cache_key?: string;
    };
    error?: string;
}

export interface QuestionValidationResult {
    valid: boolean;
    quality_score: number;
    issues: string[];
    warnings: string[];
}

export interface MentorReviewRequest {
    question_id: string;
    status: ReviewStatus;
    feedback?: string;
    suggested_changes?: Record<string, any>;
}

// ============================================================================
// AI Prompt Templates
// ============================================================================

export interface AIPromptTemplate {
    system_prompt: string;
    user_prompt: string;
    variables: Record<string, string>;
}

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
// Question Performance Analytics
// ============================================================================

export interface QuestionPerformanceMetrics {
    question_id: string;
    total_attempts: number;
    correct_attempts: number;
    success_rate: number;
    avg_time_taken: number;
    difficulty_accuracy: 'accurate' | 'too_easy' | 'too_hard';
}

export interface CachePerformanceMetrics {
    total_requests: number;
    cache_hits: number;
    cache_misses: number;
    cache_hit_rate: number;
    avg_generation_time_ms: number;
    total_cost_saved: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface BatchQuestionGenerationRequest {
    requests: QuestionGenerationRequest[];
    priority?: 'high' | 'normal' | 'low';
}

export interface QuestionFeedback {
    question_id: string;
    user_id: string;
    feedback_type: 'too_easy' | 'too_hard' | 'unclear' | 'incorrect' | 'good';
    comment?: string;
}

// ============================================================================
// Exam-Specific Configurations
// ============================================================================

export interface ExamConfiguration {
    exam_name: string;
    subjects: string[];
    topics_by_subject: Record<string, string[]>;
    question_types: QuestionType[];
    time_limits: Record<QuestionType, number>; // seconds
    difficulty_distribution: {
        easy: number;
        medium: number;
        hard: number;
    };
}

// ============================================================================
// Predefined Exam Configurations
// ============================================================================

export const EXAM_CONFIGS: Record<string, ExamConfiguration> = {
    'Banking PO (IBPS)': {
        exam_name: 'Banking PO (IBPS)',
        subjects: ['Quantitative Aptitude', 'Reasoning Ability', 'English Language', 'General Awareness', 'Computer Knowledge'],
        topics_by_subject: {
            'Quantitative Aptitude': [
                'Number Systems',
                'HCF & LCM',
                'Percentages',
                'Profit & Loss',
                'Simple & Compound Interest',
                'Time & Work',
                'Time, Speed & Distance',
                'Data Interpretation',
                'Algebra',
                'Geometry'
            ],
            'Reasoning Ability': [
                'Blood Relations',
                'Coding-Decoding',
                'Series',
                'Syllogism',
                'Direction Sense',
                'Seating Arrangement',
                'Puzzles',
                'Input-Output'
            ],
            'English Language': [
                'Reading Comprehension',
                'Grammar',
                'Vocabulary',
                'Error Spotting',
                'Sentence Improvement',
                'Para Jumbles'
            ],
            'General Awareness': [
                'Current Affairs',
                'Banking Awareness',
                'Static GK',
                'Indian Economy'
            ],
            'Computer Knowledge': [
                'Computer Fundamentals',
                'MS Office',
                'Internet & Security',
                'Computer Abbreviations'
            ]
        },
        question_types: ['mcq', 'comprehension', 'reasoning'],
        time_limits: {
            mcq: 45,
            numerical: 60,
            reasoning: 60,
            comprehension: 120
        },
        difficulty_distribution: {
            easy: 30,
            medium: 50,
            hard: 20
        }
    },
    'SSC CGL': {
        exam_name: 'SSC CGL',
        subjects: ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'English Comprehension', 'General Awareness'],
        topics_by_subject: {
            'Quantitative Aptitude': [
                'Number System',
                'Simplification',
                'Percentages',
                'Average',
                'Ratio & Proportion',
                'Profit & Loss',
                'Interest',
                'Time & Work',
                'Speed & Distance',
                'Mensuration',
                'Algebra',
                'Trigonometry',
                'Geometry',
                'Data Interpretation'
            ],
            'General Intelligence & Reasoning': [
                'Analogies',
                'Classification',
                'Series',
                'Coding-Decoding',
                'Blood Relations',
                'Direction & Distance',
                'Seating Arrangement',
                'Syllogism',
                'Venn Diagrams'
            ],
            'English Comprehension': [
                'Spotting Errors',
                'Fill in the Blanks',
                'Synonyms/Antonyms',
                'Spellings',
                'Idioms & Phrases',
                'One Word Substitution',
                'Sentence Improvement',
                'Comprehension Passage'
            ],
            'General Awareness': [
                'Current Affairs',
                'Indian Polity',
                'Indian Economy',
                'Geography',
                'History',
                'Science',
                'Sports'
            ]
        },
        question_types: ['mcq', 'numerical', 'reasoning'],
        time_limits: {
            mcq: 45,
            numerical: 60,
            reasoning: 60,
            comprehension: 120
        },
        difficulty_distribution: {
            easy: 35,
            medium: 45,
            hard: 20
        }
    }
};
