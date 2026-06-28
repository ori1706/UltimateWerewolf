import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Player } from '../game/types';
import { PlayerCard } from './PlayerCard';

interface PlayerPickerProps {
  players: Player[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelections?: number;
  excludeIds?: string[];
  showAlive?: boolean;
  voteCounts?: Record<string, number>;
  voteIcon?: string;
}

export function PlayerPicker({
  players,
  selectedIds,
  onToggle,
  maxSelections = 1,
  excludeIds = [],
  showAlive = true,
  voteCounts = {},
  voteIcon = '🐾',
}: PlayerPickerProps) {
  const { t } = useTranslation();

  const eligible = players.filter(
    (p) =>
      (!showAlive || p.alive) &&
      !excludeIds.includes(p.id)
  );

  return (
    <View style={styles.wrap}>
      {eligible.map((player) => {
        const selected = selectedIds.includes(player.id);
        const disabled =
          !selected &&
          maxSelections > 0 &&
          selectedIds.length >= maxSelections;

        const voteCount = voteCounts[player.id] ?? 0;

        return (
          <PlayerCard
            key={player.id}
            player={player}
            selected={selected}
            disabled={disabled}
            subtitle={selected ? t('common.selected') : undefined}
            showAlive={showAlive}
            trailing={
              voteCount > 0 ? (
                <View style={styles.voteBadge}>
                  <Text style={styles.voteIcon}>{voteIcon}</Text>
                  <Text style={styles.voteCount}>{voteCount}</Text>
                </View>
              ) : null
            }
            onPress={() => {
              if (disabled) return;
              if (maxSelections === 1) {
                onToggle(player.id);
                return;
              }
              if (selected) {
                onToggle(player.id);
              } else if (selectedIds.length < maxSelections) {
                onToggle(player.id);
              }
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  voteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.werewolf,
  },
  voteIcon: {
    fontSize: 14,
  },
  voteCount: {
    color: colors.werewolf,
    fontSize: 15,
    fontWeight: '700',
  },
});
