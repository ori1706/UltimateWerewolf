import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../game/types';
import { PlayerAvatar } from './PlayerAvatar';
import { colors } from '../theme/colors';

interface PlayerCardProps {
  player: Player;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  subtitle?: string;
  showAlive?: boolean;
  trailing?: React.ReactNode;
}

export function PlayerCard({
  player,
  onPress,
  selected,
  disabled,
  subtitle,
  showAlive,
  trailing,
}: PlayerCardProps) {
  const content = (
    <View
      style={[
        styles.card,
        selected && styles.selected,
        disabled && styles.disabled,
        showAlive && !player.alive && styles.dead,
      ]}
    >
      <PlayerAvatar
        name={player.name}
        photoUri={player.photoUri}
        size={48}
        selected={selected}
        dimmed={showAlive && !player.alive}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {player.name}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ?? null}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  selected: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  disabled: {
    opacity: 0.5,
  },
  dead: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.85,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
});
