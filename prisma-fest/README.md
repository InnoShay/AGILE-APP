# 🔥 PRISMA Fest 2025

> **The official digital management platform for SRM University Sonepat's annual fest.**

Built with editorial brutalism meets luxury event branding. A world-class, production-grade application.

---

## 🎨 Design Identity

**Theme: "Neon Ink on Black Stone"**

| Token | Color | Usage |
|-------|-------|-------|
| Obsidian Black | `#0A0A0F` | Base background |
| Electric Crimson | `#FF2442` | Primary accent |
| Pure Ivory | `#F5F0E8` | Text |
| Muted Gold | `#C9A84C` | Premium/highlight states |
| Dark Teal | `#0D3B38` | Secondary surfaces |

**Typography:**
- **Bebas Neue** — Display headings (massive, all-caps)
- **DM Mono** — Data, stats, metadata
- **Fraunces** — Italic serif for taglines
- **Inter** — Body text

---

## 🏗️ Architecture

```
/prisma-fest
├── /client                 React 18 + TypeScript + Vite
│   └── /src
│       ├── /components     Reusable UI (Button, Modal, Skeleton, etc.)
│       ├── /pages          20 route-level page components
│       ├── /hooks          useSocket, useCountdown, useDebounce
│       ├── /services       Axios API client + all service functions
│       ├── /store          Zustand (auth + UI state)
│       └── /components/layout  Navbar, Sidebar, DashboardLayout
├── /server                 Node.js + Express + TypeScript
│   └── /src
│       ├── /controllers    Route handler logic (10 controllers)
│       ├── /routes         Express router files
│       ├── /middleware      Auth, roles, validation, error handler
│       ├── /services       Stripe, Cloudinary, Socket.io, QR Code
│       └── /utils          JWT, Redis, Logger, Email, AppError
├── /shared                 Zod schemas shared by client + server
├── /prisma                 Schema + migrations + seed
├── docker-compose.yml      PostgreSQL 15 + Redis 7
└── .env.example            All required environment variables
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- npm or yarn

### 1. Clone and Setup

```bash
cd prisma-fest

# Copy environment variables
cp .env.example .env
# Edit .env with your API keys (Stripe, Cloudinary, SMTP, etc.)

# Start databases
docker-compose up -d

# Install all dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

### 2. Run Development Servers

```bash
# From root — runs both client and server
npm run dev

# Or separately:
cd server && npm run dev   # Backend on :4000
cd client && npm run dev   # Frontend on :5173
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000/api
- **Prisma Studio:** `npm run db:studio`

---

## 🔑 Default Login Credentials

All seeded users have the password: `Password123`

| Role | Email |
|------|-------|
| **Admin** | admin@prismafest.com |
| **Organizer** | riya@prismafest.com |
| **Organizer** | arjun@prismafest.com |
| **Student** | student1@prismafest.com ... student10@prismafest.com |

---

## 📱 All 20 Screens

### Public
1. **Landing Page** `/` — Hero, countdown, marquee, featured events, sponsors
2. **Login** `/login` — Split-screen with brand visual
3. **Register** `/register` — Password strength indicator, Zod validation
4. **Forgot Password** `/forgot-password`
5. **Reset Password** `/reset-password/:token`

### Student Dashboard
6. **Dashboard Home** `/dashboard` — Stats, upcoming events, quick actions
7. **Events Browser** `/events` — Search, filter, sort, grid display
8. **Event Detail** `/events/:id` — Registration modal, Stripe, feedback
9. **My Tickets** `/tickets` — QR code display, check-in status
10. **Notifications** `/notifications` — Real-time, mark-all-read
11. **Schedule** `/schedule` — Day tabs, timeline, stage filters
12. **Profile** `/profile` — Avatar upload, edit info, change password

### Organizer
13. **Organizer Dashboard** `/organizer` — Recharts analytics, events table
14. **Create Event** `/organizer/events/new` — 5-step multi-part form
15. **Manage Event** `/organizer/events/:id` — Registrations, check-in, analytics

### Admin
16. **Admin Dashboard** `/admin` — Platform-wide analytics, system health
17. **Manage Users** `/admin/users` — Role management, ban/unban
18. **Manage Events** `/admin/events` — Approve, cancel events
19. **Announcements** `/admin/announcements` — Create/delete, Socket.io broadcast
20. **Sponsors** `/admin/sponsors` — Add/remove, tier assignment

---

## 🔌 API Routes

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password/:token
GET    /api/auth/verify-email/:token
```

### Users
```
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
POST   /api/users/me/avatar
GET    /api/users/:id         (admin)
GET    /api/users              (admin)
PATCH  /api/users/:id/role     (admin)
PATCH  /api/users/:id/ban      (admin)
```

### Events
```
GET    /api/events             (public, filters/search/sort/pagination)
GET    /api/events/:id         (public)
POST   /api/events             (organizer)
PUT    /api/events/:id         (organizer/admin)
DELETE /api/events/:id         (organizer/admin)
PATCH  /api/events/:id/cancel
GET    /api/events/:id/registrations  (organizer/admin)
```

### Registrations, Notifications, Schedule, Feedback, Announcements, Sponsors, Analytics
See full API documentation in route files.

---

## 🔒 Security

- JWT access tokens (15min) + refresh token rotation (7 days, httpOnly cookie)
- Role-based access control: `requireRole('admin')`, `requireRole('organizer')`
- Rate limiting: 10 req/15min on auth, 100 req/min general
- Helmet.js security headers
- CORS restricted to frontend origin
- Stripe webhook signature verification
- QR codes contain signed JWT (not raw IDs)
- Refresh tokens stored/validated in Redis

---

## ⚡ Real-Time (Socket.io)

- `announcement:new` — Broadcast to all users
- `event:cancelled` — Notify registered users
- `registration:checkin` — Live check-in count updates
- `notification:new` — User-specific notifications
- `liveCount:update` — Live visitor count (every 30s via Redis)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Animation | Framer Motion |
| State | Zustand, TanStack Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL 15 (Prisma ORM) |
| Cache | Redis 7 |
| Auth | JWT (access + refresh rotation) |
| Payments | Stripe (test mode) |
| Uploads | Cloudinary |
| Email | Nodemailer |
| Real-time | Socket.io |
| Icons | Lucide React |

---

## 📄 License

MIT — Built for PRISMA Fest, SRM University Sonepat.
