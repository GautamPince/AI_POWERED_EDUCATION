/**
 * AI Question Component
 * Displays and handles AI-generated questions with answer validation
 */

'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import type { AIGeneratedQuestion, MCQQuestion, UserQuestionAttempt } from '@/lib/types/questions';
import { supabase } from '@/lib/supabase';

interface AIQuestionProps {
    question: AIGeneratedQuestion;
    onAnswer: (questionId: string, isCorrect: boolean, timeTaken: number) => void;
    showFeedback?: boolean;
}

export default function AIQuestion({ question, onAnswer, showFeedback = true }: AIQuestionProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [startTime] = useState(Date.now());
    const [timeTaken, setTimeTaken] = useState(0);

    const content = question.content as MCQQuestion;

    const handleAnswer = async (answerIndex: number) => {
        if (answered) return;

        setSelectedAnswer(answerIndex);
        setAnswered(true);

        const timeSpent = (Date.now() - startTime) / 1000; // Convert to seconds
        setTimeTaken(timeSpent);

        const isCorrect = answerIndex === content.correct_answer_index;

        // Record attempt in database
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                await supabase
                    .from('user_question_attempts')
                    .insert({
                        user_id: user.id,
                        question_id: question.id,
                        selected_answer_index: answerIndex,
                        is_correct: isCorrect,
                        time_taken: timeSpent
                    });
            }
        } catch (error) {
            console.error('Failed to record answer:', error);
        }

        onAnswer(question.id, isCorrect, timeSpent);
    };

    return (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition">
            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-trust-600 uppercase tracking-wider bg-trust-50 px-3 py-1 rounded-full">
                    {question.difficulty}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {timeTaken > 0 ? `${Math.round(timeTaken)}s` : 'In Progress'}
                </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
                {content.question}
            </h3>

            {/* Options */}
            <div className="space-y-3">
                {content.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === content.correct_answer_index;
                    const showCorrect = answered && showFeedback && isCorrect;
                    const showWrong = answered && showFeedback && isSelected && !isCorrect;

                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(index)}
                            disabled={answered}
                            className={`
                w-full p-4 rounded-lg border-2 text-left transition font-medium
                ${!answered ? 'hover:border-trust-500 hover:bg-trust-50 border-gray-200' : ''}
                ${showCorrect ? 'border-green-500 bg-green-50 text-green-900' : ''}
                ${showWrong ? 'border-red-500 bg-red-50 text-red-900' : ''}
                ${answered && !showCorrect && !showWrong ? 'opacity-60 border-gray-200' : ''}
                ${isSelected && !answered ? 'border-trust-500 bg-trust-50' : ''}
                disabled:cursor-not-allowed
              `}
                        >
                            <div className="flex items-center justify-between">
                                <span>{option}</span>
                                {showCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                {showWrong && <XCircle className="w-5 h-5 text-red-600" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Explanation (after answering) */}
            {answered && showFeedback && content.explanation && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Explanation:</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{content.explanation}</p>
                </div>
            )}

            {/* Topic Tag */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                    Topic: <span className="font-medium">{question.topic}</span>
                </span>
            </div>
        </div>
    );
}

/**
 * Question Loader Component
 * Fetches and displays AI-generated questions
 */

interface QuestionLoaderProps {
    examName: string;
    subject: string;
    topic: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    count?: number;
    onComplete?: (totalCorrect: number, totalQuestions: number) => void;
}

export function QuestionLoader({
    examName,
    subject,
    topic,
    difficulty = 'medium',
    count = 5,
    onComplete
}: QuestionLoaderProps) {
    const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<string, boolean>>(new Map());
    const [selectedLanguage, setSelectedLanguage] = useState<'english' | 'hindi'>('english');

    useEffect(() => {
        loadQuestions();
    }, [examName, subject, topic, selectedLanguage]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/questions/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam_name: examName,
                    subject,
                    topic,
                    difficulty,
                    question_type: 'mcq',
                    language: selectedLanguage,
                    count,
                    use_cache: true
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to load questions');
            }

            setQuestions(data.questions);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load questions');
            console.error('Question loading error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: string, isCorrect: boolean, timeTaken: number) => {
        setAnswers(new Map(answers.set(questionId, isCorrect)));

        // Auto-advance to next question after 2 seconds
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                // All questions completed
                const correctCount = Array.from(answers.values()).filter(Boolean).length + (isCorrect ? 1 : 0);
                onComplete?.(correctCount, questions.length);
            }
        }, 2000);
    };

    const renderHeader = () => (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-xl font-bold text-gray-900">{topic} Practice</h2>
                <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{examName}</p>
            </div>
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button
                    onClick={() => setSelectedLanguage('english')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${selectedLanguage === 'english' ? 'bg-white text-trust-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    ENGLISH
                </button>
                <button
                    onClick={() => setSelectedLanguage('hindi')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition ${selectedLanguage === 'hindi' ? 'bg-white text-trust-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    हिन्दी
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-trust-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Generating questions in {selectedLanguage}...</p>
                <p className="text-sm text-gray-500 mt-2">Personalizing for {examName}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-900 font-semibold mb-2">Failed to load questions</p>
                <p className="text-red-700 text-sm mb-4">{error}</p>
                <button
                    onClick={loadQuestions}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-yellow-900 font-semibold">No questions available for this topic</p>
                <p className="text-yellow-700 text-sm mt-2">Please select a different topic or contact support</p>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-3xl mx-auto">
            {renderHeader()}

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    <span>Question {currentIndex + 1} of {questions.length}</span>
                    <span>{Math.round(progress)}% Progress</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-trust-600 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Current Question */}
            <AIQuestion
                key={currentQuestion.id}
                question={currentQuestion}
                onAnswer={handleAnswer}
                showFeedback={true}
            />

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
                <button
                    onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    className="text-gray-400 hover:text-trust-700 font-bold text-xs uppercase tracking-widest disabled:opacity-0 transition"
                >
                    ← Previous
                </button>
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Powered by EduTrust AI ✨</span>
            </div>
        </div>
    );
}
