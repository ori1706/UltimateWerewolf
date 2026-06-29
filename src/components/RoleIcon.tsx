import { StyleSheet, Text, type TextStyle } from 'react-native';
import { getRoleIcon } from '../game/roles';
import type { RoleId } from '../game/types';

interface RoleIconProps {
  roleId: RoleId;
  size?: number;
  style?: TextStyle;
}

export function RoleIcon({ roleId, size = 24, style }: RoleIconProps) {
  return (
    <Text style={[styles.icon, { fontSize: size, lineHeight: Math.round(size * 1.15) }, style]}>
      {getRoleIcon(roleId)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});
