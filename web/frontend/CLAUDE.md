# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 frontend for a Shopify app called "Collective Club" - a forum community platform for Shopify stores. It's built with TypeScript, React 19, Shopify Polaris UI components, and TailwindCSS v4.

## Development Commands

- `npm run dev` - Start development server with Turbopack (opens at http://localhost:3000)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js TypeScript rules

## Architecture

### Framework Stack
- **Next.js 15** with App Router (app directory structure)
- **React 19** with TypeScript 5
- **Shopify Polaris** for UI components and design system
- **TailwindCSS v4** for styling (configured through PostCSS)
- **Turbopack** for fast development builds

### Key Directories
- `app/` - Next.js App Router pages and API routes
- `app/api/auth/shopify/` - Shopify OAuth authentication endpoint
- `public/` - Static assets (SVG icons)

### Shopify Integration
- Uses `@shopify/shopify-api` v11 for Shopify API interactions
- OAuth flow configured with scopes: read/write customers and content
- Shopify Polaris components wrapped in AppProvider in layout
- API version set to "2024-07"

### Configuration Notes
- TypeScript configured with Next.js plugin and path aliases (`@/*`)
- ESLint uses Next.js recommended rules with TypeScript support
- React Strict Mode enabled in Next.js config
- French locale set in root layout (`lang="fr"`)
- Custom rewrite rules for Shopify auth endpoints

### Environment Variables Required
- `SHOPIFY_API_KEY` - Shopify app API key
- `SHOPIFY_API_SECRET` - Shopify app secret
- `HOST` - Application host URL for OAuth callbacks