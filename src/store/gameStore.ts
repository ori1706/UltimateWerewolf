import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { appStorage } from '../utils/storage';
import { createId } from '../utils/id';
import type {
  GameSettings,
  GameState,
  Player,
  RoleCounts,
  SavedRoster,
} from '../game/types';
import {
  advanceRoleAssign,
  createInitialGameState,
  finishHunterPhase,
  startRoleAssignment,
  startVoting,
  submitNightAction,
  submitVote,
  type NightActionPayload,
} from '../game/engine';
import {
  createEmptyRoleCounts,
  getDefaultRoleCounts,
  MIN_PLAYERS,
} from '../game/rules';

interface GameStore {
  setupPlayers: Player[];
  roleCounts: RoleCounts;
  settings: GameSettings;
  game: GameState | null;
  savedRosters: SavedRoster[];

  addPlayer: (name: string, photoUri?: string) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  removePlayer: (id: string) => void;
  reorderPlayers: (players: Player[]) => void;
  movePlayer: (id: string, direction: 'up' | 'down') => void;
  setRoleCounts: (counts: RoleCounts) => void;
  resetRoleCounts: () => void;
  setSettings: (settings: Partial<GameSettings>) => void;

  saveRoster: (name: string) => void;
  loadRoster: (id: string) => void;
  deleteRoster: (id: string) => void;

  startGame: () => void;
  advanceRoleAssign: () => void;
  submitNightAction: (payload: NightActionPayload) => void;
  beginVoting: () => void;
  submitVote: (voterId: string, targetId: string) => void;
  submitHunterShot: (targetId: string) => void;
  resetAll: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      setupPlayers: [],
      roleCounts: createEmptyRoleCounts(),
      settings: { revealDeadRoles: true },
      game: null,
      savedRosters: [],

      addPlayer: (name, photoUri) => {
        const player: Player = {
          id: createId(),
          name: name.trim(),
          photoUri,
          alive: true,
        };
        set((s) => ({
          setupPlayers: [...s.setupPlayers, player],
          roleCounts: getDefaultRoleCounts(s.setupPlayers.length + 1),
        }));
      },

      updatePlayer: (id, updates) => {
        set((s) => ({
          setupPlayers: s.setupPlayers.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      removePlayer: (id) => {
        set((s) => {
          const setupPlayers = s.setupPlayers.filter((p) => p.id !== id);
          return {
            setupPlayers,
            roleCounts: getDefaultRoleCounts(setupPlayers.length),
          };
        });
      },

      reorderPlayers: (players) => set({ setupPlayers: players }),

      movePlayer: (id, direction) => {
        set((s) => {
          const index = s.setupPlayers.findIndex((p) => p.id === id);
          if (index < 0) return s;
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= s.setupPlayers.length) return s;
          const setupPlayers = [...s.setupPlayers];
          [setupPlayers[index], setupPlayers[targetIndex]] = [
            setupPlayers[targetIndex],
            setupPlayers[index],
          ];
          return { setupPlayers };
        });
      },

      setRoleCounts: (counts) => set({ roleCounts: counts }),

      resetRoleCounts: () => {
        const count = get().setupPlayers.length;
        set({ roleCounts: getDefaultRoleCounts(count) });
      },

      setSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),

      saveRoster: (name) => {
        const roster: SavedRoster = {
          id: createId(),
          name,
          players: get().setupPlayers.map(({ id, name: n, photoUri }) => ({
            id,
            name: n,
            photoUri,
          })),
        };
        set((s) => ({ savedRosters: [...s.savedRosters, roster] }));
      },

      loadRoster: (id) => {
        const roster = get().savedRosters.find((r) => r.id === id);
        if (!roster) return;
        const players: Player[] = roster.players.map((p) => ({
          ...p,
          alive: true,
        }));
        set({
          setupPlayers: players,
          roleCounts: getDefaultRoleCounts(players.length),
          game: null,
        });
      },

      deleteRoster: (id) =>
        set((s) => ({
          savedRosters: s.savedRosters.filter((r) => r.id !== id),
        })),

      startGame: () => {
        const { setupPlayers, roleCounts, settings } = get();
        if (setupPlayers.length < MIN_PLAYERS) return;
        let state = createInitialGameState(setupPlayers, roleCounts, settings);
        state = startRoleAssignment(state);
        set({ game: state });
      },

      advanceRoleAssign: () => {
        const { game } = get();
        if (!game) return;
        set({ game: advanceRoleAssign(game) });
      },

      submitNightAction: (payload) => {
        const { game } = get();
        if (!game) return;
        set({ game: submitNightAction(game, payload) });
      },

      beginVoting: () => {
        const { game } = get();
        if (!game) return;
        set({ game: startVoting(game) });
      },

      submitVote: (voterId, targetId) => {
        const { game } = get();
        if (!game) return;
        set({ game: submitVote(game, voterId, targetId) });
      },

      submitHunterShot: (targetId) => {
        const { game } = get();
        if (!game) return;
        set({ game: finishHunterPhase(game, targetId) });
      },

      resetAll: () =>
        set({
          game: null,
          setupPlayers: [],
          roleCounts: createEmptyRoleCounts(),
        }),
    }),
    {
      name: 'uw-game',
      storage: createJSONStorage(() => appStorage),
      partialize: (state) => ({
        setupPlayers: state.setupPlayers,
        roleCounts: state.roleCounts,
        settings: state.settings,
        game: state.game,
        savedRosters: state.savedRosters,
      }),
    }
  )
);
