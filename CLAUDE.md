# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the project root (where `package.json` lives):

```bash
npm run dev      # Vite dev server → http://localhost:5173
npm run build    # tsc -b && vite build (type-check + production build)
npm run lint     # ESLint
npm run preview  # Preview production build locally
```

Convenience scripts:

```bash
./setup.sh    # Install deps + create .env from template
./rundev.sh   # Auto-install if needed, then start dev server
```

There are no automated tests (`npm test` is not configured).

---

## Architecture

### Tech Stack

- **React-Admin v5** — admin framework; all CRUD views, hooks, and layout come from it
- **React 19 + TypeScript** — strict mode
- **Vite 7** — build tool
- **Firebase 12** — Firestore (data), Auth (Google OAuth + custom claims)
- **Material UI v9** — UI component library used alongside React-Admin primitives

### Project Layout

```
src/
├── App.tsx                  # <Admin> root — registers <CustomRoutes> and future <Resource>s
├── firebase.ts              # Firebase app init (auth, db, googleProvider)
├── theme.ts                 # MUI theme — primary colour #2a6b7c (teal placeholder)
├── index.css / App.css      # Global styles
├── main.tsx                 # React entry point
├── vite-env.d.ts
├── providers/
│   ├── authProvider.ts      # Firebase Auth; enforces admin: true custom claim
│   └── dataProvider.ts      # Stub — replace with Firestore implementation per resource
├── components/
│   ├── Login.tsx            # Google sign-in page
│   └── Dashboard.tsx        # Post-login home page (shown at /)
├── layout/
│   └── Layout.tsx           # AppBar with version, user avatar, and Logout button
└── utils/
    └── version.ts           # APP_VERSION read from package.json
```

### Auth Flow

1. User clicks "Sign in with Google" on the Login page
2. `authProvider.login()` calls `signInWithPopup(auth, googleProvider)`
3. On success, `getIdTokenResult(user, true).claims.admin` is checked
4. If `admin !== true` → `signOut` is called and an error is thrown
5. `checkAuth` and `getIdentity` re-verify the claim on every call via `onAuthStateChanged`
6. The Logout button in the AppBar calls `useLogout()` which calls `authProvider.logout()`

### Routing

- `/login` → Login page (shown when unauthenticated)
- `/` → Dashboard (registered via `<CustomRoutes>` — not the `dashboard` prop, which is ignored when no `<Resource>` children exist)
- Future resources will be added as `<Resource>` children in `App.tsx`

### Layout

`Layout.tsx` wraps react-admin's `<Layout>` with a custom `AppBar` that renders:
- Page title (via `<TitlePortal />`)
- Version number
- User avatar + first name
- Logout button (calls `useLogout()` directly — no dropdown)

The sidebar is managed by react-admin and auto-populates with navigation links as `<Resource>` components are added to `App.tsx`.

### Data Provider

`providers/dataProvider.ts` is currently a **stub** that returns empty results. When adding resources, replace it with a real Firestore implementation. See the WAE admin backoffice (`/Users/dave.rain/Workspace/whatanexp/wae-admin-backoffice/wae-admin-backoffice/src/providers/dataProvider.ts`) as the reference implementation — it handles:

- Subcollection routing via `meta: { parentResource, parentId }`
- Firestore `where` filters from the `filter` object
- DocumentReference ↔ string ID flattening on read/write
- Auto-timestamps (`createdAt`, `updatedAt`, `createdByAdmin`, `updatedByAdmin`)

---

## Code Style

- **Tabs** for indentation
- **Single quotes** for strings
- **No semicolons** (unless required for disambiguation)
- Trailing commas in multiline objects and arrays
- Event handlers prefixed with `handle`: `handleClick`, `handleSubmit`
- Booleans prefixed with verbs: `isLoading`, `hasError`, `canSubmit`
- No `any` in TypeScript (stub dataProvider is the only exception, isolated to that file)

---

## Adding a New Resource

When adding a resource (e.g. `clients`):

1. **Create the resource folder** `src/resources/clients/` with:
   - `ClientList.tsx`, `ClientShow.tsx`, `ClientCreate.tsx`, `ClientEdit.tsx`
   - `index.ts` barrel export

2. **Register in `App.tsx`**:
   ```tsx
   import { ClientList, ClientShow, ClientCreate, ClientEdit } from './resources/clients'
   // ...
   <Resource
     name="clients"
     list={ClientList}
     show={ClientShow}
     create={ClientCreate}
     edit={ClientEdit}
     options={{ label: 'Clients' }}
   />
   ```

3. **Add types** in `src/types/` (create the file if it doesn't exist yet):
   - Interface extending `BaseRecord`
   - `*_FIELDS` constant object with field path strings

4. **Implement the dataProvider** with real Firestore logic (replace the stub).

Use the WAE admin backoffice as the reference for patterns — particularly `OrgStaffTab.tsx` for subcollection CRUD and `OrganizationShow.tsx` for the `TabbedShowLayout` pattern.

---

## Access Control

Users must have the Firebase custom claim `admin: true`. Set it via the Python snippet in the README or directly in the Firebase Admin SDK. The `authProvider` enforces this on login and on every `checkAuth` call.

---

## Environment Variables

All Firebase config is read from `import.meta.env.VITE_FIREBASE_*`. See `.env.example` for the full list. The `.env` file must be in the project root (same directory as `package.json`).
