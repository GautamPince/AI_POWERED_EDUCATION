"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up Logic
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                        },
                    },
                });
                if (error) throw error;
                alert("Account created! Please check your email to verify (or login if auto-confirm is on).");
                if (data.session) router.push("/dashboard");
            } else {
                // Sign In Logic
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-trust-50 flex flex-col justify-center items-center p-4">

            {/* Brand Header */}
            <div className="mb-8 text-center">
                <Link href="/" className="inline-flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-trust-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                </Link>
                <h1 className="text-3xl font-bold text-trust-900">EduTrust India</h1>
                <p className="text-trust-500 font-medium">Career Verified. Future Secured.</p>
            </div>

            {/* Auth Card */}
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex mb-6 bg-gray-100 p-1 rounded-lg">
                    <button
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition ${!isSignUp ? 'bg-white text-trust-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setIsSignUp(false)}
                    >
                        Log In
                    </button>
                    <button
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition ${isSignUp ? 'bg-white text-trust-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setIsSignUp(true)}
                    >
                        Create Account
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                                placeholder="Ex. Rahul Kumar"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                            placeholder="rahul@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-trust-500 focus:ring-2 focus:ring-trust-200 outline-none transition"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-trust-800 hover:bg-trust-900 text-white py-3 rounded-xl font-bold transition flex items-center justify-center shadow-lg shadow-trust-900/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {isSignUp ? "Create Secure Account" : "Access Dashboard"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        On clicking submit, you agree to our <span className="underline">Terms of Service</span>.
                        <br />Your data is protected by ISO 27001 standards.
                    </p>
                </div>
            </div>
        </div>
    );
}
