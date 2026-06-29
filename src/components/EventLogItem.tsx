import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { formatInspectionResultFromEvent } from '../game/roleReveal';
import { playerName } from '../game/voteLog';
import type { GameEvent, Player } from '../game/types';
import { colors } from '../theme/colors';
import { DayVoteResultLogItem } from './DayVoteResultLogItem';

interface EventLogItemProps {
  event: GameEvent;
  players: Player[];
  showHidden?: boolean;
}

function namesList(players: Player[], ids: string[] = []): string {
  return ids.map((id) => playerName(players, id)).join(', ');
}

export function EventLogItem({ event, players, showHidden = true }: EventLogItemProps) {
  const { t } = useTranslation();

  if (event.hidden && !showHidden) return null;

  if (event.type === 'dayVoteResolved') {
    return <DayVoteResultLogItem event={event} players={players} />;
  }

  let text = '';

  switch (event.type) {
    case 'cupidLinked':
      text = t('events.cupidLinked', {
        a: playerName(players, event.targetIds?.[0] ?? ''),
        b: playerName(players, event.targetIds?.[1] ?? ''),
      });
      break;
    case 'masonsRevealed':
      text = t('events.masonsRevealed', {
        name: playerName(players, event.actorIds?.[0] ?? ''),
        others: namesList(players, event.targetIds),
      });
      break;
    case 'minionSawWolves':
      text = t('events.minionSawWolves', {
        names: namesList(players, event.targetIds),
      });
      break;
    case 'bodyguardProtected':
      text = t('events.bodyguardProtected', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'werewolvesTargeted':
      text = t('events.werewolvesTargeted', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'werewolfVote':
      text = t('events.werewolfVote', {
        wolf: playerName(players, event.actorIds?.[0] ?? ''),
        target: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'werewolfNoMajority':
      text = t('events.werewolfNoMajority');
      break;
    case 'werewolfKillSurvived':
      text = t('events.werewolfKillSurvived', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'werewolfKillSucceeded':
      text = t('events.werewolfKillSucceeded', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'seerInspected':
      text = t('events.seerInspected', {
        result: formatInspectionResultFromEvent(event, players, t),
      });
      break;
    case 'playerDied':
      text = t('events.playerDied', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
        cause: t(`events.causes.${event.metadata?.cause ?? 'night'}`),
      });
      break;
    case 'loverDied':
      text = t('events.loverDied', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
        partner: playerName(players, event.actorIds?.[0] ?? ''),
      });
      break;
    case 'hunterShot':
      text = t('events.hunterShot', {
        hunter: playerName(players, event.actorIds?.[0] ?? ''),
        target: playerName(players, event.targetIds?.[0] ?? ''),
      });
      break;
    case 'playerLynched': {
      const roleKey = event.metadata?.role as string;
      text = t('events.playerLynched', {
        name: playerName(players, event.targetIds?.[0] ?? ''),
        role: roleKey ? t(`roles.${roleKey}`) : '',
      });
      break;
    }
    case 'apprenticePromoted':
      text = t('events.apprenticePromoted');
      break;
    case 'noDeathsNight':
      text = t('events.noDeathsNight');
      break;
    case 'voteTie':
      text = t('events.voteTie');
      break;
    case 'voteSkipped':
      text = t('events.voteSkipped', {
        name: playerName(players, event.actorIds?.[0] ?? ''),
      });
      break;
    case 'gameEnded':
      text = t('events.gameEnded', {
        winner: t(`win.${event.metadata?.winner ?? 'village'}`),
      });
      break;
    default:
      return null;
  }

  return (
    <View style={[styles.row, event.hidden && styles.hidden]}>
      {event.hidden ? <Text style={styles.badge}>🔒</Text> : null}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

export function PhaseHeader({ phase, dayNumber }: { phase: 'night' | 'day'; dayNumber: number }) {
  const { t } = useTranslation();
  const label =
    phase === 'night'
      ? t('events.phaseNight', { number: dayNumber })
      : t('events.phaseDay', { number: dayNumber });

  return (
    <View style={styles.phaseHeader}>
      <Text style={styles.phaseText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hidden: {
    opacity: 0.85,
  },
  badge: {
    fontSize: 12,
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  phaseHeader: {
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  phaseText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
