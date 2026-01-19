import Link from "next/link";
import TrustTicker from "@/components/TrustTicker";
import { ShieldCheck, CheckCircle, GraduationCap, ArrowRight, PlayCircle, Building2, Briefcase, Landmark } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* Top Trust Bar */}
      <div className="bg-trust-900 text-white text-xs py-2">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="flex items-center"><ShieldCheck className="w-3 h-3 text-verified mr-1" /> Govt. Registered</span>
            <span className="flex items-center"><CheckCircle className="w-3 h-3 text-verified mr-1" /> ISO 9001 Certified</span>
          </div>
          <div className="flex items-center space-x-4 opacity-90">
            <span>Support: +91 98765-43210</span>
            <span>हिंदी / தமிழ் / తెలుగు</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-trust-800 rounded-lg flex items-center justify-center text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-trust-900 leading-none">EduTrust India</h1>
              <p className="text-[10px] text-trust-500 font-semibold tracking-wider uppercase">Vetted by Experts</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-trust-700 font-medium hover:bg-trust-50 px-4 py-2 rounded-lg transition">Log in</button>
            <Link href="/diagnostic" className="bg-trust-800 hover:bg-trust-900 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg shadow-trust-900/20 transition flex items-center">
              Start Free Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Placement Ticker (CSS Animation can be added later, static for now) */}
      {/* Dynamic Social Proof Ticker */}
      <TrustTicker />

      {/* Hero Section */}
      <main className="flex-grow bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-trust-50/50"></div>
        <div className="container mx-auto px-6 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center bg-blue-100 text-trust-800 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-200">
                <span className="w-2 h-2 bg-verified rounded-full mr-2 animate-pulse"></span>
                Trusted by 10,000+ Indian Families
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-trust-900 leading-tight">
                Don&apos;t Just Learn. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-trust-700 to-trust-500">Get Career Verified.</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                The only platform where every mentor is vetted, every course leads to a job outcome, and your certificate actually means something.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/diagnostic" className="bg-trust-800 hover:bg-trust-900 text-white text-lg px-8 py-4 rounded-xl font-semibold shadow-xl shadow-trust-900/20 transition flex items-center justify-center">
                  Check Eligibility
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <div className="cursor-not-allowed opacity-75 bg-white border-2 border-gray-200 text-gray-700 text-lg px-8 py-4 rounded-xl font-semibold transition flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-trust-600 mr-2" />
                  How it Works
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4 font-medium">Hiring Partners & Certifiers</p>
                <div className="flex gap-6 opacity-60 grayscale hover:grayscale-0 transition duration-500">
                  <div className="font-bold text-xl text-gray-800 flex items-center"><Building2 className="mr-2" /> TATA Strive</div>
                  <div className="font-bold text-xl text-gray-800 flex items-center"><Briefcase className="mr-2" /> Infosys</div>
                  <div className="font-bold text-xl text-gray-800 flex items-center"><Landmark className="mr-2" /> SBI PO</div>
                </div>
              </div>
            </div>

            {/* Right Visual - Shield Card */}
            <div className="relative hidden md:block">
              <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 divide-y divide-gray-100">
                <div className="p-6 bg-gradient-to-br from-trust-900 to-trust-800 rounded-xl text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-blue-200 text-sm font-medium">Career Path</p>
                      <h3 className="text-2xl font-bold">Data Entry Specialist</h3>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                      <ShieldCheck className="w-8 h-8 text-verified" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-100">
                    <span className="bg-verified/20 text-verified px-2 py-0.5 rounded text-xs font-bold border border-verified/30">VERIFIED DEMAND</span>
                    <span>• 450+ Jobs Open Now</span>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Avg. Salary</p>
                    <p className="text-xl font-bold text-trust-900">₹18,000<span className="text-sm font-normal text-gray-500">/mo</span></p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide font-semibold mb-1">Time to Job</p>
                    <p className="text-xl font-bold text-trust-900">3 Months</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white p-4 rounded-xl shadow-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-verified">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Placement Rate</p>
                    <p className="text-lg font-bold text-gray-900">92% Success</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
