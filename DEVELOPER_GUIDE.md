# PrimeMar - Complete Developer Guide

## 🎯 What Is PrimeMar?

PrimeMar is a **production-ready social media platform** with integrated fintech features including:
- Social engagement (posts, comments, likes, follows)
- Real-time messaging
- SA (Social Asset) economy system
- Payment processing (Paystack, Flutterwave)
- Withdrawal system with fraud prevention
- Creator verification & subscriptions
- Admin dashboard with moderation tools

**Built with:** Vanilla JavaScript + HTML5 + CSS3 + Supabase + Payment Gateways

---

## 🏗️ Architecture Overview

### Frontend Stack
- **HTML5** - Semantic markup across 10 main pages + 404
- **CSS3** - 8 responsive stylesheets (~2900 lines)
- **Vanilla JavaScript** - Module-based architecture
- **Supabase JS SDK** - Real-time database & auth

### Backend Infrastructure
- **Supabase PostgreSQL** - 16 tables with RLS policies
- **Supabase Auth** - Email + Social OAuth
- **Supabase Realtime** - Postgres changes subscriptions
- **Supabase Storage** - File upload (images, videos, docs)

### Payment Processors
- **Paystack** - NGN payments (Africa-focused)
- **Flutterwave** - USD payments (International)

### Deployment
- **Vercel** - Frontend hosting
- **Supabase Cloud** - Backend hosting

---

## 📂 Codebase Structure

### HTML Pages (11 files)
```
public/
├── index.html       # Landing/hero + feature cards
├── login.html       # Email/password + social OAuth
├── signup.html      # Registration with validation
├── feed.html        # Main social feed
├── profile.html     # User profile + tabs
├── messages.html    # Real-time chat interface
├── wallet.html      # SA balance + transactions
├── settings.html    # User preferences
├── admin.html       # Admin dashboard
├── 404.html         # Error page
└── [index.html in root - Vercel config]
```

### CSS Modules (8 files, ~2900 lines)
```
css/
├── base.css         # CSS variables, design system, utilities
├── auth.css         # Auth forms + landing page
├── feed.css         # Post cards, feed layout
├── profile.css      # Profile header, tabs, stats
├── messaging.css    # Chat UI, message bubbles
├── wallet.css       # Balance cards, transaction list
├── admin.css        # Dashboard panels, moderation UI
└── notifications.css # Toast notification styles
```

### JavaScript Modules (18 files)

**Configuration (3 files)**
```
js/config/
├── supabase.js      # Supabase client initialization
├── constants.js     # CONFIG object with all settings
└── payments.js      # Paystack & Flutterwave setup
```

**Utilities (3 files)**
```
js/utils/
├── validation.js    # 15+ input validators
├── helpers.js       # 30+ utility functions
└── error-handler.js # Error handling + notifications
```

**Authentication (3 files)**
```
js/auth/
├── auth.js          # Login/signup/logout logic
├── session.js       # Session persistence & management
└── social-auth.js   # OAuth patterns (stub)
```

**Feed & Social (3 files)**
```
js/feed/
├── posts.js         # Create/edit/delete posts
├── comments.js      # Comments & replies
└── reactions.js     # Likes on posts/comments
```

**Profiles (3 files)**
```
js/profile/
├── profile.js       # Profile info + edit
├── follow.js        # Follow/unfollow + lists
└── verification.js  # Creator verification flow
```

**Wallet & Economy (2 files)**
```
js/wallet/
├── wallet.js        # Balance, transactions, withdrawals
└── boost.js         # Post boost system
```

**Other Modules (2 files)**
```
js/messaging/
├── messaging.js     # Real-time chat + block/report

js/payments/
├── payment-service.js  # Verification, subscription, withdrawals

js/storage/
├── storage.js       # File upload/delete/validation

js/admin/
├── admin.js         # User mgmt, moderation, analytics

js/main.js          # App entry point & module exports
```

### Database (SQL files)
```
sql/
└── schema.sql       # 16 tables + indexes + RLS policies
```

