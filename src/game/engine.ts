import { createId } from '../utils/id';
import { ROLES } from './roles';
import {
  checkTannerWin,
  checkWinCondition,
  findActiveSeer,
  getLivingPlayers,
  getPlayerById,
} from './rules';
import { shuffle } from '../utils/shuffle';
import type {
  GameEvent,
  GameSettings,
  GameState,
  NightActionStep,
  NightActionType,
  Player,
  RoleCounts,
  RoleId,
  WinResult,
} from './types';

function createEvent(
  partial: Omit<GameEvent, 'id'>
): GameEvent {
  return { id: createId(), ...partial };
}

export function createInitialGameState(
  players: Player[],
  roleCounts: RoleCounts,
  settings: GameSettings
): GameState {
  return {
    phase: 'setup',
    players: players.map((p) => ({ ...p, alive: true })),
    dayNumber: 0,
    events: [],
    settings,
    roleCounts,
    nightSteps: [],
    currentNightStepIndex: 0,
    seerResults: {},
    apprenticePromoted: false,
    nightDeaths: [],
    hunterQueue: [],
    voteStepIndex: 0,
    votes: {},
    voteSteps: [],
    roleAssignIndex: 0,
    wolfVotes: {},
  };
}

export function assignRolesToPlayers(
  players: Player[],
  roleCounts: RoleCounts
): Player[] {
  const pool: RoleId[] = [];
  for (const [roleId, count] of Object.entries(roleCounts) as [RoleId, number][]) {
    for (let i = 0; i < count; i++) pool.push(roleId);
  }
  const shuffled = shuffle(pool);
  return players.map((player, i) => ({
    ...player,
    role: shuffled[i],
    team: ROLES[shuffled[i]].team,
    alive: true,
  }));
}

export function startRoleAssignment(state: GameState): GameState {
  const assigned = assignRolesToPlayers(state.players, state.roleCounts);
  return {
    ...state,
    players: assigned,
    phase: 'roleAssign',
    roleAssignIndex: 0,
  };
}

export function advanceRoleAssign(state: GameState): GameState {
  const nextIndex = state.roleAssignIndex + 1;
  if (nextIndex >= state.players.length) {
    return startNight(state);
  }
  return { ...state, roleAssignIndex: nextIndex };
}

export function buildNightSteps(state: GameState): NightActionStep[] {
  const steps: NightActionStep[] = [];
  const isNight1 = state.dayNumber === 0;

  if (isNight1) {
    const cupid = state.players.find((p) => p.role === 'cupid' && p.alive);
    if (cupid) {
      steps.push({ type: 'cupid', actorId: cupid.id, completed: false });
    }

    const masons = state.players.filter((p) => p.role === 'mason' && p.alive);
    for (const mason of masons) {
      steps.push({ type: 'masonReveal', actorId: mason.id, completed: false });
    }

    const minion = state.players.find((p) => p.role === 'minion' && p.alive);
    if (minion) {
      steps.push({ type: 'minionReveal', actorId: minion.id, completed: false });
    }
  }

  const bodyguard = state.players.find((p) => p.role === 'bodyguard' && p.alive);
  if (bodyguard) {
    steps.push({ type: 'bodyguard', actorId: bodyguard.id, completed: false });
  }

  const wolves = state.players.filter((p) => p.role === 'werewolf' && p.alive);
  for (const wolf of wolves) {
    steps.push({ type: 'werewolfKill', actorId: wolf.id, completed: false });
  }

  const seer = findActiveSeer(state);
  if (seer) {
    steps.push({ type: 'seerInspect', actorId: seer.id, completed: false });
  }

  return steps;
}

export function startNight(state: GameState): GameState {
  const dayNumber = state.dayNumber + 1;
  return {
    ...state,
    phase: 'night',
    dayNumber,
    nightSteps: buildNightSteps({ ...state, dayNumber }),
    currentNightStepIndex: 0,
    nightDeaths: [],
    votes: {},
    voteSteps: [],
    voteStepIndex: 0,
    wolfVotes: {},
  };
}

export function getCurrentNightStep(state: GameState): NightActionStep | undefined {
  return state.nightSteps[state.currentNightStepIndex];
}

function markStepComplete(state: GameState): GameState {
  const nightSteps = state.nightSteps.map((step, i) =>
    i === state.currentNightStepIndex ? { ...step, completed: true } : step
  );
  return { ...state, nightSteps };
}

function addEvents(state: GameState, events: GameEvent[]): GameState {
  return { ...state, events: [...state.events, ...events] };
}

