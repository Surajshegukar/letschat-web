# TASKS.md — Active Task Tracker

Track all in-progress and upcoming work here. Update this file when starting or completing a task.

---

## 🔴 In Progress

*No active tasks in progress.*

---

## 🟡 Up Next

*No active tasks in progress.*

---

## ✅ Completed

### Phase 4A — Status & Stories (COMPLETE)
- [x] Create Mongoose Status model with TTL auto-cleanup (24 hours)
- [x] Implement backend Status repository, service, validators, controllers, and routes
- [x] Emit real-time Socket.IO status updates to contacts
- [x] Integrate React Query queries and mutations on the frontend Status service and hook
- [x] Wire up real-time Socket status updates frontend-side

### Real-Time Chat Performance & Local Cache Optimization (COMPLETE)
- [x] Batch MongoDB database query in `sendMessage` to eliminate N+1 latency bottleneck
- [x] Implement frontend optimistic updates for `useSendMessage` to render messages instantly on dispatch
- [x] Implement WebSocket `new_message` direct cache insertion on frontend to avoid expensive query invalidations and HTTP GET requests
- [x] Implement database read query performance tuning using Mongoose `.lean()` in user, conversation, and message repositories
- [x] Implement Socket.IO `send_message` server-side event listener to allow message dispatching over WebSockets
- [x] Refactor frontend `useSendMessage` hook to implement a hybrid WebSocket-first sending protocol with REST HTTP fallback

### Phase 2.3 — Frontend: Connect Profile & Settings to API (COMPLETE)
- [x] `apps/web/src/services/user-service.ts`
- [x] `apps/web/src/hooks/api/use-user.ts` — useCurrentUser, useUpdateProfile, useUploadAvatar, useChangePassword
- [x] Connect SettingsProfileView, SettingsAccountView to real API
- [x] Avatar upload in SettingsDrawer

### Phase 2.2 — Backend: Avatar Upload (COMPLETE)
- [x] Install: `multer`, `sharp`, `@aws-sdk/client-s3` (or `cloudinary`)
- [x] `apps/api/src/config/storage.ts` — S3/Cloudinary client
- [x] `apps/api/src/middlewares/upload.ts` — Multer memoryStorage, file filter, size limits
- [x] `apps/api/src/services/upload.service.ts` — processAndUploadAvatar, processAndUploadMedia
- [x] `POST /api/users/me/avatar` route

### Phase 2.1 — Backend: User Profile API (COMPLETE)
- [x] `apps/api/src/validators/user.validator.ts` — updateProfileSchema
- [x] `apps/api/src/services/user.service.ts` — getProfile, updateProfile, searchUsers, deleteAccount
- [x] `apps/api/src/controllers/user.controller.ts` — expand beyond current getMe stub (updateMe, searchUsers, deleteAccount)
- [x] `apps/api/src/routes/user.routes.ts` — PATCH /me, GET /search, DELETE /me

### Phase 1 — Authentication & Authorization (COMPLETE)
- [x] `apps/api/src/models/User.ts` — full schema with bcrypt pre-save, comparePassword, toJSON sanitization
- [x] `apps/api/src/validators/auth.validator.ts` — registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, oauthCallbackSchema
- [x] `apps/api/src/middlewares/validate.ts` — Zod validation middleware with field-level errors
- [x] `apps/api/src/utils/token.ts` — generateRandomToken, hashToken (SHA-256), generateAccessToken (15m), generateRefreshToken (7d)
- [x] `apps/api/src/repositories/user.repository.ts` — findByEmail, findById, findByUsername, findOne, create, updateById, existsByEmail, existsByUsername, search
- [x] `apps/api/src/services/email.service.ts` — Resend integration with dev console fallback
- [x] `apps/api/src/services/auth.service.ts` — register, verifyEmail, login, refresh (rotation + reuse detection), logout, forgotPassword, resetPassword, getOAuthUrl, handleOAuthCallback (Google + GitHub)
- [x] `apps/api/src/controllers/auth.controller.ts` — all handlers
- [x] `apps/api/src/routes/auth.routes.ts` — all auth routes wired
- [x] `apps/api/src/routes/user.routes.ts` — GET /me stub
- [x] `apps/api/src/controllers/user.controller.ts` — getMe stub
- [x] MongoDB connection active in `server.ts`
- [x] `apps/web/src/services/auth-service.ts` — all auth API calls including OAuth
- [x] `apps/web/src/hooks/api/use-auth.ts` — useLogin, useRegister, useLogout, useForgotPassword, useResetPassword
- [x] `apps/web/src/providers/auth-provider.tsx` — session check on mount, 13-min refresh timer, route guard
- [x] `apps/web/src/app/verify-email/page.tsx` — email verification page
- [x] `apps/web/src/app/auth/callback/page.tsx` — OAuth callback handler
- [x] `apps/web/src/components/auth/SocialLogin.tsx` — Google + GitHub OAuth buttons
- [x] SignInForm, SignUpForm connected to real API mutations
- [x] `auth-store.ts` stores token in memory only (no localStorage)
- [x] Axios interceptor handles 401 → auto-refresh → retry with queue
- [x] Fix Axios response interceptor to bypass token refresh logic on auth-related requests, resolving the login loop bug
- [x] Modify backend `authenticateJWT` middleware to return 401 instead of 403 on token verification failure to properly support frontend auto-refresh

### Frontend UI (Static/Demo Mode)
- [x] All pages: splash, sign-in, sign-up, forgot-password, reset-password, verify-email
- [x] Chat page: 4-pane layout (sidebar, chat list, chat window, details panel)
- [x] Status, Channels, Communities, Calls pages
- [x] Active call screen (audio + video modes) with minimize widget
- [x] Settings drawer with all settings views
- [x] 7 Zustand stores with persistence
- [x] All custom hooks

### Backend Foundation
- [x] Express app with full security middleware pipeline (Helmet, CORS, compression, rate limit, morgan, cookie-parser)
- [x] Socket.IO server with basic room handlers (join_room, leave_room, send_message, typing)
- [x] JWT auth middleware
- [x] Global error handler
- [x] Pino structured logger
- [x] Zod-validated environment config (PORT, NODE_ENV, MONGO_URI, JWT_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, CORS_ORIGIN, RESEND_API_KEY, EMAIL_FROM, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET)

---

## 📋 Backlog (Phases 3–5)

See `docs/implementation_plan.md` for the full phased breakdown.

- Phase 3A: Conversation & Message Models + REST API
- Phase 3B: Real-Time Socket.IO Integration (activate socket-provider.tsx)
- Phase 3C: File Sharing (Multer + S3)
- Phase 3D: Group Chat
- Phase 3E: Message Operations (edit, delete, react, reply, pin)
- Phase 3F: Search & Push Notifications
- Phase 4B: Voice & Video Calls (WebRTC)
- Phase 4C: Channels & Communities API
- Phase 5: Production Hardening (Docker, CI/CD, monitoring, testing)
