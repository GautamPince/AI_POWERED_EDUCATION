"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Download, ShieldCheck, Video, WifiOff } from "lucide-react";

export default function ContentPage() {
    const [lowBandwidth, setLowBandwidth] = useState(false);

    return (
        <div className="min-h-screen bg-trust-50 font-sans pb-20">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/plan" className="flex items-center text-gray-600 hover:text-trust-900 font-medium">
                        <ArrowLeft className="w-5 h-5 mr-1" /> Back to Plan
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-trust-800 uppercase tracking-widest hidden sm:inline-block">Module 1: Number Systems</span>
                        <ShieldCheck className="w-5 h-5 text-verified" />
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-4xl">

                {/* Topic Title */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-trust-900 mb-2">Basic Numeracy: HCF & LCM</h1>
                    <p className="text-gray-600">Essential concept for SSC-GD exams. 2-3 questions guaranteed.</p>
                </div>

                {/* Bandwidth Toggle */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => setLowBandwidth(!lowBandwidth)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${lowBandwidth ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                        <WifiOff className="w-4 h-4" />
                        {lowBandwidth ? 'Low Bandwidth Active' : 'Enable Data Saver'}
                    </button>
                </div>

                {/* Video Player */}
                <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl mb-8 relative group">
                    {lowBandwidth ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
                            <WifiOff className="w-12 h-12 mb-4 text-gray-500" />
                            <h3 className="text-xl font-bold">Data Saver Mode</h3>
                            <p className="text-gray-400 mb-6">Video is disabled to save your pack.</p>
                            <button className="bg-trust-700 hover:bg-trust-600 text-white px-6 py-3 rounded-xl font-bold">
                                Read Transcript Instead
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center relative">
                            {/* Mock Video UI */}
                            <div className="text-white text-center">
                                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="font-medium">Video Player Placeholder</p>
                                <p className="text-sm text-gray-400">(YouTube Embed would go here)</p>
                            </div>
                            <button className="absolute inset-0 w-full h-full flex items-center justify-center group-hover:bg-black/30 transition">
                                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Resources Section */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-trust-300 transition cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">PDF Note</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-trust-700 transition">Cheat Sheet: HCF Formulas</h3>
                        <p className="text-sm text-gray-500 mt-1">Quick revision guide for last minute prep.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-trust-300 transition cursor-pointer group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                <Download className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase">Download</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-trust-700 transition">Previous Year Questions</h3>
                        <p className="text-sm text-gray-500 mt-1">2018-2023 Solved Papers for this topic.</p>
                    </div>
                </div>

            </main>
        </div>
    );
}
