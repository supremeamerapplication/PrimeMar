/* ===========================
   PrimeMar - Profile Module
   User Profile Management
   =========================== */

import { supabase } from '../config/supabase.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const PROFILE = {
    async getProfile(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async updateProfile(updates) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const currentUserId = HELPERS.getCurrentUserId();
            if (updates.bio && updates.bio.length > 500) throw new Error('Bio too long');
            const { error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', currentUserId);
            if (error) throw error;
            ERROR_HANDLER.showSuccess('Profile updated');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async searchProfiles(query, limit = 20) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            if (query.length < 2) return [];
            const { data, error } = await supabase.from('profiles').select('id, user_id, username, display_name, avatar_url, verified').ilike('username', `%${query}%`).limit(limit);
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
