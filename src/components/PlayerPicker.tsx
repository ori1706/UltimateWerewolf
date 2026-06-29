import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { Player } from '../game/types';
import { PlayerCard } from './PlayerCard';
import { PlayerGrid, shouldUsePlayerGrid } from './PlayerGrid';
import { PlayerGridTile } from './PlayerGridTile';

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
    (p) => (!showAlive || p.alive) && !excludeIds.includes(p.id)
  );

  const useGrid = shouldUsePlayerGrid(eligible.length);

  const handlePress = (playerId: string, selected: boolean, disabled: boolean) => {
    if (disabled) return;
    if (maxSelections === 1) {
      onToggle(playerId);
      return;
    }
    if (selected) {
      onToggle(playerId);
    } else if (selectedIds.length < maxSelections) {
      onToggle(playerId);
    }
  };

  if (useGrid) {
    return (
      <View style={styles.wrap}>
        <PlayerGrid>
          {eligible.map((player) => {
            const selected = selectedIds.includes(player.id);
            const atMax = maxSelections > 0 && selectedIds.length >= maxSelections;
            const disabled = maxSelections !== 1 && !selected && atMax;
            const voteCount = voteCounts[player.id] ?? 0;

            return (
              <PlayerGridTile
                key={player.id}
                player={player}
                selected={selected}
                disabled={disabled}
                showAlive={showAlive}
                voteCount={voteCount}
                voteIcon={voteIcon}
                onPress={() => handlePress(player.id, selected, disabled)}
              />
            );
          })}
        </PlayerGrid>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {eligible.map((player) => {
        const selected = selectedIds.includes(player.id);
        const atMax = maxSelections > 0 && selectedIds.length >= maxSelections;
        const disabled = maxSelections !== 1 && !selected && atMax;
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
            onPress={() => handlePress(player.id, selected, disabled)}
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
