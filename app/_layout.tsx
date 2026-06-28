import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { Heebo_400Regular, Heebo_600SemiBold, Heebo_700Bold, Heebo_800ExtraBold } from '@expo-google-fonts/heebo';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';
import { initI18n } from '@/src/i18n';
import { useSettingsStore } from '@/src/store/settingsStore';
import { colors } from '@/src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const locale = useSettingsStore((s) => s.locale);
  const i18n = initI18n(locale);

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

  if (!loaded) return null;

  const fontFamily = locale === 'he' ? 'Heebo_400Regular' : 'Inter_400Regular';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily },
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="setup/players" options={{ title: '' }} />
        <Stack.Screen name="setup/roles" options={{ title: '' }} />
        <Stack.Screen name="assign" options={{ headerShown: false }} />
        <Stack.Screen name="game/night" options={{ headerShown: false }} />
        <Stack.Screen name="game/day" options={{ headerShown: false }} />
        <Stack.Screen name="game/vote" options={{ headerShown: false }} />
        <Stack.Screen name="game/hunter" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ headerShown: false }} />
      </Stack>
    </I18nextProvider>
    </GestureHandlerRootView>
  );
}
