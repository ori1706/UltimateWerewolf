import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { Button } from '@/src/components/Button';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { PlayerPicker } from '@/src/components/PlayerPicker';
import { getPlayerById } from '@/src/game/rules';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function HunterScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('hunter');
  const submitHunterShot = useGameStore((s) => s.submitHunterShot);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setGateOpen(false);
    setSelected([]);
  }, [game?.pendingHunterId]);

  if (!game || !game.pendingHunterId) {
    return null;
  }

  const hunter = getPlayerById(game.players, game.pendingHunterId);
  if (!hunter) {
    return null;
  }

  if (!gateOpen) {
    return (
      <PassPhoneGate
        playerName={hunter.name}
        photoUri={hunter.photoUri}
        onReady={() => setGateOpen(true)}
      />
    );
  }

  return (
    <GameScreenLayout
      scroll
      footer={
        <Button
          label={t('common.confirm')}
          onPress={() => {
            if (selected.length !== 1) return;
            submitHunterShot(selected[0]);
          }}
          disabled={selected.length !== 1}
          variant="danger"
        />
      }
    >
      <Text style={styles.title}>{t('hunter.title')}</Text>
      <Text style={styles.subtitle}>
        {t('hunter.subtitle', { name: hunter.name })}
      </Text>

      <PlayerPicker
        players={game.players}
        selectedIds={selected}
        onToggle={(id) => setSelected([id])}
        maxSelections={1}
        excludeIds={[hunter.id]}
      />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.danger,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 24,
  },
});
