export type Team = 'village' | 'werewolf' | 'neutral';

export type RoleId =
  | 'werewolf'
  | 'villager'
  | 'seer'
  | 'apprenticeSeer'
  | 'bodyguard'
  | 'hunter'
  | 'minion'
  | 'tanner'
  | 'mason'
  | 'cupid';

export type Phase =
  | 'setup'
  | 'roleAssign'
  | 'night'
  | 'day'
  | 'vote'
  | 'dayRecap'
  | 'hunter'
  | 'gameOver';

export type NightActionType =
  | 'cupid'
  | 'masonReveal'
  | 'minionReveal'
  | 'loverReveal'
  | 'bodyguard'
  | 'werewolfKill'
  | 'seerInspect'
  | 'pass';

export type GameEventType =
  | 'cupidLinked'
  | 'masonsRevealed'
  | 'minionSawWolves'
  | 'bodyguardProtected'
  | 'werewolvesTargeted'
  | 'werewolfVote'
  | 'werewolfNoMajority'
  | 'werewolfKillSurvived'
  | 'werewolfKillSucceeded'
  | 'seerInspected'
  | 'playerDied'
  | 'loverDied'
  | 'hunterShot'
  | 'playerLynched'
  | 'apprenticePromoted'
  | 'noDeathsNight'
  | 'noDeathsDay'
  | 'voteTie'
  | 'voteSkipped'
  | 'dayVoteResolved'
  | 'gameEnded';

export interface GameEvent {
  id: string;
  phase: 'night' | 'day';
  dayNumber: number;
  type: GameEventType;
  actorIds?: string[];
  targetIds?: string[];
  metadata?: Record<string, string | boolean | number>;
  hidden: boolean;
}

export interface Player {
  id: string;
  name: string;
  photoUri?: string;
  role?: RoleId;
  team?: Team;
  alive: boolean;
  isLover?: boolean;
  loverPartnerId?: string;
}

export interface NightActionStep {
  type: NightActionType;
  actorId?: string;
  actorIds?: string[];
  completed: boolean;
}

export type RoleRevealAction = 'seerInspect';

export type RoleRevealMode = 'teamBinary' | 'fullRole';

export type RoleRevealSettings = Partial<Record<RoleRevealAction, RoleRevealMode>>;

export interface GameSettings {
  revealDeadRoles: boolean;
  /** Per-action reveal modes for roles that inspect or learn about others. */
  roleReveal: RoleRevealSettings;
  /** When enabled, day phase shows a countdown for discussion time. */
  deliberationTimerEnabled: boolean;
  /** Discussion timer length in seconds (default 2 minutes). */
  deliberationTimerSeconds: number;
  /** When enabled, living players may abstain during the day vote. */
  allowVoteSkip: boolean;
}

export type RoleCounts = Record<RoleId, number>;

export type WinResult = Team | 'lovers' | 'tanner';

export interface SeerResult {
  targetId: string;
  mode: RoleRevealMode;
  isWerewolf: boolean;
  revealedRole?: RoleId;
}

export interface GameState {
  phase: Phase;
  players: Player[];
  dayNumber: number;
  events: GameEvent[];
  settings: GameSettings;
  roleCounts: RoleCounts;

  nightSteps: NightActionStep[];
  currentNightStepIndex: number;
  lastBodyguardTarget?: string;
  pendingBodyguardTarget?: string;
  wolfVotes: Record<string, string>;
  seerResults: Record<string, SeerResult[]>;
  apprenticePromoted: boolean;

  nightDeaths: string[];
  pendingHunterId?: string;
  hunterQueue: string[];
  hunterReturnPhase?: 'day' | 'night';

  voteStepIndex: number;
  votes: Record<string, string>;
  voteSteps: string[];

  roleAssignIndex: number;

  winner?: WinResult;
  winReasonKey?: string;
}

export interface SavedRoster {
  id: string;
  name: string;
  players: Pick<Player, 'id' | 'name' | 'photoUri'>[];
}
