# Vale Creative Admin Backoffice

A React-Admin based admin panel for managing the Vale Creative platform, built with React, TypeScript, and Firebase.

---

## Table of Contents

- [Overview](#overview)
- [Application Modules](#application-modules)
- [Firestore Database Structure](#firestore-database-structure)
- [Setup](#setup)
- [Deployment](#deployment)
- [Access Control](#access-control)
- [Troubleshooting](#troubleshooting)

---

## Overview

Vale Creative Admin Backoffice is the administration panel for managing the Vale Creative platform.

The application uses:
- **React-Admin** as the admin framework
- **Firebase/Firestore** as the backend database
- **Google Authentication** with custom claims for access control
- **Material UI** for the component library

---

## Application Modules

### Dashboard

The post-login landing page (`/`), rendered by `src/components/Dashboard.tsx`. Shows a greeting (avatar + admin name from `useGetIdentity`) and six real-time stat cards computed from Firestore via `src/hooks/useDashboardStats.ts`:

| Stat | Source |
|------|--------|
| New Requests | Count of `commissions` where `status === 'new'` |
| In Progress | Count of `commissions` where `status === 'in_progress'` |
| Closed | Count of `commissions` where `status === 'completed'` **plus** `status === 'declined'` (summed client-side from two separate count queries) |
| Last Request | Most recent `requestedAt` across all `commissions` |
| Total Artworks | Count of all documents in `artworks` |
| Most Used Technique | The `techniques.name` referenced by the most `artworks.techniqueId` values, tallied client-side |

> All counts use `useGetList` with `pagination: { page: 1, perPage: 1 }` — the dataProvider's `getList` always runs a Firestore `getCountFromServer` for `total` independent of `perPage`, so this is a cheap way to get an exact count without downloading records. There is no Firestore-side aggregation for "Most Used Technique" — the hook fetches all `artworks` and `techniques` (capped at 1000 each) and tallies technique usage in a `useMemo`. Stat cards are static (non-clickable) — they do not navigate or apply filters when clicked.

### Techniques

Full CRUD for the `techniques` collection — the controlled vocabulary of artistic techniques used to classify artworks.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Required |
| `nameEn` | string | Optional — English translation of `name`; site falls back to `name` if empty |
| `slug` | string | Auto-filled from name on Create; manually editable; not auto-updated on Edit |
| `description` | string | Optional |
| `descriptionEn` | string | Optional — English translation of `description`; site falls back to `description` if empty |
| `category` | enum | `painting` · `engraving` · `craft` · `drawing` · `photography` · `other` (displayed in Italian) |
| `createdAt` / `updatedAt` | timestamp | Auto-managed by the dataProvider |

### Artworks

Full CRUD for the `artworks` collection — the core catalogue of individual works.

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Required |
| `titleEn` | string | Optional — English translation of `title`; site falls back to `title` if empty |
| `slug` | string | Auto-filled from title on Create; manually editable; not auto-updated on Edit |
| `year` | number | Required |
| `techniqueId` | string | Required — references a `techniques` document |
| `seriesId` | string | Optional — references a `series` document |
| `coverImage` | ImageObject | Single cover image; set in Create/Edit; same structure as `series.coverImage` |
| `origin` | enum | Required — `personal` · `commissioned` |
| `availability` | enum | Required — `for_sale` · `sold` · `not_for_sale` |
| `price` | number | Optional; only shown/relevant when `availability === 'for_sale'` |
| `featured` | boolean | Defaults to `false` |
| `isHero` | boolean | Defaults to `false`; only one artwork should be `true` at a time (enforced by a confirm dialog on Edit); pins the artwork as the homepage hero image |
| `isIntro` | boolean | Defaults to `false`; only one artwork should be `true` at a time (enforced by a confirm dialog on Edit); pins the artwork's cover image in the homepage intro band on the public site |
| `dimensions.height` / `dimensions.width` | number | Physical dimensions |
| `dimensions.unit` | string | e.g. `cm`, `mm`, `in` |
| `support` | string | e.g. `canvas`, `wood panel`, `paper` |
| `description` | string | Optional |
| `descriptionEn` | string | Optional — English translation of `description`; site falls back to `description` if empty |
| `galleryPosition` | number | Optional — manual display order within its `origin` group (`personal`/`commissioned`), set by dragging in the "Sort" modal; absent on artworks that have never been reordered |
| `featuredPosition` | number | Optional — manual display order among `featured === true` artworks for the homepage featured section, set by the same "Sort" modal |
| `createdAt` / `updatedAt` | timestamp | Auto-managed by the dataProvider |

> Delete is available from both the Show view toolbar and the Edit view toolbar.
> The Show view has two tabs: **Details** (all scalar fields + cover image) and **Gallery** (subcollection management).
> The gallery is stored as `artworks/{id}/gallery` subcollection — each document is an image with an optional caption (`caption`), an optional English translation (`captionEn`, falls back to `caption` on the site), and an optional `imagePosition` (manual per-image order within the gallery, set via the "Sort images" button — see below).
> Image variants (`thumb`, `medium`) are auto-generated by the Firebase Resize Images extension.
> **Cascade delete**: deleting an artwork also deletes its cover image and all gallery images from Firebase Storage, and removes all gallery subcollection documents. Deleting an individual gallery image (via the Gallery tab) also removes its Storage files.

#### Manual ordering ("Sort" button)

The Artworks List has a **Sort** button (next to Create) that opens a drag-and-drop modal (`src/components/SortArtworksModal.tsx`) with three tabs:

| Tab | Scope | Field written |
|-----|-------|----------------|
| Personal Gallery | Artworks with `origin === 'personal'` | `galleryPosition` |
| Commissioned Gallery | Artworks with `origin === 'commissioned'` | `galleryPosition` |
| Featured | Artworks with `featured === true` | `featuredPosition` |

Each tab is fetched and reordered independently (Personal and Commissioned artworks get their own `galleryPosition` numbering even though they share the same field). Dragging only updates local state — nothing is written until **Save order** is clicked, which is disabled unless a tab's order actually changed. On save, positions are assigned with a gap of 1000 (1000, 2000, 3000…) and written via a Firestore `writeBatch` (split into multiple batches if a tab exceeds the 500-operation batch limit). The Artworks List's default sort (`createdAt` descending) is followed by a client-side secondary sort by `galleryPosition` — once an artwork has a `galleryPosition`, it takes priority over `createdAt` in that default view; artworks without it sort to the end, so this is fully backward-compatible with existing, unordered records.

#### Manual ordering ("Sort images" button, Gallery tab)

The **Gallery** tab (inside Artwork Edit/Show) has a **Sort images** button next to "Add image" (disabled when fewer than 2 images exist) that opens a drag-and-drop modal (`src/components/SortGalleryModal.tsx`) for that artwork's `artworks/{id}/gallery` subcollection. It fetches the gallery directly via the Firestore client SDK (not through the dataProvider), ordered by `uploadedAt` ascending — `imagePosition` is never used as the Firestore query's `orderBy` field because Firestore's `orderBy` silently excludes any document missing that field entirely, which would hide every pre-existing image that has never been reordered. Instead, the fetched results are re-sorted client-side by `imagePosition ?? Infinity` (ties preserve the `uploadedAt` fetch order), which is fully backward-compatible with the existing production data where no gallery document has `imagePosition` set. Dragging only updates local state; **Save order** (disabled until the order actually changes, or with fewer than 2 images) assigns positions with a gap of 1000 and writes them via a Firestore `writeBatch`, then triggers a refetch of the Gallery tab. The Gallery tab's own image list applies the same `imagePosition ?? Infinity` client-side sort after fetching (its `useGetList` query itself still sorts by `uploadedAt` for the same reason as above).

### Series

Full CRUD for the `series` collection — curatorial groupings of artworks displayed on the public site.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Required |
| `slug` | string | Auto-filled from name on Create; manually editable; not auto-updated on Edit |
| `description` | string | Optional |
| `published` | boolean | Controls public visibility; defaults to `false` |
| `order` | number | Manual sort order; lower numbers appear first |
| `coverImage.original` | string | Firebase Storage download URL for the full-resolution image |
| `coverImage.alt` | string | Accessibility alt text |
| `coverImage.width` / `coverImage.height` | number | Natural dimensions of the original in px |
| `coverImage.blurHash` | string | BlurHash string for progressive loading |
| `createdAt` / `updatedAt` | timestamp | Auto-managed by the dataProvider |

> `coverImage.thumb` and `coverImage.medium` are auto-generated by the Firebase Resize Images extension and do not need to be filled in manually.

### Contents

Full CRUD for the `contents` collection — editorial text blocks used by the public site (bio, homepage hero, artist statement, etc.).

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Primary frontend lookup key (e.g. `bio`, `homepage_hero`, `statement`); auto-filled from title on Create, manually editable, not auto-updated on Edit |
| `title` | string | Required — human-readable label shown in the admin |
| `titleEn` | string | Optional — English translation of `title`; site falls back to `title` if empty |
| `body` | string | Required — rich text stored as HTML; edited via WYSIWYG editor (`ra-input-rich-text` / Tiptap) |
| `bodyEn` | string | Optional — English translation of `body`, same rich text editor; site falls back to `body` if empty |
| `published` | boolean | Controls frontend visibility; defaults to `false`; **records can only be deleted while unpublished** |
| `image.original` | string | Optional Firebase Storage download URL for the full-resolution image |
| `image.alt` | string | Accessibility alt text |
| `image.width` / `image.height` | number | Natural dimensions of the original in px |
| `image.blurHash` | string | BlurHash string for progressive loading |
| `createdAt` / `updatedAt` | timestamp | Auto-managed by the dataProvider |

> `image.thumb` and `image.medium` are auto-generated by the Firebase Resize Images extension and do not need to be filled in manually.
> Deleting a content record also removes its image from Firebase Storage (best-effort).

### Categories

Full CRUD for the `categories` collection — artwork taxonomy labels, assignable to multiple artworks via `artworks.categoryIds`.

| Field | Type | Notes |
|-------|------|-------|
| `name` | string | Required |
| `nameEn` | string | Optional — English translation of `name`; site falls back to `name` if empty |
| `slug` | string | Auto-filled from name on Create; not editable on Edit |
| `featuredArtworkId` | string | Optional — id of an `artworks` document to feature for this category; **editable only on Edit** (not Create, since a new category has no id for any artwork to reference yet); picked from a thumbnail list of artworks whose `categoryIds` already contains this category |
| `createdAt` / `updatedAt` | timestamp | Auto-managed by the dataProvider |

> **Featured artwork**: `CategoryEdit` shows a thumbnail-list picker (`src/components/FeaturedArtworkPicker.tsx`) built from a direct Firestore `array-contains` query against `artworks.categoryIds` — the generic dataProvider has no `array-contains` filter support, so this bypasses it the same way `GuardedDeleteButton`'s array-contains check does. The chosen artwork's cover image is then shown on `CategoryShow` (large, with title caption) and as a thumbnail column in `CategoriesList`. If an artwork is later edited to remove this category from its `categoryIds`, `featuredArtworkId` is **not** automatically cleared — this is a known, accepted limitation.
> **Guarded delete**: `CategoryShow` uses `GuardedDeleteButton` with `checkArrayField="categoryIds"` — deletion is blocked (with a dialog listing the referencing artworks) while any artwork still references the category.

### Commissions

Read + Edit only for the `commissions` collection — inbound commission requests from clients. Documents are created externally via the public site's commission form, which calls the `submitCommission` Cloud Function (reCAPTCHA v3 verified, server-side validated) — the backoffice itself has **no Create and no Delete**.

| Field | Type | Notes |
|-------|------|-------|
| `clientName` | string | Client's full name — read-only in admin |
| `email` | string | Client's email — read-only in admin |
| `phone` | string | Optional phone number — read-only in admin |
| `description` | string | Client's request description — read-only in admin |
| `status` | enum | **Editable** — `new` · `in_progress` · `completed` · `declined` |
| `estimatedBudget` | number | Optional budget in EUR — read-only in admin |
| `requestedAt` | timestamp | When the request was submitted — read-only in admin |
| `notes` | string | **Editable** — internal admin notes; not shown to the client |
| `updatedAt` | timestamp | Auto-managed by the dataProvider on every edit |

> The list is sorted by `requestedAt` descending (newest first) and shows coloured status chips: blue (New), amber (In Progress), green (Completed), grey (Declined).

---

## Firestore Database Structure

Six top-level collections. All use `createdAt` / `updatedAt` server timestamps and track `createdByAdmin` / `updatedByAdmin`.

| Collection | Description | Public reads |
|------------|-------------|--------------|
| `artworks` | Core artwork catalogue | Yes |
| `series` | Curatorial groupings | Yes |
| `techniques` | Controlled vocabulary | Yes |
| `categories` | Artwork taxonomy labels | Yes |
| `contents` | Editorial text blocks for the public site | Yes |
| `commissions` | Inbound commission requests | No — admin only |

> `commissions` documents can only be created via the `submitCommission` Cloud Function (server-side reCAPTCHA verification + validation) — direct client writes are blocked by `firestore.rules`.

---

## Setup

### 1. Create Firebase Web App

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **gear icon** → **Project settings**
4. Scroll to **Your apps** → **Add app** → **Web icon** (`</>`)
5. Register with nickname `valecreative-admin-backoffice`
6. Copy the generated configuration

### 2. Environment Configuration

Run `./setup.sh` — it creates both `.env` and `.firebaserc` from their example templates:

```bash
./setup.sh
```

Then fill in the values:

**.env**
```env
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

**.firebaserc** — replace the placeholder with your actual project ID:
```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3. Enable Google Authentication

1. Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Set a project support email → Save

### 4. Configure Firebase Storage CORS

Firebase Storage blocks browser uploads by default. Apply the CORS policy once per project using `gsutil`:

```bash
gsutil cors set storage.cors.json gs://your-project-id.firebasestorage.app
```

If `gsutil` is not installed:
```bash
brew install --cask google-cloud-sdk
gcloud auth login
```

The `storage.cors.json` file at the project root already includes `localhost:5173` and the default Firebase Hosting domains. If you use a **custom domain**, add it to the `origin` array before running the command. The change takes effect immediately — no redeployment needed.

> **Note:** `storage.rules` controls *authorization* (who can write). CORS is a separate GCS-level setting that `firebase deploy` does not touch — it must be applied once with `gsutil`.

### 5. Cloud Functions Setup

The `publishSite` callable function triggers a GitHub Actions deploy of the public site.

```bash
cd functions && npm install
cp functions/.env.example functions/.env
```

Edit `functions/.env` and set:
- `GITHUB_OWNER` — GitHub username or organisation that owns the public site repo
- `GITHUB_REPO` — repository name (e.g. `valecreative-site`)

Then store the GitHub PAT as a Firebase Secret (needs `repo` scope):
```bash
firebase functions:secrets:set GITHUB_DISPATCH_TOKEN
```

The `submitCommission` callable function validates and writes public commission-form submissions after verifying a reCAPTCHA v3 token server-side.

Store the reCAPTCHA secret key as a Firebase Secret:
```bash
firebase functions:secrets:set RECAPTCHA_SECRET_KEY
```

On a successful submission, `submitCommission` also sends two transactional emails via Brevo: a notification to the site owner (with a link into the backoffice to view the new request) and a confirmation to the requester. Edit `functions/.env` and additionally set:
- `EMAIL_SENDER_ADDRESS` — the "from" address used for both emails (e.g. `noreply@valentinadamiano.it`)
- `OWNER_NOTIFICATION_EMAIL` — the inbox that receives new-request notifications
- `BACKOFFICE_BASE_URL` — the backoffice's public URL, used to build the "view in backoffice" link

Then store the Brevo API key as a Firebase Secret:
```bash
firebase functions:secrets:set BREVO_API_KEY
```

### 6. Install and Run

```bash
./setup.sh   # installs deps, creates .env and .firebaserc if missing
./rundev.sh  # starts dev server → http://localhost:5173
```

---

## Deployment

### Deploy Firestore Rules

```bash
./deploy-rules.sh
# or: npm run deploy:rules
```

### Deploy Storage Rules

```bash
./deploy-storage-rules.sh
# or: npm run deploy:storage-rules
```

### Deploy Hosting Only

```bash
./deploy-hosting.sh
# or: npm run deploy:hosting
```

### Deploy Cloud Functions

```bash
./deploy-functions.sh
# or: npm run deploy:functions
```

The Firebase CLI automatically compiles the TypeScript before deploying (via the `predeploy` hook in `firebase.json`). Make sure `functions/.env` is configured and `GITHUB_DISPATCH_TOKEN` is set as a Firebase Secret before the first deploy.

### Deploy Everything (rules + functions + hosting)

```bash
./deploy-all.sh
# or: npm run deploy
```

`npm run deploy` (no `--only` flag) deploys all services configured in `firebase.json` — Firestore rules + indexes, Storage rules, Cloud Functions, and hosting.

All scripts require the Firebase CLI (`npm install -g firebase-tools`) and a valid `.firebaserc`.

### Firestore Security Rules

Rules live in `firestore.rules`. Access model:
- Portfolio collections (`artworks`, `series`, `techniques`, `contents`) — public reads, admin writes
- `commissions` — admin only (read/update/delete); create is blocked — only the `submitCommission` Cloud Function (Admin SDK) can create documents

Composite indexes are declared in `firestore.indexes.json` and deployed alongside rules.

### Firebase Storage Rules

Rules live in `storage.rules`. Access model:
- All files — public reads (frontend displays images), admin writes only

Storage path convention: `{resourceType}/{uuid}/{filename}` (e.g., `series/abc-123/photo.jpg`). Resized variants (`thumb_`, `medium_`) are auto-generated by the Firebase Resize Images extension in the same folder.

When a Series or Artwork is deleted (single or bulk), the dataProvider automatically deletes the entire Storage folder for each image — including all resized variants. Gallery images deleted individually also clean up their Storage folder. Storage cleanup is best-effort: if a file is already missing it is silently ignored.

---

## Access Control

Access is controlled via Firebase custom claims. Users must have `admin: true` claim.

**Setting Admin Claims (Python example):**

```python
import firebase_admin
from firebase_admin import auth, credentials

firebase_admin.initialize_app()

def set_admin(uid: str, is_admin: bool):
    user = auth.get_user(uid)
    prev = user.custom_claims or {}
    prev['admin'] = bool(is_admin)
    auth.set_custom_user_claims(uid, prev)
    print(f"{uid} admin = {bool(is_admin)}")

# Usage:
# set_admin("user_uid_here", True)   # Grant access
# set_admin("user_uid_here", False)  # Revoke access
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "User does not have admin privileges" | Set admin custom claim for the user |
| "Missing or insufficient permissions" on getList | Deploy Firestore rules: `./deploy-rules.sh` |
| Firebase errors | Verify all environment variables in `.env` are correct |
| Google sign-in not working | Enable Google provider in Firebase Console |
| App not loading | Ensure `.env` exists in the project root |
| Dashboard not showing after login | Hard-refresh the browser (`Cmd+Shift+R`) |
