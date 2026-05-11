# RaamatuPood – Modern E-Commerce Bookstore Platform

A production-ready online bookstore application built with cutting-edge web technologies. Features a public catalog, user authentication, shopping cart, secure checkout with Stripe payments, and a comprehensive admin dashboard.

**Status:** Active Development | **Node.js:** 20+ | **License:** Internal

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Testing Strategy](#testing-strategy)
- [Security](#security)
- [Database](#database)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Technical Debt & Roadmap](#technical-debt--roadmap)
- [Contributing](#contributing)

---

## Project Overview

**RaamatuPood** is a full-featured e-commerce platform for selling books online. It combines:

- **Public-facing catalog** with search, filtering, and sorting
- **User authentication** via Auth0 with session management
- **Shopping cart** with persistent state synchronization
- **Secure checkout** with Stripe payment processing
- **User accounts** with order history and profile management
- **Admin panel** for managing inventory, categories, authors, and orders
- **Multi-language support** (English & Estonian)
- **Responsive design** with Tailwind CSS

The project emphasizes security (rate limiting, bot detection, brute-force protection), performance (server components, optimized queries), and maintainability (TypeScript, modular architecture, comprehensive testing).

### Target Users

- **End users:** Browse and purchase books online
- **Admin users:** Manage inventory and orders
- **Business:** Generate e-commerce revenue with low operational overhead

---

## Tech Stack

### Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | Full-stack framework with SSR/SSG |
| **UI Library** | React | 19.2.3 | Component-based UI with server/client separation |
| **Language** | TypeScript | 5 | Type-safe development |
| **Styling** | Tailwind CSS | 4 | Utility-first CSS framework |
| **State Management** | Zustand | 5.0.12 | Lightweight client-side state (cart, UI) |
| **Component Testing** | React Testing Library | 16.3.2 | User-centric component testing |
| **E2E Testing** | Playwright | 1.59.1 | Cross-browser end-to-end testing |

### Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 16.1.6 | API routes, server components, middleware |
| **Language** | TypeScript | 5 | Type-safe backend logic |
| **Database** | MySQL | 5.7+ / 8.0+ | Relational data storage |
| **ORM** | Prisma | 5.22.0 | Type-safe database access |
| **Validation** | Zod | 4.3.6 | Schema validation for API requests |
| **Authentication** | Auth0 | 4.16.0 | OAuth 2.0 / OIDC identity provider |
| **Payments** | Stripe | 20.4.1 | Payment processing and webhooks |

### Development Tools

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Testing** | Jest | 30.3.0 | Unit and integration testing |
| **Linting** | ESLint | 9 | Code quality and style enforcement |
| **Package Manager** | npm/pnpm/yarn | Latest | Dependency management |

---

## Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────┐
│        Next.js App Router           │
│   (Server Components & Middleware)  │
├─────────────────────────────────────┤
│  API Routes  │  Server Components   │  Client Components
│  /api/*      │  async pages         │  (React 19)
│              │  Server Actions      │
├─────────────────────────────────────┤
│  Security Layer (Middleware)        │
│  - Rate Limiting                    │
│  - Bot Detection                    │
│  - Brute Force Protection           │
│  - Security Headers                 │
├─────────────────────────────────────┤
│         Business Logic (lib/)       │
│  - Auth Flow  - Checkout Logic      │
│  - DB Safety  - API Guards          │
├─────────────────────────────────────┤
│  Data Layer (Prisma + MySQL)        │
│  - Models: Users, Books, Orders,    │
│    Cart Items, Reviews, Addresses   │
└─────────────────────────────────────┘
```

### Key Architecture Decisions

#### 1. **Server-First with Strategic Client Components**
- Most pages are server components by default (zero JS overhead)
- Client components used only where interactivity is needed (cart, filters, search)
- Clear separation with `'use client'` boundary

#### 2. **Security-First Design**
- Middleware layer applies rate limiting, bot detection, and security headers to all requests
- API routes wrapped with `withApiSecurity()` for consistent protection
- Brute-force protection on login attempts
- Request throttling and payload validation

#### 3. **Database Safety**
- All Prisma queries wrapped with `withPrismaProtection()` for timeout handling
- Graceful degradation when DB is unavailable
- Transactions for critical operations (checkout)

#### 4. **Dual Cart State Management**
- **Zustand store** (`stores/cartStore.ts`): Persistent client-side cart
- **React Context** (`contexts/CartContext.tsx`): Legacy fallback
- **Session sync**: Cart items synced to DB via `/api/sync-user` after login

#### 5. **Auth Flow**
1. User starts login at `/auth/login`
2. Auth0 redirects to `/auth/callback`
3. Session created, user synced to DB
4. Cart items synced from session to database
5. Redirect to original page or home

---

## Features

### Public Features

- [x] **Book Catalog**
  - Browse books by category
  - Search by title or author
  - Filter by category
  - Sort by popularity, price, or rating
  - View detailed product pages with reviews

- [x] **Shopping Cart**
  - Add/remove items
  - Update quantities
  - Persistent cart across sessions
  - Real-time total calculation
  - Cart sync on login (session → database)

- [x] **Checkout**
  - Address entry (street, postal code, city, country)
  - Shipping method selection (multiple carriers)
  - Stripe payment processing
  - Order creation and confirmation

- [x] **User Authentication**
  - Login via Auth0
  - Profile setup after first login
  - Email verification flow
  - Session management

- [x] **User Account**
  - View profile and order history
  - Avatar upload

- [x] **Reviews**
  - Read and submit product reviews
  - Star ratings

- [x] **Localization**
  - English (en) and Estonian (et) support
  - Language switcher in header

- [x] **Responsive Design**
  - Mobile-first approach
  - Touch-friendly UI
  - Optimized images

### Admin Features

- [x] **Book Management**
- [x] **Category Management**
- [x] **Author Management**
- [x] **Order Management**
- [x] **Dashboard**

---

## Getting Started

### Prerequisites

- **Node.js** 20 or later
- **npm**, **pnpm**, or **yarn**
- **MySQL** 5.7+ or 8.0+ (local or remote)
- **Stripe account** (for payments)
- **Auth0 tenant** (for authentication)

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd RaamatuPood

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```bash
cp .env .env.local
```

Then update `.env.local` with your actual values (see [Environment Variables](#environment-variables) section below).

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate dev

# (Optional) Seed test data
npm run db:seed-users
```

### 4. Development Server

```bash
npm run dev
```

Opens http://localhost:3000

### 5. Verify Setup

- [ ] Home page loads without DB errors
- [ ] Catalog page shows books
- [ ] Login flow works (redirects to Auth0)
- [ ] Cart functionality works
- [ ] Admin panel accessible to admins

---

## Environment Variables

All variables should be in `.env.local` (gitignored). The `.env` file shows defaults/examples.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| **Core** | | | |
| `APP_BASE_URL` | Yes | Application base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Public-facing site URL | `http://localhost:3000` |
| | | | |
| **Database** | | | |
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://user:pass@localhost:3306/book_store` |
| | | | |
| **Auth0** | | | |
| `AUTH0_SECRET` | Yes | 32+ character secret | (generate with `openssl rand -hex 32`) |
| `AUTH0_BASE_URL` | Yes | Auth0 callback base URL | `http://localhost:3000` |
| `AUTH0_ISSUER_BASE_URL` | Yes | Auth0 tenant domain | `https://your-tenant.auth0.com` |
| `AUTH0_CLIENT_ID` | Yes | Auth0 application ID | (from Auth0 dashboard) |
| `AUTH0_CLIENT_SECRET` | Yes | Auth0 application secret | (from Auth0 dashboard) |
| `AUTH0_DOMAIN` | No | Auth0 domain (alternative) | `your-tenant.auth0.com` |
| `AUTH0_SCOPE` | No | OAuth scopes | `openid profile email` |
| `AUTH0_MANAGEMENT_DOMAIN` | Yes | Auth0 Management API domain | `your-tenant.auth0.com` |
| `AUTH0_MANAGEMENT_CLIENT_ID` | Yes | M2M application ID | (from Auth0 dashboard) |
| `AUTH0_MANAGEMENT_CLIENT_SECRET` | Yes | M2M application secret | (from Auth0 dashboard) |
| | | | |
| **Stripe** | | | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Public Stripe key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Yes | Secret Stripe key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret | `whsec_...` |
| | | | |
| **Storage** | | | |
| `STORAGE_UPLOAD_ENDPOINT` | No | External file upload service URL | `https://upload-api.example.com` |

### Generating Auth0 Secret

```bash
openssl rand -hex 32
```

---

## Available Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| **Development** | | |
| `dev` | `next dev` | Start development server (hot reload) |
| | | |
| **Production** | | |
| `build` | `next build` | Build for production |
| `start` | `next start` | Start production server |
| | | |
| **Code Quality** | | |
| `lint` | `eslint` | Run ESLint |
| | | |
| **Testing** | | |
| `test` | `jest` | Run tests once |
| `test:ci` | `jest --runInBand` | Run tests serially (for CI/CD) |
| `test:coverage` | `jest --coverage` | Run tests and generate coverage report |
| | | |
| **Database** | | |
| `db:init` | `node scripts/initDb.js` | Initialize database |
| `db:seed-users` | `node scripts/seedUsers.js` | Seed test users |

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

**Location:** `tests/unit/`  
**Coverage:** Core logic (cart, checkout, security)  
**Current Status:** 3 test suites, 8 tests, ~3% coverage (actively expanding)

#### Running Unit Tests

```bash
# Run all tests
npm run test

# Run with coverage report
npm run test:coverage

# Watch mode
npm run test -- --watch
```

#### Test Examples

- **Cart Context** (`tests/unit/contexts/CartContext.test.tsx`)
- **Prisma Protection** (`tests/unit/lib/security/prisma.test.ts`)
- **Checkout Flow** (`tests/unit/lib/checkout/createCheckout.test.ts`)

### Coverage Goals

| Layer | Current | Target |
|-------|---------|--------|
| Core logic (lib/) | 3% | 80%+ |
| Context/Hooks | 94% | 95%+ |
| Components | <1% | 50%+ |
| API Routes | 0% | 60%+ |
| Pages | 0% | 40%+ |

---

## Security

### Security Architecture

RaamatuPood implements defense-in-depth with multiple security layers:

#### 1. **Middleware (Request-Level)**

File: `middleware.ts`

- **Rate Limiting:** Per-IP request throttling
- **Bot Detection:** Blocks known user-agents
- **Brute-Force Protection:** Tracks failed login attempts
- **Email Flow Guard:** Restricts unauthenticated access
- **Early Blocking:** Fails fast for invalid requests

#### 2. **API Guard (Handler-Level)**

File: `lib/security/api-guard.ts`

- **Request Validation:** Payload size limits and JSON injection detection
- **Rate Limiting:** Per-user and per-IP limits
- **CAPTCHA Verification:** Optional for sensitive endpoints
- **Security Headers:** Logs request details for monitoring

#### 3. **Database Safety**

File: `lib/security/prisma.ts`

- **Query Timeouts:** All Prisma operations wrapped with 8-second timeout
- **Graceful Degradation:** Returns empty results on timeout
- **Connection Pooling:** Prevents connection exhaustion

#### 4. **Authentication**

File: `lib/auth/` and `app/auth/`

- **Auth0 Integration:** OAuth 2.0 / OIDC
- **Session Management:** Secure, HTTP-only cookies
- **Brute-Force Detection:** Login attempt tracking
- **Email Verification:** Required before activation
- **Profile Setup:** Ensures complete user data before checkout

#### 5. **Authorization**

File: `lib/admin/guard.ts`

- **Role-Based Access:** USER vs. ADMIN roles
- **Admin Middleware:** Validates user role before operations

#### 6. **Input Validation**

File: `lib/api/` and handlers

- **Zod Schemas:** Strict schema validation
- **Injection Prevention:** Blocks dangerous object keys
- **Type Safety:** Full TypeScript coverage

#### 7. **Payment Security**

File: `lib/checkout/createCheckout.ts`

- **Stripe Server-Side:** All payment processing server-side
- **Transaction Safety:** Atomic order creation

### Pre-Deployment Security Checklist

- [ ] All environment secrets are set correctly
- [ ] HTTPS enabled in production
- [ ] Auth0 callback URLs point to production domain
- [ ] Stripe keys are production keys
- [ ] Rate limit thresholds are appropriate
- [ ] CORS origins are restricted
- [ ] Database backups are automated
- [ ] Error logs don't leak sensitive data
- [ ] GDPR/privacy policy is in place (if applicable)

---

## Database

### Schema Overview

**Database:** MySQL 5.7+ or 8.0+  
**ORM:** Prisma 5.22.0

#### **Core Models**
- **Users**: Auth0 integration, role-based access, profile data
- **Books**: Title, price, stock, rating, category, authors (many-to-many)
- **Authors**: Name and book associations
- **Categories**: Book grouping
- **Cart Items**: User's shopping cart
- **Orders**: Order data, total price, status, Stripe payment ID
- **Order Items**: Line items in an order (snapshot of book data at purchase time)
- **Reviews**: User ratings and comments on books
- **Addresses**: Billing/shipping addresses
- **Shipping Methods**: Available delivery options

### Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <description>

# Apply pending migrations
npx prisma migrate deploy

# View migration status
npx prisma migrate status
```

### Prisma Studio

Interactive database browser:

```bash
npx prisma studio
```

Opens http://localhost:5555 with full CRUD interface.

---

## API Documentation

### Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://yourdomain.com/api`

### Authentication

Most endpoints require a valid Auth0 session cookie (`appSession`).

### Key Endpoints

#### **Books**
```http
GET /api/books?page=1&limit=10&sort=rating
```

#### **Cart**
```http
POST /api/cart
PATCH /api/cart
DELETE /api/cart/[bookId]
```

#### **Checkout**
```http
POST /api/checkout
```

#### **Orders**
```http
GET /api/orders
```

#### **Admin: Books**
```http
POST /api/admin/books
PATCH /api/admin/books/[id]
DELETE /api/admin/books/[id]
```

**All `/api/admin/*` requests require ADMIN role.**

---

## Deployment

### Pre-Deployment Checklist

- [ ] TypeScript compiles cleanly: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Tests pass: `npm run test:ci`
- [ ] All secrets configured in platform environment
- [ ] Database migrations ready: `npx prisma migrate deploy`
- [ ] Auth0 production tenant configured
- [ ] Stripe production keys configured
- [ ] HTTPS enforced
- [ ] Error monitoring (e.g., Sentry) configured

### Build Process

```bash
# Build production bundle
npm run build
```

Outputs to `.next/` directory.

### Running Production

```bash
npm run start
```

### Recommended Hosting

- **Vercel** (Recommended): Built for Next.js
- **Netlify**: Good support, serverless functions
- **Railway/Render**: Easy database integration
- **Traditional VPS** (AWS EC2, DigitalOcean, Linode): More control

### Environment Setup on Hosting

Set environment variables in your hosting platform's dashboard.

**Do not commit `.env.local` to git.**

### Database in Production

**Option 1: Managed Service** (Recommended)
- AWS RDS (MySQL)
- Azure Database for MySQL
- PlanetScale (MySQL-compatible)

**Option 2: Self-Hosted**
- Docker + MySQL container
- VPS with MySQL

---

## Project Structure

```
RaamatuPood/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   ├── catalog/                  # Book catalog pages
│   ├── checkout/                 # Checkout page
│   ├── account/                  # User account area
│   ├── admin/                    # Admin dashboard
│   ├── auth/                     # Auth flows
│   └── [other pages]/            # Static pages
├── components/                   # Reusable React components
│   ├── admin/                    # Admin components
│   ├── account/                  # Account components
│   └── ui/                       # Base UI components
├── contexts/                     # React Context
│   └── CartContext.tsx
├── hooks/                        # Custom React hooks
│   └── useTranslation.ts
├── lib/                          # Business logic & utilities
│   ├── auth/                     # Auth utilities
│   ├── cart/                     # Cart logic
│   ├── checkout/                 # Checkout orchestration
│   ├── security/                 # Security utilities
│   ├── i18n/                     # Localization
│   ├── api/                      # API types
│   └── storage/                  # File uploads
├── stores/                       # Zustand stores
│   └── cartStore.ts
├── locales/                      # Translation files
│   ├── en.json
│   └── et.json
├── prisma/                       # Database schema
│   ├── schema.prisma
│   └── migrations/
├── public/                       # Static assets
├── tests/                        # Test suites
│   └── unit/
├── scripts/                      # Utility scripts
├── middleware.ts                 # Next.js middleware
├── jest.config.ts                # Jest configuration
├── jest.setup.ts                 # Jest setup
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── eslint.config.mjs             # ESLint configuration
├── tailwind.config.mjs           # Tailwind configuration
└── package.json                  # Dependencies
```

---

## Technical Debt & Roadmap

### Known Issues

#### Low Test Coverage

**Status:** In-progress  
**Impact:** Medium

- Currently **3.27%** statement coverage
- Focus on core modules first (security, checkout, cart)

**Mitigation:**
```bash
npm run test:coverage  # See coverage report
```

#### ESLint Warnings

**Status:** Known  
**Impact:** Low (warnings, not errors)

- 22 active warnings (mostly image optimization, unused variables)
- Won't block deployment

#### Database Dependency

**Status:** Mitigated  
**Impact:** Low (graceful degradation)

- Home page and critical paths protected with `withPrismaProtection`
- Proper error handling in place

### Roadmap

#### Q1-Q2 2024
- [ ] Expand test coverage to 50%
  - [ ] Add integration tests for API routes
  - [ ] Add E2E tests with Playwright
  - [ ] Cover admin endpoints
- [ ] Reduce ESLint warnings to <5
- [ ] Document API with OpenAPI/Swagger

#### Q2-Q3 2024
- [ ] Performance optimization
  - [ ] Image optimization
  - [ ] Query optimization and caching
  - [ ] CDN for static assets
- [ ] Advanced features
  - [ ] Wishlist functionality
  - [ ] Book recommendations
  - [ ] Bulk admin operations

#### Backlog (Future)
- [ ] Multi-currency support
- [ ] GraphQL API layer
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native)

---

## Contributing

### Development Standards

#### Code Style

- **Language:** TypeScript (strict mode)
- **Formatting:** Prettier (configured)
- **Linting:** ESLint with React Plugin
- **Naming:** camelCase for variables/functions, PascalCase for components

```bash
# Run linting
npm run lint

# Auto-fix fixable issues
npm run lint -- --fix
```

#### Commit Convention

```
feat: add wishlist functionality
fix: correct cart total calculation
docs: update README with deployment guide
refactor: simplify auth middleware
test: add tests for checkout flow
chore: update dependencies
```

#### Pull Request Process

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes with tests
3. Run full test suite: `npm run test:ci`
4. Ensure linting passes: `npm run lint`
5. Create PR with clear description

#### Testing Requirements

- New features must include tests
- Target coverage: 80% for core logic

```bash
# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test:coverage
```

---

## License

Internal project. Contact maintainers for licensing information.

---

**Last Updated:** May 2026  
**Status:** Active Development  
**Node.js Version:** 20+
