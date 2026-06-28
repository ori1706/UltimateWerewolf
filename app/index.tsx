import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useGameStore } from '@/src/store/gameStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);
  const game = useGameStore((s) => s.game);
  const hasActiveGame = game && game.phase !== 'gameOver' && game.phase !== 'setup';

  return (
    <ScreenLayout scroll={false}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🐺</Text>
        <Text style={styles.title}>{t('app.title')}</Text>
        <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
      </View>

      <LanguageSwitcher locale={locale} onChange={setLocale} />

      <View style={styles.actions}>
        <Button
          label={t('home.newGame')}
          onPress={() => router.push('/setup/players')}
        />
        {hasActiveGame ? (
          <Button
            label={t('home.continueGame')}
            variant="secondary"
            onPress={() => {
              const phase = game!.phase;
              if (phase === 'roleAssign') router.push('/assign');
              else if (phase === 'night') router.push('/game/night');
              else if (phase === 'day') router.push('/game/day');
              else if (phase === 'vote') router.push('/game/vote');
              else if (phase === 'hunter') router.push('/game/hunter');
            }}
          />
        ) : null}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>{t('home.howToPlay')}</Text>
        <Text style={styles.infoText}>{t('home.howToPlayText')}</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    gap: 12,
    marginBottom: 32,
  },
  infoBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
});
