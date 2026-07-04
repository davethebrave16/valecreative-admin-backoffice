# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the project root (where `package.json` lives):

```bash
npm run dev           # Vite dev server → http://localhost:5173
npm run build         # tsc -b && vite build (type-check + production build)
npm run lint          # ESLint
npm run preview       # Preview production build locally
npm run deploy:rules          # Deploy Firestore rules only
npm run deploy:storage-rules  # Deploy Storage rules only
npm run deploy:functions      # Deploy Cloud Functions only
npm run deploy:hosting        # Build + deploy to Firebase Hosting
npm run deploy                # Build + deploy all (rules, storage, functions, hosting)
```

Convenience scripts:

```bash
./setup.sh         # Install deps + create .env and .firebaserc from templates
./rundev.sh        # Auto-install if needed, then start dev server
./deploy-rules.sh          # Deploy Firestore rules
./deploy-storage-rules.sh  # Deploy Storage rules
./deploy-functions.sh      # Deploy Cloud Functions
./deploy-hosting.sh        # Build + deploy hosting
./deploy-all.sh            # Build + deploy everything
```

There are no automated tests (`npm test` is not configured).

---

## Architecture

### Tech Stack

- **React-Admin v5** — admin framework; all CRUD views, hooks, and layout come from it
- **React 19 + TypeScript** — strict mode
- **Vite 7** — build tool
- **Firebase 12** — Firestore (data), Auth (Google OAuth + custom claims), Storage (media uploads)
- **Material UI v9** — UI component library used alongside React-Admin primitives
- **@dnd-kit** (`core`, `sortable`, `utilities`) — drag-and-drop primitives, used only by the artworks "Sort" modal (see [Artwork Ordering](#artwork-ordering-gallerypositionfeaturedposition))

### Project Layout

```
src/
├── App.tsx                  # <Admin> root — registers <Resource>s and <CustomRoutes>
├── firebase.ts              # Firebase app init (auth, db, storage, googleProvider)
├── theme.ts                 # MUI theme — primary colour #2e6b55 (forest green)
├── index.css / App.css      # Global styles
├── main.tsx                 # React entry point
├── vite-env.d.ts
├── providers/
│   ├── authProvider.ts      # Firebase Auth; enforces admin: true custom claim
│   └── dataProvider.ts      # Firestore CRUD — generic, handles all collections
├── hooks/
│   └── useDashboardStats.ts # Aggregates Dashboard stat-card data (see Dashboard Stats below)
├── components/
│   ├── Login.tsx            # Google sign-in page
│   ├── Dashboard.tsx        # Post-login home page (shown at /) — renders real stat cards via useDashboardStats
│   ├── ImageUploadInput.tsx # Reusable image upload → Firebase Storage (source, storagePath props)
│   └── SortArtworksModal.tsx # Drag-and-drop reorder modal for artworks, opened from ArtworkList's "Sort" button
├── layout/
│   └── Layout.tsx           # AppBar with version, user avatar, and Logout button
├── resources/
│   ├── techniques/          # TechniqueList, TechniqueCreate, TechniqueEdit, TechniqueShow
│   ├── series/              # SeriesList, SeriesCreate, SeriesEdit, SeriesShow
│   ├── artworks/            # ArtworkList, ArtworkCreate, ArtworkEdit, ArtworkShow, GalleryTab
│   ├── contents/            # ContentsList, ContentsCreate, ContentsEdit, ContentsShow
│   ├── commissions/         # CommissionsList, CommissionsShow, CommissionsEdit (no Create, no Delete)
│   └── categories/          # CategoriesList, CategoryCreate, CategoryEdit, CategoryShow (guarded delete)
├── types/
│   ├── base.ts              # BaseRecord, TimestampFields, AdminTrackingFields
│   ├── resources.ts         # Per-resource interfaces + FIELDS constants + category labels
│   └── index.ts             # Barrel export
└── utils/
    ├── slugify.ts           # toSlug() — accent-stripping slug generator
    ├── debugLogger.ts       # Dev-only console wrappers for the dataProvider
    ├── refUtils.ts          # isDocRef, refId, flattenRefs — DocumentRef handling
    ├── dateUtils.ts         # normalizeDateFields — Firestore Timestamp → ms
    ├── filterUtils.ts       # normalizeReferenceValue — handles techniqueId and seriesId → DocumentReference
    ├── authUtils.ts         # getCurrentAdminEmail — for audit timestamps
    ├── storageUtils.ts      # getStorageFolderPath, deleteStorageFolder — Storage cleanup helpers
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
- `/` → Dashboard (registered via `<CustomRoutes>`) — shows commission/artwork stat cards, see [Dashboard Stats](#dashboard-stats)
- `/techniques` → Techniques CRUD (List / Create / Edit / Show)
- `/series` → Series CRUD (List / Create / Edit / Show)
- `/artworks` → Artworks CRUD (List / Create / Edit / Show with tabbed Details + Gallery)
- `/contents` → Contents CRUD (List / Create / Edit / Show); delete only available when `published === false`
- `/commissions` → Commissions (List / Show / Edit only — no Create, no Delete); documents are created externally by clients via the `submitCommission` Cloud Function
- `/categories` → Categories CRUD (List / Create / Edit / Show); delete is guarded — blocked when any artwork references the category via `categoryIds`

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
- **Storage cleanup on delete**: `delete` and `deleteMany` automatically remove Firebase Storage files for `series` (cover image), `artworks` (cover image + entire gallery subcollection), `gallery` (individual image), and `contents` (optional image). Cleanup is best-effort — a storage failure does not roll back the Firestore delete. Uses `utils/storageUtils.ts`.
- **`applyGalleryPositionSort`** (artworks only): after the Firestore query for `getList` returns, if `resource === 'artworks'` and the sort is the default (`field` absent or `'createdAt'`, `order !== 'ASC'`), the result array gets an additional client-side sort by `galleryPosition` ascending (`?? Infinity`, so artworks without it sort to the end and unpopulated data produces no reordering — stable no-op). Any explicit column-header sort (`title`, `year`, etc.) or explicit `ASC` on `createdAt` bypasses this entirely. This is what lets the drag-order set in the "Sort" modal (see [Artwork Ordering](#artwork-ordering-gallerypositionfeaturedposition)) actually affect `ArtworkList`'s default view without adding a Firestore index or changing the underlying query.

### Dashboard Stats

`src/hooks/useDashboardStats.ts` computes the six stat cards shown on `/` (`Dashboard.tsx`): new/in-progress/closed commission counts, the most recent commission `requestedAt`, total artwork count, and the most-used technique. All commission/artwork **counts** use `useGetList(resource, { pagination: { page: 1, perPage: 1 }, filter: {...} })` and read `.total` — cheap because `dataProvider.getList` always runs a Firestore `getCountFromServer` for `total`, regardless of `perPage`. "Closed" sums two separate count queries (`status === 'completed'` and `status === 'declined'`) since the dataProvider has no `in`/`or` filter support. There is **no server-side `group by` / aggregation** in the dataProvider — "Most Used Technique" is computed by fetching all `artworks` and all `techniques` (perPage 1000 each) and tallying `techniqueId` occurrences client-side in a `useMemo`. If either collection grows past a few thousand documents, this tally should move to a scheduled Cloud Function that maintains a precomputed counter document instead of fetching everything on every Dashboard load.

### Slug Generation

`utils/slugify.ts` exports `toSlug(str)` — strips accents, lowercases, replaces spaces with hyphens. Used in Create forms for auto-fill. Edit forms never auto-update the slug to avoid breaking public URLs.

### Firebase Storage

`storage` (exported from `src/firebase.ts`) is used for media uploads. The `ImageUploadInput` component in `src/components/ImageUploadInput.tsx` is the shared upload primitive — use it for any resource with image fields.

Props:
- `source` — react-hook-form field path for the `ImageObject` (e.g., `"coverImage"`)
- `storagePath` — Storage folder prefix (e.g., `"series"`, `"artworks"`)
- `label` — section label shown above the control

Behaviour on upload:
1. Reads natural width/height from the file
2. Computes a BlurHash (4×3 components) via an off-screen canvas + the `blurhash` package
3. Uploads to `{storagePath}/{uuid}/{filename}` in Firebase Storage
4. Writes the full `ImageObject` to the form field on success

The `thumb` and `medium` variants are auto-generated by the Firebase Resize Images extension — the component only uploads the original.

Storage rules live in `storage.rules`. Deploy with `./deploy-storage-rules.sh`.

**CORS** — `storage.rules` controls authorization; CORS is a separate GCS-level setting that `firebase deploy` does not touch. It must be applied once with:
```bash
gsutil cors set storage.cors.json gs://your-project-id.firebasestorage.app
```
The `storage.cors.json` file at the project root includes `localhost:5173` and the default Firebase Hosting domains. Add custom domains to the `origin` array before running. The change is immediate.

### Firestore Rules

`firestore.rules` enforces:
- `isAdmin()` — `request.auth.token.admin == true` (mirrors `authProvider.ts`)
- Public reads: `artworks`, `series`, `techniques`, `contents`, `categories`
- `commissions`: reads/updates/deletes admin-only; creates are blocked entirely (`allow create: if false`) — writes only happen server-side via the `submitCommission` Cloud Function using the Admin SDK, which bypasses rules

Deploy with `./deploy-rules.sh` after any rule change.

### Cloud Functions

`functions/` is a standalone TypeScript package compiled to CommonJS (`functions/lib/`). Firebase CLI auto-builds it via the `predeploy` hook in `firebase.json` before every deploy.

**One-time setup (new environment):**
```bash
cd functions && npm install
cp functions/.env.example functions/.env   # set GITHUB_OWNER, GITHUB_REPO, EMAIL_SENDER_ADDRESS, OWNER_NOTIFICATION_EMAIL, BACKOFFICE_BASE_URL
firebase functions:secrets:set GITHUB_DISPATCH_TOKEN  # GitHub PAT with repo scope
firebase functions:secrets:set RECAPTCHA_SECRET_KEY   # reCAPTCHA v3 secret key
firebase functions:secrets:set BREVO_API_KEY          # Brevo transactional email API key
```

**Deploy:**
```bash
./deploy-functions.sh
# or: npm run deploy:functions
# or: firebase deploy --only functions
```

**`publishSite`** — HTTP callable (`onCall`). Requires `admin: true` custom claim. Reads `GITHUB_OWNER`/`GITHUB_REPO` from `functions/.env` and `GITHUB_DISPATCH_TOKEN` from Firebase Secret Manager. POSTs a `repository_dispatch` event to the GitHub API with `event_type: publish-site` and returns `{ ok: true }` on success.

**`submitCommission`** — HTTP callable (`onCall`), public (no auth/admin-claim required — this is the public commission/inquiry form's write path). Verifies a reCAPTCHA v3 token server-side via `RECAPTCHA_SECRET_KEY` (Firebase Secret Manager) before writing; requests scoring below `0.5` or failing verification are rejected with `HttpsError('permission-denied', ...)`. Validates and sanitizes all input (length limits, email format, HTML-tag stripping) before writing to the `commissions` collection via the Admin SDK. Silently discards submissions with a filled honeypot field (bot detection) without writing or erroring. This is now the **only** way to create `commissions` documents — direct client writes are blocked in `firestore.rules` (see above). On success, it also sends two transactional emails via the Brevo API (`functions/src/lib/brevo.ts` / `functions/src/lib/emailTemplates.ts`, Italian-only HTML templates): an owner notification (to `OWNER_NOTIFICATION_EMAIL`) with a "view in backoffice" link built from `BACKOFFICE_BASE_URL`, and a confirmation to the requester's submitted email. Both are sent from `EMAIL_SENDER_ADDRESS`. Email sending is best-effort — failures are logged (`console.error`) but never fail the callable or roll back the Firestore write, and the two emails are sent independently via `Promise.allSettled` so one failing doesn't affect the other. `BREVO_API_KEY` is a Firebase Secret; `EMAIL_SENDER_ADDRESS`, `OWNER_NOTIFICATION_EMAIL`, and `BACKOFFICE_BASE_URL` are plain `functions/.env` vars.

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

### Image patterns

For a **single cover image** (e.g. `series.coverImage`, `artworks.coverImage`) use `ImageUploadInput` from `src/components/ImageUploadInput.tsx`.

For a **gallery subcollection** (e.g. `artworks/{id}/gallery`) see `src/resources/artworks/GalleryTab.tsx`. It uses `useGetList` / `useCreate` / `useUpdate` / `useDelete` with `meta: { parentResource: 'artworks', parentId: record.id }` to route through the generic dataProvider subcollection support. The Show view uses `TabbedShowLayout` to separate the Details and Gallery tabs.

### Artworks — origin & availability fields

`artworks` uses two string enum fields instead of a boolean `available`:

- **`origin`** (`personal` | `commissioned`) — how the work came to exist; drives the tab split in `ArtworkList` (All / Personal / Commissioned via MUI `Tabs` + `useListContext`/`setFilters`).
- **`availability`** (`for_sale` | `sold` | `not_for_sale`) — current commercial status; shown as a coloured chip in the list (green / gray / amber).
- **`categoryIds`** (`string[]`) — array of category document IDs (plain strings, not DocumentReferences). At least one is required. Set via `ReferenceArrayInput` + `AutocompleteArrayInput` pointing to the `categories` resource. The site uses this for client-side category chip filtering.

The **price** field is conditionally rendered in Create/Edit using a `ConditionalPriceInput` component that calls `useWatch({ name: 'availability' })` from `react-hook-form` — it returns `null` unless `availability === 'for_sale'`. Use this pattern for any future field that should only appear based on another field's value.

- **`isHero`** / **`isIntro`** (`boolean`) — pin an artwork to the homepage hero section or intro band respectively. Each is single-select: setting one to `true` on Edit queries Firestore for any other artwork with the same flag set and, if found, shows a confirm dialog that unsets the previous one before saving (see `ArtworkSaveButton` in `ArtworkEdit.tsx`, which handles both fields generically via an `EXCLUSIVE_FIELDS` config). Not enforced on Create.

`title`/`description` have optional English counterparts (`titleEn`/`descriptionEn`) — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields).

### Artwork Ordering (`galleryPosition`/`featuredPosition`)

`Artwork` carries two optional numeric fields for manual drag-and-drop ordering: `galleryPosition` (order within the `/works` public gallery, scoped per `origin`) and `featuredPosition` (order within the homepage featured section, scoped to `featured === true`). `GalleryImage` (the `artworks/{id}/gallery` subcollection) also carries an optional `imagePosition` — this field exists in the type and is reserved for a future per-image drag-reorder inside a single artwork's gallery, but **no UI reads or writes it yet**. All three fields are optional and absent on every pre-existing document; nothing auto-populates them.

- **`ArtworkList`** has a "Sort" button (`src/resources/artworks/ArtworkList.tsx`, next to Create) that opens `SortArtworksModal` (`src/components/SortArtworksModal.tsx`), a MUI `Dialog` built with `@dnd-kit` (`DndContext` + `SortableContext`, `PointerSensor`/`KeyboardSensor`).
- The modal has three independent tabs, each backed by its own `useGetList<Artwork>('artworks', { filter, pagination: { perPage: 200 } })` call and its own local drag state (via a shared `useSortableTab` hook):

  | Tab | Filter | Field written on save |
  |-----|--------|------------------------|
  | Personal Gallery | `{ origin: 'personal' }` | `galleryPosition` |
  | Commissioned Gallery | `{ origin: 'commissioned' }` | `galleryPosition` |
  | Featured | `{ featured: true }` | `featuredPosition` |

  Personal and Commissioned share the `galleryPosition` field name but are numbered independently within their own tab/filter — this mirrors the public `/works` page, which shows all artworks and lets the visitor toggle between Personal/Commissioned tabs client-side (`valecreative-site`'s `WorksGrid.tsx`), so each origin needs its own coherent order.
- Rows only reorder in local state on drag (`arrayMove` from `@dnd-kit/sortable`) — no Firestore write happens until **Save order** is clicked, which is disabled unless at least one tab's order differs from what was originally fetched. Switching tabs preserves each tab's in-progress edits; closing the modal (Cancel or backdrop) discards everything by unmounting, so the next open re-fetches clean.
- On save: for each changed tab, positions are assigned with a gap of 1000 (`(index + 1) * 1000`) and written via `writeBatch(db)` (`doc(db, 'artworks', id)`), split into multiple sequential batches if a tab's operation count would exceed Firestore's 500-per-batch limit. On success it calls `refresh()` (react-admin) and closes the modal; on failure it shows a Snackbar ("Errore durante il salvataggio. Riprova.") and leaves the modal open so nothing is lost.
- See [Data Provider](#data-provider) (`applyGalleryPositionSort`) for how `galleryPosition` feeds back into `ArtworkList`'s default sort order.

### Categories — guarded delete

`categories` stores artwork taxonomy labels (name + slug, plus an optional `nameEn` — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields)). Each category can be assigned to multiple artworks via `categoryIds`. Delete is guarded: `CategoryShow` uses `GuardedDeleteButton` with `checkArrayField="categoryIds"`, which queries Firestore with `array-contains` before allowing deletion. If any artworks still reference the category, a blocking dialog lists them instead of proceeding.

`GuardedDeleteButton` in `src/components/GuardedDeleteButton.tsx` supports two modes:
- `checkField` — equality filter (used by techniques and series)
- `checkArrayField` — `array-contains` filter via direct Firestore query (used by categories)

### Commissions — read and triage only

`commissions` stores inbound commission requests submitted externally by clients. The backoffice provides **no Create and no Delete** — documents originate from the public site form, which calls the `submitCommission` Cloud Function (reCAPTCHA v3 verified, server-side validated); direct client writes to Firestore are blocked by `firestore.rules`.

- **Editable fields**: `status` (`new` | `in_progress` | `completed` | `declined`) and `notes` (internal admin text). All client-submitted fields (`clientName`, `email`, `phone`, `description`, `estimatedBudget`, `requestedAt`) are shown read-only in the Edit view via `<Labeled>` + display fields.
- **List** sorts by `requestedAt` descending, shows a coloured status chip (blue / amber / green / grey), and has no create button (`actions={false}`).
- **Show** toolbar contains only `<EditButton />` — no delete.

### Contents — body and publish guard

`contents` stores editorial text blocks for the public site (bio, homepage hero, statement, etc.). Two notable behaviours:

- **`body`** is an HTML string edited via `RichTextInput` from `ra-input-rich-text` (Tiptap v2). It integrates natively with react-admin's form system and outputs an HTML string stored directly in Firestore.
- **`published`** (boolean, default `false`) controls frontend visibility. The `DeleteButton` in `ContentsShow` is rendered conditionally — it only appears when `record.published === false`. To delete a live content block, the admin must first unpublish it. This prevents accidental removal of production content.
- **`slug`** is the primary frontend lookup key (e.g. `bio`, `homepage_hero`). The examples use underscores; `toSlug()` produces hyphens. The auto-fill in Create is a starting point — admins should treat the slug as a manually-set identifier and adjust it before saving.

`title`/`body` have optional English counterparts (`titleEn`/`bodyEn`) — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields).

### Bilingual (IT/EN) content fields

`contents`, `artworks`, `techniques`, `categories`, and the artworks' `gallery` subcollection each carry the Italian text fields (`title`/`name`/`description`/`body`/`caption`) plus **optional** English sibling fields, flat-suffixed with `En`:

| Resource | Italian field | English field |
|----------|---------------|---------------|
| `contents` | `title`, `body` | `titleEn`, `bodyEn` |
| `artworks` | `title`, `description` | `titleEn`, `descriptionEn` |
| `techniques` | `name`, `description` | `nameEn`, `descriptionEn` |
| `categories` | `name` | `nameEn` |
| `artworks/{id}/gallery` | `caption` | `captionEn` |

The `*En` fields are never required and are rendered in an **"English (optional)"** section at the bottom of each Create/Edit form (or inline next to the caption field, for the gallery). Slugs are always derived from the Italian field only — the English fields never drive slug auto-fill. `valecreative-site` reads these fields at build time and falls back to the Italian value whenever the English one is empty, so translations can be filled in gradually per document (see `src/lib/fetchContent.ts` and `src/i18n/utils.ts` in that repo). When adding bilingual support to a future text field, follow this same flat-suffix convention rather than introducing a nested `{it, en}` shape — it requires no data migration and no dataProvider changes, since Firestore writes pass through arbitrary fields generically.

---

## Access Control

Users must have the Firebase custom claim `admin: true`. Set it via the Python snippet in the README or directly in the Firebase Admin SDK. The `authProvider` enforces this on login and on every `checkAuth` call.

---

## Environment Variables

All Firebase config is read from `import.meta.env.VITE_FIREBASE_*`. See `.env.example` for the full list. The `.env` file must be in the project root (same directory as `package.json`). `.firebaserc` (gitignored) holds the Firebase project alias — copy from `.firebaserc.example` and fill in the project ID.
