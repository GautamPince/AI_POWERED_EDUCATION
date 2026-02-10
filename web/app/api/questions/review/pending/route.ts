/**
 * Mentor Question Review API Routes
 * Endpoints for mentors to review and approve/reject AI-generated questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/questions/review/pending - Get all pending questions for review
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
            return NextResponse.json({ error: 'Forbidden - Mentors only' }, { status: 403 });
        }

        // Get pending questions
        const { data: questions, error } = await supabase
            .from('ai_generated_questions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            questions: questions || [],
            count: questions?.length || 0
        });

    } catch (error) {
        console.error('Failed to fetch pending questions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch questions' },
            { status: 500 }
        );
    }
}
