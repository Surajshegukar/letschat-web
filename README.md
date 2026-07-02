# 💬 Let's Chat — Next.js & Turborepo Monorepo Chat Client

Let's Chat is a gorgeous, modern, high-fidelity chat client monorepo built using Next.js, TypeScript, Tailwind CSS, next-themes, and Zustand. It features premium design aesthetics, fluid calling screens, advanced chat routing filters, and clean modular component design patterns.

---

## ✨ Features

- **📞 Calling Overlay & Video Streams**:
  - Full-bleed calling overlays supporting both **Audio** and **Video** modes.
  - Concurrent radial pulsing wave animations simulating voice dial ringing.
  - Picture-in-picture (PiP) local camera stream cards overlaying full-bleed video backgrounds.
  - **Minimize Floating Widget**: Collapses the call into a compact floating popup in the bottom right corner so users can check other logs or chat while keeping the call active.
  - Mic mute, camera disable, and speaker route controls with instant icon statuses.
- **🏷️ Advanced Chat Filter Pills**:
  - Filter chats dynamically by **All**, **Unread** (MailOpen icon), **Direct**, **Groups** (Users icon), **Mentions** (AtSign icon), **Pinned** (Pin icon), and **Archive** (Archive icon).
  - Dynamic count badges that automatically hide if active matches equal 0.
- **🌗 Sidebar Theme Toggler**:
  - Integrated themes switch located directly above the profile footer block.
  - Collapses into a sun/moon icon button or expands into a sliding switch.
- **🔒 Authentication & Progress Routing**:
  - Ambient loading splash loader page that redirects users to `/sign-in` as soon as progress reaches 100%.
  - Prefilled mock sign-in credentials (`admin@letschat.com` / `password123`) for fast testing.
  - Submit listeners that route authentication requests straight to `/chat`.
- **📂 Shared Assets Modal Overlay**:
  - Tabbed overlay listing shared media gallery grids, spreadsheet/document sheets, and clickable external links.

---

## 📂 Monorepo Structure

```
letschat-web/
├── apps/
│   ├── web/                     # Primary Next.js chat client app
│   └── api/                     # Backend service stub
├── packages/
│   ├── eslint-config/           # Custom ESLint shared configurations
│   ├── typescript-config/       # Shared TypeScript configurations
│   └── ui/                      # Shared component library
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the following command in the root of the project:
```sh
npm install
```

### 2. Run Local Development Server
Boot up all monorepo apps and packages concurrently:
```sh
npm run dev
```
The web client will be available at [http://localhost:3000](http://localhost:3000).

### 3. Run Build & Type Checks
To verify production compiler and typescript safety:
```sh
npm run build
# Or test typescript checks on the web workspace:
npm run check-types --workspace=web
```

---

## ⚡ Vercel Deployment

This project is fully configured and ready for production deployment to **Vercel** with strict ESLint and TypeScript compilations.

### Deployment Configuration:
1. Link your GitHub repository to [Vercel](https://vercel.com).
2. Set the **Root Directory** option in the Vercel project settings to `apps/web`.
3. Set the **Framework Preset** option to `Next.js`.
4. Leave build commands as default (`next build`) or use `npm run build` from the workspace root.
5. Vercel will automatically build the client package, pull types from `@repo/typescript-config`, and deploy it successfully.
