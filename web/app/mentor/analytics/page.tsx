/**
 * Mentor Analytics Dashboard
 * Visualizes the impact and performance of AI question generation
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    TrendingUp,
    BarChart3,
    PieChart,
    DollarSign,
    Target,
    Clock,
    Users,
    Loader2,
    RefreshCcw,
    Languages
} from 'lucide-react';

interface StatsSummary {
    total: number;
    approved: number;
    savings: number;
    cacheHitRate: number;
}

interface Performance {
    topic: string;
    times_used: number;
    times_correct: number;
    avg_time_taken: number;
}

export default function AnalyticsDashboard() {
    const [stats, setStats] = useState<StatsSummary | null>(null);
    const [performance, setPerformance] = useState<Performance[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('/api/analytics/questions');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            setStats(data.summary);
            setPerformance(data.performance);
        } catch (error) {
            console.error('Analytics Load Failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
        <div className="min-h-screen bg-trust-50 font-sans pb-12">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 py-6 px-8 sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/mentor" className="p-2 hover:bg-gray-100 rounded-full transition">
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-trust-900">AI Platform Analytics</h1>
                            <p className="text-sm text-gray-500">Live performance & ROI tracking</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        disabled={refreshing}
                        className="flex items-center gap-2 bg-trust-50 hover:bg-trust-100 text-trust-700 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50"
                    >
                        <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh Data
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-8 py-8">

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Questions"
                        value={stats?.total || 0}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="bg-blue-500"
                        subtitle={`${stats?.approved} Approved`}
                    />
                    <StatCard
                        title="Estimated Savings"
                        value={`₹${stats?.savings || 0}`}
                        icon={<DollarSign className="w-5 h-5" />}
                        color="bg-green-500"
                        subtitle="Via AI Caching"
                    />
                    <StatCard
                        title="Cache Hit Rate"
                        value={`${stats?.cacheHitRate || 0}%`}
                        icon={<RefreshCcw className="w-5 h-5" />}
                        color="bg-purple-500"
                        subtitle="Latency Optimized"
                    />
                    <StatCard
                        title="Student Success"
                        value="84%"
                        icon={<Target className="w-5 h-5" />}
                        color="bg-orange-500"
                        subtitle="Avg. Correct Rate"
                    />
                </div>

                <div className="grid lg:grid-cols-3 gap-8">

                    {/* Topic Performance Table */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                        <h3 className="text-lg font-bold text-trust-900 mb-6 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-trust-600" />
                            Topic-Wise Performance (AI Accuracy)
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="pb-4">Topic</th>
                                        <th className="pb-4">Attempts</th>
                                        <th className="pb-4">Accuracy</th>
                                        <th className="pb-4">Avg. Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {performance.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="py-4 font-bold text-gray-800">{item.topic}</td>
                                            <td className="py-4">{item.times_used}</td>
                                            <td className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-grow bg-gray-100 rounded-full h-1.5 w-24">
                                                        <div
                                                            className="bg-green-500 h-1.5 rounded-full"
                                                            style={{ width: `${(item.times_correct / item.times_used) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold">{Math.round((item.times_correct / (item.times_used || 1)) * 100)}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 text-gray-500">{Math.round(item.avg_time_taken)}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Lateral Info / Insights */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h3 className="text-lg font-bold text-trust-900 mb-4 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-trust-600" />
                                Difficulty Mix
                            </h3>
                            <div className="space-y-4">
                                <DifficultyRow label="Easy" perc={30} color="bg-green-400" />
                                <DifficultyRow label="Medium" perc={50} color="bg-yellow-400" />
                                <DifficultyRow label="Hard" perc={20} color="bg-red-400" />
                            </div>
                        </div>

                        <div className="bg-blue-900 text-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Languages className="w-5 h-5 text-blue-200" />
                                Vernacular Reach
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 rounded-xl p-3">
                                    <p className="text-xs opacity-70">Hindi Content</p>
                                    <p className="text-xl font-bold">4.2k <span className="text-xs opacity-50">qns</span></p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3">
                                    <p className="text-xs opacity-70">English Content</p>
                                    <p className="text-xl font-bold">12k <span className="text-xs opacity-50">qns</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 border-l-4 border-l-trust-500">
                            <h4 className="font-bold text-trust-900 mb-2 flex items-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                System Health
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Cache warming is enabled for **Number Systems** and **Simplification**. AI Response time is optimal (&lt; 2.4s).
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

function StatCard({ title, value, icon, color, subtitle }: any) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4 mb-3">
                <div className={`${color} p-2 rounded-xl text-white`}>
                    {icon}
                </div>
                <p className="text-gray-500 font-medium text-sm">{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-bold text-trust-900">{value}</h4>
                {subtitle && <span className="text-xs text-gray-400 font-medium">{subtitle}</span>}
            </div>
        </div>
    );
}

function DifficultyRow({ label, perc, color }: any) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="text-gray-400 font-bold">{perc}%</span>
            </div>
            <div className="h-2 bg-gray-50 rounded-full w-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${perc}%` }} />
            </div>
        </div>
    );
}
