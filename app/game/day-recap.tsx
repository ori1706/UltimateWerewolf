import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { PlayerCard } from '@/src/components/PlayerCard';
import { RoleIcon } from '@/src/components/RoleIcon';
import { getPlayerById } from '@/src/game/rules';
import type { RoleId } from '@/src/game/types';
import {
  findHeartbreakDeathsAfterVote,
  findLastDayVoteResolved,
  getDayVoteResult,
  parseDayVoteBallots,
  playerName,
} from '@/src/game/voteLog';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function DayRecapScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('dayRecap');
  const advanceDayRecap = useGameStore((s) => s.advanceDayRecap);
  const [ballotsExpanded, setBallotsExpanded] = useState(false);

  if (!game) {
    return null;
  }

  const voteEvent = findLastDayVoteResolved(game);
  if (!voteEvent) {
    return null;
  }

  const result = getDayVoteResult(voteEvent);
  const ballots = parseDayVoteBallots(voteEvent);
  const ballotEntries = Object.entries(ballots);
  const hasBallots = ballotEntries.length > 0;
  const executedId = voteEvent.targetIds?.[0];
  const executed = executedId ? getPlayerById(game.players, executedId) : undefined;
  const executedRole =
    (voteEvent.metadata?.executedRole as string | undefined) ?? executed?.role;
  const heartbreakDeaths = findHeartbreakDeathsAfterVote(game, voteEvent);

  let outcomeText = '';
  if (result === 'executed' && executed) {
    outcomeText = t('dayRecap.executed', { name: executed.name });
  } else if (result === 'no_votes') {
    outcomeText = t('dayRecap.noVotes');
  } else {
    outcomeText = t('dayRecap.tie');
  }

  return (
    <GameScreenLayout
      scroll
      contentStyle={styles.content}
      footer={
        <Button label={t('common.continue')} onPress={() => advanceDayRecap()} />
      }
    >
      <Text style={styles.phase}>{t('dayRecap.title', { number: game.dayNumber })}</Text>

      <Text style={[styles.outcome, result === 'executed' && styles.outcomeExecuted]}>
        {outcomeText}
      </Text>

      {result === 'executed' && executed ? (
        <View style={styles.executedCard}>
          <PlayerCard player={executed} />
          {game.settings.revealDeadRoles && executedRole ? (
            <View style={styles.roleRevealRow}>
              <Text style={styles.roleReveal}>{t('dayRecap.roleRevealPrefix')}</Text>
              <RoleIcon roleId={executedRole as RoleId} size={18} />
              <Text style={styles.roleReveal}>{t(`roles.${executedRole}`)}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {heartbreakDeaths.length > 0 ? (
        <View style={styles.heartbreakSection}>
          <Text style={styles.sectionTitle}>{t('dayRecap.heartbreakTitle')}</Text>
          {heartbreakDeaths.map((event) => {
            const partnerId = event.targetIds?.[0];
            const partner = partnerId ? getPlayerById(game.players, partnerId) : undefined;
            if (!partner) return null;

            return (
              <View key={event.id} style={styles.heartbreakCard}>
                <PlayerCard player={partner} />
                <Text style={styles.heartbreakText}>
                  {t('dayRecap.loverDied', { name: partner.name })}
                </Text>
                {game.settings.revealDeadRoles && partner.role ? (
                  <View style={styles.roleRevealRow}>
                    <Text style={styles.roleReveal}>{t('dayRecap.roleRevealPrefix')}</Text>
                    <RoleIcon roleId={partner.role} size={18} />
                    <Text style={styles.roleReveal}>{t(`roles.${partner.role}`)}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      ) : null}

      {hasBallots ? (
        <View style={styles.ballotsSection}>
          <Pressable
            onPress={() => setBallotsExpanded((open) => !open)}
            style={({ pressed }) => [styles.ballotsHeader, pressed && styles.ballotsHeaderPressed]}
          >
            <Text style={styles.ballotsHint}>
              {ballotsExpanded ? t('events.voteCollapse') : t('events.voteExpand')}
            </Text>
            <Text style={[styles.chevron, ballotsExpanded && styles.chevronOpen]}>
              {ballotsExpanded ? '▾' : '▸'}
            </Text>
          </Pressable>

          {ballotsExpanded ? (
            <View style={styles.ballotsDetails}>
              {ballotEntries.map(([voterId, targetId]) => (
                <Text key={voterId} style={styles.ballotLine}>
                  {targetId === 'skip'
                    ? t('events.dayVoteBallotSkip', {
                        voter: playerName(game.players, voterId),
                      })
                    : t('events.dayVoteBallotVote', {
                        voter: playerName(game.players, voterId),
                        target: playerName(game.players, targetId),
                      })}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  phase: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  outcome: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 24,
  },
  outcomeExecuted: {
    color: colors.danger,
  },
  executedCard: {
    marginBottom: 24,
  },
  roleReveal: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 4,
  },
  roleRevealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 4,
  },
  heartbreakSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  heartbreakCard: {
    marginBottom: 12,
  },
  heartbreakText: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: -4,
    paddingLeft: 4,
  },
  ballotsSection: {
    marginTop: 8,
  },
  ballotsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  ballotsHeaderPressed: {
    opacity: 0.85,
  },
  ballotsHint: {
    flex: 1,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  chevron: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  chevronOpen: {
    color: colors.textMuted,
  },
  ballotsDetails: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  ballotLine: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
