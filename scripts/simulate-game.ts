/**
 * Smoke-test the game engine through a minimal full game loop.
 * Run: npx tsx scripts/simulate-game.ts
 */
import {
  advanceDayRecap,
  advanceRoleAssign,
  createInitialGameState,
  finishHunterPhase,
  startRoleAssignment,
  startVoting,
  submitNightAction,
  submitVote,
} from '../src/game/engine';
import { DEFAULT_GAME_SETTINGS } from '../src/game/roleReveal';
import { getDefaultRoleCounts } from '../src/game/rules';
import type { Player } from '../src/game/types';

function players(n: number): Player[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i}`,
    name: `Player ${i + 1}`,
    alive: true,
  }));
}

function runNight(state: ReturnType<typeof createInitialGameState>) {
  let s = state;
  while (s.phase === 'night') {
    const step = s.nightSteps[s.currentNightStepIndex];
    if (!step) break;
    const living = s.players.filter((p) => p.alive && p.role !== 'werewolf');
    const target = living[0]?.id ?? s.players.find((p) => p.alive && p.id !== step.actorId)?.id;
    if (!target && step.type !== 'masonReveal' && step.type !== 'minionReveal' && step.type !== 'loverReveal' && step.type !== 'pass') {
      throw new Error(`No target for step ${step.type}`);
    }
    if (step.type === 'cupid') {
      s = submitNightAction(s, { type: 'cupid', targetIds: [living[0].id, living[1].id] });
    } else if (step.type === 'masonReveal') {
      s = submitNightAction(s, { type: 'masonReveal', targetIds: [] });
    } else if (step.type === 'minionReveal') {
      s = submitNightAction(s, { type: 'minionReveal', targetIds: [] });
    } else if (step.type === 'loverReveal') {
      const partnerId = s.players.find((p) => p.id === step.actorId)?.loverPartnerId;
      s = submitNightAction(s, { type: 'loverReveal', targetIds: partnerId ? [partnerId] : [] });
    } else if (step.type === 'pass') {
      s = submitNightAction(s, { type: 'pass', targetIds: [] });
    } else if (step.type === 'werewolfKill') {
      s = submitNightAction(s, { type: 'werewolfKill', targetIds: [target!] });
    } else {
      s = submitNightAction(s, { type: step.type, targetIds: [target!] });
    }
  }
  return s;
}

function runHunterChain(s: ReturnType<typeof createInitialGameState>) {
  let state = s;
  while (state.phase === 'hunter') {
    const target = state.players.find((p) => p.alive && p.id !== state.pendingHunterId)?.id;
    if (!target) break;
    state = finishHunterPhase(state, target);
  }
  return state;
}

let state = createInitialGameState(
  players(6),
  getDefaultRoleCounts(6),
  DEFAULT_GAME_SETTINGS
);
state = startRoleAssignment(state);

while (state.phase === 'roleAssign') {
  state = advanceRoleAssign(state);
}

let rounds = 0;
while (state.phase !== 'gameOver' && rounds < 30) {
  rounds++;
  if (state.phase === 'night') {
    state = runNight(state);
    state = runHunterChain(state);
    continue;
  }
  if (state.phase === 'day') {
    state = startVoting(state);
    continue;
  }
  if (state.phase === 'vote') {
    const voterId = state.voteSteps[state.voteStepIndex];
    const target = state.players.find((p) => p.alive && p.id !== voterId)?.id;
    if (!voterId || !target) break;
    state = submitVote(state, voterId, target);
    continue;
  }
  if (state.phase === 'dayRecap') {
    state = advanceDayRecap(state);
    state = runHunterChain(state);
    continue;
  }
  break;
}

if (state.phase !== 'gameOver') {
  throw new Error(`Simulation stuck in phase ${state.phase} after ${rounds} rounds`);
}

console.log('Simulation OK:', state.winner, state.winReasonKey, `${state.events.length} events`);
