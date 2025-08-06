# Video Analysis Tool - Replit.md

## Overview

This is a full-stack video analysis application designed for sports video tagging and analysis, specifically focused on Ultimate Frisbee. The application allows users to load video content, create timestamped tags with categories and player associations, and analyze patterns in the tagged data. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database)
- **Validation**: Zod schemas shared between frontend and backend
- **Development**: In-memory storage fallback for development without database

### Key Components

#### Database Schema
- **Categories**: Predefined action categories (Offensive Play, Defensive Play, Turnover, Goal, Penalty)
- **Players**: Player roster with names and jersey numbers
- **Tags**: Timestamped video annotations linking categories, players, and descriptions

#### API Structure
RESTful API endpoints for:
- Categories CRUD operations (`/api/categories`)
- Players CRUD operations (`/api/players`)
- Tags CRUD operations (`/api/tags`)

#### Core Features
1. **Video Player**: ReactPlayer integration with custom controls for play/pause, seeking, and timestamping
2. **Tagging System**: Real-time video tagging with category selection, player association, and descriptions
3. **Pattern Analysis**: Statistical analysis of tagged events by category and player
4. **Admin Panel**: Management interface for categories and players
5. **Data Export**: CSV export functionality for analysis data

## Data Flow

1. **Video Loading**: Users input video URLs, validated client-side before loading into ReactPlayer
2. **Tag Creation**: Users pause video, select category and players, add description, creating timestamped tags
3. **Data Persistence**: Tags stored in PostgreSQL with relationships to categories and players
4. **Analysis Generation**: Real-time statistics calculated from tag data for pattern analysis
5. **Export Process**: Tag data transformed and exported as CSV for external analysis

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon Database
- **drizzle-orm & drizzle-kit**: Database ORM and migration tools
- **@tanstack/react-query**: Server state management
- **react-player**: Video playback functionality
- **@radix-ui/**: UI primitive components
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Build tool with React plugin
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **TypeScript**: Type safety across the application

## Deployment Strategy

### Production Build
- Frontend: Vite builds optimized static assets to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Database: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with Express API, optional in-memory storage
- **Production**: Serves static frontend through Express with database persistence
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Replit Integration
- Custom Vite plugins for Replit development environment
- Runtime error overlay for better debugging experience
- Cartographer plugin for enhanced development tools

## Technical Decisions

### Database Choice
**Problem**: Need reliable data persistence for video analysis metadata
**Solution**: PostgreSQL with Drizzle ORM
**Rationale**: PostgreSQL provides robust relational data handling for complex tag relationships, while Drizzle offers type-safe database operations with excellent TypeScript integration

### State Management
**Problem**: Complex server state synchronization for real-time analysis
**Solution**: TanStack Query for server state, React state for UI interactions
**Rationale**: TanStack Query handles caching, background updates, and error states automatically, reducing boilerplate while maintaining data consistency

### UI Framework
**Problem**: Need professional, accessible UI components quickly
**Solution**: shadcn/ui built on Radix UI primitives with Tailwind CSS
**Rationale**: Provides pre-built, customizable components with excellent accessibility support, allowing focus on application logic rather than UI implementation

### Validation Strategy
**Problem**: Ensure data consistency between frontend and backend
**Solution**: Shared Zod schemas for validation
**Rationale**: Single source of truth for data validation reduces errors and maintains type safety across the full stack