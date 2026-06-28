import type { RoleId, Team } from './types';

export interface RoleDefinition {
  id: RoleId;
  team: Team;
  hasNightAction: boolean;
  night1Only?: boolean;
  i18nKey: string;
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  werewolf: {
    id: 'werewolf',
    team: 'werewolf',
    hasNightAction: true,
    i18nKey: 'roles.werewolf',
  },
  villager: {
    id: 'villager',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.villager',
  },
  seer: {
    id: 'seer',
    team: 'village',
    hasNightAction: true,
    i18nKey: 'roles.seer',
  },
  apprenticeSeer: {
    id: 'apprenticeSeer',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.apprenticeSeer',
  },
  bodyguard: {
    id: 'bodyguard',
    team: 'village',
    hasNightAction: true,
    i18nKey: 'roles.bodyguard',
  },
  hunter: {
    id: 'hunter',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.hunter',
  },
  minion: {
    id: 'minion',
    team: 'werewolf',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.minion',
  },
  tanner: {
    id: 'tanner',
    team: 'neutral',
    hasNightAction: false,
    i18nKey: 'roles.tanner',
  },
  mason: {
    id: 'mason',
    team: 'village',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.mason',
  },
  cupid: {
    id: 'cupid',
    team: 'village',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.cupid',
  },
};

export const ALL_ROLE_IDS: RoleId[] = Object.keys(ROLES) as RoleId[];

export const CORE_ROLES: RoleId[] = [
  'werewolf',
  'villager',
  'seer',
  'apprenticeSeer',
  'bodyguard',
  'hunter',
  'minion',
  'tanner',
  'mason',
  'cupid',
];

export function getRoleTeam(roleId: RoleId): Team {
  return ROLES[roleId].team;
}

export function isWerewolfTeam(roleId: RoleId): boolean {
  return ROLES[roleId].team === 'werewolf';
}
