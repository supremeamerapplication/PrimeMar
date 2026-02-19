/* ===========================
   PrimeMar - Session Management
   =========================== */

const SESSION = {
    // Initialize session
    init: async () => {
        try {
            const user = AUTH.getCurrentUser();
            if (!user) {
                // Check if we're on a protected page
                const publicPages = ['/index.html', '/login.html', '/signup.html', '/404.html'];
                const currentPath = window.location.pathname;
                const isPublicPage = publicPages.some(page => currentPath.includes(page));

                if (!isPublicPage) {
                    window.location.href = './login.html';
                }
                return;
            }

            // Load user profile
            await SESSION.loadUserProfile(user.id);

            // Setup logout button
            SESSION.setupLogoutButton();

            // Setup sidebar info
            SESSION.updateSidebarInfo();
        } catch (error) {
            console.error('Error initializing session:', error);
        }
    },

    // Load user profile
    loadUserProfile: async (userId) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase
                .from(CONFIG.TABLES.PROFILES)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            localStorage.setItem('primemar_profile', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    },

    // Get user profile
    getUserProfile: () => {
        const profileJSON = localStorage.getItem('primemar_profile');
        return profileJSON ? JSON.parse(profileJSON) : null;
    },

    // Update sidebar info
    updateSidebarInfo: () => {
        const profile = SESSION.getUserProfile();
        if (!profile) return;

        const elements = {
            sidebarUsername: document.getElementById('sidebarUsername'),
            sidebarDisplayName: document.getElementById('sidebarDisplayName'),
            sidebarUserAvatar: document.getElementById('sidebarUserAvatar'),
            profileUsername: document.getElementById('profileUsername'),
            profileDisplayName: document.getElementById('profileDisplayName'),
            profileAvatar: document.getElementById('profileAvatar'),
            chatUserName: document.getElementById('chatUserName'),
            chatUserAvatar: document.getElementById('chatUserAvatar'),
        };

        Object.entries(elements).forEach(([key, el]) => {
            if (el && key.includes('Username')) {
                el.textContent = `@${profile.username}`;
            } else if (el && key.includes('DisplayName')) {
                el.textContent = profile.display_name;
            } else if (el && key.includes('Avatar')) {
                el.src = profile.avatar_url || './assets/icons/primebird.svg';
            } else if (el && key.includes('UserName')) {
                el.textContent = profile.display_name;
            }
        });
    },

    // Setup logout button
    setupLogoutButton: () => {
        const logoutLinks = document.querySelectorAll('#logoutLink, #adminLogoutLink');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                AUTH.logout();
            });
        });
    },

    // Check admin access
    isAdmin: () => {
        const user = AUTH.getCurrentUser();
        return user && user.email === CONFIG.ADMIN.EMAIL;
    },

    // Redirect if not admin
    requireAdmin: () => {
        if (!SESSION.isAdmin()) {
            ERROR_HANDLER.showError('Admin access required');
            setTimeout(() => {
                window.location.href = './feed.html';
            }, 2000);
            return false;
        }
        return true;
    },

    // Get wallet
    getWallet: async (userId) => {
        try {
            if (!supabase) throw new Error('Supabase not initialized');

            const { data, error } = await supabase
                .from(CONFIG.TABLES.WALLETS)
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('Error loading wallet:', error);
            return null;
        }
    },

    // Update last activity
    updateLastActivity: async () => {
        try {
            const user = AUTH.getCurrentUser();
            if (!user || !supabase) return;

            await supabase
                .from(CONFIG.TABLES.USERS)
                .update({ last_activity: new Date().toISOString() })
                .eq('id', user.id);
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    },
};

// Initialize session on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SESSION.init);
} else {
    SESSION.init();
}

// Update activity every 5 minutes
setInterval(SESSION.updateLastActivity, 5 * 60 * 1000);

// Export session
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SESSION };
}
