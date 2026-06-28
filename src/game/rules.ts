import type { GameState, Player, RoleCounts, RoleId, WinResult } from './types';
import { ROLES } from './roles';

export const MIN_PLAYERS = 5;
export const MAX_PLAYERS = 20;

export function createEmptyRoleCounts(): RoleCounts {
  return {
    werewolf: 0,
    villager: 0,
    seer: 0,
    apprenticeSeer: 0,
    bodyguard: 0,
    hunter: 0,
    minion: 0,
    tanner: 0,
    mason: 0,
    cupid: 0,
  };
}

export function getDefaultRoleCounts(playerCount: number): RoleCounts {
  const counts = createEmptyRoleCounts();
  if (playerCount < MIN_PLAYERS) return counts;

  const wolfCount = Math.max(1, Math.floor(playerCount / 4));
  counts.werewolf = wolfCount;
  counts.seer = 1;
  counts.bodyguard = playerCount >= 7 ? 1 : 0;
  counts.hunter = playerCount >= 8 ? 1 : 0;
  counts.minion = playerCount >= 9 ? 1 : 0;
  counts.cupid = playerCount >= 10 ? 1 : 0;
  counts.mason = playerCount >= 11 ? 2 : 0;
  counts.tanner = playerCount >= 12 ? 1 : 0;
  counts.apprenticeSeer = playerCount >= 13 ? 1 : 0;

  const specialTotal = Object.entries(counts)
    .filter(([id]) => id !== 'villager')
    .reduce((sum, [, n]) => sum + n, 0);
  counts.villager = Math.max(0, playerCount - specialTotal);

  return counts;
}

export function totalRoleCount(counts: RoleCounts): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

export interface RoleValidation {
  valid: boolean;
  errors: string[];
}

export function validateRoleCounts(
  counts: RoleCounts,
  playerCount: number
): RoleValidation {
  const errors: string[] = [];
  const total = totalRoleCount(counts);

  if (playerCount < MIN_PLAYERS) {
    errors.push('errors.minPlayers');
  }
  if (playerCount > MAX_PLAYERS) {
    errors.push('errors.maxPlayers');
  }
  if (total !== playerCount) {
    errors.push('errors.roleCountMismatch');
  }
  if (counts.werewolf < 1) {
    errors.push('errors.needWerewolf');
  }
  if (counts.mason === 1) {
    errors.push('errors.masonPair');
  }
  if (counts.werewolf >= playerCount - counts.werewolf) {
    errors.push('errors.tooManyWolves');
  }

  return { valid: errors.length === 0, errors };
}

export function getLivingPlayers(players: Player[]): Player[] {
  return players.filter((p) => p.alive);
}

export function getPlayerById(players: Player[], id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export function findActiveSeer(state: GameState): Player | undefined {
  const seer = state.players.find((p) => p.role === 'seer' && p.alive);
  if (seer) return seer;
  if (state.apprenticePromoted) {
    return state.players.find((p) => p.role === 'apprenticeSeer' && p.alive);
  }
  return undefined;
}

export function isCrossTeamLovers(state: GameState): boolean {
  const lovers = state.players.filter((p) => p.isLover && p.alive);
  if (lovers.length !== 2) return false;
  const [a, b] = lovers;
  if (!a.role || !b.role) return false;
  const teamA = ROLES[a.role].team;
  const teamB = ROLES[b.role].team;
  return teamA !== teamB;
}

export function checkWinCondition(state: GameState): {
  winner?: WinResult;
  reasonKey?: string;
} | null {
  const living = getLivingPlayers(state.players);
  const livingWolves = living.filter((p) => p.role && ROLES[p.role].team === 'werewolf');
  const livingNonWolves = living.filter(
    (p) => !p.role || ROLES[p.role].team !== 'werewolf'
  );

  if (livingWolves.length === 0) {
    return { winner: 'village', reasonKey: 'win.allWolvesDead' };
  }

  if (livingWolves.length >= livingNonWolves.length) {
    return { winner: 'werewolf', reasonKey: 'win.wolfParity' };
  }

  if (isCrossTeamLovers(state) && living.length === 2) {
    return { winner: 'lovers', reasonKey: 'win.loversAlone' };
  }

  return null;
}

export function checkTannerWin(playerId: string, state: GameState): {
  winner: WinResult;
  reasonKey: string;
} | null {
  const player = getPlayerById(state.players, playerId);
  if (player?.role === 'tanner') {
    return { winner: 'tanner', reasonKey: 'win.tannerEliminated' };
  }
  return null;
}

export interface TeamBalance {
  village: number;
  werewolf: number;
  neutral: number;
}

export function getTeamBalance(counts: RoleCounts): TeamBalance {
  const balance: TeamBalance = { village: 0, werewolf: 0, neutral: 0 };
  for (const [roleId, count] of Object.entries(counts) as [RoleId, number][]) {
    balance[ROLES[roleId].team] += count;
  }
  return balance;
}
