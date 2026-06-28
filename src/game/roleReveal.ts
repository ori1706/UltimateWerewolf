import type { TFunction } from 'i18next';
import type {
  GameEvent,
  GameSettings,
  Player,
  RoleRevealAction,
  RoleRevealMode,
  RoleRevealSettings,
} from './types';

import type { RoleId } from './types';

export interface RoleInspectionResult {
  targetId: string;
  mode: RoleRevealMode;
  isWerewolf: boolean;
  revealedRole?: RoleId;
}

export interface RoleRevealSettingDef {
  action: RoleRevealAction;
  labelKey: string;
  hintKey: string;
  defaultMode: RoleRevealMode;
  enabledMode: RoleRevealMode;
}

export const DEFAULT_ROLE_REVEAL: RoleRevealSettings = {
  seerInspect: 'teamBinary',
};

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  revealDeadRoles: true,
  roleReveal: DEFAULT_ROLE_REVEAL,
};

/** Configurable role-reveal toggles shown in setup. Add entries here for future roles. */
export const ROLE_REVEAL_SETTING_DEFS: RoleRevealSettingDef[] = [
  {
    action: 'seerInspect',
    labelKey: 'settings.seerFullRole',
    hintKey: 'settings.seerFullRoleHint',
    defaultMode: 'teamBinary',
    enabledMode: 'fullRole',
  },
];

export function getRoleRevealMode(
  settings: GameSettings,
  action: RoleRevealAction
): RoleRevealMode {
  return settings.roleReveal?.[action] ?? DEFAULT_ROLE_REVEAL[action] ?? 'teamBinary';
}

export function inspectPlayer(
  target: Player,
  action: RoleRevealAction,
  settings: GameSettings
): RoleInspectionResult {
  const mode = getRoleRevealMode(settings, action);
  const role = target.role!;
  const isWerewolf = role === 'werewolf';

  if (mode === 'fullRole') {
    return { targetId: target.id, mode, isWerewolf, revealedRole: role };
  }

  return { targetId: target.id, mode, isWerewolf };
}

export function roleInspectionToEventMetadata(
  result: RoleInspectionResult
): Record<string, string | boolean | number> {
  const metadata: Record<string, string | boolean | number> = {
    isWerewolf: result.isWerewolf,
    revealMode: result.mode,
  };
  if (result.revealedRole) {
    metadata.revealedRole = result.revealedRole;
  }
  return metadata;
}

export function formatInspectionResultLabel(
  result: RoleInspectionResult,
  targetName: string,
  t: TFunction
): string {
  if (result.mode === 'fullRole' && result.revealedRole) {
    return t('night.roleInspectionRole', {
      name: targetName,
      role: t(`roles.${result.revealedRole}`),
    });
  }

  return t('night.roleInspectionTeam', {
    name: targetName,
    result: result.isWerewolf ? t('night.werewolfResult') : t('night.notWerewolfResult'),
  });
}

export function formatInspectionResultFromEvent(
  event: GameEvent,
  players: Player[],
  t: TFunction
): string {
  const targetName =
    players.find((p) => p.id === event.targetIds?.[0])?.name ?? event.targetIds?.[0] ?? '';
  const metadata = event.metadata;
  const mode = (metadata?.revealMode as RoleRevealMode | undefined) ?? 'teamBinary';

  if (mode === 'fullRole' && metadata?.revealedRole) {
    return t('night.roleInspectionRole', {
      name: targetName,
      role: t(`roles.${metadata.revealedRole}`),
    });
  }

  return t('night.roleInspectionTeam', {
    name: targetName,
    result: metadata?.isWerewolf ? t('night.werewolfResult') : t('night.notWerewolfResult'),
  });
}

export function mergeGameSettings(
  current: GameSettings,
  partial: Partial<GameSettings>
): GameSettings {
  const base: GameSettings = {
    ...DEFAULT_GAME_SETTINGS,
    ...current,
    roleReveal: { ...DEFAULT_ROLE_REVEAL, ...current.roleReveal },
  };

  return {
    ...base,
    ...partial,
    roleReveal: partial.roleReveal
      ? { ...base.roleReveal, ...partial.roleReveal }
      : base.roleReveal,
  };
}

export function isRoleRevealEnabled(
  settings: GameSettings,
  def: RoleRevealSettingDef
): boolean {
  return getRoleRevealMode(settings, def.action) === def.enabledMode;
}

export function setRoleRevealEnabled(
  settings: GameSettings,
  def: RoleRevealSettingDef,
  enabled: boolean
): GameSettings {
  return mergeGameSettings(settings, {
    roleReveal: {
      [def.action]: enabled ? def.enabledMode : def.defaultMode,
    },
  });
}
