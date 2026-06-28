import { router } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { PlayerCard } from '@/src/components/PlayerCard';
import { getPlayerById } from '@/src/game/rules';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function DayScreen() {
  const { t } = useTranslation();
  const game = useGameStore((s) => s.game);
  const beginVoting = useGameStore((s) => s.beginVoting);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'night') router.replace('/game/night');
    else if (game.phase === 'hunter') router.replace('/game/hunter');
    else if (game.phase === 'vote') router.replace('/game/vote');
    else if (game.phase === 'gameOver') router.replace('/results');
  }, [game?.phase]);

  if (!game || game.phase !== 'day') {
    return null;
  }

  const deadTonight = game.nightDeaths
    .map((id) => getPlayerById(game.players, id))
    .filter(Boolean);

  return (
    <View style={styles.container}>
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
        onPress={() => {
          beginVoting();
          router.replace('/game/vote');
        }}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    justifyContent: 'center',
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
    marginTop: 'auto',
  },
});
