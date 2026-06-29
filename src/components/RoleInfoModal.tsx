import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ROLES } from '../game/roles';
import type { RoleId } from '../game/types';
import { colors } from '../theme/colors';
import { Button } from './Button';
import { RoleIcon } from './RoleIcon';

interface RoleInfoModalProps {
  roleId: RoleId | null;
  visible: boolean;
  onClose: () => void;
}

export function RoleInfoModal({ roleId, visible, onClose }: RoleInfoModalProps) {
  const { t } = useTranslation();

  if (!roleId) return null;

  const team = ROLES[roleId].team;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.titleRow}>
            <RoleIcon roleId={roleId} size={40} />
            <Text style={styles.title}>{t(`roles.${roleId}`)}</Text>
          </View>
          <View style={styles.teamBadge}>
            <Text style={styles.teamLabel}>{t('assign.team')}</Text>
            <Text style={[styles.team, team === 'werewolf' && styles.teamWolf]}>
              {t(`assign.teams.${team}`)}
            </Text>
          </View>
          <Text style={styles.description}>{t(`roles.descriptions.${roleId}`)}</Text>
          <Button label={t('common.close')} onPress={onClose} variant="secondary" />
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
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    flex: 1,
  },
  teamBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  teamLabel: {
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  team: {
    color: colors.village,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  teamWolf: {
    color: colors.werewolf,
  },
  description: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
});
