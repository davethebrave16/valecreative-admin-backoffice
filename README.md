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

> Resources will be documented here as they are added to the panel.

---

## Firestore Database Structure

> Collections and subcollections will be documented here as resources are implemented.

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

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Then fill in the values:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 3. Enable Google Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** provider
3. Set a project support email
4. Save

### 4. Install Dependencies and Run

```bash
./setup.sh   # installs deps and creates .env if missing
./rundev.sh  # starts dev server → http://localhost:5173
```

Or manually:

```bash
npm install
npm run dev
```

---

## Deployment

### Manual Deployment

1. Create `.firebaserc`:
```json
{
  "projects": {
    "default": "your-project-id"
  },
  "targets": {
    "your-project-id": {
      "hosting": {
        "admin-panel": ["your-hosting-site-id"]
      }
    }
  }
}
```

2. Build and deploy:
```bash
npm run build
firebase deploy --only hosting:admin-panel
```

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
| Firebase errors | Verify all environment variables are correct |
| Google sign-in not working | Enable Google provider in Firebase Console |
| App not loading | Ensure `.env` file exists in the project root |
| Dashboard not showing after login | Hard-refresh the browser (`Cmd+Shift+R`) |
