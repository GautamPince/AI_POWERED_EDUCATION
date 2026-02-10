/**
 * Question Rejection API
 * Endpoint for mentors to reject questions
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

        // Reject the question
        const { error: updateError } = await supabase
            .from('ai_generated_questions')
            .update({
                status: 'rejected',
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
                status: 'rejected',
                feedback,
                suggested_changes
            });

        return NextResponse.json({ success: true, message: 'Question rejected' });

    } catch (error) {
        console.error('Rejection error:', error);
        return NextResponse.json({ error: 'Failed to reject question' }, { status: 500 });
    }
}
