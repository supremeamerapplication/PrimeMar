# PrimeMar - Comprehensive Setup Guide

## Overview
PrimeMar is a production-ready social media platform built with HTML, CSS, Vanilla JavaScript, Supabase, Paystack, and Flutterwave.

## Quick Start

### 1. Prerequisites
- Node.js 16+ and npm
- Supabase account (https://supabase.com)
- Paystack account (https://paystack.com)
- Flutterwave account (https://flutterwave.com)
- Vercel account for deployment (https://vercel.com)

### 2. Installation

```bash
# Clone repository
git clone <repository-url>
cd primemar

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your credentials
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Go to SQL Editor and run `sql/schema.sql` to create tables
3. Configure authentication (Email/Password, Google, GitHub)
4. Create a storage bucket named "media"
5. Copy your Supabase URL and ANON_KEY to .env

### 4. Payment Gateway Setup

#### Paystack
1. Get PUBLIC_KEY and SECRET_KEY from dashboard
2. Add to .env file
3. Set webhook URL in dashboard

#### Flutterwave
1. Get PUBLIC_KEY and SECRET_KEY from dashboard
2. Add to .env file
3. Configure webhook for transaction verification

### 5. Development

```bash
npm run dev
# Server runs at http://localhost:5173
```

### 6. Build & Deploy

```bash
npm run build

# Deploy to Vercel
vercel
```

## Project Structure

```
primemar/
├── public/           # Static HTML pages
│   ├── index.html
│   ├── login.html
│   ├── feed.html
│   └── ...
├── css/              # Stylesheets
├── js/               # JavaScript modules
│   ├── config/       # Configuration files
│   ├── auth/         # Authentication
│   ├── feed/         # Feed functionality
│   ├── profile/      # Profile management
│   ├── messaging/    # Real-time messaging
│   ├── wallet/       # Wallet & SA economy
│   ├── payments/     # Payment processing
│   ├── admin/        # Admin dashboard
│   ├── storage/      # File storage
│   └── utils/        # Utilities
├── server/           # Server functions
├── sql/              # Database schema
├── tests/            # Test suites
└── vercel.json       # Vercel configuration
```

## Features Implemented

### User Management
- ✅ Authentication (Email/Password, Social Login)
- ✅ Profile management
- ✅ User follow/unfollow
- ✅ Verification badge system

### Content
- ✅ Create, edit, delete posts (Connects)
- ✅ Comments and replies
- ✅ Likes and reactions
- ✅ Media uploads (images, videos)

### Messaging
- ✅ One-to-one real-time chat
- ✅ File sharing
- ✅ Typing indicators
- ✅ Read receipts

### SA Economy
- ✅ SA earning from engagement
- ✅ Subscription tiers
- ✅ Daily earning limits
- ✅ SA hold system

### Monetization
- ✅ Conversion (SA → USD/NGN)
- ✅ Withdrawals (Paystack, Flutterwave)
- ✅ Verification fee payment
- ✅ Subscription payment

### Boost System
- ✅ Boost posts for visibility
- ✅ 24-hour boost duration
- ✅ SA distribution
- ✅ Boost history

### Admin Dashboard
- ✅ User management
- ✅ Verification approvals
- ✅ Withdrawal reviews
- ✅ SA reserve management
- ✅ Analytics and reporting

### Security
- ✅ Row-level security (RLS)
- ✅ Anti-fraud detection
- ✅ Trust scoring system
- ✅ Rate limiting
- ✅ Data encryption

## Configuration

### SA Economy Constants
```javascript
CONFIG.SA.USD_RATE = 100        // 1 USD = 100 SA
CONFIG.SA.NGN_RATE = 144000     // 1 USD = 144,000 NGN
CONFIG.WITHDRAWAL.MINIMUM = 5   // Minimum $5 withdrawal
CONFIG.BOOST_COST = 100         // Boost costs 100 SA
```

### Withdrawal Cooldowns
- First withdrawal: 72 hours
- Normal user: 48 hours
- Verified creator: 24 hours
- Amount ≥ $100: +48 hours

### Daily Caps
- Normal user: $50/day
- Verified creator: $300/day

## Database

All data is stored in Supabase PostgreSQL with RLS policies enabled.

Key tables:
- users
- profiles
- posts
- comments
- messages
- wallets
- transactions
- withdrawals
- subscriptions
- boosts
- sa_reserve

## API Integration

### Supabase Realtime
- Real-time messaging
- Live notifications
- Presence tracking

### Payment Webhooks
- Paystack payment confirmation
- Flutterwave transaction verification
- Automatic wallet updates

## Testing

```bash
npm run test           # Run all tests
npm run test:unit     # Unit tests
npm run test:e2e      # End-to-end tests
```

## Troubleshooting

### Supabase Connection Issues
- Verify SUPABASE_URL and SUPABASE_KEY
- Check firewall and CORS settings
- Ensure storage bucket exists

### Payment Processing
- Verify API keys are correct
- Check webhook endpoints
- Review payment logs in gateway dashboard

### Real-time Issues
- Check Supabase connection
- Verify RLS policies
- Enable realtime in table settings

## Security Checklist

- [ ] Change all default credentials
- [ ] Enable email verification
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable 2FA for admin
- [ ] Review RLS policies
- [ ] Set up monitoring/alerts
- [ ] Regular backups enabled
- [ ] HTTPS enabled
- [ ] Environment variables secured

## Support & Resources

- Supabase Docs: https://supabase.com/docs
- Paystack Docs: https://paystack.com/docs
- Flutterwave Docs: https://developer.flutterwave.com
- Vercel Docs: https://vercel.com/docs

## License

MIT License - See LICENSE file for details

## Contributing

Pull requests welcome! Please follow code standards and include tests.

---

**PrimeMar v1.0.0** - Built with ❤️ for the community
