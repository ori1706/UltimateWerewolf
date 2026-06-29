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

## TODO

- [ ] **Export / import game settings** — As the app gains more configuration options (e.g. seer reveal mode, deliberation timer, vote skip rules, and future variants), add a way to serialize the full ruleset into a compact string that players can copy, paste, and share. Importing that string should restore the same settings on another device or for the next game.
