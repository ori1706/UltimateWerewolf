import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { RoleRevealSettingRow } from '@/src/components/RoleRevealSettingRow';
import {
  MAX_DELIBERATION_TIMER_MINUTES,
  MIN_DELIBERATION_TIMER_MINUTES,
  ROLE_REVEAL_SETTING_DEFS,
  setRoleRevealEnabled,
} from '@/src/game/roleReveal';
import type { GameSettings } from '@/src/game/types';
import { colors } from '@/src/theme/colors';

interface GameSettingsFormProps {
  settings: GameSettings;
  onChange: (partial: Partial<GameSettings>) => void;
}

export function GameSettingsForm({ settings, onChange }: GameSettingsFormProps) {
  const { t } = useTranslation();
  const deliberationMinutes = Math.round(settings.deliberationTimerSeconds / 60);

  return (
    <View>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{t('settings.revealDeadRoles')}</Text>
          <Text style={styles.settingHint}>{t('settings.revealDeadRolesHint')}</Text>
        </View>
        <Switch
          value={settings.revealDeadRoles}
          onValueChange={(v) => onChange({ revealDeadRoles: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {ROLE_REVEAL_SETTING_DEFS.map((def) => (
        <RoleRevealSettingRow
          key={def.action}
          def={def}
          settings={settings}
          onChange={(enabled) => {
            const next = setRoleRevealEnabled(settings, def, enabled);
            onChange({ roleReveal: next.roleReveal });
          }}
        />
      ))}

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{t('settings.deliberationTimer')}</Text>
          <Text style={styles.settingHint}>{t('settings.deliberationTimerHint')}</Text>
        </View>
        <Switch
          value={settings.deliberationTimerEnabled}
          onValueChange={(v) => onChange({ deliberationTimerEnabled: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>

      {settings.deliberationTimerEnabled ? (
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.deliberationTimerDuration')}</Text>
            <Text style={styles.settingHint}>{t('settings.deliberationTimerDurationHint')}</Text>
          </View>
          <View style={styles.durationControls}>
            <Pressable
              onPress={() =>
                onChange({
                  deliberationTimerSeconds:
                    Math.max(MIN_DELIBERATION_TIMER_MINUTES, deliberationMinutes - 1) * 60,
                })
              }
              style={styles.durationBtn}
            >
              <Text style={styles.durationBtnText}>−</Text>
            </Pressable>
            <Text style={styles.durationValue}>
              {t('settings.deliberationTimerMinutes', { count: deliberationMinutes })}
            </Text>
            <Pressable
              onPress={() =>
                onChange({
                  deliberationTimerSeconds:
                    Math.min(MAX_DELIBERATION_TIMER_MINUTES, deliberationMinutes + 1) * 60,
                })
              }
              style={styles.durationBtn}
            >
              <Text style={styles.durationBtnText}>+</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{t('settings.allowVoteSkip')}</Text>
          <Text style={styles.settingHint}>{t('settings.allowVoteSkipHint')}</Text>
        </View>
        <Switch
          value={settings.allowVoteSkip}
          onValueChange={(v) => onChange({ allowVoteSkip: v })}
          trackColor={{ true: colors.primary }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
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
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  settingHint: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBtnText: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  durationValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 72,
    textAlign: 'center',
  },
});
