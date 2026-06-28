# Ultimate Werewolf

Pass-and-play Ultimate Werewolf moderator app for iOS and Android, built with Expo and React Native.

## Features

- Single-device pass-and-play with private role reveals and night actions
- Player photos (camera or gallery)
- Auto-moderator: night resolution, secret voting, hunter/lover chains, win detection
- Chronological post-game event log (including hidden night actions)
- English and Hebrew (עברית) with RTL support — switch language on the home screen

## Getting started

```bash
cd UltimateWerewolf
npm install
npm run ios     # or npm run android
```

## Project structure

- `app/` — Expo Router screens
- `src/game/` — types, roles, rules, engine
- `src/i18n/` — translations (`en`, `he`)
- `src/store/` — Zustand state (persisted locally)
- `src/components/` — shared UI

## Core roles (v1)

Werewolf, Villager, Seer, Apprentice Seer, Bodyguard, Hunter, Minion, Tanner, Mason, Cupid