function promoteApprenticeIfNeeded(state: GameState): GameState {
  const seerDead = state.players.some(
    (p) => p.role === 'seer' && !p.alive
  );
  if (seerDead && !state.apprenticePromoted) {
    const apprentice = state.players.find((p) => p.role === 'apprenticeSeer');
    if (apprentice) {
      return addEvents(
        { ...state, apprenticePromoted: true },
        [
          createEvent({
            phase: 'night',
            dayNumber: state.dayNumber,
            type: 'apprenticePromoted',
            targetIds: [apprentice.id],
            hidden: true,
          }),
        ]
      );
    }
  }
  return state;
}

function applyDeaths(
  state: GameState,
  deathIds: string[],
  cause: 'night' | 'lynch' | 'hunter' | 'lover',
  phase: 'night' | 'day'
): GameState {
  let next = state;
  const newDeaths: string[] = [];
  const events: GameEvent[] = [];

  for (const id of deathIds) {
    const player = getPlayerById(next.players, id);
    if (!player || !player.alive) continue;

    next = {
      ...next,
      players: next.players.map((p) =>
        p.id === id ? { ...p, alive: false } : p
      ),
    };
    newDeaths.push(id);

    events.push(
      createEvent({
        phase,
        dayNumber: next.dayNumber,
        type: cause === 'lynch' ? 'playerLynched' : 'playerDied',
        targetIds: [id],
        metadata: { cause, role: player.role ?? '' },
        hidden: false,
      })
    );

    if (player.role === 'hunter') {
      next = {
        ...next,
        hunterQueue: [...next.hunterQueue, id],
      };
    }

    if (player.isLover && player.loverPartnerId) {
      const partner = getPlayerById(next.players, player.loverPartnerId);
      if (partner?.alive) {
        next = {
          ...next,
          players: next.players.map((p) =>
            p.id === partner.id ? { ...p, alive: false } : p
          ),
        };
        events.push(
          createEvent({
            phase,
            dayNumber: next.dayNumber,
            type: 'loverDied',
            actorIds: [id],
            targetIds: [partner.id],
            hidden: false,
          })
        );
        if (partner.role === 'hunter') {
          next = {
            ...next,
            hunterQueue: [...next.hunterQueue, partner.id],
          };
        }
      }
    }
  }

  next = addEvents(next, events);
  next = promoteApprenticeIfNeeded(next);

  if (cause === 'night') {
    next = { ...next, nightDeaths: [...next.nightDeaths, ...newDeaths] };
  }

  return next;
}

export interface NightActionPayload {
  type: NightActionType;
  targetIds: string[];
}

export function submitNightAction(
  state: GameState,
  payload: NightActionPayload
): GameState {
  const step = getCurrentNightStep(state);
  if (!step || step.type !== payload.type) return state;

  let next = markStepComplete(state);
  const dayNumber = next.dayNumber;
  const events: GameEvent[] = [];

  switch (payload.type) {
    case 'cupid': {
      const [a, b] = payload.targetIds;
      next = {
        ...next,
        players: next.players.map((p) => {
          if (p.id === a) return { ...p, isLover: true, loverPartnerId: b };
          if (p.id === b) return { ...p, isLover: true, loverPartnerId: a };
          return p;
        }),
      };
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'cupidLinked',
          actorIds: step.actorId ? [step.actorId] : [],
          targetIds: [a, b],
          hidden: true,
        })
      );
      break;
    }
    case 'masonReveal': {
      const masons = next.players.filter((p) => p.role === 'mason');
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'masonsRevealed',
          actorIds: step.actorId ? [step.actorId] : [],
          targetIds: masons.map((m) => m.id),
          hidden: true,
        })
      );
      break;
    }
    case 'minionReveal': {
      const wolves = next.players.filter((p) => p.role === 'werewolf');
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'minionSawWolves',
          actorIds: step.actorId ? [step.actorId] : [],
          targetIds: wolves.map((w) => w.id),
          hidden: true,
        })
      );
      break;
    }
    case 'bodyguard': {
      const targetId = payload.targetIds[0];
      next = { ...next, pendingBodyguardTarget: targetId };
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'bodyguardProtected',
          actorIds: step.actorId ? [step.actorId] : [],
          targetIds: [targetId],
          hidden: true,
        })
      );
      break;
    }
    case 'werewolfKill': {
      const targetId = payload.targetIds[0];
      const wolfId = step.actorId!;
      next = {
        ...next,
        wolfVotes: { ...next.wolfVotes, [wolfId]: targetId },
      };
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'werewolfVote',
          actorIds: [wolfId],
          targetIds: [targetId],
          hidden: true,
        })
      );
      break;
    }
    case 'seerInspect': {
      const targetId = payload.targetIds[0];
      const target = getPlayerById(next.players, targetId);
      const isWerewolf = target?.role === 'werewolf';
      const actorId = step.actorId!;
      const existing = next.seerResults[actorId] ?? [];
      next = {
        ...next,
        seerResults: {
          ...next.seerResults,
          [actorId]: [...existing, { targetId, isWerewolf }],
        },
      };
      events.push(
        createEvent({
          phase: 'night',
          dayNumber,
          type: 'seerInspected',
          actorIds: [actorId],
          targetIds: [targetId],
          metadata: { isWerewolf },
          hidden: true,
        })
      );
      break;
    }
  }

  next = addEvents(next, events);

  const nextIndex = next.currentNightStepIndex + 1;
  if (nextIndex >= next.nightSteps.length) {
    return resolveNight(next);
  }

  return { ...next, currentNightStepIndex: nextIndex };
}

