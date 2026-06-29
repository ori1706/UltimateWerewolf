import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { RoleCounter } from '@/src/components/RoleCounter';
import { RoleInfoModal } from '@/src/components/RoleInfoModal';
import { ScreenLayout } from '@/src/components/ScreenLayout';
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
  const setRoleCounts = useGameStore((s) => s.setRoleCounts);
  const resetRoleCounts = useGameStore((s) => s.resetRoleCounts);
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
        <View style={styles.footerRow}>
          <Button
            label={t('roles.settings')}
            variant="secondary"
            onPress={() => router.push('/setup/game-settings')}
            style={styles.footerButton}
          />
          <Button
            label={t('roles.startGame')}
            onPress={handleStart}
            disabled={!validation.valid}
            style={styles.footerButton}
          />
        </View>
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
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
