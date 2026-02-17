/* ===========================
   PrimeMar - Verification Module
   Creator Verification
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const VERIFICATION = {
    async checkEligibility(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            const { data: profile } = await supabase.from('profiles').select('followers_count, verified').eq('user_id', userId).single();
            if (!profile) return { eligible: false, reason: 'Profile not found' };
            if (profile.verified) return { eligible: false, reason: 'Already verified' };
            if (profile.followers_count < CONFIG.VERIFICATION.MIN_FOLLOWERS) {
                return { eligible: false, reason: `Need ${CONFIG.VERIFICATION.MIN_FOLLOWERS} followers` };
            }
            return { eligible: true, reason: null };
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async requestVerification() {
        try {
            const currentUserId = HELPERS.getCurrentUserId();
            const eligibility = await this.checkEligibility(currentUserId);
            if (!eligibility.eligible) throw new Error(eligibility.reason);
            ERROR_HANDLER.showSuccess('Verification request submitted');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    async getVerificationStatus() {
        try {
            const currentUserId = HELPERS.getCurrentUserId();
            const { data: profile } = await supabase.from('profiles').select('verified').eq('user_id', currentUserId).single();
            return profile?.verified || false;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    }
};
