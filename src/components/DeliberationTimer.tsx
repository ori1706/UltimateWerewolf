import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { formatDuration } from '../utils/formatDuration';
import { colors } from '../theme/colors';

interface DeliberationTimerProps {
  secondsLeft: number;
  onSkip: () => void;
  onAddTime: () => void;
}

export function DeliberationTimer({ secondsLeft, onSkip, onAddTime }: DeliberationTimerProps) {
  const { t } = useTranslation();
  const isExpired = secondsLeft <= 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('day.deliberationTimer')}</Text>
      <Text style={[styles.time, isExpired && styles.timeExpired]}>
        {formatDuration(secondsLeft)}
      </Text>
      {isExpired ? (
        <Text style={styles.expiredHint}>{t('day.deliberationTimerEnded')}</Text>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={t('day.deliberationSkip')}
          onPress={onSkip}
          variant="secondary"
          style={styles.actionBtn}
        />
        <Button
          label={t('day.deliberationAdd15')}
          onPress={onAddTime}
          variant="secondary"
          style={styles.actionBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  time: {
    color: colors.accent,
    fontSize: 56,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  timeExpired: {
    color: colors.danger,
  },
  expiredHint: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
  },
});
