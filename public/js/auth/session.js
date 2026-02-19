// session.js
import { AUTH, supabase } from './auth.js';

// Session module
export const SESSION = {
    // Initialize session on page load
    init: async () => {
        try {
            const user = AUTH.getCurrentUser();
            const publicPages = ['/index.html', '/login.html', '/signup.html', '/404.html'];
            const currentPath = window.location.pathname;

            if (!user && !publicPages.some(page => currentPath.includes(page))) {
                window.location.href = '/login.html';
                return;
            }

            if (user) {
                await SESSION.loadUserProfile(user.id);
                SESSION.updateSidebarInfo();
                SESSION.setupLogoutButton();
            }

        } catch (error) {
            console.error('Session init error:', error);
        }
    },

    // Load user profile
    loadUserProfile: async (userId) => {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
            if (error) throw error;

            localStorage.setItem('primemar_profile', JSON.stringify(data));
            return data;

        } catch (error) {
            console.error('Load profile error:', error);
        }
    },

    // Get user profile
    getUserProfile: () => {
        const profileJSON = localStorage.getItem('primemar_profile');
        return profileJSON ? JSON.parse(profileJSON) : null;
    },

    // Update sidebar/profile UI
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
            if (!el) return;
            if (key.toLowerCase().includes('username')) el.textContent = `@${profile.username}`;
            else if (key.toLowerCase().includes('displayname')) el.textContent = profile.display_name;
            else if (key.toLowerCase().includes('avatar')) el.src = profile.avatar_url || '/assets/icons/primebird.svg';
        });
    },

    // Setup logout buttons
    setupLogoutButton: () => {
        const logoutLinks = document.querySelectorAll('#logoutLink, #adminLogoutLink');
        logoutLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                AUTH.logout();
            });
        });
    },

    // Update last activity in Supabase
    updateLastActivity: async () => {
        try {
            const user = AUTH.getCurrentUser();
            if (!user) return;

            await supabase.from('users')
                .update({ last_activity: new Date().toISOString() })
                .eq('id', user.id);

        } catch (error) {
            console.error('Error updating activity:', error);
        }
    }
};

// Initialize session when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SESSION.init);
} else {
    SESSION.init();
}

// Update activity every 5 minutes
setInterval(SESSION.updateLastActivity, 5 * 60 * 1000);

// Optional: make SESSION globally available
window.SESSION = SESSION;