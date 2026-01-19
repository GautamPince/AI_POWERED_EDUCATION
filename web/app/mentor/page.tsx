"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, Calendar, ShieldAlert, Award, ShieldCheck } from "lucide-react";

export default function MentorPage() {
    return (
        <div className="min-h-screen bg-trust-50 font-sans pb-20">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/plan" className="flex items-center text-gray-600 hover:text-trust-900 font-medium">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-trust-800 uppercase tracking-widest hidden sm:inline-block">Mentor Support</span>
                        <ShieldCheck className="w-5 h-5 text-verified" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-2xl">

                {/* Mentor Profile Card */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-3xl">👨🏽‍🏫</div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-trust-900">Rajesh Kumar</h1>
                                <span className="bg-verified/10 text-verified px-2 py-0.5 rounded text-xs font-bold border border-verified/20 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                                </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">Ex-SBI PO • 5 Years Experience • Hindi/English</p>
                            <div className="flex gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center text-trust-700"><Award className="w-4 h-4 mr-1" /> Top Rated</span>
                                <span>•</span>
                                <span>45 Active Students</span>
                            </div>
                        </div>
                    </div>

                    <hr className="my-6 border-gray-100" />

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/20 transition">
                            <MessageCircle className="w-5 h-5" />
                            Chat on WhatsApp
                        </button>
                        <button className="flex items-center justify-center gap-2 bg-trust-50 hover:bg-trust-100 text-trust-800 py-3 rounded-xl font-bold transition">
                            <Calendar className="w-5 h-5" />
                            Book Video Call
                        </button>
                    </div>
                </div>

                {/* Safety & Rules (Trust Layer) */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                    <h3 className="font-bold text-trust-900 mb-3 flex items-center">
                        <ShieldAlert className="w-5 h-5 mr-2 text-trust-600" />
                        Mentor Guidelines
                    </h3>
                    <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                        <li>Mentors will <span className="font-bold">never</span> ask for extra money.</li>
                        <li>All sessions are recorded for quality assurance.</li>
                        <li>Report any misconduct immediately.</li>
                    </ul>
                </div>

                {/* Session History (Mock) */}
                <h3 className="text-lg font-bold text-trust-900 mb-4">Recent Sessions</h3>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center opacity-75">
                        <div>
                            <h4 className="font-bold text-gray-800">Weekly Goal Setting</h4>
                            <p className="text-xs text-gray-500">Jan 15 • 15 mins</p>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">Completed</span>
                    </div>
                </div>

            </main>
        </div>
    );
}
