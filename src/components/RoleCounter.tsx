import { Pressable, StyleSheet, Text, View } from 'react-native';
import { RoleIcon } from './RoleIcon';
import type { RoleId } from '../game/types';
import { colors } from '../theme/colors';

interface RoleCounterProps {
  roleId: RoleId;
  label: string;
  count: number;
  onChange: (count: number) => void;
  onInfoPress?: () => void;
  min?: number;
  max?: number;
}

export function RoleCounter({
  roleId,
  label,
  count,
  onChange,
  onInfoPress,
  min = 0,
  max = 20,
}: RoleCounterProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onInfoPress}
        style={styles.labelPress}
        disabled={!onInfoPress}
      >
        <RoleIcon roleId={roleId} size={22} />
        <Text style={styles.label}>{label}</Text>
        {onInfoPress ? <Text style={styles.infoHint}>ⓘ</Text> : null}
      </Pressable>
      <View style={styles.controls}>
        <Pressable
          onPress={() => onChange(Math.max(min, count - 1))}
          style={styles.btn}
        >
          <Text style={styles.btnText}>−</Text>
        </Pressable>
        <Text style={styles.count}>{count}</Text>
        <Pressable
          onPress={() => onChange(Math.min(max, count + 1))}
          style={styles.btn}
        >
          <Text style={styles.btnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
    flexShrink: 1,
  },
  infoHint: {
    color: colors.primary,
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  count: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
});
