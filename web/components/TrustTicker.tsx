"use client";

import { useEffect, useState } from "react";

const RECENT_OUTCOMES = [
    "✨ Rajan K. (Bhopal) joined HDFC Bank",
    "✨ Priya S. (Madurai) placed at TCS iON",
    "✨ Amit V. (Kanpur) verified Electrician",
    "✨ Sneha R. (Pune) cleared SBI PO Prelims",
    "✨ Arjun M. (Chennai) joined Infosys",
    "✨ Fatima Z. (Hyderabad) started as Data Analyst",
];

export default function TrustTicker() {
    const [offset, setOffset] = useState(0);

    // Simple CSS animation simulation via offset
    // In production, we'd use CSS animations (@keyframes) defined in globals.css
    // For MVP, we render a static list that "feels" live or rely on the CSS marquee if implemented.

    return (
        <div className="bg-trust-900 text-white/90 text-sm py-2 overflow-hidden whitespace-nowrap border-b border-trust-800 relative">
            <div className="animate-marquee inline-block">
                {RECENT_OUTCOMES.map((outcome, i) => (
                    <span key={i} className="mx-8">
                        {outcome.split(" joined ").map((part, index) => (
                            index === 0 ? <span key={index} className="text-yellow-400 font-bold">{part}</span> : <span key={index} className="font-bold"> joined {part}</span>
                        ))}
                    </span>
                ))}
                {/* Duplicate for seamless loop */}
                {RECENT_OUTCOMES.map((outcome, i) => (
                    <span key={`dup-${i}`} className="mx-8">
                        {outcome.split(" joined ").map((part, index) => (
                            index === 0 ? <span key={index} className="text-yellow-400 font-bold">{part}</span> : <span key={index} className="font-bold"> joined {part}</span>
                        ))}
                    </span>
                ))}
            </div>
        </div>
    );
}
