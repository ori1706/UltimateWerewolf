import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
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

  const allowSkip = game.settings.allowVoteSkip;

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
    <GameScreenLayout
      scroll
      footer={
        allowSkip ? (
          <View style={styles.footer}>
            <Button
              label={t('vote.skipVote')}
              variant="secondary"
              onPress={() => submitVote(voter.id, null)}
              style={styles.footerBtn}
            />
            <Button
              label={t('common.confirm')}
              onPress={() => {
                if (selected.length !== 1) return;
                submitVote(voter.id, selected[0]);
              }}
              disabled={selected.length !== 1}
              style={styles.footerBtn}
            />
          </View>
        ) : (
          <Button
            label={t('common.confirm')}
            onPress={() => {
              if (selected.length !== 1) return;
              submitVote(voter.id, selected[0]);
            }}
            disabled={selected.length !== 1}
          />
        )
      }
    >
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

      {allowSkip ? <Text style={styles.skipHint}>{t('vote.skipHint')}</Text> : null}

      <PlayerPicker
        players={game.players}
        selectedIds={selected}
        onToggle={(id) => setSelected([id])}
        maxSelections={1}
        excludeIds={[voter.id]}
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
  skipHint: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
  },
});
