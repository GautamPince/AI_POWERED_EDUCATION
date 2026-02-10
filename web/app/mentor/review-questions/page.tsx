/**
 * Mentor Review Dashboard
 * Interface for mentors to review and approve AI-generated questions
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import type { AIGeneratedQuestion, MCQQuestion } from '@/lib/types/questions';

export default function MentorReviewPage() {
    const [questions, setQuestions] = useState<AIGeneratedQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState<AIGeneratedQuestion | null>(null);
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPendingQuestions();
    }, []);

    const loadPendingQuestions = async () => {
        try {
            const response = await fetch('/api/questions/review/pending');
            const data = await response.json();

            if (data.success) {
                setQuestions(data.questions);
            }
        } catch (error) {
            console.error('Failed to load questions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (questionId: string, status: 'approved' | 'rejected') => {
        setSubmitting(true);

        try {
            const endpoint = status === 'approved' ? '/api/questions/review/approve' : '/api/questions/review/reject';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question_id: questionId,
                    feedback,
                })
            });

            const data = await response.json();

            if (data.success) {
                // Remove from list
                setQuestions(questions.filter(q => q.id !== questionId));
                setSelectedQuestion(null);
                setFeedback('');
            }
        } catch (error) {
            console.error('Review submission failed:', error);
            alert('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-trust-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-trust-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-trust-50 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/mentor" className="flex items-center text-gray-600 hover:text-trust-900 font-medium">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Mentor Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-trust-800 uppercase tracking-widest">Question Review</span>
                        <span className="bg-trust-800 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {questions.length} Pending
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {questions.length === 0 ? (
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-12 text-center shadow-lg">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
                        <p className="text-gray-600">There are no questions pending review at the moment.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Question List */}
                        <div className="md:col-span-1 space-y-3">
                            <h3 className="font-bold text-gray-900 text-lg mb-4">Pending Questions ({questions.length})</h3>

                            {questions.map((q) => {
                                const content = q.content as MCQQuestion;
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setSelectedQuestion(q)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition ${selectedQuestion?.id === q.id
                                                ? 'border-trust-500 bg-trust-50'
                                                : 'border-gray-200 hover:border-trust-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-trust-600 uppercase">{q.difficulty}</span>
                                            <span className="text-xs text-gray-500">Score: {q.quality_score}</span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{content.question}</p>
                                        <p className="text-xs text-gray-500 mt-2">{q.topic}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Question Preview */}
                        <div className="md:col-span-2">
                            {selectedQuestion ? (
                                <div className="bg-white rounded-2xl p-8 shadow-lg">
                                    {/* Metadata */}
                                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Question Review</h2>
                                            <div className="flex gap-3 text-sm">
                                                <span className="bg-trust-100 text-trust-800 px-3 py-1 rounded-full font-medium">
                                                    {selectedQuestion.exam_name}
                                                </span>
                                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                                                    {selectedQuestion.topic}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${selectedQuestion.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                                    selectedQuestion.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                }`}>
                                                {selectedQuestion.difficulty.toUpperCase()}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-2">Quality Score: {selectedQuestion.quality_score}%</p>
                                        </div>
                                    </div>

                                    {/* Question Content */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 leading-relaxed">
                                            {(selectedQuestion.content as MCQQuestion).question}
                                        </h3>

                                        {/* Options */}
                                        <div className="space-y-3">
                                            {(selectedQuestion.content as MCQQuestion).options.map((option, index) => {
                                                const isCorrect = index === (selectedQuestion.content as MCQQuestion).correct_answer_index;
                                                return (
                                                    <div
                                                        key={index}
                                                        className={`p-4 rounded-lg border-2 ${isCorrect
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-medium">{option}</span>
                                                            {isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Explanation */}
                                        {(selectedQuestion.content as MCQQuestion).explanation && (
                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                                                <p className="text-sm text-blue-800">
                                                    {(selectedQuestion.content as MCQQuestion).explanation}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Feedback Input */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Feedback (Optional)
                                        </label>
                                        <textarea
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder="Add any comments or suggestions..."
                                            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-trust-500 outline-none resize-none"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleReview(selectedQuestion.id, 'approved')}
                                            disabled={submitting}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center disabled:opacity-50"
                                        >
                                            <CheckCircle className="w-5 h-5 mr-2" />
                                            {submitting ? 'Processing...' : 'Approve Question'}
                                        </button>
                                        <button
                                            onClick={() => handleReview(selectedQuestion.id, 'rejected')}
                                            disabled={submitting}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center disabled:opacity-50"
                                        >
                                            <XCircle className="w-5 h-5 mr-2" />
                                            {submitting ? 'Processing...' : 'Reject Question'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                                    <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Select a question from the list to review</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
