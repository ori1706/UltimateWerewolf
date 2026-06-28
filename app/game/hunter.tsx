import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { Button } from '@/src/components/Button';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { PlayerPicker } from '@/src/components/PlayerPicker';
import { getPlayerById } from '@/src/game/rules';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function HunterScreen() {
  const { t } = useTranslation();
  const game = useGameStore((s) => s.game);
  const submitHunterShot = useGameStore((s) => s.submitHunterShot);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!game) return;
    if (game.phase === 'night') router.replace('/game/night');
    else if (game.phase === 'day') router.replace('/game/day');
    else if (game.phase === 'vote') router.replace('/game/vote');
    else if (game.phase === 'gameOver') router.replace('/results');
  }, [game?.phase]);

  if (!game || game.phase !== 'hunter' || !game.pendingHunterId) {
    return null;
  }

  const hunter = getPlayerById(game.players, game.pendingHunterId);
  if (!hunter) return null;

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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

      <Button
        label={t('common.confirm')}
        onPress={() => {
          if (selected.length !== 1) return;
          submitHunterShot(selected[0]);
          setSelected([]);
          setGateOpen(false);
        }}
        disabled={selected.length !== 1}
        variant="danger"
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
  btn: {
    marginTop: 24,
  },
});
