"use client";

type EventName =
    | "page_view"
    | "diagnostic_start"
    | "diagnostic_complete"
    | "plan_generated"
    | "content_accessed"
    | "mentor_chat_click";

export const trackEvent = (name: EventName, data: Record<string, any> = {}) => {
    // In a real app, this would send data to Google Analytics, Mixpanel, or PostHog.
    // For MVP/First Cohort, we log to console to verify the data shape.
    const eventPayload = {
        event: name,
        timestamp: new Date().toISOString(),
        ...data,
    };

    if (process.env.NODE_ENV === "development") {
        console.log("📊 [Analytics]:", name, data);
    }

    // TODO: Replace with real analytics SDK
    // window.gtag('event', name, data);
};
