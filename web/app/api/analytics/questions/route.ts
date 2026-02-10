/**
 * Question Analytics API
 * Returns performance and cost metrics for the AI generation system
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Verify mentor authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is a mentor
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (userData?.role !== 'mentor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Get Overall Stats
        const { data: totalQuestions } = await supabase
            .from('ai_generated_questions')
            .select('count', { count: 'exact', head: true });

        const { data: approvedQuestions } = await supabase
            .from('ai_generated_questions')
            .select('count', { count: 'exact', head: true })
            .eq('status', 'approved');

        // 2. Get Audit Stats (Savings & Usage)
        const { data: auditLogs } = await supabase
            .from('ai_generation_audit')
            .select('cache_hit, estimated_cost, questions_generated');

        const totalHits = auditLogs?.filter((l: any) => l.cache_hit).length || 0;
        const cacheHitRate = auditLogs?.length ? (totalHits / auditLogs.length) * 100 : 0;

        // Calculate estimated savings (Assuming cache hits save ₹1 per question)
        const estimatedSavings = auditLogs?.reduce((acc: number, log: any) => {
            return log.cache_hit ? acc + (log.questions_generated || 0.5) : acc;
        }, 0) || 0;

        // 3. Get Topic Performance
        // NOTE: In production, this would be a complex view or aggregated in lib/supabase
        const { data: perfData } = await supabase
            .from('ai_generated_questions')
            .select('topic, times_used, times_correct, avg_time_taken')
            .eq('status', 'approved')
            .order('times_used', { ascending: false })
            .limit(10);

        return NextResponse.json({
            summary: {
                total: totalQuestions?.[0]?.count || 0,
                approved: approvedQuestions?.[0]?.count || 0,
                savings: estimatedSavings,
                cacheHitRate: Math.round(cacheHitRate)
            },
            performance: perfData || [],
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
