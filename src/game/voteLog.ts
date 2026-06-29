import type { GameEvent, GameState, Player } from './types';

export type DayVoteResult = 'executed' | 'tie' | 'no_votes';

export function parseDayVoteBallots(event: GameEvent): Record<string, string> {
  const raw = event.metadata?.ballots;
  if (typeof raw !== 'string') return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    return {};
  }
}

export function getDayVoteResult(event: GameEvent): DayVoteResult {
  const result = event.metadata?.result;
  if (result === 'executed' || result === 'tie' || result === 'no_votes') {
    return result;
  }
  return 'tie';
}

export function playerName(players: Player[], id: string): string {
  return players.find((p) => p.id === id)?.name ?? id;
}

export function findLastDayVoteResolved(
  state: GameState,
  dayNumber = state.dayNumber
): GameEvent | undefined {
  for (let i = state.events.length - 1; i >= 0; i -= 1) {
    const event = state.events[i];
    if (event.type === 'dayVoteResolved' && event.dayNumber === dayNumber) {
      return event;
    }
  }
  return undefined;
}

/** Lover heartbreak deaths triggered by the vote execution on the same day. */
export function findHeartbreakDeathsAfterVote(
  state: GameState,
  voteEvent: GameEvent
): GameEvent[] {
  const voteIndex = state.events.findIndex((event) => event.id === voteEvent.id);
  if (voteIndex < 0) return [];

  return state.events.slice(voteIndex + 1).filter(
    (event) =>
      event.type === 'loverDied' &&
      event.dayNumber === voteEvent.dayNumber &&
      event.phase === 'day'
  );
}

/** Hide redundant or legacy log lines when a richer grouped event exists. */
export function filterEventLogEvents(events: GameEvent[]): GameEvent[] {
  const resolvedDays = new Set(
    events
      .filter((event) => event.type === 'dayVoteResolved')
      .map((event) => event.dayNumber)
  );

  const werewolfKillTargetIds = new Set(
    events
      .filter((event) => event.type === 'werewolfKillSucceeded')
      .map((event) => event.targetIds?.[0])
      .filter((id): id is string => !!id)
  );

  const hunterShotTargetIds = new Set(
    events
      .filter((event) => event.type === 'hunterShot')
      .map((event) => event.targetIds?.[0])
      .filter((id): id is string => !!id)
  );

  return events.filter((event) => {
    if (event.type === 'voteSkipped' || event.type === 'voteTie') {
      return false;
    }

    if (
      event.type === 'playerLynched' &&
      event.metadata?.cause === 'lynch' &&
      resolvedDays.has(event.dayNumber)
    ) {
      return false;
    }

    if (event.type === 'playerDied') {
      const targetId = event.targetIds?.[0];
      const cause = event.metadata?.cause;
      if (targetId && cause === 'night' && werewolfKillTargetIds.has(targetId)) {
        return false;
      }
      if (targetId && cause === 'hunter' && hunterShotTargetIds.has(targetId)) {
        return false;
      }
    }

    return true;
  });
}
