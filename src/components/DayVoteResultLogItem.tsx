import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getDayVoteResult,
  parseDayVoteBallots,
  playerName,
} from '../game/voteLog';
import type { GameEvent, Player } from '../game/types';
import { colors } from '../theme/colors';

interface DayVoteResultLogItemProps {
  event: GameEvent;
  players: Player[];
}

export function DayVoteResultLogItem({ event, players }: DayVoteResultLogItemProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  const result = getDayVoteResult(event);
  const ballots = parseDayVoteBallots(event);
  const ballotEntries = Object.entries(ballots);
  const hasBallots = ballotEntries.length > 0;
  const executedId = event.targetIds?.[0];
  const executedName = executedId ? playerName(players, executedId) : '';
  const executedRole = event.metadata?.executedRole as string | undefined;

  let summary = '';
  if (result === 'executed' && executedName) {
    summary = executedRole
      ? t('events.dayVoteExecutedWithRole', {
          name: executedName,
          role: t(`roles.${executedRole}`),
        })
      : t('events.dayVoteExecuted', { name: executedName });
  } else if (result === 'no_votes') {
    summary = t('events.dayVoteNoVotes');
  } else {
    summary = t('events.dayVoteTie');
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => hasBallots && setExpanded((open) => !open)}
        disabled={!hasBallots}
        style={({ pressed }) => [styles.header, pressed && hasBallots && styles.headerPressed]}
      >
        <View style={styles.headerText}>
          <Text style={styles.summary}>{summary}</Text>
          {hasBallots ? (
            <Text style={styles.hint}>
              {expanded ? t('events.voteCollapse') : t('events.voteExpand')}
            </Text>
          ) : null}
        </View>
        {hasBallots ? (
          <Text style={[styles.chevron, expanded && styles.chevronOpen]}>
            {expanded ? '▾' : '▸'}
          </Text>
        ) : null}
      </Pressable>

      {expanded && hasBallots ? (
        <View style={styles.details}>
          {ballotEntries.map(([voterId, targetId]) => (
            <Text key={voterId} style={styles.detailLine}>
              {targetId === 'skip'
                ? t('events.dayVoteBallotSkip', {
                    voter: playerName(players, voterId),
                  })
                : t('events.dayVoteBallotVote', {
                    voter: playerName(players, voterId),
                    target: playerName(players, targetId),
                  })}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  headerPressed: {
    opacity: 0.85,
  },
  headerText: {
    flex: 1,
  },
  summary: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
  },
  hint: {
    color: colors.primary,
    fontSize: 13,
    marginTop: 4,
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
  details: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    gap: 6,
  },
  detailLine: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
