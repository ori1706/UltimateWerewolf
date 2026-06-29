import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import type { Player, RoleId } from '../game/types';
import { PlayerAvatar } from './PlayerAvatar';
import { colors } from '../theme/colors';

interface NightActorBannerProps {
  player: Player;
  /** When set, shown instead of player.role (e.g. apprentice acting as seer). */
  displayRole?: RoleId;
}

export function NightActorBanner({ player, displayRole }: NightActorBannerProps) {
  const { t } = useTranslation();

  const role = displayRole ?? player.role;
  if (!role) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <PlayerAvatar name={player.name} photoUri={player.photoUri} size={40} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={styles.roleLabel}>{t('night.yourRole')}</Text>
        <Text style={styles.role} numberOfLines={1}>
          {t(`roles.${role}`)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleLabel: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  role: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});
