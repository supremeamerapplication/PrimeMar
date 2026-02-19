/* ===========================
   PrimeMar - Wallet Module
   SA Economy Management
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';
import { VALIDATION } from '../utils/validation.js';

export const WALLET = {
    // Get wallet balance
    async getWalletBalance() {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data: wallet, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', HELPERS.getCurrentUserId())
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            return wallet || {
                total_balance: 0,
                available_balance: 0,
                on_hold_balance: 0,
                subscription_tier: 'free'
            };
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Add SA to wallet
    async addSA(amount, type = 'engagement', description = '') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            if (!VALIDATION.validateSAAmount(amount)) {
                throw new Error('Invalid SA amount');
            }
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            // Calculate hold time based on type
            let holdTime = 0;
            switch(type) {
                case 'engagement': holdTime = CONFIG.SA.HOLD_TIME.ENGAGEMENT; break;
                case 'subscription': holdTime = CONFIG.SA.HOLD_TIME.SUBSCRIPTION; break;
                case 'boost': holdTime = CONFIG.SA.HOLD_TIME.BOOST; break;
            }
            
            const availableAt = new Date();
            availableAt.setHours(availableAt.getHours() + holdTime);
            
            // Insert transaction
            const { data: transaction, error: txError } = await supabase
                .from('transactions')
                .insert([{
                    user_id: currentUserId,
                    type: type,
                    amount: amount,
                    description: description,
                    available_at: availableAt.toISOString()
                }])
                .select()
                .single();
            
            if (txError) throw txError;
            
            // Update wallet
            const { error: walletError } = await supabase
                .from('wallets')
                .update({
                    total_balance: HELPERS.incrementDecimal(await this.getWalletBalance().then(w => w.total_balance), amount),
                    on_hold_balance: HELPERS.incrementDecimal(await this.getWalletBalance().then(w => w.on_hold_balance), amount),
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            if (walletError) throw walletError;
            
            ERROR_HANDLER.showSuccess(`${amount} SA added (${type})`);
            return transaction;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Convert SA to USD/NGN
    async convertSA(saAmount, targetCurrency = 'USD') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            if (!VALIDATION.validateSAAmount(saAmount)) {
                throw new Error('Invalid SA amount');
            }
            
            if (!['USD', 'NGN'].includes(targetCurrency)) {
                throw new Error('Invalid currency');
            }
            
            const currentUserId = HELPERS.getCurrentUserId();
            const wallet = await this.getWalletBalance();
            
            if (wallet.available_balance < saAmount) {
                throw new Error('Insufficient available balance');
            }
            
            // Calculate conversion
            const convertedAmount = targetCurrency === 'USD' 
                ? saAmount / CONFIG.SA.USD_RATE
                : (saAmount / CONFIG.SA.USD_RATE) * CONFIG.SA.NGN_RATE;
            
            // Create transaction record
            const { error } = await supabase
                .from('transactions')
                .insert([{
                    user_id: currentUserId,
                    type: 'conversion',
                    amount: saAmount,
                    converted_to: targetCurrency,
                    converted_amount: convertedAmount,
                    description: `Converted ${saAmount} SA to ${convertedAmount} ${targetCurrency}`
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update wallet - deduct SA and add converted amount
            const newAvailable = wallet.available_balance - saAmount;
            const { error: walletError } = await supabase
                .from('wallets')
                .update({
                    total_balance: wallet.total_balance - saAmount,
                    available_balance: newAvailable,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            if (walletError) throw walletError;
            
            ERROR_HANDLER.showSuccess(`${saAmount} SA converted to ${convertedAmount} ${targetCurrency}`);
            return { convertedAmount, currency: targetCurrency };
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Request withdrawal
    async requestWithdrawal(amount, currency, method, walletAddress = '') {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            const wallet = await this.getWalletBalance();
            const userProfile = await supabase
                .from('profiles')
                .select('verified')
                .eq('user_id', currentUserId)
                .single();
            
            // Validation
            if (amount < CONFIG.WITHDRAWAL.MINIMUM) {
                throw new Error(`Minimum withdrawal is $${CONFIG.WITHDRAWAL.MINIMUM}`);
            }
            
            if (wallet.available_balance < amount) {
                throw new Error('Insufficient balance');
            }
            
            // Check daily cap
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const { data: todaysWithdrawals } = await supabase
                .from('withdrawals')
                .select('amount')
                .eq('user_id', currentUserId)
                .gte('created_at', today.toISOString());
            
            const dailyTotal = (todaysWithdrawals || []).reduce((sum, w) => sum + w.amount, 0) + amount;
            const dailyCap = userProfile?.data?.verified ? CONFIG.WITHDRAWAL.DAILY_CAP_VERIFIED : CONFIG.WITHDRAWAL.DAILY_CAP_NORMAL;
            
            if (dailyTotal > dailyCap) {
                throw new Error(`Daily withdrawal limit ($${dailyCap}) would be exceeded`);
            }
            
            // Check cooldown
            const lastWithdrawal = await supabase
                .from('withdrawals')
                .select('created_at')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            
            if (lastWithdrawal?.data) {
                const timeSinceLastWithdrawal = new Date() - new Date(lastWithdrawal.data.created_at);
                let requiredCooldown = CONFIG.WITHDRAWAL.COOLDOWN_NORMAL;
                
                if (!lastWithdrawal) requiredCooldown = CONFIG.WITHDRAWAL.COOLDOWN_FIRST;
                else if (userProfile?.data?.verified) requiredCooldown = CONFIG.WITHDRAWAL.COOLDOWN_VERIFIED;
                
                if (amount >= 100) requiredCooldown += CONFIG.WITHDRAWAL.COOLDOWN_LARGE_AMOUNT;
                
                if (timeSinceLastWithdrawal < requiredCooldown * 3600000) {
                    throw new Error('Cooldown period not yet complete');
                }
            }
            
            // Create withdrawal request
            const { data, error } = await supabase
                .from('withdrawals')
                .insert([{
                    user_id: currentUserId,
                    amount: amount,
                    currency: currency,
                    method: method,
                    status: 'pending'
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            // Deduct from available balance
            const { error: walletError } = await supabase
                .from('wallets')
                .update({
                    available_balance: wallet.available_balance - amount,
                    on_hold_balance: wallet.on_hold_balance + amount,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            if (walletError) throw walletError;
            
            ERROR_HANDLER.showSuccess(`Withdrawal request submitted for ${amount} ${currency}`);
            return data;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get transaction history
    async getTransactionHistory(limit = 50, offset = 0) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
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

    // Subscribe to wallet changes
    subscribeToWalletChanges(callback) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            return supabase
                .channel(`wallet-${currentUserId}`)
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'wallets',
                    filter: `user_id=eq.${currentUserId}`
                }, (payload) => {
                    callback(payload.new);
                })
                .subscribe();
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
