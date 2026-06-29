import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import type { GameState, Phase } from '@/src/game/types';
import { useGameStore } from '@/src/store/gameStore';

const PHASE_ROUTES: Record<Phase, Href> = {
  setup: '/',
  roleAssign: '/assign',
  night: '/game/night',
  day: '/game/day',
  vote: '/game/vote',
  dayRecap: '/game/day-recap',
  hunter: '/game/hunter',
  gameOver: '/results',
};

export function routeForPhase(phase: Phase): Href {
  return PHASE_ROUTES[phase];
}

/**
 * Keeps the current screen in sync with game phase.
 * Never navigate during render — redirects run in useEffect only.
 */
export function useGamePhaseScreen(requiredPhase: Phase): GameState | null {
  const game = useGameStore((s) => s.game);

  useEffect(() => {
    if (!game) {
      router.replace('/');
      return;
    }
    if (game.phase !== requiredPhase) {
      router.replace(routeForPhase(game.phase));
    }
  }, [game, game?.phase, requiredPhase]);

  if (!game || game.phase !== requiredPhase) {
    return null;
  }

  return game;
}
