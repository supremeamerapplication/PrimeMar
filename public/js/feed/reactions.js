/* ===========================
   PrimeMar - Reactions Module
   Likes & Reactions
   =========================== */

import { supabase } from '../config/supabase.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const REACTIONS = {
    async likePost(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            const { data: existing } = await supabase.from('likes').select('id').eq('user_id', currentUserId).eq('post_id', postId).single();
            if (existing) throw new Error('Already liked');
            const { error } = await supabase.from('likes').insert([{ user_id: currentUserId, post_id: postId }]);
            if (error) throw error;
            const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
            await supabase.from('posts').update({ likes_count: (post?.likes_count || 0) + 1 }).eq('id', postId);
            return true;
        } catch (error) {
            if (error.message !== 'Already liked') ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    },

    async unlikePost(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            const { error } = await supabase.from('likes').delete().eq('user_id', currentUserId).eq('post_id', postId);
            if (error) throw error;
            const { data: post } = await supabase.from('posts').select('likes_count').eq('id', postId).single();
            await supabase.from('posts').update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) }).eq('id', postId);
            return true;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    },

    async hasLikedPost(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data, error } = await supabase.from('likes').select('id').eq('user_id', HELPERS.getCurrentUserId()).eq('post_id', postId).single();
            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    }
};
