import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { EventLogItem, PhaseHeader } from '@/src/components/EventLogItem';
import { PlayerCard } from '@/src/components/PlayerCard';
import type { GameEvent } from '@/src/game/types';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

function groupEvents(events: GameEvent[]) {
  const groups: { phase: 'night' | 'day'; dayNumber: number; events: GameEvent[] }[] = [];

  for (const event of events) {
    if (event.type === 'gameEnded') continue;
    const last = groups[groups.length - 1];
    if (last && last.phase === event.phase && last.dayNumber === event.dayNumber) {
      last.events.push(event);
    } else {
      groups.push({ phase: event.phase, dayNumber: event.dayNumber, events: [event] });
    }
  }

  return groups;
}

export default function ResultsScreen() {
  const { t } = useTranslation();
  const game = useGameStore((s) => s.game);
  const resetAll = useGameStore((s) => s.resetAll);

  const groups = useMemo(
    () => (game ? groupEvents(game.events) : []),
    [game?.events]
  );

  if (!game || game.phase !== 'gameOver') {
    router.replace('/');
    return null;
  }

  const winnerKey = game.winner ?? 'village';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>🏆</Text>
      <Text style={styles.winTitle}>{t(`win.${winnerKey}`)}</Text>
      {game.winReasonKey ? (
        <Text style={styles.winReason}>{t(game.winReasonKey)}</Text>
      ) : null}

      <View style={styles.playersSection}>
        <Text style={styles.sectionTitle}>{t('common.players')}</Text>
        {game.players.map((p) => (
          <PlayerCard
            key={p.id}
            player={p}
            subtitle={t(`roles.${p.role}`)}
            showAlive
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>{t('results.eventLog')}</Text>
      <Text style={styles.hiddenNote}>{t('results.hiddenNote')}</Text>

      {groups.map((group) => (
        <View key={`${group.phase}-${group.dayNumber}`}>
          <PhaseHeader phase={group.phase} dayNumber={group.dayNumber} />
          {group.events.map((event) => (
            <EventLogItem
              key={event.id}
              event={event}
              players={game.players}
              showHidden
            />
          ))}
        </View>
      ))}

      <View style={styles.actions}>
        <Button
          label={t('results.playAgain')}
          onPress={() => {
            resetAll();
            router.replace('/setup/players');
          }}
        />
        <Button
          label={t('results.backHome')}
          variant="secondary"
          onPress={() => {
            resetAll();
            router.replace('/');
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  emoji: {
    fontSize: 56,
    textAlign: 'center',
    marginTop: 24,
  },
  winTitle: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
  },
  winReason: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  playersSection: {
    marginBottom: 8,
  },
  hiddenNote: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 32,
  },
});
