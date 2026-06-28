import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { PhaseIntro } from '@/src/components/PhaseIntro';
import { PlayerCard } from '@/src/components/PlayerCard';
import { getPlayerById } from '@/src/game/rules';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
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
    <GameScreenLayout scroll contentStyle={styles.content}>
      <Text style={styles.phase}>{t('day.title', { number: game.dayNumber })}</Text>
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
                  <Text style={styles.roleReveal}>
                    {t('day.roleReveal', { role: t(`roles.${p!.role}`) })}
                  </Text>
                </View>
              ))
            : deadTonight.map((p) => <PlayerCard key={p!.id} player={p!} />)}
        </>
      )}

      <Button
        label={t('day.beginVote')}
        onPress={() => beginVoting()}
        style={styles.btn}
      />
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
  btn: {
    marginTop: 24,
  },
});
