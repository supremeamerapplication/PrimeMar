/* ===========================
   PrimeMar - Posts Module
   Feed & Post Management
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';
import { VALIDATION } from '../utils/validation.js';

export const FEED = {
    // Get feed posts
    async getFeedPosts(limit = 20, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    id,
                    user_id,
                    content,
                    media_url,
                    likes_count,
                    comments_count,
                    shares_count,
                    created_at,
                    profiles(username, display_name, avatar_url, verified)
                `)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Create post
    async createPost(content, mediaUrl = null) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            if (!content || content.trim().length === 0) {
                throw new Error('Post content required');
            }
            
            const { data, error } = await supabase
                .from('posts')
                .insert([{
                    user_id: currentUserId,
                    content: content.trim(),
                    media_url: mediaUrl,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('posts_count')
                .eq('user_id', currentUserId)
                .single();
            
            await supabase
                .from('profiles')
                .update({
                    posts_count: (profile?.posts_count || 0) + 1
                })
                .eq('user_id', currentUserId);
            
            ERROR_HANDLER.showSuccess('Post published! 📝');
            return data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Delete post
    async deletePost(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            const { data: post } = await supabase
                .from('posts')
                .select('user_id')
                .eq('id', postId)
                .single();
            
            if (post.user_id !== currentUserId) {
                throw new Error('Unauthorized');
            }
            
            const { error } = await supabase
                .from('posts')
                .update({
                    deleted_at: new Date().toISOString()
                })
                .eq('id', postId);
            
            if (error) throw error;
            
            const { data: profile } = await supabase
                .from('profiles')
                .select('posts_count')
                .eq('user_id', currentUserId)
                .single();
            
            await supabase
                .from('profiles')
                .update({
                    posts_count: Math.max(0, (profile?.posts_count || 1) - 1)
                })
                .eq('user_id', currentUserId);
            
            ERROR_HANDLER.showSuccess('Post deleted');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
