import { useTranslation } from 'react-i18next';
import { StyleSheet, Switch, Text, View } from 'react-native';
import {
  isRoleRevealEnabled,
  type RoleRevealSettingDef,
} from '@/src/game/roleReveal';
import type { GameSettings } from '@/src/game/types';
import { colors } from '@/src/theme/colors';

interface RoleRevealSettingRowProps {
  def: RoleRevealSettingDef;
  settings: GameSettings;
  onChange: (enabled: boolean) => void;
}

export function RoleRevealSettingRow({ def, settings, onChange }: RoleRevealSettingRowProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.label}>{t(def.labelKey)}</Text>
        <Text style={styles.hint}>{t(def.hintKey)}</Text>
      </View>
      <Switch
        value={isRoleRevealEnabled(settings, def)}
        onValueChange={onChange}
        trackColor={{ true: colors.primary }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
