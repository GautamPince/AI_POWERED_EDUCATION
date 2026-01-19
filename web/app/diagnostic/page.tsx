"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle, ShieldCheck } from "lucide-react";

export default function DiagnosticPage() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        exam: "",
        prevScore: "",
        weakness: "",
    });

    const handleNext = () => setStep(step + 1);

    return (
        <div className="min-h-screen bg-trust-50 font-sans flex flex-col">
            {/* Simple Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="font-bold text-trust-900 text-xl flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2 text-trust-800" />
                        EduTrust Diagnostic
                    </Link>
                    <span className="text-sm font-medium text-gray-500">Step {step} of 3</span>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-6 py-12">
                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* Form Section */}
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                        {step === 1 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-trust-900">Which exam are you targeting?</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {["SSC GD Constable", "State PSC (UP/Bihar)", "Banking PO (IBPS)", "Railway NTPC"].map((exam) => (
                                        <button
                                            key={exam}
                                            onClick={() => { setFormData({ ...formData, exam }); handleNext(); }}
                                            className="p-4 rounded-xl border-2 border-gray-100 hover:border-trust-500 hover:bg-trust-50 text-left transition font-semibold text-gray-700"
                                        >
                                            {exam}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-trust-900">Have you taken this exam before?</h2>
                                <p className="text-gray-500">Be honest. This helps us create your plan.</p>
                                <input
                                    type="text"
                                    placeholder="Enter previous score (or 0 if new)"
                                    className="w-full p-4  rounded-xl border-2 border-gray-200 focus:border-trust-500 outline-none text-lg"
                                    onChange={(e) => setFormData({ ...formData, prevScore: e.target.value })}
                                />
                                <button
                                    onClick={handleNext}
                                    className="w-full bg-trust-800 hover:bg-trust-900 text-white py-4 rounded-xl font-bold transition flex items-center justify-center"
                                >
                                    Next Step <ArrowRight className="ml-2 w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-trust-900">What is your biggest weakness?</h2>
                                <div className="grid grid-cols-1 gap-4">
                                    {["Mathematics / Quant", "English Language", "General Knowledge", "Reasoning"].map((weakness) => (
                                        <button
                                            key={weakness}
                                            onClick={() => {
                                                setFormData({ ...formData, weakness });
                                                // MVP: Redirect to plan
                                                window.location.href = "/plan";
                                            }}
                                            className="p-4 rounded-xl border-2 border-gray-100 hover:border-trust-500 hover:bg-trust-50 text-left transition font-semibold text-gray-700"
                                        >
                                            {weakness}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trust Sidebar */}
                    <div className="hidden md:block py-8">
                        <div className="bg-trust-900 text-white p-8 rounded-2xl shadow-lg">
                            <h3 className="text-xl font-bold mb-6">Why take this test?</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-verified mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="opacity-90">AI analyzes your gaps against 10,000+ past papers.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-verified mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="opacity-90">Get a 100% personalized 30-day plan instantly.</span>
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-verified mr-3 flex-shrink-0 mt-0.5" />
                                    <span className="opacity-90">No motivational fluff. Pure outcome strategy.</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
