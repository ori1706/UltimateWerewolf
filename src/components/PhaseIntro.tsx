import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { GameScreenLayout } from './GameScreenLayout';
import { colors } from '../theme/colors';

interface PhaseIntroProps {
  variant: 'night' | 'day';
  dayNumber: number;
  onContinue: () => void;
}

export function PhaseIntro({ variant, dayNumber, onContinue }: PhaseIntroProps) {
  const { t } = useTranslation();
  const isNight = variant === 'night';

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onContinue();
  };

  return (
    <GameScreenLayout contentStyle={styles.content}>
      <View style={styles.center}>
        <Text style={styles.icon}>{isNight ? '🌙' : '☀️'}</Text>
        <Text style={[styles.title, isNight && styles.titleNight]}>
          {t(isNight ? 'phaseIntro.nightTitle' : 'phaseIntro.dayTitle', {
            number: dayNumber,
          })}
        </Text>
        <Text style={styles.subtitle}>
          {t(isNight ? 'phaseIntro.nightSubtitle' : 'phaseIntro.daySubtitle')}
        </Text>
      </View>
      <Button
        label={t('phaseIntro.continue')}
        onPress={handleContinue}
        style={styles.btn}
      />
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  icon: {
    fontSize: 72,
    marginBottom: 24,
  },
  title: {
    color: colors.accent,
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  titleNight: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 320,
  },
  btn: {
    marginTop: 24,
  },
});
