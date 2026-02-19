/* ===========================
   PrimeMar - Payments Module
   Payment Processing & Verification
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { PAYMENTS } from '../config/payments.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';

export const PAYMENT_SERVICE = {
    // Process verification payment
    async processVerificationPayment() {
        try {
            const amount = CONFIG.VERIFICATION.FEE_USD;
            const email = localStorage.getItem('user_email');
            
            if (!email) {
                throw new Error('User email not found');
            }
            
            // Use Paystack for NGN (primary market)
            const reference = `VERIFY-${HELPERS.generateRandomString(12)}`;
            
            // Initiate payment
            const paymentData = {
                email: email,
                amount: amount * 100, // Paystack expects amount in kobo
                reference: reference,
                metadata: {
                    type: 'verification',
                    user_id: HELPERS.getCurrentUserId()
                }
            };
            
            // Call Paystack API
            const response = await fetch(`${PAYMENTS.PAYSTACK.BASEURL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PAYMENTS.PAYSTACK.SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!data.status) {
                throw new Error(data.message || 'Payment initialization failed');
            }
            
            return {
                authorizationUrl: data.data.authorization_url,
                reference: reference,
                accessCode: data.data.access_code
            };
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Verify payment
    async verifyPayment(reference, paymentMethod = 'paystack') {
        try {
            if (paymentMethod === 'paystack') {
                const response = await fetch(
                    `${PAYMENTS.PAYSTACK.BASEURL}/transaction/verify/${reference}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${PAYMENTS.PAYSTACK.SECRET_KEY}`
                        }
                    }
                );
                
                const data = await response.json();
                
                if (!data.status || data.data.status !== 'success') {
                    throw new Error('Payment verification failed');
                }
                
                return {
                    status: 'success',
                    amount: data.data.amount / 100,
                    reference: data.data.reference,
                    timestamp: data.data.paid_at
                };
            }
            
            if (paymentMethod === 'flutterwave') {
                const response = await fetch(
                    `${PAYMENTS.FLUTTERWAVE.BASEURL}/transactions/${reference}/verify`,
                    {
                        headers: {
                            'Authorization': `Bearer ${PAYMENTS.FLUTTERWAVE.SECRET_KEY}`
                        }
                    }
                );
                
                const data = await response.json();
                
                if (data.status !== 'success' || data.data.status !== 'successful') {
                    throw new Error('Payment verification failed');
                }
                
                return {
                    status: 'success',
                    amount: data.data.amount_settled,
                    reference: data.data.flw_ref,
                    timestamp: data.data.created_at
                };
            }
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Update verification status after payment
    async completeVerification(reference) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            // Verify payment first
            const payment = await this.verifyPayment(reference);
            
            if (payment.status !== 'success') {
                throw new Error('Payment not verified');
            }
            
            // Update profile to verified
            const { error } = await supabase
                .from('profiles')
                .update({
                    verified: true,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            if (error) throw error;
            
            ERROR_HANDLER.showSuccess('Verification successful! 💠');
            return true;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Process subscription payment
    async processSubscriptionPayment() {
        try {
            const amount = CONFIG.SUBSCRIPTION.PRICE_USD;
            const email = localStorage.getItem('user_email');
            
            if (!email) {
                throw new Error('User email not found');
            }
            
            const reference = `SUB-${HELPERS.generateRandomString(12)}`;
            
            const paymentData = {
                email: email,
                amount: amount * 100,
                reference: reference,
                metadata: {
                    type: 'subscription',
                    user_id: HELPERS.getCurrentUserId()
                }
            };
            
            const response = await fetch(`${PAYMENTS.PAYSTACK.BASEURL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${PAYMENTS.PAYSTACK.SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            const data = await response.json();
            
            if (!data.status) {
                throw new Error(data.message || 'Payment initialization failed');
            }
            
            return {
                authorizationUrl: data.data.authorization_url,
                reference: reference,
                accessCode: data.data.access_code
            };
        } catch (error) {
            ERROR_HANDLER.handleAPIError(error);
            throw error;
        }
    },

    // Complete subscription after payment
    async completeSubscription(reference) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            // Verify payment
            const payment = await this.verifyPayment(reference);
            
            if (payment.status !== 'success') {
                throw new Error('Payment not verified');
            }
            
            const renewsAt = new Date();
            renewsAt.setDate(renewsAt.getDate() + 30);
            
            // Create or update subscription
            const { error } = await supabase
                .from('subscriptions')
                .upsert([{
                    user_id: currentUserId,
                    tier: 'premium',
                    status: 'active',
                    renews_at: renewsAt.toISOString(),
                    updated_at: new Date().toISOString()
                }], { onConflict: 'user_id' });
            
            if (error) throw error;
            
            // Update wallet tier
            await supabase
                .from('wallets')
                .update({
                    subscription_tier: 'premium',
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUserId);
            
            ERROR_HANDLER.showSuccess('Premium subscription activated! 🎉');
            return true;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Process withdrawal payment
    async processWithdrawal(withdrawalId, withdrawalAmount, currency, method) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const reference = `WD-${withdrawalId.substring(0, 8)}-${HELPERS.generateRandomString(8)}`;
            
            if (method === 'paystack' && currency === 'NGN') {
                // Process NGN withdrawal via Paystack
                // Implementation depends on payout API
                const payoutData = {
                    type: 'nuban',
                    currency: currency,
                    amount: withdrawalAmount * 100,
                    reference: reference
                };
                
                // Send to Paystack Payout API
                // This is a server-side operation in production
            }
            
            if (method === 'flutterwave' && currency === 'USD') {
                // Process USD withdrawal via Flutterwave
                const payoutData = {
                    amount: withdrawalAmount,
                    currency: currency,
                    reference: reference
                };
                
                // Send to Flutterwave Payout API
            }
            
            // Update withdrawal status
            const { error } = await supabase
                .from('withdrawals')
                .update({
                    status: 'processing',
                    reference: reference,
                    updated_at: new Date().toISOString()
                })
                .eq('id', withdrawalId);
            
            if (error) throw error;
            
            ERROR_HANDLER.showSuccess('Withdrawal processing...');
            return reference;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Handle payment webhook (Paystack)
    async handlePaystackWebhook(event) {
        try {
            if (event.event === 'charge.success') {
                const reference = event.data.reference;
                const metadata = event.data.metadata;
                
                if (metadata.type === 'verification') {
                    await this.completeVerification(reference);
                } else if (metadata.type === 'subscription') {
                    await this.completeSubscription(reference);
                }
            }
        } catch (error) {
            console.error('Webhook handling failed:', error);
        }
    },

    // Handle payment webhook (Flutterwave)
    async handleFlutterwaveWebhook(event) {
        try {
            if (event.event === 'charge.completed') {
                const reference = event.data.flw_ref;
                const metadata = event.data.meta;
                
                if (metadata.type === 'verification') {
                    await this.completeVerification(reference);
                } else if (metadata.type === 'subscription') {
                    await this.completeSubscription(reference);
                }
            }
        } catch (error) {
            console.error('Webhook handling failed:', error);
        }
    }
};
