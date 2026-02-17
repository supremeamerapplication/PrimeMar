/* ===========================
   PrimeMar - Boost Module
   Post Boost Functionality
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const BOOST = {
    // Create boost for post
    async boostPost(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            const boostCost = CONFIG.BOOST_COST;
            
            // Check wallet balance
            const { data: wallet } = await supabase
                .from('wallets')
                .select('available_balance')
                .eq('user_id', currentUserId)
                .single();
            
            if (!wallet || wallet.available_balance < boostCost) {
                throw new Error(`Insufficient balance. Need ${boostCost} SA`);
            }
            
            // Create boost record
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + CONFIG.BOOST_DURATION_HOURS);
            
            const { data: boost, error: boostError } = await supabase
                .from('boosts')
                .insert([{
                    post_id: postId,
                    user_id: currentUserId,
                    cost_sa: boostCost,
                    created_at: new Date().toISOString(),
                    expires_at: expiresAt.toISOString()
                }])
                .select()
                .single();
            
            if (boostError) throw boostError;
            
            // Distribute SA
            const creatorShare = (boostCost * CONFIG.BOOST_DISTRIBUTION.CREATOR) / 100;
            const platformShare = (boostCost * CONFIG.BOOST_DISTRIBUTION.PLATFORM) / 100;
            const reserveShare = (boostCost * CONFIG.BOOST_DISTRIBUTION.RESERVE) / 100;
            
            // Get post creator
            const { data: post } = await supabase
                .from('posts')
                .select('user_id')
                .eq('id', postId)
                .single();
            
            if (post) {
                // Add SA to post creator
                const creatorWallet = await supabase
                    .from('wallets')
                    .select('available_balance')
                    .eq('user_id', post.user_id)
                    .single();
                
                await supabase
                    .from('wallets')
                    .update({
                        available_balance: (creatorWallet?.data?.available_balance || 0) + creatorShare,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', post.user_id);
                
                // Log transaction
                await supabase
                    .from('transactions')
                    .insert([{
                        user_id: post.user_id,
                        type: 'boost_earnings',
                        amount: creatorShare,
                        description: `Earnings from post boost`
                    }]);
            }
            
            // Add to platform reserve
            const { data: reserve } = await supabase
                .from('sa_reserve')
                .select('balance')
                .single();
            
            await supabase
                .from('sa_reserve')
                .update({
                    balance: (reserve?.balance || 0) + reserveShare + platformShare,
                    updated_at: new Date().toISOString()
                });
            
            // Deduct from booster's wallet
            await supabase
                .from('wallets')
                .update({
                    available_balance: wallet.available_balance - boostCost,
                    total_balance: (wallet.available_balance || 0) - boostCost,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            // Log transaction
            await supabase
                .from('transactions')
                .insert([{
                    user_id: currentUserId,
                    type: 'boost_cost',
                    amount: boostCost,
                    description: `Boosted post for 24 hours`
                }]);
            
            ERROR_HANDLER.showSuccess(`Post boosted for 24 hours! 🚀`);
            return boost;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get active boosts for user
    async getActiveBoosts(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('boosts')
                .select(`
                    id,
                    post_id,
                    cost_sa,
                    created_at,
                    expires_at
                `)
                .eq('user_id', userId)
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get boost history
    async getBoostHistory(limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('boosts')
                .select(`
                    id,
                    post_id,
                    cost_sa,
                    created_at,
                    expires_at
                `)
                .eq('user_id', HELPERS.getCurrentUserId())
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Check if post is boosted
    async isPostBoosted(postId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('boosts')
                .select('id')
                .eq('post_id', postId)
                .gt('expires_at', new Date().toISOString())
                .limit(1);
            
            if (error) throw error;
            return (data && data.length > 0) ? true : false;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            return false;
        }
    }
};
