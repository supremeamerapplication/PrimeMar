/* ===========================
   PrimeMar - Authentication Module
   =========================== */

const AUTH = {
    // Current user
    currentUser: null,

    // Check if user is authenticated
    isAuthenticated: () => {
        return localStorage.getItem('primemar_token') !== null;
    },

    // Get current user
    getCurrentUser: () => {
        const userJSON = localStorage.getItem('primemar_user');
        return userJSON ? JSON.parse(userJSON) : null;
    },

    // Login user
    login: async (email, password) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            localStorage.setItem('primemar_token', data.session.access_token);
            localStorage.setItem('primemar_user', JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (error) {
            return ERROR_HANDLER.handleSupabaseError(error);
        }
    },

    // Sign up user
    signup: async (email, password, displayName, username) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            // Validate inputs
            if (!VALIDATION.isValidEmail(email)) {
                throw new Error(VALIDATION.getErrorMessage('email', 'invalid'));
            }
            if (!VALIDATION.isValidPassword(password)) {
                throw new Error(VALIDATION.getErrorMessage('password', 'invalid'));
            }
            if (!VALIDATION.isValidUsername(username)) {
                throw new Error(VALIDATION.getErrorMessage('username', 'invalid'));
            }
            if (!VALIDATION.isValidDisplayName(displayName)) {
                throw new Error(VALIDATION.getErrorMessage('displayName', 'invalid'));
            }

            // Create auth user
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create profile
            const { error: profileError } = await supabase
                .from(CONFIG.TABLES.PROFILES)
                .insert([
                    {
                        user_id: data.user.id,
                        username,
                        display_name: displayName,
                        bio: '',
                        avatar_url: null,
                        verified: false,
                        followers_count: 0,
                        following_count: 0,
                        views_count: 0,
                        posts_count: 0,
                    },
                ]);

            if (profileError) throw profileError;

            // Create wallet
            const { error: walletError } = await supabase
                .from(CONFIG.TABLES.WALLETS)
                .insert([
                    {
                        user_id: data.user.id,
                        total_balance: 0,
                        available_balance: 0,
                        on_hold_balance: 0,
                        subscription_tier: 'free',
                    },
                ]);

            if (walletError) throw walletError;

            ERROR_HANDLER.showSuccess('Account created successfully! Please check your email to verify.');
            return { success: true, user: data.user };
        } catch (error) {
            return ERROR_HANDLER.handleSupabaseError(error);
        }
    },

    // Logout user
    logout: async () => {
        try {
            if (supabase) {
                await supabase.auth.signOut();
            }
            localStorage.removeItem('primemar_token');
            localStorage.removeItem('primemar_user');
            window.location.href = './index.html';
        } catch (error) {
            ERROR_HANDLER.handleSupabaseError(error);
        }
    },

    // Reset password
    resetPassword: async (email) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) throw error;

            ERROR_HANDLER.showSuccess('Password reset email sent! Check your inbox.');
            return { success: true };
        } catch (error) {
            return ERROR_HANDLER.handleSupabaseError(error);
        }
    },

    // Update password
    updatePassword: async (newPassword) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            ERROR_HANDLER.showSuccess('Password updated successfully!');
            return { success: true };
        } catch (error) {
            return ERROR_HANDLER.handleSupabaseError(error);
        }
    },

    // Verify email
    verifyEmail: async (token) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email',
            });

            if (error) throw error;

            ERROR_HANDLER.showSuccess('Email verified successfully!');
            return { success: true };
        } catch (error) {
            return ERROR_HANDLER.handleSupabaseError(error);
        }
    },
};

// Setup authentication event listeners
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check authentication on page load
        if (!AUTH.isAuthenticated() && window.location.pathname.includes('/public/')) {
            const publicPages = ['/index.html', '/login.html', '/signup.html', '/404.html'];
            const isPublicPage = publicPages.some(page => window.location.pathname.includes(page));
            if (!isPublicPage) {
                window.location.href = './login.html';
            }
        }
    });
}

// Export authentication
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AUTH };
}
