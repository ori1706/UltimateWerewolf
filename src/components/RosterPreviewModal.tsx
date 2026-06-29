import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SavedRoster } from '../game/types';
import { colors } from '../theme/colors';
import { Button } from './Button';
import { PlayerGrid } from './PlayerGrid';
import { PlayerGridTile } from './PlayerGridTile';

interface RosterPreviewModalProps {
  roster: SavedRoster | null;
  visible: boolean;
  loading?: boolean;
  onClose: () => void;
  onLoad: () => void;
}

export function RosterPreviewModal({
  roster,
  visible,
  loading,
  onClose,
  onLoad,
}: RosterPreviewModalProps) {
  const { t } = useTranslation();

  if (!roster) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{t('setup.rosterPreviewTitle', { name: roster.name })}</Text>
          <Text style={styles.subtitle}>
            {t('setup.rosterPreviewCount', { count: roster.players.length })}
          </Text>

          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            <PlayerGrid>
              {roster.players.map((player) => (
                <PlayerGridTile
                  key={player.id}
                  player={{ ...player, alive: true }}
                />
              ))}
            </PlayerGrid>
          </ScrollView>

          <View style={styles.actions}>
            <Button
              label={t('setup.loadRoster')}
              onPress={onLoad}
              loading={loading}
              style={styles.loadBtn}
            />
            <Button label={t('common.close')} onPress={onClose} variant="secondary" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 10,
  },
  list: {
    maxHeight: 280,
  },
  listContent: {
    paddingBottom: 4,
  },
  actions: {
    gap: 10,
    marginTop: 16,
  },
  loadBtn: {
    marginBottom: 0,
  },
});
