import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/src/components/Button';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { PlayerPicker } from '@/src/components/PlayerPicker';
import { getCurrentVoter } from '@/src/game/engine';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function VoteScreen() {
  const { t } = useTranslation();
  const game = useGameStore((s) => s.game);
  const submitVote = useGameStore((s) => s.submitVote);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'night') router.replace('/game/night');
    else if (game.phase === 'day') router.replace('/game/day');
    else if (game.phase === 'hunter') router.replace('/game/hunter');
    else if (game.phase === 'gameOver') router.replace('/results');
  }, [game?.phase]);

  if (!game || game.phase !== 'vote') {
    return null;
  }

  const voter = getCurrentVoter(game);
  if (!voter) return null;

  const reset = () => {
    setSelected([]);
    setGateOpen(false);
  };

  if (!gateOpen) {
    return (
      <PassPhoneGate
        playerName={voter.name}
        photoUri={voter.photoUri}
        onReady={() => setGateOpen(true)}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.phase}>
        {t('vote.title', { number: game.dayNumber })}
      </Text>
      <Text style={styles.instruction}>{t('vote.subtitle')}</Text>
      <Text style={styles.progress}>
        {t('vote.progress', {
          current: game.voteStepIndex + 1,
          total: game.voteSteps.length,
        })}
      </Text>

      <PlayerPicker
        players={game.players}
        selectedIds={selected}
        onToggle={(id) => setSelected([id])}
        maxSelections={1}
        excludeIds={[voter.id]}
      />

      <Button
        label={t('common.confirm')}
        onPress={() => {
          if (selected.length !== 1) return;
          submitVote(voter.id, selected[0]);
          reset();
        }}
        disabled={selected.length !== 1}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  phase: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  instruction: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  progress: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  btn: {
    marginTop: 24,
  },
});
