/* ===========================
   PrimeMar - Admin Module
   Dashboard & Moderation
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const ADMIN = {
    // Get platform statistics
    async getStatistics() {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            // Total users
            const { count: totalUsers } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });
            
            // Verified creators
            const { count: verifiedCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('verified', true);
            
            // Subscribed users
            const { count: subscribedCount } = await supabase
                .from('subscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active');
            
            // Total posts
            const { count: totalPosts } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .is('deleted_at', null);
            
            // SA in reserve
            const { data: reserveData } = await supabase
                .from('sa_reserve')
                .select('balance')
                .single();
            
            // Pending withdrawals
            const { count: pendingWithdrawals } = await supabase
                .from('withdrawals')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');
            
            return {
                totalUsers,
                verifiedCount,
                subscribedCount,
                totalPosts,
                saReserve: reserveData?.balance || 0,
                pendingWithdrawals
            };
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get all users with pagination
    async getUsers(limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    user_id,
                    username,
                    display_name,
                    verified,
                    followers_count,
                    created_at
                `)
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get pending verifications
    async getPendingVerifications(limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    id,
                    user_id,
                    username,
                    display_name,
                    followers_count,
                    created_at
                `)
                .eq('verified', false)
                .gte('followers_count', CONFIG.VERIFICATION.MIN_FOLLOWERS)
                .range(offset, offset + limit - 1)
                .order('followers_count', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Approve verification
    async approveVerification(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('profiles')
                .update({ verified: true })
                .eq('user_id', userId);
            
            if (error) throw error;
            
            // Log action
            await this.logAction(`Approved verification for user ${userId}`);
            ERROR_HANDLER.showSuccess('Verification approved');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Reject verification
    async rejectVerification(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            await this.logAction(`Rejected verification for user ${userId}`);
            ERROR_HANDLER.showSuccess('Verification rejected');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get pending withdrawals
    async getPendingWithdrawals(limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('withdrawals')
                .select(`
                    id,
                    user_id,
                    amount,
                    currency,
                    method,
                    status,
                    created_at
                `)
                .eq('status', 'pending')
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Approve withdrawal
    async approveWithdrawal(withdrawalId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('withdrawals')
                .update({
                    status: 'approved',
                    updated_at: new Date().toISOString()
                })
                .eq('id', withdrawalId);
            
            if (error) throw error;
            
            await this.logAction(`Approved withdrawal ${withdrawalId}`);
            ERROR_HANDLER.showSuccess('Withdrawal approved');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Reject withdrawal
    async rejectWithdrawal(withdrawalId, reason = '') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data: withdrawal } = await supabase
                .from('withdrawals')
                .select('user_id, amount')
                .eq('id', withdrawalId)
                .single();
            
            const { error } = await supabase
                .from('withdrawals')
                .update({
                    status: 'rejected',
                    updated_at: new Date().toISOString()
                })
                .eq('id', withdrawalId);
            
            if (error) throw error;
            
            // Refund amount to wallet
            if (withdrawal) {
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('available_balance, on_hold_balance')
                    .eq('user_id', withdrawal.user_id)
                    .single();
                
                await supabase
                    .from('wallets')
                    .update({
                        available_balance: (wallet?.available_balance || 0) + withdrawal.amount,
                        on_hold_balance: (wallet?.on_hold_balance || 0) - withdrawal.amount
                    })
                    .eq('user_id', withdrawal.user_id);
            }
            
            await this.logAction(`Rejected withdrawal ${withdrawalId}: ${reason}`);
            ERROR_HANDLER.showSuccess('Withdrawal rejected');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get reports
    async getReports(status = 'pending', limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('status', status)
                .range(offset, offset + limit - 1)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Resolve report
    async resolveReport(reportId, action) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            // Update report status
            const { error } = await supabase
                .from('reports')
                .update({ status: 'resolved' })
                .eq('id', reportId);
            
            if (error) throw error;
            
            // If action is 'ban' or 'suspend', disable account
            // Implementation depends on specific action type
            
            await this.logAction(`Resolved report ${reportId}: ${action}`);
            ERROR_HANDLER.showSuccess('Report resolved');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Update SA reserve
    async updateSAReserve(amount, description = '') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('sa_reserve')
                .update({
                    balance: amount,
                    updated_at: new Date().toISOString()
                });
            
            if (error) throw error;
            
            await this.logAction(`Updated SA reserve to ${amount}: ${description}`);
            ERROR_HANDLER.showSuccess('SA reserve updated');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Log admin action
    async logAction(action) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            const { error } = await supabase
                .from('admin_logs')
                .insert([{
                    admin_id: currentUserId,
                    action: action,
                    timestamp: new Date().toISOString()
                }]);
            
            if (error) throw error;
        } catch (error) {
            // Silently fail for logging
            console.error('Failed to log admin action:', error);
        }
    },

    // Get admin activity log
    async getActivityLog(limit = 100, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('admin_logs')
                .select(`
                    id,
                    admin_id,
                    action,
                    timestamp
                `)
                .range(offset, offset + limit - 1)
                .order('timestamp', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
