# GolfGives

A subscription-driven web platform with tracking, monthly prize draws, and charity fundraising.

## Live URLs

| | URL |
|---|---|
| Frontend | https://digital-heroes-4.vercel.app |
| Backend API | https://digital-heroes3.vercel.app |

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express (ESM) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT |
| Payments | Razorpay |
| Email | Nodemailer (Mailtrap for testing) |
| Deploy | Vercel |

## Payment Gateway Note

The PRD specifies Stripe as the payment provider. However, **Stripe is currently invite-only in India** and not immediately available for new accounts. **Razorpay** has been integrated as the alternative — it is PCI-DSS compliant and supports the same subscription and webhook functionality.

## Project Structure

```
backend/
  src/
    controllers/   — request handlers
    routes/        — URL definitions
    middleware/    — JWT auth guards
    services/      — draw engine, email
    validators/    — request validation rules
    lib/           — supabase client
  supabase/
    schema.sql     — DB schema, indexes, seed data

frontend/
  src/
    pages/         — all pages + admin panel
    components/    — Navbar, ConfirmDialog
    store/         — Zustand auth store
    lib/           — Axios API client
```

## Local Setup

**1. Database** — Run `backend/supabase/schema.sql` in Supabase SQL Editor

**2. Backend**
```bash
cd backend
cp .env.example .env   
npm install
npm run dev
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

See `backend/.env.example` for all required backend variables.

Set `VITE_API_URL` in frontend to the deployed backend URL for production.

## Admin Access

Register a user normally, then set `role = 'admin'` in Supabase → Table Editor → users. The user will be redirected to `/admin` on next login.

## API Endpoints

**Auth**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

**Scores** _(requires active subscription)_
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scores` | Get user's scores |
| POST | `/api/scores` | Add a score |
| PUT | `/api/scores/:id` | Edit a score |
| DELETE | `/api/scores/:id` | Delete a score |

**Subscriptions**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/subscriptions/create-order` | Create Razorpay order |
| POST | `/api/subscriptions/verify` | Verify payment and activate |
| POST | `/api/subscriptions/cancel` | Cancel subscription |
| GET | `/api/subscriptions/status` | Get subscription status |

**Charities** _(public)_
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/charities` | List charities (search, filter) |
| GET | `/api/charities/:id` | Charity detail |
| PUT | `/api/charities/select` | Select charity for user |

**Draws** _(public)_
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/draws` | List published draws |
| GET | `/api/draws/:id` | Draw detail with winners |
| GET | `/api/draws/my/results` | User's draw history |
| POST | `/api/draws/:id/upload-proof` | Upload winner proof |

**Admin** _(requires admin role)_
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | List users (paginated) |
| GET | `/api/admin/users/:id` | User detail |
| PUT | `/api/admin/users/:id` | Update user |
| GET | `/api/admin/draws` | List all draws |
| POST | `/api/admin/draws` | Create draw |
| POST | `/api/admin/draws/:id/simulate` | Simulate draw |
| POST | `/api/admin/draws/:id/run` | Run draw |
| POST | `/api/admin/draws/:id/publish` | Publish draw |
| POST | `/api/admin/charities` | Add charity |
| PUT | `/api/admin/charities/:id` | Edit charity |
| DELETE | `/api/admin/charities/:id` | Deactivate charity |
| GET | `/api/admin/winners` | List winners |
| PUT | `/api/admin/winners/:id/verify` | Approve or reject winner |
| PUT | `/api/admin/winners/:id/mark-paid` | Mark winner as paid |
| GET | `/api/admin/analytics` | Platform analytics |

**Webhooks**
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/webhooks/razorpay` | Razorpay event handler |

## Test Credentials (Razorpay)

- UPI: `success@razorpay` (instant success)
- Card: `5267 3181 8797 5449` · Expiry: any future date · CVV: `123` · OTP: `1234`
