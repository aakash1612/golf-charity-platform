# GolfGives — Golf Charity Subscription Platform

##  Project Link : https://golfcharit.netlify.app/

## Features

### For Players
- Subscribe monthly (£9.99) or yearly (£99.99)
- Track last 5 Stableford scores (1–45 range)
- Auto-enter monthly prize draws
- Choose a charity and set contribution percentage (min 10%)
- View winnings history and payment status

### Draw System
- Monthly automated draws on the 1st of each month
- Random or algorithmic (weighted frequency) draw modes
- 3 prize tiers — 5-match (40%), 4-match (35%), 3-match (25%)
- Jackpot rolls over to next month if unclaimed
- Pre-publish simulation mode for admins

### Charity System
- Directory of charities with search and category filter
- Featured charity spotlight on homepage
- Per-user charity selection with adjustable contribution %
- Charity event listings on individual profiles

### Admin Panel
- User management — view, edit, delete, override subscription status
- Draw management — configure, simulate, publish
- Charity management — add, edit, feature, deactivate
- Winner verification — approve proof uploads, mark payouts as paid
- Analytics dashboard — subscribers, revenue, charity contributions, pool totals

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Payments | Stripe (Checkout, Webhooks, Billing Portal) |
| Scheduling | node-cron |
| Email | Nodemailer |
| Deployment | Netlify (frontend), Render (backend), MongoDB Atlas (DB) |

---

## Project Structure

```
golf-charity-platform/
├── backend/
│   ├── models/
│   │   ├── User.js          # Auth, subscription, charity, winnings
│   │   ├── Score.js         # Rolling 5-score system
│   │   ├── Charity.js       # Charity directory with events
│   │   └── Draw.js          # Draw results, prize pool, winners
│   ├── routes/
│   │   ├── auth.js          # Register, login, profile
│   │   ├── scores.js        # Score CRUD (rolling 5 enforced)
│   │   ├── subscriptions.js # Stripe checkout, cancel, portal
│   │   ├── webhook.js       # Stripe webhook handler
│   │   ├── draws.js         # Draw listing, simulate, publish
│   │   ├── charities.js     # Charity directory CRUD
│   │   ├── winners.js       # Proof upload, verify, mark paid
│   │   └── admin.js         # Stats, user management
│   ├── middleware/
│   │   └── auth.js          # JWT protect, adminOnly, subscriberOnly
│   ├── services/
│   │   ├── drawEngine.js    # Random + algorithmic draw logic
│   │   └── cronJobs.js      # Monthly auto-draw scheduler
│   ├── scripts/
│   │   ├── seedAdmin.js     # Creates first admin user
│   │   └── seedCharities.js # Populates charity directory
│   ├── server.js
│   └── package.json
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Global auth state
        ├── utils/
        │   └── api.js            # Axios + JWT injection
        ├── components/
        │   ├── Navbar.jsx
        │   └── Footer.jsx
        └── pages/
            ├── HomePage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── PricingPage.jsx
            ├── DashboardPage.jsx
            ├── ScoresPage.jsx
            ├── CharitiesPage.jsx
            ├── CharityDetailPage.jsx
            ├── DrawsPage.jsx
            ├── WinnersPage.jsx
            ├── NotFoundPage.jsx
            └── admin/
                ├── AdminLayout.jsx
                ├── AdminDashboard.jsx
                ├── AdminUsers.jsx
                ├── AdminDraws.jsx
                ├── AdminCharities.jsx
                └── AdminWinners.jsx
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- MongoDB (local) or MongoDB Atlas account
- Stripe account
- Stripe CLI

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/golf-charity-platform.git
cd golf-charity-platform
```

### 2. Install dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configure environment variables

**Backend — create `backend/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/golf-charity
JWT_SECRET=your_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_MONTHLY_PRICE_ID=price_xxx
STRIPE_YEARLY_PRICE_ID=price_xxx
MONTHLY_PRICE=9.99
YEARLY_PRICE=99.99
POOL_CONTRIBUTION_MONTHLY=5
POOL_CONTRIBUTION_YEARLY=50
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=GolfGives <your@gmail.com>
```

**Frontend — create `frontend/.env`:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### 4. Seed the database
```bash
cd backend
node scripts/seedAdmin.js
node scripts/seedCharities.js
```

### 5. Run the development servers

Open 3 separate terminals:

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev

# Terminal 3 — Stripe webhook listener
stripe listen --forward-to localhost:5000/webhook
```

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:5000/api**

---

## Default Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@golfgives.com | Admin1234! |


---



## Test Checklist

- [ ] Register new user → redirected to /pricing
- [ ] Subscribe monthly → Stripe checkout → dashboard shows Active
- [ ] Subscribe yearly → Stripe checkout → dashboard shows Active
- [ ] Add 5 scores → 6th score replaces oldest automatically
- [ ] Edit and delete a score
- [ ] Select a charity → shows on dashboard
- [ ] Admin login → redirected to /admin
- [ ] Admin → Draws → Simulate → numbers and winners appear
- [ ] Admin → Draws → Publish → winner records created
- [ ] Admin → Winners → approve proof → mark as paid
- [ ] Admin → Charities → add / edit / feature a charity
- [ ] Admin → Users → edit user details and scores
- [ ] Cancel subscription → Stripe billing portal opens
- [ ] Mobile responsive on all pages

---

## API Reference

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login | Public |
| GET | /api/auth/me | Get current user | Required |
| PUT | /api/auth/profile | Update profile | Required |

### Scores
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/scores/mine | Get my scores | Subscriber |
| POST | /api/scores | Add new score | Subscriber |
| PUT | /api/scores/:index | Edit score by position | Subscriber |
| DELETE | /api/scores/:index | Delete score | Subscriber |

### Subscriptions
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/subscriptions/create-checkout | Start Stripe checkout | Required |
| POST | /api/subscriptions/cancel | Cancel at period end | Required |
| POST | /api/subscriptions/reactivate | Undo cancellation | Required |
| GET | /api/subscriptions/portal | Open billing portal | Required |

### Draws
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/draws | List published draws | Public |
| GET | /api/draws/current | Current month draw | Public |
| GET | /api/draws/pool-estimate | Prize pool estimate | Required |
| GET | /api/draws/my-entries | My draw entries | Required |
| POST | /api/draws/admin/simulate | Simulate draw | Admin |
| POST | /api/draws/admin/publish | Publish draw | Admin |

### Charities
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | /api/charities | List charities | Public |
| GET | /api/charities/:id | Single charity | Public |
| POST | /api/charities | Create charity | Admin |
| PUT | /api/charities/:id | Update charity | Admin |
| DELETE | /api/charities/:id | Deactivate charity | Admin |

---

## Prize Pool Logic

| Match | Pool Share | Rollover |
|---|---|---|
| 5 numbers matched | 40% | Yes — jackpot carries to next month |
| 4 numbers matched | 35% | No — split equally among winners |
| 3 numbers matched | 25% | No — split equally among winners |

---

## Built By

Akash Varshney

