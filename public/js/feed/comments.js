/* ===========================
   PrimeMar - Comments Module
   Post Comments & Replies
   =========================== */

import { supabase } from '../config/supabase.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const COMMENTS = {
    async getComments(postId, limit = 20, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data, error } = await supabase
                .from('comments')
                .select(`
                    id, user_id, content, likes_count, created_at,
                    profiles(username, display_name, avatar_url, verified)
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async addComment(postId, content) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            if (!content || content.trim().length === 0) throw new Error('Comment required');
            const { data, error } = await supabase
                .from('comments')
                .insert([{
                    post_id: postId,
                    user_id: currentUserId,
                    content: content.trim(),
                    created_at: new Date().toISOString()
                }]).select().single();
            if (error) throw error;
            ERROR_HANDLER.showSuccess('Comment posted');
            return data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async deleteComment(commentId, postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            const { data: comment } = await supabase
                .from('comments')
                .select('user_id')
                .eq('id', commentId)
                .single();
            if (comment.user_id !== currentUserId) throw new Error('Unauthorized');
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId);
            if (error) throw error;
            ERROR_HANDLER.showSuccess('Comment deleted');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
