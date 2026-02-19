/* ===========================
   PrimeMar - Follow Module
   User Following System
   =========================== */

import { supabase } from '../config/supabase.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const FOLLOW = {
    async followUser(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            if (userId === currentUserId) throw new Error('Cannot follow yourself');
            const { data: existing } = await supabase.from('follows').select('id').eq('follower_id', currentUserId).eq('following_id', userId).single();
            if (existing) throw new Error('Already following');
            const { error } = await supabase.from('follows').insert([{ follower_id: currentUserId, following_id: userId }]);
            if (error) throw error;
            const { data: targetProfile } = await supabase.from('profiles').select('followers_count').eq('user_id', userId).single();
            await supabase.from('profiles').update({ followers_count: (targetProfile?.followers_count || 0) + 1 }).eq('user_id', userId);
            ERROR_HANDLER.showSuccess('User followed');
            return true;
        } catch (error) {
            if (error.message !== 'Already following') ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    },

    async unfollowUser(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            const { error } = await supabase.from('follows').delete().eq('follower_id', currentUserId).eq('following_id', userId);
            if (error) throw error;
            const { data: targetProfile } = await supabase.from('profiles').select('followers_count').eq('user_id', userId).single();
            await supabase.from('profiles').update({ followers_count: Math.max(0, (targetProfile?.followers_count || 1) - 1) }).eq('user_id', userId);
            ERROR_HANDLER.showSuccess('User unfollowed');
            return true;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    },

    async isFollowing(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data, error } = await supabase.from('follows').select('id').eq('follower_id', HELPERS.getCurrentUserId()).eq('following_id', userId).single();
            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    }
};
