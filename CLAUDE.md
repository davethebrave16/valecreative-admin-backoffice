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
- **@dnd-kit** (`core`, `sortable`, `utilities`) — drag-and-drop primitives, used by the artworks "Sort" modal (see [Artwork Ordering](#artwork-ordering-gallerypositionfeaturedposition)) and the Gallery tab's "Sort images" modal (see [Gallery Image Ordering](#gallery-image-ordering-imageposition))

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
│   ├── SlugInput.tsx        # SlugAutoFillInput (Create) / SlugEditInput (Edit) — validated slug fields
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
    ├── slugify.ts           # toSlug(), SLUG_PATTERN, CONTENT_SLUG_PATTERN
    ├── imageFileName.ts     # coverFileName / galleryFileName — Storage file naming rules
    ├── debugLogger.ts       # Dev-only console wrappers for the dataProvider
    ├── refUtils.ts          # isDocRef, refId, flattenRefs — DocumentRef handling
    ├── dateUtils.ts         # normalizeDateFields — Firestore Timestamp → ms
    ├── filterUtils.ts       # normalizeReferenceValue — handles techniqueId and seriesId → DocumentReference
    ├── authUtils.ts         # getCurrentAdminEmail — for audit timestamps
    ├── storageUtils.ts      # getStorageFolderPath, deleteStorageFolder, IMAGE_UPLOAD_METADATA
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

`utils/slugify.ts` exports `toSlug(str)` — strips accents, lowercases, removes apostrophes without a separator (`dell'anello` → `dellanello`), turns every other run of non-alphanumerics into one hyphen and trims leading/trailing hyphens — plus `SLUG_PATTERN` (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) and `CONTENT_SLUG_PATTERN` (same, but `_` also allowed, because `contents` slugs are lookup keys like `homepage_hero`, not URLs).

All slug inputs come from `src/components/SlugInput.tsx`:
- `SlugAutoFillInput({ source, fromSource, allowUnderscore? })` — Create forms: auto-fills `toSlug(title/name)` until edited by hand; validated with the pattern (empty allowed, the Create `transform` falls back to `toSlug`).
- `SlugEditInput({ source, allowUnderscore? })` — Edit forms: `required` + pattern; shows a warning Alert as soon as the value differs from the saved record ("Cambiare lo slug cambia l'indirizzo della pagina…"). Edit forms never auto-update the slug.
- `contents` passes `allowUnderscore`. `CategoryEdit` keeps its slug `disabled` (not editable, not validated).
- A record with a non-conforming slug can't be saved from Edit until the slug is fixed. All existing data was normalized on 2026-09-27 (see below), so this only matters for data written outside the backoffice.
- **Changing the slug of a published artwork breaks its URL**: add a 301 rule to `firebase.json` → `hosting.redirects` in `valecreative-site` (see its README).

### Firebase Storage

`storage` (exported from `src/firebase.ts`) is used for media uploads. The `ImageUploadInput` component in `src/components/ImageUploadInput.tsx` is the shared upload primitive — use it for any resource with image fields.

Props:
- `source` — react-hook-form field path for the `ImageObject` (e.g., `"coverImage"`)
- `storagePath` — Storage folder prefix (e.g., `"series"`, `"artworks"`)
- `label` — section label shown above the control
- `slugSource` (default `'slug'`) / `titleSource` (default `'title'`; series pass `'name'`) — form fields watched to name the file and pre-fill the alt text

Behaviour on upload:
1. Reads natural width/height from the file
2. Computes a BlurHash (4×3 components) via an off-screen canvas + the `blurhash` package
3. Uploads to `{storagePath}/{uuid}/{slug}.{ext}` (`coverFileName` in `src/utils/imageFileName.ts`; falls back to the slugified original file name when the slug is still empty) with `IMAGE_UPLOAD_METADATA` (`Cache-Control: public, max-age=31536000, immutable`, from `src/utils/storageUtils.ts`)
4. Writes the full `ImageObject` to the form field on success. `alt` keeps a value the admin already typed, otherwise defaults to the record title/name, otherwise stays empty — in that case a warning Alert asks to add alt text

Only the original is uploaded and stored. The Firebase Resize Images extension is **not** installed and `thumb`/`medium` are never populated: `valecreative-site` generates responsive AVIF/WebP variants from `original` at build time. There is no English alt field (`ImageObject` has a single `alt`).

**File naming rules** (`src/utils/imageFileName.ts`, mirrored 1:1 in Python by `normalize_data.py` in `valecreative-firebase-set-scripts`, whose tests compare both outputs — regenerate its fixtures with `tests/generate_ts_fixtures.sh` whenever `slugify.ts` or `imageFileName.ts` change): cover `{slug}.{ext}`, gallery `{artworkSlug}-{n}.{ext}` (n = 1-based position; short random suffix if the name already exists in that gallery), always inside the per-upload `{uuid}` folder, lowercase extension, no spaces/accents. Storage cleanup (`deleteStorageFolder`) deletes the whole `uuid` folder, so it doesn't depend on the file name.

**Existing data (normalized on 2026-09-27)** — every image uploaded before these rules was brought to the same state by `normalize_data.py` (`valecreative-firebase-set-scripts`): files renamed to `{slug}.{ext}` / `{slug}-{n}.{ext}`, immutable Cache-Control on all objects, file-name-like alt texts replaced by the title, 10 slugs fixed (5 non-conforming, with redirects on the site; 5 duplicates renamed `-2` / `acrilico-su-tela`), old files and 23 orphan folders (incl. 5 unreferenced TIFFs) deleted. Every object in the bucket is now referenced by a document. The script is idempotent: run `normalize` in dry run periodically to catch drift (e.g. cover uploaded before typing the title, orphans left by "Replace image").

**Known limitation**: "Replace image" (and removing a gallery image from a document without deleting it) leaves the previous `uuid` folder orphaned in Storage — only deleting the record cleans up. `normalize_data.py cleanup-old-files --orphans` removes them.

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

**`submitCommission`** — HTTP callable (`onCall`), public (no auth/admin-claim required — this is the public commission/inquiry form's write path). Verifies a reCAPTCHA v3 token server-side via `RECAPTCHA_SECRET_KEY` (Firebase Secret Manager) before writing; requests scoring below `0.5` or failing verification are rejected with `HttpsError('permission-denied', ...)`. Validates and sanitizes all input (length limits, email format, HTML-tag stripping) before writing to the `commissions` collection via the Admin SDK. Silently discards submissions with a filled honeypot field (bot detection) without writing or erroring. This is now the **only** way to create `commissions` documents — direct client writes are blocked in `firestore.rules` (see above). On success, it also sends two transactional emails via the Brevo API (`functions/src/lib/brevo.ts` / `functions/src/lib/emailTemplates.ts`, Italian-only HTML templates): an owner notification (to `OWNER_NOTIFICATION_EMAIL`) with a "view in backoffice" link built from `BACKOFFICE_BASE_URL`, and a confirmation to the requester's submitted email. `OWNER_NOTIFICATION_EMAIL` supports a comma-separated list of addresses — each recipient gets its own independent send (built from the same template once, but not CC'd to each other) rather than a single email with everyone in `to:`. Both the owner notification(s) and the confirmation are sent from `EMAIL_SENDER_ADDRESS`. Email sending is best-effort — failures are logged (`console.error`) but never fail the callable or roll back the Firestore write, and every email (each owner recipient plus the confirmation) is sent independently via `Promise.allSettled` so one failing doesn't affect the others. `BREVO_API_KEY` is a Firebase Secret; `EMAIL_SENDER_ADDRESS`, `OWNER_NOTIFICATION_EMAIL`, and `BACKOFFICE_BASE_URL` are plain `functions/.env` vars.

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

Use `src/resources/techniques/` as the reference pattern; for the slug field use `SlugAutoFillInput` / `SlugEditInput` from `src/components/SlugInput.tsx` (see [Slug Generation](#slug-generation)).

### Image patterns

For a **single cover image** (e.g. `series.coverImage`, `artworks.coverImage`) use `ImageUploadInput` from `src/components/ImageUploadInput.tsx`.

For a **gallery subcollection** (e.g. `artworks/{id}/gallery`) see `src/resources/artworks/GalleryTab.tsx` (uploads use `galleryFileName` + `IMAGE_UPLOAD_METADATA`; default alt = artwork title, but it's editable afterward — see below). It uses `useGetList` / `useCreate` / `useUpdate` / `useDelete` with `meta: { parentResource: 'artworks', parentId: record.id }` to route through the generic dataProvider subcollection support. The Show view uses `TabbedShowLayout` to separate the Details and Gallery tabs.

### Artworks — origin & availability fields

`artworks` uses two string enum fields instead of a boolean `available`:

- **`origin`** (`personal` | `commissioned`) — how the work came to exist; drives the tab split in `ArtworkList` (All / Personal / Commissioned via MUI `Tabs` + `useListContext`/`setFilters`).
- **`availability`** (`for_sale` | `sold` | `not_for_sale`) — current commercial status; shown as a coloured chip in the list (green / gray / amber).
- **`categoryIds`** (`string[]`) — array of category document IDs (plain strings, not DocumentReferences). At least one is required. Set via `ReferenceArrayInput` + `AutocompleteArrayInput` pointing to the `categories` resource. The site uses this for client-side category chip filtering.

The **price** field is conditionally rendered in Create/Edit using a `ConditionalPriceInput` component that calls `useWatch({ name: 'availability' })` from `react-hook-form` — it returns `null` unless `availability === 'for_sale'`. Use this pattern for any future field that should only appear based on another field's value.

- **`isHero`** / **`isIntro`** (`boolean`) — pin an artwork to the homepage hero section or intro band respectively. Each is single-select: setting one to `true` on Edit queries Firestore for any other artwork with the same flag set and, if found, shows a confirm dialog that unsets the previous one before saving (see `ArtworkSaveButton` in `ArtworkEdit.tsx`, which handles both fields generically via an `EXCLUSIVE_FIELDS` config). Not enforced on Create.

`title`/`description` have optional English counterparts (`titleEn`/`descriptionEn`) — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields).

### Artwork Ordering (`galleryPosition`/`featuredPosition`)

`Artwork` carries two optional numeric fields for manual drag-and-drop ordering: `galleryPosition` (order within the `/works` public gallery, scoped per `origin`) and `featuredPosition` (order within the homepage featured section, scoped to `featured === true`). `GalleryImage` (the `artworks/{id}/gallery` subcollection) also carries an optional `imagePosition` for per-image drag-reorder inside a single artwork's gallery — see [Gallery Image Ordering](#gallery-image-ordering-imageposition) below. All three fields are optional and absent on every pre-existing document; nothing auto-populates them.

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

### Gallery Image Ordering (`imagePosition`)

`GalleryTab` (`src/resources/artworks/GalleryTab.tsx`, inside Artwork Edit/Show) has a "Sort images" button next to "Add image" (disabled when fewer than 2 images exist in the current artwork's gallery) that opens `SortGalleryModal` (`src/components/SortGalleryModal.tsx`), a MUI `Dialog` built with the same `@dnd-kit` primitives as `SortArtworksModal` (`DndContext` + `SortableContext` with `rectSortingStrategy` for a 2/3-column responsive grid, `PointerSensor`/`KeyboardSensor`, drag handle only via `useSortable` `listeners`/`attributes` — not the whole card).

- **Fetching bypasses the dataProvider** — the modal queries the `artworks/{id}/gallery` Firestore subcollection directly via the client SDK (`collection`/`getDocs`/`query`/`orderBy`), since subcollection routing via `meta` adds no value for a one-shot ordered read here.
- **Critical gotcha**: Firestore's `orderBy(field)` silently excludes any document that doesn't have that field set at all (not just documents where it's `null`) — it isn't a "nulls sort first/last" behavior, the document is dropped from the result set entirely. Since production gallery documents never had `imagePosition` populated before this feature shipped, both the modal's direct Firestore query and `GalleryTab`'s own `useGetList('gallery', ...)` call **must never pass `imagePosition` as the query's `sort`/`orderBy` field** — doing so returns zero images for any artwork whose gallery hasn't been manually reordered yet (this shipped as a regression once and was caught by images vanishing from a gallery with real data). Both instead query with `orderBy('uploadedAt', 'asc')` (a field always set by the upload flow) and apply a client-side re-sort by `imagePosition ?? Infinity` (ties preserve fetch order) afterward — mirroring the `applyGalleryPositionSort` pattern used for artworks, just done inline rather than in the dataProvider.
- Local state only during drag (`arrayMove` from `@dnd-kit/sortable`); Save order is disabled unless the current order differs from the initially-fetched order, or there are fewer than 2 images (shown via a `Tooltip`: "Add more images to reorder").
- On save: positions assigned with a gap of 1000 (`(index + 1) * 1000`), written via `writeBatch(db)` (`doc(db, 'artworks', artworkId, 'gallery', imageId)`), split into sequential batches over Firestore's 500-op limit — same shape as `SortArtworksModal`. On success calls `onSaved()` (which closes the modal and calls `GalleryTab`'s `refetch()`); on failure shows the same Italian Snackbar message ("Errore durante il salvataggio. Riprova.") and leaves the modal open.
- `GalleryCard` (upload, delete, alt/caption editing, all still routed through the dataProvider with `meta: { parentResource: 'artworks', parentId }`) is untouched by this feature. `GalleryCard` has an editable `alt` `TextField` alongside `caption`/`captionEn`, saved on blur the same way — it defaults to the artwork title at upload time (`GalleryTab.tsx`'s upload handler) but, unlike `ImageUploadInput`'s cover-image alt, can be edited per image after upload for a more specific description.

### Categories — guarded delete

`categories` stores artwork taxonomy labels (name + slug, plus optional `description` and their `nameEn`/`descriptionEn` counterparts — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields)). `description` is free text rendered by `valecreative-site` as intro copy on the category landing page and used as its meta description when present — it exists specifically to give category pages unique, keyword-rich copy for SEO. Each category can be assigned to multiple artworks via `categoryIds`. Delete is guarded: `CategoryShow` uses `GuardedDeleteButton` with `checkArrayField="categoryIds"`, which queries Firestore with `array-contains` before allowing deletion. If any artworks still reference the category, a blocking dialog lists them instead of proceeding.

`GuardedDeleteButton` in `src/components/GuardedDeleteButton.tsx` supports two modes:
- `checkField` — equality filter (used by techniques and series)
- `checkArrayField` — `array-contains` filter via direct Firestore query (used by categories)

### Categories — featured artwork

`Category` carries an optional `featuredArtworkId?: string` (`CATEGORY_FIELDS.FEATURED_ARTWORK_ID`) pointing at an `artworks` document id — a plain string id, not a Firestore `DocumentReference`, consistent with how `categoryIds` is stored on the artwork side. It is only editable from **`CategoryEdit`** (there is no picker on Create, since a not-yet-saved category has no id for any artwork to reference yet).

- **`src/components/FeaturedArtworkPicker.tsx`** exports two components:
  - `FeaturedArtworkInput` (used in `CategoryEdit`) — fetches the candidate artworks by querying Firestore directly with `where('categoryIds', 'array-contains', categoryId)` (same direct-Firestore pattern as `GuardedDeleteButton`'s `checkArrayField` mode, since `dataProvider.getList` only ever builds `==` filters — there's no `array-contains` support in the generic dataProvider, and react-admin's stock `ReferenceInput`/`ReferenceArrayInput` can't filter a *third* collection by array-contains either). Renders a thumbnail-list radio picker (MUI `List`/`ListItemButton`, 48×48 cover-image thumbnails) plus a "None" option to clear the selection. Shows an info `Alert` instead of the list when zero artworks reference the category yet. Wires into the form the same way `ImageUploadInput.tsx` does — `useFormContext()` + `register(source)` + `setValue(source, id | undefined, { shouldDirty: true })` — rather than react-admin's `useInput`, so no `transform` prop is needed on `<Edit>`.
  - `FeaturedArtworkPreview` (used in `CategoryShow` and `CategoriesList`) — looks up the referenced artwork via `useGetOne('artworks', { id: record.featuredArtworkId }, { enabled: !!record.featuredArtworkId })` and renders its `coverImage` (`small` size for the List thumbnail column, `large` size with the artwork title as a caption for Show). Renders "No featured artwork selected" text when unset.
- **Known limitation, accepted for v1**: if an artwork's `categoryIds` is later edited to drop this category, the category's `featuredArtworkId` is *not* automatically cleared — it still resolves to a real artwork (the image keeps displaying), it's just no longer semantically "in" the category. No Cloud Function trigger or extra guard was added for this, mirroring how `GuardedDeleteButton` already only guards *deletion* of the category, not `categoryIds` edits on the artwork side.
- No `firestore.indexes.json` or `firestore.rules` change was needed — the array-contains query has no `orderBy`, which Firestore's automatic single-field indexing covers (same as `GuardedDeleteButton`'s existing identical query), and `artworks` already has `allow read: if true`.

### Techniques — category enum

`Technique.category` (`src/types/resources.ts`) is a fixed enum with Italian display labels via `TECHNIQUE_CATEGORY_LABELS`:

| Value | Label |
|-------|-------|
| `painting` | Pittura |
| `engraving` | Incisione |
| `craft` | Artigianato |
| `drawing` | Disegno |
| `photography` | Fotografia |
| `other` | Altro |

`valecreative-site` mirrors this enum exactly in `src/lib/types.ts` and translates each value into IT/EN via per-locale dictionaries (`src/i18n/it.ts` / `src/i18n/en.ts`, `techniques.category`) rather than the `*En`-field bilingual pattern, since the category isn't admin-editable free text. Adding or renaming a category means updating both repos: this enum + label map here, and the type + both locale dictionaries there.

### Commissions — read and triage only

`commissions` stores inbound commission requests submitted externally by clients. The backoffice provides **no Create and no Delete** — documents originate from the public site form, which calls the `submitCommission` Cloud Function (reCAPTCHA v3 verified, server-side validated); direct client writes to Firestore are blocked by `firestore.rules`.

- **Editable fields**: `status` (`new` | `in_progress` | `completed` | `declined`) and `notes` (internal admin text). All client-submitted fields (`clientName`, `email`, `phone`, `description`, `estimatedBudget`, `requestedAt`) are shown read-only in the Edit view via `<Labeled>` + display fields.
- **List** sorts by `requestedAt` descending, shows a coloured status chip (blue / amber / green / grey), and has no create button (`actions={false}`).
- **Show** toolbar contains only `<EditButton />` — no delete.

### Contents — body and publish guard

`contents` stores editorial text blocks for the public site (bio, homepage hero, statement, etc.). Two notable behaviours:

- **`body`** is an HTML string edited via `RichTextInput` from `ra-input-rich-text` (Tiptap v2). It integrates natively with react-admin's form system and outputs an HTML string stored directly in Firestore.
- **`published`** (boolean, default `false`) controls frontend visibility. The `DeleteButton` in `ContentsShow` is rendered conditionally — it only appears when `record.published === false`. To delete a live content block, the admin must first unpublish it. This prevents accidental removal of production content.
- **`slug`** is the primary frontend lookup key (e.g. `bio`, `homepage_hero`). The examples use underscores; `toSlug()` produces hyphens. The auto-fill in Create is a starting point — admins should treat the slug as a manually-set identifier and adjust it before saving. Contents slugs are validated with `CONTENT_SLUG_PATTERN` (lowercase, digits, hyphens or underscores).

`title`/`body` have optional English counterparts (`titleEn`/`bodyEn`) — see [Bilingual (IT/EN) content fields](#bilingual-iten-content-fields).

### Bilingual (IT/EN) content fields

`contents`, `artworks`, `techniques`, `categories`, and the artworks' `gallery` subcollection each carry the Italian text fields (`title`/`name`/`description`/`body`/`caption`) plus **optional** English sibling fields, flat-suffixed with `En`:

| Resource | Italian field | English field |
|----------|---------------|---------------|
| `contents` | `title`, `body` | `titleEn`, `bodyEn` |
| `artworks` | `title`, `description` | `titleEn`, `descriptionEn` |
| `techniques` | `name`, `description` | `nameEn`, `descriptionEn` |
| `categories` | `name`, `description` | `nameEn`, `descriptionEn` |
| `artworks/{id}/gallery` | `caption` | `captionEn` |

The `*En` fields are never required and are rendered in an **"English (optional)"** section at the bottom of each Create/Edit form (or inline next to the caption field, for the gallery). Slugs are always derived from the Italian field only — the English fields never drive slug auto-fill. `valecreative-site` reads these fields at build time and falls back to the Italian value whenever the English one is empty, so translations can be filled in gradually per document (see `src/lib/fetchContent.ts` and `src/i18n/utils.ts` in that repo). When adding bilingual support to a future text field, follow this same flat-suffix convention rather than introducing a nested `{it, en}` shape — it requires no data migration and no dataProvider changes, since Firestore writes pass through arbitrary fields generically.

---

## Access Control

Users must have the Firebase custom claim `admin: true`. Set it via the Python snippet in the README or directly in the Firebase Admin SDK. The `authProvider` enforces this on login and on every `checkAuth` call.

---

## Environment Variables

All Firebase config is read from `import.meta.env.VITE_FIREBASE_*`. See `.env.example` for the full list. The `.env` file must be in the project root (same directory as `package.json`). `.firebaserc` (gitignored) holds the Firebase project alias — copy from `.firebaserc.example` and fill in the project ID.
