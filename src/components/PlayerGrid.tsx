import { StyleSheet, View, type ViewStyle } from 'react-native';

export const PLAYER_GRID_THRESHOLD = 4;
export const PLAYER_GRID_COLUMNS = 3;
export const PLAYER_GRID_GAP = 6;
export const PLAYER_GRID_AVATAR_SIZE = 40;

export function shouldUsePlayerGrid(count: number): boolean {
  return count > PLAYER_GRID_THRESHOLD;
}

interface PlayerGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function PlayerGrid({ children, style }: PlayerGridProps) {
  return <View style={[styles.grid, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PLAYER_GRID_GAP,
  },
});