function resolveWolfKillTarget(wolfVotes: Record<string, string>): string | null {
  const tally: Record<string, number> = {};
  for (const targetId of Object.values(wolfVotes)) {
    tally[targetId] = (tally[targetId] ?? 0) + 1;
  }
  const totalVotes = Object.keys(wolfVotes).length;
  if (totalVotes === 0) return null;

  const threshold = Math.floor(totalVotes / 2) + 1;
  const withMajority = Object.entries(tally).filter(([, count]) => count >= threshold);
  if (withMajority.length === 1) {
    return withMajority[0][0];
  }
  return null;
}

function resolveNight(state: GameState): GameState {
  const protectTarget = state.pendingBodyguardTarget;
  const wolfTarget = resolveWolfKillTarget(state.wolfVotes);

  let next: GameState = {
    ...state,
    lastBodyguardTarget: protectTarget ?? state.lastBodyguardTarget,
    pendingBodyguardTarget: undefined,
    wolfVotes: {},
  };
  const events: GameEvent[] = [];
  const deaths: string[] = [];

  if (Object.keys(state.wolfVotes).length > 0 && !wolfTarget) {
    events.push(
      createEvent({
        phase: 'night',
        dayNumber: next.dayNumber,
        type: 'werewolfNoMajority',
        hidden: true,
      })
    );
  }

  if (wolfTarget) {
    events.push(
      createEvent({
        phase: 'night',
        dayNumber: next.dayNumber,
        type: 'werewolvesTargeted',
        actorIds: Object.keys(state.wolfVotes),
        targetIds: [wolfTarget],
        hidden: true,
      })
    );

    const target = getPlayerById(next.players, wolfTarget);
    if (target?.alive) {
      if (protectTarget === wolfTarget) {
        events.push(
          createEvent({
            phase: 'night',
            dayNumber: next.dayNumber,
            type: 'werewolfKillSurvived',
            targetIds: [wolfTarget],
            hidden: true,
          })
        );
      } else {
        deaths.push(wolfTarget);
        events.push(
          createEvent({
            phase: 'night',
            dayNumber: next.dayNumber,
            type: 'werewolfKillSucceeded',
            targetIds: [wolfTarget],
            hidden: false,
          })
        );
      }
    }
  }

  next = addEvents(next, events);

  if (deaths.length === 0) {
    const skipNoDeaths = events.some(
      (e) =>
        e.type === 'werewolfKillSurvived' || e.type === 'werewolfNoMajority'
    );
    if (!skipNoDeaths) {
      next = addEvents(next, [
        createEvent({
          phase: 'night',
          dayNumber: next.dayNumber,
          type: 'noDeathsNight',
          hidden: false,
        }),
      ]);
    }
  } else {
    next = applyDeaths(next, deaths, 'night', 'night');
  }

  for (const deathId of deaths) {
    const tannerWin = checkTannerWin(deathId, next);
    if (tannerWin) {
      return endGame(next, tannerWin.winner, tannerWin.reasonKey);
    }
  }

  const win = checkWinCondition(next);
  if (win?.winner) {
    return endGame(next, win.winner, win.reasonKey!);
  }

  if (next.hunterQueue.length > 0) {
    return {
      ...next,
      phase: 'hunter',
      pendingHunterId: next.hunterQueue[0],
      hunterReturnPhase: 'day',
    };
  }

  return startDay(next);
}

export function startDay(state: GameState): GameState {
  return { ...state, phase: 'day' };
}

export function startVoting(state: GameState): GameState {
  const living = getLivingPlayers(state.players);
  return {
    ...state,
    phase: 'vote',
    voteSteps: living.map((p) => p.id),
    voteStepIndex: 0,
    votes: {},
  };
}

export function submitVote(state: GameState, voterId: string, targetId: string): GameState {
  const next = {
    ...state,
    votes: { ...state.votes, [voterId]: targetId },
    voteStepIndex: state.voteStepIndex + 1,
  };

  if (next.voteStepIndex >= next.voteSteps.length) {
    return resolveVote(next);
  }
  return next;
}

