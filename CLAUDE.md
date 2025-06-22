# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at http://localhost:3000
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint code linting

### Testing
No test framework is currently configured in this project.

## Architecture

This is a **Next.js 15 admin panel** for the Lincue service, built with TypeScript and Tailwind CSS. The application provides administrative functions for managing users and video content.

### Authentication System
- **Custom authentication** using environment variables (not Firebase Auth)
- Admin credentials stored in `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
- Cookie-based session management with `admin_logged_in` cookie
- Middleware at `src/middleware.ts` protects `/admin` routes and handles redirects
- Authentication utilities in `src/lib/auth.ts`

### Application Structure
- **App Router architecture** with route-based pages
- Root redirects to `/login`
- Admin panel at `/admin` with protected routes
- Responsive sidebar navigation with mobile support

### Key Routes
- `/login` - Admin authentication page
- `/admin` - Dashboard (protected)
- `/admin/users` - User management with plan updates
- `/admin/videos` - Video content management
- `/admin/videos/new` - Manual video registration

### Firebase Integration
- **Firebase Admin SDK** for server-side operations (`src/lib/firebase-admin.ts`)
- **Firebase Client SDK** for client-side operations (`src/lib/firebase.ts`)
- Firestore database with collections:
  - `users/{uid}` - User profiles with plans and usage
  - `videoAnalyses/{videoId}` - YouTube video data and analysis results

### External APIs
- **YouTube Data API** integration (`src/lib/youtube.ts`)
- Video ID extraction from YouTube URLs
- Automatic fetching of video metadata (title, description, thumbnails, duration)

### Component Architecture
- `AdminLayout` component provides consistent sidebar navigation and mobile responsiveness
- Lucide React icons for UI elements
- Tailwind CSS for styling with responsive design

### Environment Variables Required
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# YouTube Data API
YOUTUBE_DATA_API_KEY=

# Admin Credentials
ADMIN_EMAIL=admin
ADMIN_PASSWORD=1234
```

### API Routes
- `POST /api/auth/login` - Admin authentication
- `GET /api/admin/users` - Fetch user list
- `PUT /api/admin/update-plan` - Update user plans
- `POST /api/admin/register-video` - Register new video analysis
- `GET /api/admin/youtube-details` - Fetch YouTube video metadata