# CHANGELOG.md

All notable changes to Let's Chat are documented here.
Format: `## [version] — YYYY-MM-DD` with sections Added / Changed / Fixed / Removed.

---

## [0.3.0] — In Progress

### Fixed
- **Authentication Token Loop Bug**:
  - Excluded authentication endpoints (`/auth/login`, `/auth/refresh`, `/auth/register`, `/auth/verify`) from the Axios response interceptor's auto-refresh logic. This ensures actual authentication failures (e.g. incorrect credentials) display correctly to the user instead of triggering a token refresh failure.
  - Adjusted the backend `authenticateJWT` middleware to return a `401 Unauthorized` status code instead of a `403 Forbidden` status code on expired/invalid access tokens, allowing the client-side interceptor to correctly catch expiration and perform session refreshes.

### Added
- **Phase 2.2 / 2.3: User Profile & Settings Complete**:
  - Backend S3/Cloudinary storage and local upload fallback service using Multer and Sharp.
  - Backend password validation and change password service/controllers/routes (`PATCH /api/users/me/password`).
  - Frontend hooks, service APIs, and collapsible change password card interface inside SettingsAccountView.
- **Phase 3A: User Search & New Chat**:
  - Frontend `useSearchUsers` query hook leveraging `/api/users/search` (updated to query default contacts immediately on mount).
  - Frontend ChatList query-based filtering based on sidebar search input.
  - WhatsApp-style slide-in sidebar NewChatList drawer layout (as in `newchat.png`) featuring alphabetical contacts grouping with A-Z headers, quick actions (New Group/Contact/Community), current user "Message Yourself" shortcut, and direct conversation creation trigger.
  - Real-time conversation syncing: Backend emits `new_conversation` on creation and `new_message` to participants' personal rooms. Frontend hooks update and query client caches dynamically.
  - Global presence syncing: Backend broadcasts status events globally and emits a list of online users on socket connection, updating the frontend in real-time without requiring refreshes.
- **Real-Time Performance & Local Cache Optimization**:
  - Fixed N+1 MongoDB query bottleneck in backend `sendMessage` service by querying online status in bulk.
  - Implemented client-side optimistic updates in `useSendMessage` to render messages instantly with `isSending: true` status.
  - Refactored `new_message` WebSocket handler to directly update messages and conversations caches locally in React Query, avoiding HTTP invalidations/refetching.
  - Fixed React hydration console warning in `ChatRoomItem` by changing outer nested `<button>` element to an accessible, keyboard-interactive `div`.
  - Resolved React render-phase update console warning in `ChatList` by wrapping query cache updates in a deferred `setTimeout`.
  - Refactored the core messaging protocol to be WebSocket-first with REST HTTP fallback (using a promisified client emit call and a dedicated `send_message` listener on the Socket.IO backend).
  - Optimized backend query speeds and memory consumption by applying `.lean()` queries to user, conversation, and message repositories' list/read methods.

---

## [0.2.0] — Phase 1 Complete

### Added
- `apps/api/src/models/User.ts` — Mongoose User schema with bcrypt pre-save hook (12 rounds), `comparePassword` instance method, `toJSON` sanitization (strips password, refreshTokens, verificationToken, resetToken, resetTokenExpiry, __v)
- `apps/api/src/validators/auth.validator.ts` — registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, oauthCallbackSchema + inferred TypeScript types
- `apps/api/src/middlewares/validate.ts` — Generic Zod validation middleware with field-level error formatting
- `apps/api/src/utils/token.ts` — generateRandomToken (crypto.randomBytes), hashToken (SHA-256), generateAccessToken (15m JWT), generateRefreshToken (7d JWT)
- `apps/api/src/repositories/user.repository.ts` — findByEmail, findById, findByUsername, findOne, create, updateById, existsByEmail, existsByUsername, search
- `apps/api/src/services/email.service.ts` — Resend provider with dev console fallback; sendVerificationEmail, sendPasswordResetEmail with branded HTML templates
- `apps/api/src/services/auth.service.ts` — register, verifyEmail, login, refresh (rotation + reuse detection), logout, forgotPassword, resetPassword, getOAuthUrl, handleOAuthCallback (Google + GitHub)
- `apps/api/src/controllers/auth.controller.ts` — all handlers; login/refresh/logout manage HTTP-only refresh cookie
- `apps/api/src/controllers/user.controller.ts` — getMe stub
- `apps/api/src/routes/auth.routes.ts` — POST /register, GET /verify/:token, GET /verify, POST /login, POST /refresh, POST /logout, GET /oauth/url/:provider, POST /oauth/callback, POST /forgot-password, POST /reset-password
- `apps/api/src/routes/user.routes.ts` — GET /me (protected)
- `apps/web/src/services/auth-service.ts` — register, verifyEmail, login, refreshToken, logout, getMe, forgotPassword, resetPassword, getOAuthUrl, handleOAuthCallback
- `apps/web/src/hooks/api/use-auth.ts` — useLogin, useRegister, useLogout, useForgotPassword, useResetPassword
- `apps/web/src/providers/auth-provider.tsx` — session check on mount, 13-min auto-refresh timer, route guard with PUBLIC_ROUTES list, loading splash
- `apps/web/src/app/verify-email/page.tsx` — animated verification page (loading/success/error states)
- `apps/web/src/app/auth/callback/page.tsx` — OAuth callback handler
- `apps/web/src/components/auth/SocialLogin.tsx` — Google + GitHub OAuth buttons

### Changed
- `apps/api/src/config/env.ts` — added JWT_REFRESH_SECRET, CLIENT_URL, RESEND_API_KEY, EMAIL_FROM, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- `apps/api/src/server.ts` — MongoDB connection now active (connectDatabase() called in startServer())
- `apps/api/src/app.ts` — removed hardcoded inline auth routes; all routes go through route files
- `apps/web/src/store/auth-store.ts` — token in Zustand memory only (no localStorage); removed hardcoded default user
- `apps/web/src/lib/axios.ts` — added withCredentials: true; 401 interceptor with refresh queue
- `apps/web/src/app/layout.tsx` — AuthProvider added to provider tree
- `apps/web/src/components/auth/SignInForm.tsx` — connected to useLogin() mutation
- `apps/web/src/components/auth/SignUpForm.tsx` — connected to useRegister() mutation

---

## [0.1.0] — Initial Build

### Added
- Turborepo monorepo with `apps/web`, `apps/api`, shared packages
- **Frontend**: Next.js 16 App Router, all pages and components, 7 Zustand stores, TanStack React Query, Axios, Socket.IO provider (scaffolded), next-themes, Framer Motion, Sonner
- **Backend**: Express.js with full security middleware pipeline, Socket.IO server with basic room handlers, JWT auth middleware, global error handler, Pino logger, Zod env config, MongoDB connection, layered directory structure
