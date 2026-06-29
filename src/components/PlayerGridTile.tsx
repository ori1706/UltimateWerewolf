import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Player } from '../game/types';
import { PLAYER_GRID_AVATAR_SIZE, PLAYER_GRID_COLUMNS } from './PlayerGrid';
import { colors } from '../theme/colors';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerGridTileProps {
  player: Player;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  showAlive?: boolean;
  voteCount?: number;
  voteIcon?: string;
}

const CELL_WIDTH = `${(100 - (PLAYER_GRID_COLUMNS - 1) * 2.2) / PLAYER_GRID_COLUMNS}%`;

export function PlayerGridTile({
  player,
  selected,
  disabled,
  onPress,
  showAlive,
  voteCount = 0,
  voteIcon = '🐾',
}: PlayerGridTileProps) {
  const isDead = showAlive && !player.alive;

  const content = (
    <View
      style={[
        styles.tile,
        selected && styles.selected,
        disabled && styles.disabled,
        isDead && styles.dead,
      ]}
    >
      <View style={styles.avatarWrap}>
        <PlayerAvatar
          name={player.name}
          photoUri={player.photoUri}
          size={PLAYER_GRID_AVATAR_SIZE}
          selected={selected}
          dimmed={isDead}
        />
        {voteCount > 0 ? (
          <View style={styles.voteBadge}>
            <Text style={styles.voteIcon}>{voteIcon}</Text>
            <Text style={styles.voteCount}>{voteCount}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {player.name}
      </Text>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.cell}>{content}</View>;
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_WIDTH,
  },
  tile: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingTop: 6,
    paddingBottom: 5,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
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
  avatarWrap: {
    position: 'relative',
  },
  name: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    width: '100%',
  },
  voteBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: colors.werewolf,
  },
  voteIcon: {
    fontSize: 8,
  },
  voteCount: {
    color: colors.werewolf,
    fontSize: 9,
    fontWeight: '700',
  },
});
