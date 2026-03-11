# LEGO Series Priority Voting System

A web application for anonymous priority voting on LEGO series, built for university laboratory use.

## Overview

Students enter their ID, which is hashed locally using SHA-256.
They select 3 LEGO series and rank them in priority order (1st, 2nd, 3rd).
The vote is saved to a shared Firestore database.
The administrator can view aggregated results in a password-protected panel.

## Tech Stack

- React 18 + Vite
- Firebase Cloud Firestore (real-time database)
- Firebase Hosting
- Framer Motion (animations)
- Lucide React (icons)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your Firebase project credentials:

```bash
cp .env.example .env
```

The required variables are listed in `.env.example`.

### 3. Run the development server

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

### 5. Deploy to Firebase Hosting

```bash
npx firebase-tools deploy --only hosting,firestore:rules
```

## Project Structure

```
src/
  firebase.js          # Firebase initialization
  main.jsx             # App entry point
  App.jsx              # Router and page layout
  context/
    VoteContext.jsx    # Global vote session state
  data/
    legoSeries.js      # LEGO series data and admin secret
  pages/
    LoginPage.jsx      # Voter identification screen
    VotingPage.jsx     # Series selection grid
    RankPage.jsx       # Ranking step
    ConfirmPage.jsx    # Review and submit
    DonePage.jsx       # Submission confirmation
    AdminPage.jsx      # Admin results dashboard
  services/
    storage.js         # Firestore read/write operations
  components/
    LegoCard.jsx       # Series card component
```

## Notes

- Voter IDs are hashed client-side and never stored in plain text.
- The admin panel is protected by a secret key defined in `src/data/legoSeries.js`.
- Firestore security rules are in `firestore.rules` and are deployed alongside the app.
