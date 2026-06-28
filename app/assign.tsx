import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { Button } from '@/src/components/Button';
import { PlayerCard } from '@/src/components/PlayerCard';
import { getFellowWerewolves } from '@/src/game/engine';
import { getRoleTeam } from '@/src/game/roles';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function AssignScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('roleAssign');
  const advanceRoleAssign = useGameStore((s) => s.advanceRoleAssign);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    setGateOpen(false);
  }, [game?.roleAssignIndex]);

  if (!game) {
    return null;
  }

  const player = game.players[game.roleAssignIndex];
  const role = player.role!;
  const team = getRoleTeam(role);
  const fellowWolves =
    role === 'werewolf' ? getFellowWerewolves(game, player.id) : [];

  if (!gateOpen) {
    return (
      <PassPhoneGate
        playerName={player.name}
        photoUri={player.photoUri}
        onReady={() => setGateOpen(true)}
        holdToReveal
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.progress}>
        {t('assign.progress', {
          current: game.roleAssignIndex + 1,
          total: game.players.length,
        })}
      </Text>
      <Text style={styles.label}>{t('assign.yourRole')}</Text>
      <Text style={styles.role}>{t(`roles.${role}`)}</Text>
      <Text style={styles.desc}>{t(`roles.descriptions.${role}`)}</Text>
      <View style={styles.teamBadge}>
        <Text style={styles.teamLabel}>{t('assign.team')}</Text>
        <Text style={styles.team}>{t(`assign.teams.${team}`)}</Text>
      </View>

      {role === 'werewolf' ? (
        <View style={styles.wolfSection}>
          {fellowWolves.length === 0 ? (
            <Text style={styles.wolfTitle}>{t('assign.onlyWerewolf')}</Text>
          ) : (
            <>
              <Text style={styles.wolfTitle}>{t('assign.fellowWerewolves')}</Text>
              {fellowWolves.map((wolf) => (
                <PlayerCard key={wolf.id} player={wolf} />
              ))}
            </>
          )}
        </View>
      ) : null}

      <Button
        label={t('passPhone.gotIt')}
        onPress={() => {
          advanceRoleAssign();
        }}
        style={styles.btn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 8,
  },
  role: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  desc: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  teamBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  teamLabel: {
    color: colors.textMuted,
    fontSize: 12,
  },
  team: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  wolfSection: {
    width: '100%',
    marginBottom: 24,
  },
  wolfTitle: {
    color: colors.werewolf,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
  },
});