### Configuration Files
```
├── package.json          # Dependencies
├── vite.config.js        # Build configuration
├── vercel.json           # Deployment settings
├── .env.example          # Environment variables template
├── README.md             # Setup instructions
├── SECURITY.md           # Security policies
└── IMPLEMENTATION_SUMMARY.md  # Project status
```

---

## 🔌 How to Use PrimeMar

### Basic Import Pattern

```javascript
// Import what you need
import { supabase } from './config/supabase.js';
import { CONFIG } from './config/constants.js';
import { FEED } from './feed/posts.js';
import { WALLET } from './wallet/wallet.js';
import { ERROR_HANDLER } from './utils/error-handler.js';

// Use the modules
async function createPost() {
    try {
        const post = await FEED.createPost('Hello world!');
        ERROR_HANDLER.showSuccess('Post created!');
    } catch (error) {
        ERROR_HANDLER.handleSupabaseError(error);
    }
}
```

### Global Access (in HTML)

```html
<script type="module" src="./js/main.js"></script>
<script>
    // After main.js loads, access via window
    const userProfile = await window.PRIMEMAR.PROFILE.getCurrentProfile();
    const balance = await window.PRIMEMAR.WALLET.getWalletBalance();
</script>
```

---

## 📚 Module Reference

### Authentication (`auth/auth.js`)
```javascript
AUTH.login(email, password)           // Email login
AUTH.signup(email, password, displayName, username)  // Register
AUTH.logout()                         // Logout
AUTH.resetPassword(email)             // Password reset
AUTH.isAuthenticated()                // Check logged in
AUTH.getCurrentUser()                 // Get user object
```

### Feed (`feed/posts.js`)
```javascript
FEED.getFeedPosts(limit, offset)      // Get posts
FEED.createPost(content, mediaUrl)    // Create post
FEED.deletePost(postId)               // Delete post
FEED.getUserPosts(userId, limit)      // Get user's posts
```

### Comments (`feed/comments.js`)
```javascript
COMMENTS.getComments(postId, limit)   // Get post comments
COMMENTS.addComment(postId, content)  // Comment on post
COMMENTS.deleteComment(commentId)     // Delete comment
```

### Reactions (`feed/reactions.js`)
```javascript
REACTIONS.likePost(postId)            // Like a post
REACTIONS.unlikePost(postId)          // Unlike a post
REACTIONS.hasLikedPost(postId)        // Check if liked
REACTIONS.getPostLikers(postId)       // Get who liked
```

### Profile (`profile/profile.js`)
```javascript
PROFILE.getProfile(userId)            // Get any profile
PROFILE.updateProfile(updates)        // Update own profile
PROFILE.searchProfiles(query)         // Search users
```

### Follow (`profile/follow.js`)
```javascript
FOLLOW.followUser(userId)             // Follow user
FOLLOW.unfollowUser(userId)           // Unfollow user
FOLLOW.isFollowing(userId)            // Check if following
FOLLOW.getFollowers(userId)           // Get followers
FOLLOW.getFollowing(userId)           // Get following list
```

### Verification (`profile/verification.js`)
```javascript
VERIFICATION.checkEligibility(userId) // Check if eligible
VERIFICATION.requestVerification()    // Start verification
VERIFICATION.getVerificationStatus()  // Check verified status
```

### Messaging (`messaging/messaging.js`)
```javascript
MESSAGING.getConversations()          // Get all chats
MESSAGING.loadConversation(userId)    // Load specific chat
MESSAGING.sendMessage(receiverId, content, mediaUrl)  // Send message
MESSAGING.markAsRead(messageId)       // Mark read
MESSAGING.subscribeToMessages(userId, callback)  // Real-time updates
MESSAGING.blockUser(userId)           // Block user
```

### Wallet (`wallet/wallet.js`)
```javascript
WALLET.getWalletBalance()             // Get SA balance
WALLET.addSA(amount, type, description)  // Add SA (with holds)
WALLET.convertSA(amount, currency)    // Convert SA to USD/NGN
WALLET.requestWithdrawal(amount, currency, method)  // Withdraw
WALLET.getTransactionHistory(limit)   // Transaction list
WALLET.subscribeToWalletChanges(callback)  // Real-time balance
```

