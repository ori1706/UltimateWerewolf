import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/src/components/Button';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { PlayerPicker } from '@/src/components/PlayerPicker';
import { getCurrentVoter } from '@/src/game/engine';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function VoteScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('vote');
  const submitVote = useGameStore((s) => s.submitVote);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setGateOpen(false);
    setSelected([]);
  }, [game?.voteStepIndex, game?.dayNumber]);

  if (!game) {
    return null;
  }

  const voter = getCurrentVoter(game);
  if (!voter) {
    return null;
  }

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
    <GameScreenLayout scroll>
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
        }}
        disabled={selected.length !== 1}
        style={styles.btn}
      />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
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
