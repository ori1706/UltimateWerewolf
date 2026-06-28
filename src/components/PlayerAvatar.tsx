import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface PlayerAvatarProps {
  name: string;
  photoUri?: string;
  size?: number;
  selected?: boolean;
  dimmed?: boolean;
}

export function PlayerAvatar({
  name,
  photoUri,
  size = 56,
  selected,
  dimmed,
}: PlayerAvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.selected,
        dimmed && styles.dimmed,
      ]}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Text style={[styles.initials, { fontSize: size * 0.32 }]}>
            {initials}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: colors.primary,
  },
  dimmed: {
    opacity: 0.4,
  },
  fallback: {
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.textMuted,
    fontWeight: '700',
  },
});
