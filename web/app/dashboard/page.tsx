"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart, BookOpen, User, ShieldCheck, ArrowRight, Bell, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState<any>(null);
    const [diagnosticData, setDiagnosticData] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Check authentication
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push("/login");
                    return;
                }

                // Fetch user profile
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Fetch latest diagnostic
                const { data: diagnostic } = await supabase
                    .from('diagnostics')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                setUserData(profile);
                setDiagnosticData(diagnostic);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-trust-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-trust-800" />
            </div>
        );
    }

    const userName = userData?.full_name || "Student";
    const examTarget = diagnosticData?.exam_target || "Your Exam";
    const weakness = diagnosticData?.weakness || "Not yet assessed";

    return (
        <div className="min-h-screen bg-trust-50 font-sans pb-20">
            <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-trust-900 flex items-center">
                        <ShieldCheck className="w-6 h-6 mr-2 text-trust-800" />
                        EduTrust Board
                    </h1>
                    <Bell className="w-6 h-6 text-gray-500 hover:text-trust-700 cursor-pointer" />
                </div>
            </header>

            <main className="container mx-auto px-6 py-8 max-w-4xl">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-trust-900">Namaste, {userName}! 🙏</h2>
                    <p className="text-gray-600">
                        You are on track for <span className="font-bold text-trust-700">{examTarget}</span>.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Plan Progress</p>
                        <p className="text-2xl font-bold text-trust-900">12%</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Weakness</p>
                        <p className="text-sm font-bold text-orange-600 mt-1">{weakness.split(" /")[0]}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Day Streak</p>
                        <p className="text-2xl font-bold text-orange-500">🔥 1</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-bold">Mentor</p>
                        <p className="text-sm font-bold text-trust-900 mt-1">Active</p>
                    </div>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Link href="/plan" className="bg-gradient-to-br from-trust-900 to-trust-800 text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <span className="bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold uppercase">Resume</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">Today's Study Plan</h3>
                        <p className="text-blue-200 text-sm mb-4">Focus on {weakness}</p>
                        <div className="flex items-center font-bold text-sm text-blue-100 group-hover:text-white">
                            Continue Learning <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                        </div>
                    </Link>

                    <Link href="/mentor" className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:border-trust-300 transition group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <User className="w-8 h-8 text-trust-600" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-trust-900 mb-1">Your Mentor</h3>
                        <p className="text-gray-600 text-sm mb-4">Rajesh Kumar is ready to help.</p>
                        <div className="flex items-center font-bold text-sm text-trust-600 group-hover:text-trust-800">
                            Open Chat <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                        </div>
                    </Link>
                </div>

                {/* Mock Analytics */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-trust-900 mb-4 flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-gray-400" />
                        Performance Analysis
                    </h3>
                    <div className="h-40 flex items-end gap-2 justify-between px-2">
                        {[40, 65, 55, 70, 68, 80, 85].map((h, i) => (
                            <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group">
                                <div
                                    className="absolute bottom-0 w-full bg-trust-500 rounded-t-lg transition-all duration-500 group-hover:bg-trust-600"
                                    style={{ height: `${h}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2 font-medium">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