### Boost (`wallet/boost.js`)
```javascript
BOOST.boostPost(postId)               // Boost a post
BOOST.getActiveBoosts(userId)         // Get active boosts
BOOST.getBoostHistory(limit)          // Boost history
BOOST.isPostBoosted(postId)           // Check if boosted
```

### Payments (`payments/payment-service.js`)
```javascript
PAYMENT_SERVICE.processVerificationPayment()  // Start verification payment
PAYMENT_SERVICE.processSubscriptionPayment()  // Start subscription payment
PAYMENT_SERVICE.verifyPayment(reference)      // Verify payment status
PAYMENT_SERVICE.completeVerification(reference)  // Mark as verified
PAYMENT_SERVICE.completeSubscription(reference)  // Activate subscription
```

### Storage (`storage/storage.js`)
```javascript
STORAGE.uploadFile(file, folder)      // Upload any file
STORAGE.uploadAvatar(file)            // Upload profile pic
STORAGE.deleteFile(filename)          // Delete file
STORAGE.getSignedUrl(filename)        // Get private URL
STORAGE.validateFile(file)            // Validate before upload
```

### Admin (`admin/admin.js`)
```javascript
ADMIN.getStatistics()                 // Platform stats
ADMIN.getUsers(limit, offset)         // List all users
ADMIN.getPendingVerifications()       // Verification queue
ADMIN.approveVerification(userId)     // Approve verification
ADMIN.getPendingWithdrawals()         // Withdrawal queue
ADMIN.approveWithdrawal(withdrawalId) // Approve withdrawal
ADMIN.getReports(status, limit)       // Get reports
ADMIN.resolveReport(reportId, action) // Resolve report
ADMIN.getActivityLog(limit)           // Admin action log
```

---

## 🔐 Security Patterns

### 1. **User Isolation** (RLS Policies)
```javascript
// Users can only access their own data
await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', currentUserId);  // Always filter by user_id
```

### 2. **Input Validation**
```javascript
if (!VALIDATION.validateEmail(email)) {
    throw new Error('Invalid email');
}
if (!VALIDATION.validateUsername(username)) {
    throw new Error('Emojis not allowed in username');
}
```

### 3. **Error Handling**
```javascript
try {
    const data = await supabase.from('posts').select();
} catch (error) {
    ERROR_HANDLER.handleSupabaseError(error);
    // Shows user-friendly message
}
```

### 4. **Admin Checks**
```javascript
const user = await AUTH.getCurrentUser();
if (user.email !== CONFIG.ADMIN.EMAIL) {
    throw new Error('Admin access required');
}
```

---

## 🚀 Common Workflows

### Create a Post
```javascript
const content = "Check out this amazing content! 🎉";
const post = await FEED.createPost(content);
ERROR_HANDLER.showSuccess('Post created!');
```

### Like a Post
```javascript
const liked = await REACTIONS.likePost(postId);
if (liked) {
    // Update UI to show liked state
}
```

### Follow a User
```javascript
const followed = await FOLLOW.followUser(userId);
if (followed) {
    // Update follow button
}
```

### Request Withdrawal
```javascript
try {
    const withdrawal = await WALLET.requestWithdrawal(100, 'USD', 'paystack');
    ERROR_HANDLER.showSuccess('Withdrawal pending approval');
} catch (error) {
    ERROR_HANDLER.showError(error.message);
}
```

### Send Message
```javascript
const message = await MESSAGING.sendMessage(recipientId, 'Hello!');
// Subscribe to new messages
MESSAGING.subscribeToMessages(recipientId, (newMessage) => {
    // Update chat UI with new message
});
```

---

## 🎨 Styling Guidelines

### Colors (from CSS variables)
```css
--primary: #7c3aed      /* Purple */
--secondary: #3b82f6    /* Blue */
--success: #10b981      /* Green */
--error: #ef4444        /* Red */
--warning: #f59e0b      /* Amber */
--background: #ffffff   /* White */
--text-primary: #1f2937 /* Dark gray */
```

### Responsive Breakpoints
```css
@media (max-width: 768px) {
    /* Tablet & Mobile */
}

@media (max-width: 480px) {
    /* Mobile only */
}
```

