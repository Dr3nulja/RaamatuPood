# RaamatuPood

RaamatuPood is a modern online bookstore built with Next.js App Router, TypeScript, Prisma, and Stripe.
It includes a public catalog, user accounts, checkout flow, and an admin panel for content and order management.

## Main Features

- Book catalog with categories, search, and sorting
- Product detail pages with customer reviews
- Cart drawer and persistent cart state
- Checkout with shipping methods and Stripe payments
- Account area with order history and profile management
- Admin dashboard for books, categories, authors, metadata, and orders
- File uploads for book images
- Localization support (English and Estonian)

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Prisma + PostgreSQL
- Stripe
- Auth0
- Zustand
- Tailwind CSS v4

## Prerequisites

- Node.js 20+
- npm, pnpm, or yarn
- PostgreSQL database
- Stripe account and API keys
- Auth0 tenant configuration

## Environment Variables

Create `.env.local` in the project root and configure at least:

```env
DATABASE_URL=
DIRECT_URL=

NEXT_PUBLIC_BASE_URL=

AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

STORAGE_UPLOAD_ENDPOINT=
```

Additional variables may be required for your deployment target.

## Installation

```bash
npm install
```

## Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Optional seed/init scripts:

```bash
npm run init:db
npm run seed:users
```

## Development

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Production

Build and run:

```bash
npm run build
npm run start
```

## Linting

```bash
npm run lint
```

## Project Structure

```text
app/                  Next.js App Router pages and API routes
components/           Reusable UI and feature components
contexts/             React contexts
hooks/                Client hooks (including i18n)
lib/                  Server/client business logic and helpers
locales/              Translation dictionaries
prisma/               Prisma schema
scripts/              Database and utility scripts
stores/               Zustand stores
```

## Authentication

Authentication is handled with Auth0.

- Login and callback routes are under `app/auth/`.
- Session-related logic is in `lib/auth/`.
- User synchronization runs through dedicated API/actions.

## Payments

Stripe is used for checkout and webhooks.

- Checkout logic: `app/api/checkout/` and `lib/checkout/`
- Webhooks: `app/api/webhooks/stripe/route.ts`

Make sure webhook secrets and endpoint signing are configured correctly.

## Admin Area

Admin views are under `app/admin/` and `components/admin/`.

Current scope includes:

- Book management
- Category and metadata management
- Order monitoring and status updates

## Localization

Translations are managed via JSON dictionaries and translation hooks.

- Dictionaries: `locales/en.json`, `locales/et.json`
- Hook/store: `hooks/useTranslation.ts`

## Troubleshooting

- If DB queries fail, verify `DATABASE_URL` and run migrations again.
- If Auth0 login fails, verify callback URLs and Auth0 env values.
- If Stripe checkout fails, verify secret keys and webhook signing secret.
- If uploads fail, verify external upload endpoint config.

## License

Internal project. Add your preferred license if you plan to publish.