import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Heebo_400Regular, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';
import i18n, { setAppLocale } from '@/src/i18n';
import { useSettingsStore } from '@/src/store/settingsStore';
import { colors } from '@/src/theme/colors';
import { useTranslation } from 'react-i18next';

SplashScreen.preventAutoHideAsync();

function AppStack() {
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const fontFamily = locale === 'he' ? 'Heebo_400Regular' : 'Inter_400Regular';
  const homeTitle = t('nav.home');

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        headerBackTitle: homeTitle,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: homeTitle }} />
      <Stack.Screen name="how-to-play" options={{ title: '' }} />
      <Stack.Screen name="settings" options={{ title: '' }} />
      <Stack.Screen name="setup/players" options={{ title: '' }} />
      <Stack.Screen name="setup/roles" options={{ title: '' }} />
      <Stack.Screen name="setup/game-settings" options={{ title: '' }} />
      <Stack.Screen name="assign" options={{ headerShown: false }} />
      <Stack.Screen name="game/night" options={{ headerShown: false }} />
      <Stack.Screen name="game/day" options={{ headerShown: false }} />
      <Stack.Screen name="game/vote" options={{ headerShown: false }} />
      <Stack.Screen name="game/day-recap" options={{ headerShown: false }} />
      <Stack.Screen name="game/hunter" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const locale = useSettingsStore((s) => s.locale);

  const [loaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Heebo_400Regular,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  useEffect(() => {
    void setAppLocale(locale);
  }, [locale]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <AppStack />
    </I18nextProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
