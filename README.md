# Commonroom

An artist community and marketplace starter. The existing responsive Commonroom interface lives in `client/`; the API and PostgreSQL data model live in `server/`.

## Stack

- Client: React, TypeScript, Vite, Tailwind CSS 4
- API: Node.js, Express, TypeScript
- Data: PostgreSQL and Prisma
- Platform: responsive web app with an installable PWA manifest; Electron can wrap the same web client later

## Local development

Requirements: Node.js 20.19+ (or 22.12+) and PostgreSQL 14+.

1. Install dependencies: `npm install`
2. Start the local PostgreSQL container: `npm run db:up` (Docker required).
3. Copy `.env.example` to `.env` if you want custom database credentials or a custom development JWT secret. `npm run dev` supplies local-only defaults otherwise.
4. Generate Prisma Client and apply the initial schema: `npm run db:generate && npm run db:migrate`
5. Start both API and client together: `npm run dev`.

The Vite dev server proxies `/api` to `http://localhost:4000`, so one `npm run dev` starts both processes. API health check: `http://localhost:4000/api/health`. Stop both with Ctrl+C.

## Project map

```text
client/
  public/manifest.webmanifest
  src/
    components/{auth,feed,profile,marketplace,trading,navigation,layout}/
    lib/api.ts
    pages/
    App.tsx
server/
  prisma/schema.prisma
  prisma/seed.ts
  src/{middleware,routes,lib}/
```

The first route is an authentication gate: before a valid session exists, only sign in/sign up is rendered. A successful sign-in or registration opens the authenticated artist's personal profile. Registration collects a profile image, name, pseudonym, art role, instruments, biography, background, contact details, and Terms/Privacy acceptance. The personal page loads that artist's works and organizes them into six media categories. Auth state lives in React Context and persists through the bearer token; Lucide React provides the interface icons. The manifest, app icon, and service worker provide an installable PWA shell on mobile and desktop browsers.

`client/src/components/README.md` maps the feature boundaries. The API provides health, JWT-backed registration/login/current-user, artwork listing/creation, marketplace listing reads, follows, and trade proposal endpoints. The Prisma schema models artists, artworks, listings, purchases, follows, likes, comments, and trades.

## Implementation boundaries

This is a development foundation, not yet a production marketplace. Profile photos currently use a small inline image payload for local development; replace this with object storage before production. Artwork media storage, payment completion, signed payment webhooks, and public artist-to-artist trade discovery still need provider-backed implementations. Add rate limiting, email verification, password reset, refresh-token/session rotation, moderation and audit logs before opening registration publicly. JWTs are stored as bearer tokens in browser local storage for this prototype. Configure HTTPS and review token storage before production deployment.
