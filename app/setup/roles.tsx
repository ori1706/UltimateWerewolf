import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { RoleCounter } from '@/src/components/RoleCounter';
import { RoleInfoModal } from '@/src/components/RoleInfoModal';
import { RoleRevealSettingRow } from '@/src/components/RoleRevealSettingRow';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { ROLE_REVEAL_SETTING_DEFS, setRoleRevealEnabled } from '@/src/game/roleReveal';
import { CORE_ROLES } from '@/src/game/roles';
import type { RoleId } from '@/src/game/types';
import {
  getTeamBalance,
  totalRoleCount,
  validateRoleCounts,
} from '@/src/game/rules';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function RolesSetupScreen() {
  const { t } = useTranslation();
  const setupPlayers = useGameStore((s) => s.setupPlayers);
  const roleCounts = useGameStore((s) => s.roleCounts);
  const settings = useGameStore((s) => s.settings);
  const setRoleCounts = useGameStore((s) => s.setRoleCounts);
  const resetRoleCounts = useGameStore((s) => s.resetRoleCounts);
  const setSettings = useGameStore((s) => s.setSettings);
  const startGame = useGameStore((s) => s.startGame);
  const [infoRole, setInfoRole] = useState<RoleId | null>(null);

  const validation = validateRoleCounts(roleCounts, setupPlayers.length);
  const balance = getTeamBalance(roleCounts);
  const total = totalRoleCount(roleCounts);

  const updateCount = (roleId: RoleId, count: number) => {
    setRoleCounts({ ...roleCounts, [roleId]: count });
  };

  const handleStart = () => {
    if (!validation.valid) return;
    startGame();
    router.replace('/assign');
  };

  return (
    <ScreenLayout
      title={t('roles.title')}
      subtitle={`${setupPlayers.length} ${t('common.players')} · ${total} ${t('roles.total')}`}
      footer={
        <Button
          label={t('roles.startGame')}
          onPress={handleStart}
          disabled={!validation.valid}
        />
      }
    >
      <View style={styles.balanceCard}>
        <Text style={styles.balanceTitle}>{t('roles.balance')}</Text>
        <View style={styles.balanceRow}>
          <Text style={[styles.balanceItem, { color: colors.village }]}>
            {t('roles.teams.village')}: {balance.village}
          </Text>
          <Text style={[styles.balanceItem, { color: colors.werewolf }]}>
            {t('roles.teams.werewolf')}: {balance.werewolf}
          </Text>
          <Text style={[styles.balanceItem, { color: colors.neutral }]}>
            {t('roles.teams.neutral')}: {balance.neutral}
          </Text>
        </View>
      </View>

      <Pressable onPress={resetRoleCounts} style={styles.resetLink}>
        <Text style={styles.resetText}>{t('roles.resetDefaults')}</Text>
      </Pressable>

      <Text style={styles.tapHint}>{t('roles.tapForInfo')}</Text>

      {validation.errors.map((err) => (
        <Text key={err} style={styles.error}>
          {t(err)}
        </Text>
      ))}

      {CORE_ROLES.map((roleId) => (
        <RoleCounter
          key={roleId}
          roleId={roleId}
          label={t(`roles.${roleId}`)}
          count={roleCounts[roleId]}
          onChange={(n) => updateCount(roleId, n)}
          onInfoPress={() => setInfoRole(roleId)}
        />
      ))}

      <RoleInfoModal
        roleId={infoRole}
        visible={infoRole !== null}
        onClose={() => setInfoRole(null)}
      />

      <View style={styles.settingsSection}>
        <Text style={styles.settingsTitle}>{t('settings.title')}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>{t('settings.revealDeadRoles')}</Text>
            <Text style={styles.settingHint}>{t('settings.revealDeadRolesHint')}</Text>
          </View>
          <Switch
            value={settings.revealDeadRoles}
            onValueChange={(v) => setSettings({ revealDeadRoles: v })}
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
              setSettings({ roleReveal: next.roleReveal });
            }}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  balanceTitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  balanceItem: {
    fontSize: 16,
    fontWeight: '700',
  },
  resetLink: {
    marginBottom: 16,
  },
  resetText: {
    color: colors.primary,
    fontWeight: '600',
  },
  tapHint: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
    fontSize: 14,
  },
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
  settingsSection: {
    marginTop: 16,
  },
  settingsTitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
});
