import type { RoleId, Team } from './types';

export interface RoleDefinition {
  id: RoleId;
  team: Team;
  hasNightAction: boolean;
  night1Only?: boolean;
  i18nKey: string;
  icon: string;
}

export const ROLES: Record<RoleId, RoleDefinition> = {
  werewolf: {
    id: 'werewolf',
    team: 'werewolf',
    hasNightAction: true,
    i18nKey: 'roles.werewolf',
    icon: '🐺',
  },
  villager: {
    id: 'villager',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.villager',
    icon: '👤',
  },
  seer: {
    id: 'seer',
    team: 'village',
    hasNightAction: true,
    i18nKey: 'roles.seer',
    icon: '🔮',
  },
  apprenticeSeer: {
    id: 'apprenticeSeer',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.apprenticeSeer',
    icon: '✨',
  },
  bodyguard: {
    id: 'bodyguard',
    team: 'village',
    hasNightAction: true,
    i18nKey: 'roles.bodyguard',
    icon: '🛡️',
  },
  hunter: {
    id: 'hunter',
    team: 'village',
    hasNightAction: false,
    i18nKey: 'roles.hunter',
    icon: '🏹',
  },
  minion: {
    id: 'minion',
    team: 'werewolf',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.minion',
    icon: '😈',
  },
  tanner: {
    id: 'tanner',
    team: 'neutral',
    hasNightAction: false,
    i18nKey: 'roles.tanner',
    icon: '🧥',
  },
  mason: {
    id: 'mason',
    team: 'village',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.mason',
    icon: '🧱',
  },
  cupid: {
    id: 'cupid',
    team: 'village',
    hasNightAction: true,
    night1Only: true,
    i18nKey: 'roles.cupid',
    icon: '💘',
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

export function getRoleIcon(roleId: RoleId): string {
  return ROLES[roleId].icon;
}

export function isWerewolfTeam(roleId: RoleId): boolean {
  return ROLES[roleId].team === 'werewolf';
}
