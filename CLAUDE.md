# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the project root (where `package.json` lives):

```bash
npm run dev           # Vite dev server → http://localhost:5173
npm run build         # tsc -b && vite build (type-check + production build)
npm run lint          # ESLint
npm run preview       # Preview production build locally
npm run deploy:rules  # Deploy Firestore rules only
npm run deploy:hosting # Build + deploy to Firebase Hosting
npm run deploy        # Build + deploy rules and hosting
```

Convenience scripts:

```bash
./setup.sh         # Install deps + create .env and .firebaserc from templates
./rundev.sh        # Auto-install if needed, then start dev server
./deploy-rules.sh  # Deploy Firestore rules
./deploy-hosting.sh # Build + deploy hosting
./deploy-all.sh    # Build + deploy everything
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
├── App.tsx                  # <Admin> root — registers <Resource>s and <CustomRoutes>
├── firebase.ts              # Firebase app init (auth, db, googleProvider)
├── theme.ts                 # MUI theme — primary colour #2a6b7c (teal)
├── index.css / App.css      # Global styles
├── main.tsx                 # React entry point
├── vite-env.d.ts
├── providers/
│   ├── authProvider.ts      # Firebase Auth; enforces admin: true custom claim
│   └── dataProvider.ts      # Firestore CRUD — generic, handles all collections
├── components/
│   ├── Login.tsx            # Google sign-in page
│   └── Dashboard.tsx        # Post-login home page (shown at /)
├── layout/
│   └── Layout.tsx           # AppBar with version, user avatar, and Logout button
├── resources/
│   ├── techniques/          # TechniqueList, TechniqueCreate, TechniqueEdit, TechniqueShow
│   └── series/              # SeriesList, SeriesCreate, SeriesEdit, SeriesShow
├── types/
│   ├── base.ts              # BaseRecord, TimestampFields, AdminTrackingFields
│   ├── resources.ts         # Per-resource interfaces + FIELDS constants + category labels
│   └── index.ts             # Barrel export
└── utils/
    ├── slugify.ts           # toSlug() — accent-stripping slug generator
    ├── debugLogger.ts       # Dev-only console wrappers for the dataProvider
    ├── refUtils.ts          # isDocRef, refId, flattenRefs — DocumentRef handling
    ├── dateUtils.ts         # normalizeDateFields — Firestore Timestamp → ms
    ├── filterUtils.ts       # normalizeReferenceValue — stub, expand per resource
    ├── authUtils.ts         # getCurrentAdminEmail — for audit timestamps
    └── version.ts           # APP_VERSION read from package.json

Firebase config files (project root):
├── firebase.json            # Firestore + Hosting config for Firebase CLI
├── .firebaserc.example      # Project alias template (copy to .firebaserc, gitignored)
├── firestore.rules          # Security rules for all 5 collections
└── firestore.indexes.json   # Composite indexes
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
- `/` → Dashboard (registered via `<CustomRoutes>`)
- `/techniques` → Techniques CRUD (List / Create / Edit / Show)
- `/series` → Series CRUD (List / Create / Edit / Show)

### Layout

`Layout.tsx` wraps react-admin's `<Layout>` with a custom `AppBar` that renders:
- Page title (via `<TitlePortal />`)
- Version number
- User avatar + first name
- Logout button (calls `useLogout()` directly — no dropdown)

The sidebar auto-populates with navigation links as `<Resource>` components are added to `App.tsx`.

### Data Provider

`providers/dataProvider.ts` is a **generic Firestore implementation** that works with any collection. Key behaviours:

- Subcollection routing via `meta: { parentResource, parentId }`
- Firestore `where` filters built from the `filter` object
- Date-range detection for fields matching `*At`, `*date`, `*time`, `*created`, `*updated`
- Cursor-based pagination with `startAfter`
- `flattenRefs` converts DocumentReferences to string IDs on read
- Auto-timestamps: `createdAt` + `createdByAdmin` on create; `updatedAt` + `updatedByAdmin` on update
- `uid` field: if present, uses `setDoc` with custom ID; otherwise `addDoc` for auto-ID

### Slug Generation

`utils/slugify.ts` exports `toSlug(str)` — strips accents, lowercases, replaces spaces with hyphens. Used in Create forms for auto-fill. Edit forms never auto-update the slug to avoid breaking public URLs.

### Firestore Rules

`firestore.rules` enforces:
- `isAdmin()` — `request.auth.token.admin == true` (mirrors `authProvider.ts`)
- Public reads: `artworks`, `series`, `techniques`, `contents`
- Admin-only: `commissions` (read + write)

Deploy with `./deploy-rules.sh` after any rule change.

---

## Code Style

- **Tabs** for indentation
- **Single quotes** for strings
- **No semicolons** (unless required for disambiguation)
- Trailing commas in multiline objects and arrays
- Event handlers prefixed with `handle`: `handleClick`, `handleSubmit`
- Booleans prefixed with verbs: `isLoading`, `hasError`, `canSubmit`
- No `any` in TypeScript — the dataProvider is the only exception (isolated, with eslint-disable comments)

---

## Adding a New Resource

When adding a resource (e.g. `series`):

1. **Add types** in `src/types/resources.ts`:
   - Interface extending `BaseRecord`
   - `*_FIELDS` constant object with field path strings
   - Any enum types + label maps (see `TECHNIQUE_CATEGORY_LABELS` as the pattern)
   - Export from `src/types/index.ts`

2. **Create the resource folder** `src/resources/series/` with:
   - `SeriesList.tsx`, `SeriesShow.tsx`, `SeriesCreate.tsx`, `SeriesEdit.tsx`
   - `index.ts` barrel export

3. **Register in `App.tsx`**:
   ```tsx
   import { SeriesList, SeriesShow, SeriesCreate, SeriesEdit } from './resources/series'
   // ...
   <Resource
     name="series"
     list={SeriesList}
     show={SeriesShow}
     create={SeriesCreate}
     edit={SeriesEdit}
     options={{ label: 'Serie' }}
   />
   ```

4. **If the resource has reference fields** (e.g. `techniqueId` referencing `techniques`), expand `src/utils/filterUtils.ts` so `normalizeReferenceValue` converts the string ID to a `DocumentReference` for Firestore queries. The dataProvider handles everything else automatically.

5. **Add composite indexes** to `firestore.indexes.json` for any filter + sort combinations you'll use, then run `./deploy-rules.sh` (which also deploys indexes via `firebase.json`).

Use `src/resources/techniques/` as the reference pattern — particularly `TechniqueCreate.tsx` for the slug auto-fill component.

---

## Access Control

Users must have the Firebase custom claim `admin: true`. Set it via the Python snippet in the README or directly in the Firebase Admin SDK. The `authProvider` enforces this on login and on every `checkAuth` call.

---

## Environment Variables

All Firebase config is read from `import.meta.env.VITE_FIREBASE_*`. See `.env.example` for the full list. The `.env` file must be in the project root (same directory as `package.json`). `.firebaserc` (gitignored) holds the Firebase project alias — copy from `.firebaserc.example` and fill in the project ID.