function resolveVote(state: GameState): GameState {
  const tally: Record<string, number> = {};
  for (const targetId of Object.values(state.votes)) {
    tally[targetId] = (tally[targetId] ?? 0) + 1;
  }

  let maxVotes = 0;
  let lynchedId: string | undefined;
  let tie = false;

  for (const [id, count] of Object.entries(tally)) {
    if (count > maxVotes) {
      maxVotes = count;
      lynchedId = id;
      tie = false;
    } else if (count === maxVotes && maxVotes > 0) {
      tie = true;
    }
  }

  let next = state;

  if (tie || !lynchedId || maxVotes === 0) {
    next = addEvents(next, [
      createEvent({
        phase: 'day',
        dayNumber: next.dayNumber,
        type: 'voteTie',
        hidden: false,
      }),
    ]);
  } else {
    next = applyDeaths(next, [lynchedId], 'lynch', 'day');

    const tannerWin = checkTannerWin(lynchedId, next);
    if (tannerWin) {
      return endGame(next, tannerWin.winner, tannerWin.reasonKey);
    }
  }

  const win = checkWinCondition(next);
  if (win?.winner) {
    return endGame(next, win.winner, win.reasonKey!);
  }

  if (next.hunterQueue.length > 0) {
    return {
      ...next,
      phase: 'hunter',
      pendingHunterId: next.hunterQueue[0],
      hunterReturnPhase: 'night',
    };
  }

  return startNight(next);
}

function endGame(state: GameState, winner: WinResult, reasonKey: string): GameState {
  return addEvents(
    {
      ...state,
      phase: 'gameOver',
      winner,
      winReasonKey: reasonKey,
      pendingHunterId: undefined,
      hunterQueue: [],
    },
    [
      createEvent({
        phase: 'day',
        dayNumber: state.dayNumber,
        type: 'gameEnded',
        metadata: { winner, reasonKey },
        hidden: false,
      }),
    ]
  );
}

export function finishHunterPhase(state: GameState, targetId: string): GameState {
  const hunterId = state.pendingHunterId;
  if (!hunterId) return state;

  const eventPhase = state.hunterReturnPhase === 'night' ? 'day' : 'night';

  let next = addEvents(
    applyDeaths(state, [targetId], 'hunter', eventPhase),
    [
      createEvent({
        phase: eventPhase,
        dayNumber: state.dayNumber,
        type: 'hunterShot',
        actorIds: [hunterId],
        targetIds: [targetId],
        hidden: false,
      }),
    ]
  );

  next = {
    ...next,
    hunterQueue: next.hunterQueue.filter((id) => id !== hunterId),
    pendingHunterId: undefined,
  };

  const tannerWin = checkTannerWin(targetId, next);
  if (tannerWin) {
    return endGame(next, tannerWin.winner, tannerWin.reasonKey);
  }

  if (next.hunterQueue.length > 0) {
    return { ...next, pendingHunterId: next.hunterQueue[0] };
  }

  const win = checkWinCondition(next);
  if (win?.winner) {
    return endGame(next, win.winner, win.reasonKey!);
  }

  const returnPhase = state.hunterReturnPhase ?? 'day';
  if (returnPhase === 'day') {
    return startDay(next);
  }
  return startNight(next);
}

export function getMasonPartners(state: GameState, masonId: string): Player[] {
  return state.players.filter((p) => p.role === 'mason' && p.id !== masonId);
}

export function getPriorWolfVoteCounts(
  state: GameState,
  currentWolfId: string
): Record<string, number> {
  const tally: Record<string, number> = {};
  for (const [wolfId, targetId] of Object.entries(state.wolfVotes)) {
    if (wolfId === currentWolfId) continue;
    tally[targetId] = (tally[targetId] ?? 0) + 1;
  }
  return tally;
}

export function getLivingWerewolfIds(state: GameState): string[] {
  return state.players
    .filter((p) => p.role === 'werewolf' && p.alive)
    .map((p) => p.id);
}

export function getFellowWerewolves(state: GameState, wolfId: string): Player[] {
  return state.players.filter(
    (p) => p.role === 'werewolf' && p.alive && p.id !== wolfId
  );
}

export function getWerewolves(state: GameState): Player[] {
  return state.players.filter((p) => p.role === 'werewolf');
}

export function canBodyguardProtect(state: GameState, targetId: string): boolean {
  return state.lastBodyguardTarget !== targetId;
}

export function getCurrentVoter(state: GameState): Player | undefined {
  const voterId = state.voteSteps[state.voteStepIndex];
  return voterId ? getPlayerById(state.players, voterId) : undefined;
}
