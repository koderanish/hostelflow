# HostelFlow — Student Mobile App

React Native (Expo Router) app for the Student role. Built to match the
Stitch UI export — see `src/theme/tokens.ts` for the exact design tokens
(colors, spacing, typography) pulled from `DESIGN.md`.

## Screens included

| Screen | File | Status |
|---|---|---|
| Login / Register / Forgot Password | `app/(auth)/` | UI done |
| Dashboard | `app/(tabs)/index.tsx` | Matches Stitch design |
| Room Details | `app/(tabs)/room-details.tsx` | Matches Stitch design |
| Payments | `app/(tabs)/payments.tsx` | Matches Stitch design |
| Profile & Settings | `app/(tabs)/profile.tsx` | Matches Stitch design |
| Attendance, Leave, Complaints, Visitor, Mess, Notifications, Documents, Edit Profile, Settings | `app/*.tsx` | Placeholder — UI structure ready, needs design + real content |

All screens currently use **mock data** from `src/data/mockData.ts`.
Swap that for real calls through `src/api/client.ts` once Member 1's
backend endpoints are live.

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `w` to
run in a browser.

## Project structure

```
app/
  (auth)/          — login, register, forgot-password
  (tabs)/          — bottom-nav screens: Home, Room, Fees, Profile
  *.tsx            — screens reached via router.push(), not in the tab bar
src/
  theme/tokens.ts  — design tokens (colors, spacing, type)
  components/UI.tsx— shared building blocks (Card, Badge, TopAppBar, etc.)
  data/mockData.ts — temporary mock data
  api/client.ts    — axios client, point at the backend when ready
```
