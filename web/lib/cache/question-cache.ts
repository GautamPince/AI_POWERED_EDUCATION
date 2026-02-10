/**
 * Question Cache Service
 * Implements intelligent caching to reduce AI API costs
 */

import { createClient } from '@/lib/supabase';
import type { QuestionGenerationRequest, AIGeneratedQuestion } from '../types/questions';
import crypto from 'crypto';

// ============================================================================
// Cache Configuration
// ============================================================================

const CACHE_TTL_HOURS = {
    easy: 24 * 7,    // 7 days for easy questions (more reusable)
    medium: 24 * 3,  // 3 days for medium questions
    hard: 24 * 1     // 1 day for hard questions (more unique)
};

// ============================================================================
// Cache Key Generation
// ============================================================================

export function generateCacheKey(request: QuestionGenerationRequest): string {
    const keyString = `${request.exam_name}|${request.subject}|${request.topic}|${request.difficulty}|${request.question_type}|${request.language}|${request.count}`;
    return crypto.createHash('md5').update(keyString).digest('hex');
}

// ============================================================================
// Cache Operations
// ============================================================================

export async function getCachedQuestions(
    request: QuestionGenerationRequest
): Promise<AIGeneratedQuestion[] | null> {
    try {
        const supabase = createClient();
        const cacheKey = generateCacheKey(request);

        // Check if cache entry exists and is not expired
        const { data: cacheEntry, error: cacheError } = await supabase
            .from('question_generation_cache')
            .select('question_ids, expires_at')
            .eq('cache_key', cacheKey)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (cacheError || !cacheEntry) {
            return null;
        }

        // Increment hit count
        await supabase
            .from('question_generation_cache')
            .update({ hit_count: supabase.rpc('increment', { row_id: cacheKey }) })
            .eq('cache_key', cacheKey);

        // Fetch actual questions
        const { data: questions, error: questionsError } = await supabase
            .from('ai_generated_questions')
            .select('*')
            .in('id', cacheEntry.question_ids)
            .eq('status', 'approved');

        if (questionsError || !questions || questions.length === 0) {
            return null;
        }

        return questions as AIGeneratedQuestion[];

    } catch (error) {
        console.error('Cache retrieval error:', error);
        return null;
    }
}

export async function cacheQuestions(
    request: QuestionGenerationRequest,
    questionIds: string[]
): Promise<void> {
    try {
        const supabase = createClient();
        const cacheKey = generateCacheKey(request);
        const ttlHours = CACHE_TTL_HOURS[request.difficulty];
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + ttlHours);

        await supabase
            .from('question_generation_cache')
            .upsert({
                cache_key: cacheKey,
                question_ids: questionIds,
                expires_at: expiresAt.toISOString(),
                request_params: request,
                hit_count: 0
            }, {
                onConflict: 'cache_key'
            });

    } catch (error) {
        console.error('Cache storage error:', error);
        // Non-blocking - don't throw
    }
}

// ============================================================================
// Cache Management
// ============================================================================

export async function cleanupExpiredCache(): Promise<number> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('question_generation_cache')
            .delete()
            .lt('expires_at', new Date().toISOString())
            .select();

        if (error) throw error;

        return data?.length || 0;
    } catch (error) {
        console.error('Cache cleanup error:', error);
        return 0;
    }
}

export async function getCacheStatistics(): Promise<{
    total_entries: number;
    total_hits: number;
    avg_hits_per_entry: number;
    cache_size_mb: number;
}> {
    try {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('question_generation_cache')
            .select('hit_count');

        if (error) throw error;

        const totalEntries = data?.length || 0;
        const totalHits = data?.reduce((sum, entry) => sum + (entry.hit_count || 0), 0) || 0;
        const avgHits = totalEntries > 0 ? totalHits / totalEntries : 0;

        return {
            total_entries: totalEntries,
            total_hits: totalHits,
            avg_hits_per_entry: Math.round(avgHits * 100) / 100,
            cache_size_mb: 0 // Can be calculated from actual data size if needed
        };
    } catch (error) {
        console.error('Cache statistics error:', error);
        return {
            total_entries: 0,
            total_hits: 0,
            avg_hits_per_entry: 0,
            cache_size_mb: 0
        };
    }
}

// ============================================================================
// Intelligent Cache Warming
// ============================================================================

export async function warmCache(
    examName: string,
    popularTopics: string[]
): Promise<number> {
    // Pre-generate questions for popular topics during off-peak hours
    // This reduces wait time for real users

    let warmedCount = 0;

    for (const topic of popularTopics) {
        try {
            const request: QuestionGenerationRequest = {
                exam_name: examName,
                subject: 'Quantitative Aptitude', // Most common
                topic: topic,
                difficulty: 'medium', // Most requested
                question_type: 'mcq',
                language: 'english',
                count: 5,
                use_cache: false // Force generation
            };

            // Check if already cached
            const cached = await getCachedQuestions(request);
            if (!cached) {
                // Would trigger generation in actual implementation
                warmedCount++;
            }
        } catch (error) {
            console.error(`Cache warming failed for ${topic}:`, error);
        }
    }

    return warmedCount;
}
