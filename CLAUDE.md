# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CollectiveClub is a Shopify app that provides a community forum platform for Shopify stores. It enables store owners to create interactive communities with features like posts, comments, polls, badges, user points, and social interactions.

## Repository Structure

```
/
├── package.json                    # Root Shopify CLI commands
├── shopify.app.toml               # Shopify app configuration
└── web/frontend/                  # Next.js application
    ├── app/                       # Next.js App Router (pages & API routes)
    ├── components/                # React components
    ├── prisma/                    # Database schema and migrations
    └── package.json               # Frontend dependencies and scripts
```

## Development Commands

**IMPORTANT**: All development work should be done from the `web/frontend/` directory.

### Root Level (Shopify CLI)
- `npm run dev` - Start Shopify app development server
- `npm run build` - Build Shopify app for production  
- `npm run deploy` - Deploy app to Shopify
- `npm run info` - Show app configuration info

### Frontend (in web/frontend/)
- `npm run dev` - Start Next.js development server with Turbopack
- `npm run build` - Build Next.js application for production
- `npm run start` - Start production Next.js server
- `npm run lint` - Run ESLint with Next.js rules and auto-fix issues

### Database & Scripts (in web/frontend/)
- `npm run seed` or `npm run db:seed` - Seed database with initial data
- `npm run admin` - Ensure admin user exists (scripts/ensure-admin.ts)
- `npm run recovery` - Run data recovery script (scripts/data-recovery.ts)
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma migrate dev` - Apply database migrations in development
- `npx prisma studio` - Open Prisma Studio for database management

### Additional Utility Scripts (in web/frontend/)
- `tsx scripts/create-dev-shop.ts` - Create development shop
- `tsx scripts/seed-demo-data.ts` - Seed demo data for testing
- `tsx scripts/update-default-badges.ts` - Update default badge system

## Architecture

### Technology Stack
- **Shopify App**: Built with Shopify CLI v3 and Shopify API v11 (API version 2025-07)
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5
- **Database**: PostgreSQL with Prisma ORM
- **UI Framework**: Radix UI components with Tailwind CSS v4
- **Styling**: TailwindCSS with custom design system
- **Image Management**: Cloudinary integration via next-cloudinary
- **Development**: Turbopack for fast builds, ESLint for code quality

### Database Schema (Multi-tenant)
All models include `shopId` for multi-tenant isolation:
- **Shop**: Store configuration and settings
- **User**: Store customers with roles (ADMIN, MODERATOR, MEMBER)  
- **Post**: Forum posts with categories, images, polls
- **Comment**: Threaded discussions on posts
- **Category**: Organized post categorization
- **Poll/PollOption/PollVote**: Interactive polling system
- **Reaction**: Emoji reactions (LIKE, LOVE, LAUGH, WOW, APPLAUSE)
- **Badge/UserBadge**: Gamification system with unlockable achievements
- **UserPoints/PointTransaction**: Points system for user engagement
- **Follow**: Social following between users
- **CustomizationSettings**: Per-user theming and personalization

### Key Directories (in web/frontend/)
- `app/api/` - Next.js API routes for backend functionality (auth, posts, users, etc.)
- `app/api/auth/[...nextauth]/` - NextAuth.js authentication endpoints
- `app/api/admin/` - Admin-specific API routes for management operations
- `app/auth/` - Authentication pages and flows
- `app/community/` - Main forum pages and post creation
- `app/dashboard/` - Admin dashboard for shop configuration
- `components/` - Reusable React components
- `components/providers/` - React context providers (session, theme)
- `lib/hooks/` - Custom React hooks
- `prisma/` - Database schema, migrations, and seed data
- `scripts/` - Utility scripts for admin, data management, and development
- `types/` - TypeScript type definitions

### Authentication & Multi-tenant Architecture
- **NextAuth.js v4** with Google OAuth provider integration
- **Prisma Adapter** for database session management
- Each shop is isolated by `shopId` in all database operations
- Dual authentication system: Shopify OAuth + Google OAuth for users
- Shop-specific customization (colors, fonts, branding)  
- Per-shop categories, badges, and user management

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SHOPIFY_API_KEY` - Shopify app API key  
- `SHOPIFY_API_SECRET` - Shopify app secret
- `HOST` - Application host URL for OAuth callbacks
- `CLOUDINARY_CLOUD_NAME` - Cloudinary configuration
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID for authentication
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret for authentication
- `NEXTAUTH_SECRET` - NextAuth.js secret for session encryption
- `NEXTAUTH_URL` - Base URL for NextAuth.js callbacks

### App Installation Flow
1. **Shopify App Store**: Merchants install the app, Shopify redirects to your app with `?shop=store.myshopify.com`
2. **Admin Access**: Users access the app from Shopify Admin → Apps → CollectiveClub
3. **Direct Link**: For development: `https://your-app.com/?shop=store.myshopify.com`
4. **Google Auth**: First user to connect via Google becomes admin for that shop

### Important Implementation Notes
- Always include `shopId` when creating or querying database records
- Use `@relation(onDelete: Cascade)` to maintain referential integrity
- French locale is set in root layout (`lang="fr"`)
- Prisma client is generated to `node_modules/.prisma/client`
- Shop parameter detection via URL params and middleware cookies
- Google OAuth replaces previous Shopify OAuth admin detection

## Testing & Quality
- No formal test framework currently configured
- ESLint provides code quality checks with Next.js rules
- TypeScript provides compile-time type checking
- Use `npm run lint` to check and fix code style issues before commits