### Component Classes
```html
<!-- Buttons -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>

<!-- Cards -->
<div class="card">Content</div>

<!-- Forms -->
<input class="input" type="text" />
<textarea class="input"></textarea>

<!-- Modals -->
<div class="modal">
    <div class="modal-content">Content</div>
</div>
```

---

## 📊 Database Queries

### Get User Profile
```javascript
const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
```

### Get Feed Posts
```javascript
const { data: posts } = await supabase
    .from('posts')
    .select(`
        id, content, created_at,
        profiles(username, avatar_url)
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(20);
```

### Get Wallet with Balance
```javascript
const { data: wallet } = await supabase
    .from('wallets')
    .select('total_balance, available_balance, on_hold_balance')
    .eq('user_id', userId)
    .single();
```

---

## 🧪 Testing Examples

### Test Login
1. Navigate to `/login.html`
2. Enter valid email & password
3. Should redirect to `/feed.html`
4. Session should persist in localStorage

### Test Post Creation
1. Login to platform
2. Click "Create Post" on feed
3. Enter content and optional media
4. Click "Publish"
5. Post should appear at top of feed

### Test Withdrawal
1. Go to Wallet
2. Click "Withdraw"
3. Enter amount (min $5)
4. Select payment method
5. Check withdrawal appears in pending list

---

## 🐛 Debugging Tips

### Enable Console Logging
```javascript
// All Supabase operations log to console
console.log('Fetching posts...');
const posts = await FEED.getFeedPosts();
console.log('Posts:', posts);
```

### Check Stored Tokens
```javascript
// View auth tokens
console.log(localStorage.getItem('supabase.auth.token'));
```

### Monitor API Calls
```javascript
// Open DevTools Network tab to see all API requests
// Filter by "api" to see Supabase calls
```

### Validate Form Input
```javascript
// Before submitting forms, validate
if (!VALIDATION.validateEmail(email)) {
    console.error('Invalid email format');
}
```

---

## 📈 Performance Optimizations

1. **Pagination** - All lists use limit/offset
2. **Lazy Loading** - Images load as needed
3. **Caching** - Session data in localStorage
4. **Debouncing** - Search queries throttled
5. **Real-time** - Only subscribe when needed

---

## 🎓 Best Practices

1. ✅ Always validate input before API calls
2. ✅ Use try/catch for all async operations
3. ✅ Show error messages to users
4. ✅ Update UI optimistically
5. ✅ Check authentication before protected routes
6. ✅ Use CONFIG for all settings
7. ✅ Import only needed modules
8. ✅ Add null checks for database queries
9. ✅ Log errors but don't expose details to users
10. ✅ Test on mobile devices

---

## 📞 Troubleshooting

### "Supabase not initialized"
**Problem**: Supabase client not loaded
**Solution**: Ensure supabase.js is imported and SUPABASE_URL/KEY are in .env

### "User not authenticated"
**Problem**: No valid session
**Solution**: User must login via /login.html first

### "Insufficient balance"
**Problem**: Wallet doesn't have enough SA
**Solution**: Earn SA through engagement or check available vs on-hold balance

### "Payment verification failed"
**Problem**: Payment API returned error
**Solution**: Check payment gateway credentials in .env, verify webhook configured

### "Database connection error"
**Problem**: RLS policy blocking query
**Solution**: Ensure user_id is filtered in query, check RLS policies in SQL

---

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Paystack Integration](https://paystack.com/docs)
- [Flutterwave Integration](https://developer.flutterwave.com)
- [Vercel Deployment](https://vercel.com/docs)

---

## ✅ Checklist for Launch

- [ ] All .env variables set
- [ ] Database schema imported
- [ ] Payment credentials configured
- [ ] Admin email verified in settings
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Error monitoring setup
- [ ] Backup strategy implemented
- [ ] SSL/TLS enabled
- [ ] User data privacy verified

---

**PrimeMar Developer Guide v1.0**  
Last Updated: January 2026

For questions or updates, refer to README.md and IMPLEMENTATION_SUMMARY.md
