import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { routeForPhase } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  const { t } = useTranslation();
  const game = useGameStore((s) => s.game);
  const hasActiveGame = game && game.phase !== 'gameOver' && game.phase !== 'setup';

  return (
    <ScreenLayout scroll={false} style={styles.screen}>
      <View style={styles.main}>
        <View style={styles.hero}>
          <Text style={styles.emoji}>🐺</Text>
          <Text style={styles.title}>{t('app.title')}</Text>
          <Text style={styles.subtitle}>{t('app.subtitle')}</Text>
        </View>

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
                router.push(routeForPhase(game!.phase));
              }}
            />
          ) : null}
          <Button
            label={t('home.settings')}
            variant="ghost"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>

      <Pressable
        onPress={() => router.push('/how-to-play')}
        style={({ pressed }) => [styles.howToPlayLink, pressed && styles.howToPlayPressed]}
      >
        <Text style={styles.howToPlayText}>{t('home.howToPlay')}</Text>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
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
  },
  howToPlayLink: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  howToPlayPressed: {
    opacity: 0.7,
  },
  howToPlayText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
