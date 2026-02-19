/* ===========================
   PrimeMar - Messaging Module
   Real-time Chat
   =========================== */

import { supabase } from '../config/supabase.js';
import { CONFIG } from '../config/constants.js';
import { ERROR_HANDLER } from '../utils/error-handler.js';
import { HELPERS } from '../utils/helpers.js';
import { VALIDATION } from '../utils/validation.js';

export const MESSAGING = {
    // Load conversation with a user
    async loadConversation(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${userId},receiver_id.eq.${HELPERS.getCurrentUserId()}),and(sender_id.eq.${HELPERS.getCurrentUserId()},receiver_id.eq.${userId})`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return messages || [];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Get all conversations for current user
    async getConversations() {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            const { data: messages, error } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            // Group by conversation partner
            const conversations = {};
            messages.forEach(msg => {
                const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
                if (!conversations[partnerId]) {
                    conversations[partnerId] = {
                        user_id: partnerId,
                        last_message: msg.content,
                        last_message_time: msg.created_at,
                        unread_count: !msg.read && msg.receiver_id === currentUserId ? 1 : 0
                    };
                } else if (!msg.read && msg.receiver_id === currentUserId) {
                    conversations[partnerId].unread_count++;
                }
            });
            
            return Object.values(conversations);
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Send message
    async sendMessage(receiverId, content, mediaUrl = null) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            // Validate message
            if (!content && !mediaUrl) {
                throw new Error('Message content or media required');
            }
            
            if (content && content.length > 5000) {
                throw new Error('Message too long (max 5000 chars)');
            }
            
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    sender_id: currentUserId,
                    receiver_id: receiverId,
                    content: content || null,
                    media_url: mediaUrl,
                    created_at: new Date().toISOString()
                }])
                .select();
            
            if (error) throw error;
            return data[0];
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Mark message as read
    async markAsRead(messageId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('messages')
                .update({ read: true })
                .eq('id', messageId);
            
            if (error) throw error;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Subscribe to messages in real-time
    subscribeToMessages(receiverId, callback) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const currentUserId = HELPERS.getCurrentUserId();
            
            return supabase
                .channel(`messages-${currentUserId}-${receiverId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `or(and(sender_id=eq.${currentUserId},receiver_id=eq.${receiverId}),and(sender_id=eq.${receiverId},receiver_id=eq.${currentUserId}))`
                }, (payload) => {
                    callback(payload.new);
                })
                .subscribe();
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Delete message
    async deleteMessage(messageId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', messageId);
            
            if (error) throw error;
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Report message
    async reportMessage(messageId, reason) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { data: message } = await supabase
                .from('messages')
                .select('sender_id')
                .eq('id', messageId)
                .single();
            
            if (!message) throw new Error('Message not found');
            
            const { error } = await supabase
                .from('reports')
                .insert([{
                    reporter_id: HELPERS.getCurrentUserId(),
                    reported_user_id: message.sender_id,
                    reason: reason,
                    status: 'pending'
                }]);
            
            if (error) throw error;
            ERROR_HANDLER.showSuccess('Message reported');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Block user
    async blockUser(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('blocks')
                .insert([{
                    blocker_id: HELPERS.getCurrentUserId(),
                    blocked_id: userId
                }]);
            
            if (error) throw error;
            ERROR_HANDLER.showSuccess('User blocked');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    },

    // Unblock user
    async unblockUser(userId) {
        try {
            if (!supabase) throw new Error('Supabase not initialized');
            
            const { error } = await supabase
                .from('blocks')
                .delete()
                .eq('blocker_id', HELPERS.getCurrentUserId())
                .eq('blocked_id', userId);
            
            if (error) throw error;
            ERROR_HANDLER.showSuccess('User unblocked');
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
            throw error;
        }
    }
};
