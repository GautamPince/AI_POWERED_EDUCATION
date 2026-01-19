"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, BookOpen, ChevronRight, ShieldCheck, BrainCircuit } from "lucide-react";
import Link from "next/link";

export default function PlanPage() {
    const [loading, setLoading] = useState(true);

    // Simulate AI "Thinking"
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000); // 3s delay for perceived value
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-trust-50 flex flex-col items-center justify-center p-6 text-center">
                <BrainCircuit className="w-16 h-16 text-trust-500 animate-pulse mb-6" />
                <h2 className="text-2xl font-bold text-trust-900 mb-2">Analyzing your profile...</h2>
                <p className="text-gray-600">Comparing your score against 50,000+ past successful candidates.</p>
                <div className="mt-8 w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-trust-500 animate-progress"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20">
            {/* Header */}
            <header className="bg-trust-900 text-white py-6 px-6 shadow-lg sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold flex items-center">
                            <ShieldCheck className="w-5 h-5 mr-2 text-verified" />
                            Your Personal Success Plan
                        </h1>
                        <p className="text-xs text-blue-200 mt-1">AI Confidence Score: <span className="font-bold text-white">94%</span></p>
                    </div>
                    <Link href="/dashboard" className="text-sm hover:text-blue-200">Exit</Link>
                </div>
            </header>

            {/* Summary Card */}
            <div className="container mx-auto px-6 mt-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-bold text-trust-900 mb-4">Diagnostic Result</h2>
                    <div className="flex gap-4 items-center mb-4">
                        <div className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-bold">Weakness: Mathematics</div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">Strength: Reasoning</div>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Based on your diagnostic, you need <span className="font-bold text-gray-900">45 hours</span> of focused practice on Basic Numeracy to clear the cutoff.
                    </p>
                </div>
            </div>

            {/* The Plan Timeline */}
            <div className="container mx-auto px-6 mt-8 space-y-6">
                <h3 className="text-xl font-bold text-trust-900">Week 1 Schedule</h3>

                {/* Day 1 */}
                <div className="bg-white border-l-4 border-trust-500 pl-4 py-4 pr-4 rounded-r-xl shadow-sm relative">
                    <div className="absolute -left-2.5 top-6 w-5 h-5 bg-trust-500 rounded-full border-4 border-white"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Day 1: Number Systems</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 2 Hours</span>
                                <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> 2 Videos</span>
                            </div>
                        </div>
                        <Link href="/content" className="bg-trust-800 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-trust-900/10 hover:bg-trust-900 transition">Start</Link>
                    </div>
                </div>

                {/* Day 2 */}
                <div className="bg-white border-l-4 border-gray-200 pl-4 py-4 pr-4 rounded-r-xl shadow-sm relative opacity-75">
                    <div className="absolute -left-2.5 top-6 w-5 h-5 bg-gray-200 rounded-full border-4 border-white"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Day 2: HCF & LCM</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 1.5 Hours</span>
                                <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> 1 PDF + Quiz</span>
                            </div>
                        </div>
                        <CheckCircle className="text-gray-300 w-6 h-6" />
                    </div>
                </div>

                {/* Day 3 */}
                <div className="bg-white border-l-4 border-gray-200 pl-4 py-4 pr-4 rounded-r-xl shadow-sm relative opacity-75">
                    <div className="absolute -left-2.5 top-6 w-5 h-5 bg-gray-200 rounded-full border-4 border-white"></div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Day 3: Revision + Mock</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 3 Hours</span>
                                <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Practice Set</span>
                            </div>
                        </div>
                        <CheckCircle className="text-gray-300 w-6 h-6" />
                    </div>
                </div>

                <div className="text-center pt-4">
                    <button className="text-trust-600 font-semibold flex items-center justify-center mx-auto hover:underline">
                        View Full 30-Day Roadmap <ChevronRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
}
