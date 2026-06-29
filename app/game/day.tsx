import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { DeliberationTimer } from '@/src/components/DeliberationTimer';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { PhaseIntro } from '@/src/components/PhaseIntro';
import { PlayerCard } from '@/src/components/PlayerCard';
import { RoleIcon } from '@/src/components/RoleIcon';
import { getPlayerById } from '@/src/game/rules';
import { DEFAULT_DELIBERATION_TIMER_SECONDS } from '@/src/game/roleReveal';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useDeliberationTimer } from '@/src/hooks/useDeliberationTimer';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function DayScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('day');
  const beginVoting = useGameStore((s) => s.beginVoting);
  const [phaseIntroDismissed, setPhaseIntroDismissed] = useState(false);

  useEffect(() => {
    setPhaseIntroDismissed(false);
  }, [game?.dayNumber]);

  const timerEnabled = game?.settings.deliberationTimerEnabled ?? false;
  const timerSeconds =
    game?.settings.deliberationTimerSeconds ?? DEFAULT_DELIBERATION_TIMER_SECONDS;
  const { secondsLeft, skip, addTime } = useDeliberationTimer(
    !!game && timerEnabled && phaseIntroDismissed,
    timerSeconds,
    game?.dayNumber ?? 0
  );
  const autoVoteTriggeredRef = useRef(false);

  useEffect(() => {
    autoVoteTriggeredRef.current = false;
  }, [game?.dayNumber]);

  useEffect(() => {
    if (!game || !timerEnabled || !phaseIntroDismissed) return;
    if (secondsLeft > 0) return;
    if (autoVoteTriggeredRef.current) return;

    autoVoteTriggeredRef.current = true;
    beginVoting();
  }, [game, timerEnabled, phaseIntroDismissed, secondsLeft, beginVoting]);

  if (!game) {
    return null;
  }

  if (!phaseIntroDismissed) {
    return (
      <PhaseIntro
        variant="day"
        dayNumber={game.dayNumber}
        onContinue={() => setPhaseIntroDismissed(true)}
      />
    );
  }

  const deadTonight = game.nightDeaths
    .map((id) => getPlayerById(game.players, id))
    .filter(Boolean);

  return (
    <GameScreenLayout
      scroll
      contentStyle={styles.content}
      footer={<Button label={t('day.beginVote')} onPress={() => beginVoting()} />}
    >
      <Text style={styles.phase}>{t('day.title', { number: game.dayNumber })}</Text>

      {timerEnabled ? (
        <DeliberationTimer secondsLeft={secondsLeft} onSkip={skip} onAddTime={addTime} />
      ) : null}

      <Text style={styles.discussion}>{t('day.discussion')}</Text>

      <Text style={styles.sectionTitle}>{t('day.deathsTitle')}</Text>

      {deadTonight.length === 0 ? (
        <Text style={styles.noDeaths}>{t('day.noDeaths')}</Text>
      ) : (
        <>
          <Text style={styles.deaths}>
            {t('day.deaths', {
              names: deadTonight.map((p) => p!.name).join(', '),
            })}
          </Text>
          {game.settings.revealDeadRoles
            ? deadTonight.map((p) => (
                <View key={p!.id} style={styles.deathCard}>
                  <PlayerCard player={p!} />
                  {p!.role ? (
                    <View style={styles.roleRevealRow}>
                      <Text style={styles.roleReveal}>{t('day.roleRevealPrefix')}</Text>
                      <RoleIcon roleId={p!.role} size={18} />
                      <Text style={styles.roleReveal}>{t(`roles.${p!.role}`)}</Text>
                    </View>
                  ) : null}
                </View>
              ))
            : deadTonight.map((p) => <PlayerCard key={p!.id} player={p!} />)}
        </>
      )}
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  phase: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  discussion: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  noDeaths: {
    color: colors.textMuted,
    fontSize: 18,
    marginBottom: 32,
  },
  deaths: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  deathCard: {
    marginBottom: 12,
  },
  roleReveal: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 4,
  },
  roleRevealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 4,
  },
});
