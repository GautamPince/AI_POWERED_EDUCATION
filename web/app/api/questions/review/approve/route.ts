/**
 * Question Review Approval API
 * Endpoint for mentors to approve questions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
    try {
        const supabase = createClient();
        const { question_id, feedback, suggested_changes } = await req.json();

        // Verify mentor authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Approve the question
        const { error: updateError } = await supabase
            .from('ai_generated_questions')
            .update({
                status: 'approved',
                reviewed_by: user.id,
                reviewed_at: new Date().toISOString()
            })
            .eq('id', question_id);

        if (updateError) throw updateError;

        // Record the review
        await supabase
            .from('mentor_question_reviews')
            .insert({
                question_id,
                mentor_id: user.id,
                status: 'approved',
                feedback,
                suggested_changes
            });

        return NextResponse.json({ success: true, message: 'Question approved' });

    } catch (error) {
        console.error('Approval error:', error);
        return NextResponse.json({ error: 'Failed to approve question' }, { status: 500 });
    }
}
