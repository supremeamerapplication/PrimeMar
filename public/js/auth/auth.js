// auth.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials (replace with your own)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const AUTH = {
    // Check if user is logged in
    isAuthenticated: () => !!localStorage.getItem('primemar_token'),

    // Get current user
    getCurrentUser: () => {
        const userJSON = localStorage.getItem('primemar_user');
        return userJSON ? JSON.parse(userJSON) : null;
    },

    // Login
    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            localStorage.setItem('primemar_token', data.session.access_token);
            localStorage.setItem('primemar_user', JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Logout
    logout: () => {
        supabase.auth.signOut();
        localStorage.removeItem('primemar_token');
        localStorage.removeItem('primemar_user');
        localStorage.removeItem('primemar_profile');
        window.location.href = '/login.html';
    },

    // Signup
    signup: async (email, password, username, displayName) => {
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) throw error;

            // Create profile
            const { error: profileError } = await supabase.from('profiles').insert([{
                user_id: data.user.id,
                username,
                display_name: displayName,
                bio: '',
                avatar_url: null,
                verified: false,
                followers_count: 0,
                following_count: 0,
                views_count: 0,
                posts_count: 0
            }]);
            if (profileError) throw profileError;

            // Create wallet
            const { error: walletError } = await supabase.from('wallets').insert([{
                user_id: data.user.id,
                total_balance: 0,
                available_balance: 0,
                on_hold_balance: 0,
                subscription_tier: 'free'
            }]);
            if (walletError) throw walletError;

            return { success: true, user: data.user };

        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

// Optional: make AUTH available globally for quick access
window.AUTH = AUTH;