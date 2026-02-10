/**
 * Question Generation API Route
 * Main endpoint for generating AI questions with caching and fallback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { generateQuestions, validateQuestion } from '@/lib/ai/question-generator';
import { getCachedQuestions, cacheQuestions } from '@/lib/cache/question-cache';
import type {
    QuestionGenerationRequest,
    QuestionGenerationResponse,
    AIGeneratedQuestion,
    QuestionContent
} from '@/lib/types/questions';

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

const RATE_LIMIT = {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10
};

const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userLimit = requestCounts.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        requestCounts.set(userId, {
            count: 1,
            resetTime: now + RATE_LIMIT.windowMs
        });
        return true;
    }

    if (userLimit.count >= RATE_LIMIT.maxRequests) {
        return false;
    }

    userLimit.count++;
    return true;
}

// ============================================================================
// Fallback Questions (Pre-seeded)
// ============================================================================

async function getFallbackQuestions(
    request: QuestionGenerationRequest
): Promise<AIGeneratedQuestion[]> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('ai_generated_questions')
            .select('*')
            .eq('exam_name', request.exam_name)
            .eq('topic', request.topic)
            .eq('difficulty', request.difficulty)
            .eq('question_type', request.question_type)
            .eq('status', 'approved')
            .limit(request.count);

        if (error || !data || data.length === 0) {
            return [];
        }

        return data as AIGeneratedQuestion[];
    } catch (error) {
        console.error('Fallback questions error:', error);
        return [];
    }
}

// ============================================================================
// Main API Handler
// ============================================================================

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    try {
        // Parse request body
        const body = await req.json() as QuestionGenerationRequest;

        // Validate request
        if (!body.exam_name || !body.subject || !body.topic || !body.difficulty || !body.question_type) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get user session
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Rate limiting
        if (!checkRateLimit(user.id)) {
            return NextResponse.json(
                { success: false, error: 'Rate limit exceeded. Please try again later.' },
                { status: 429 }
            );
        }

        let questions: AIGeneratedQuestion[] = [];
        let source: 'cache' | 'ai' | 'fallback' = 'ai';
        let cached = false;

        // Step 1: Try cache first (if enabled)
        if (body.use_cache !== false) {
            const cachedQuestions = await getCachedQuestions(body);
            if (cachedQuestions && cachedQuestions.length >= body.count) {
                questions = cachedQuestions.slice(0, body.count);
                source = 'cache';
                cached = true;
            }
        }

        // Step 2: Generate with AI if cache miss
        if (questions.length === 0) {
            try {
                const generatedContent = await generateQuestions(body);

                // Validate and store questions
                const validatedQuestions: AIGeneratedQuestion[] = [];

                for (const content of generatedContent) {
                    const validation = validateQuestion(content);

                    if (!validation.valid) {
                        console.warn('Invalid question generated:', validation.issues);
                        continue;
                    }

                    // Store in database
                    const { data: storedQuestion, error: insertError } = await supabase
                        .from('ai_generated_questions')
                        .insert({
                            exam_name: body.exam_name,
                            subject: body.subject,
                            topic: body.topic,
                            question_type: body.question_type,
                            difficulty: body.difficulty,
                            language: body.language,
                            content: content,
                            status: validation.quality_score >= 80 ? 'approved' : 'pending',
                            quality_score: validation.quality_score,
                            created_by: user.id
                        })
                        .select()
                        .single();

                    if (insertError) {
                        console.error('Failed to store question:', insertError);
                        continue;
                    }

                    validatedQuestions.push(storedQuestion as AIGeneratedQuestion);
                }

                questions = validatedQuestions;
                source = 'ai';

                // Cache the generated questions if valid
                if (questions.length > 0) {
                    await cacheQuestions(body, questions.map(q => q.id));
                }

            } catch (aiError) {
                console.error('AI generation failed:', aiError);
                // Fall through to fallback
            }
        }

        // Step 3: Fallback to pre-seeded questions if AI fails
        if (questions.length === 0) {
            questions = await getFallbackQuestions(body);
            source = 'fallback';

            if (questions.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'No questions available for this topic. Please try another topic or contact support.'
                    },
                    { status: 404 }
                );
            }
        }

        // Audit logging
        const generationTime = Date.now() - startTime;

        await supabase
            .from('ai_generation_audit')
            .insert({
                request_params: body,
                user_id: user.id,
                success: true,
                questions_generated: questions.length,
                cache_hit: cached,
                generation_time_ms: generationTime,
                estimated_cost: source === 'ai' ? 0.05 * questions.length : 0 // ₹0.05 per question estimate
            });

        // Return response
        const response: QuestionGenerationResponse = {
            success: true,
            questions,
            metadata: {
                source,
                generation_time_ms: generationTime,
                cached
            }
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Question generation API error:', error);

        // Log failure
        try {
            const supabase = createClient();
            await supabase
                .from('ai_generation_audit')
                .insert({
                    request_params: await req.json(),
                    success: false,
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                    generation_time_ms: Date.now() - startTime
                });
        } catch (logError) {
            console.error('Failed to log error:', logError);
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to generate questions. Please try again.'
            },
            { status: 500 }
        );
    }
}

// ============================================================================
// GET - Check Service Health
// ============================================================================

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Check database connectivity
        const { error } = await supabase
            .from('ai_generated_questions')
            .select('id')
            .limit(1);

        if (error) throw error;

        return NextResponse.json({
            status: 'healthy',
            service: 'Question Generation API',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return NextResponse.json(
            { status: 'unhealthy', error: 'Database connection failed' },
            { status: 503 }
        );
    }
}
