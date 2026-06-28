import * as Haptics from 'expo-haptics';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { PlayerAvatar } from './PlayerAvatar';
import { Button } from './Button';
import { colors } from '../theme/colors';

interface PassPhoneGateProps {
  playerName: string;
  photoUri?: string;
  onReady: () => void;
  holdToReveal?: boolean;
  onReveal?: () => void;
  children?: React.ReactNode;
}

export function PassPhoneGate({
  playerName,
  photoUri,
  onReady,
  holdToReveal,
  onReveal,
  children,
}: PassPhoneGateProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHold = () => {
    timer.current = setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRevealed(true);
      onReveal?.();
      if (!children) {
        onReady();
      }
    }, 600);
  };

  const endHold = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  if (revealed && children) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.container}>
          {children}
          <Button
            label={t('passPhone.gotIt')}
            onPress={() => {
              setRevealed(false);
              onReady();
            }}
            style={styles.hideBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
      <Text style={styles.title}>{t('passPhone.title')}</Text>
      <Text style={styles.subtitle}>{t('passPhone.subtitle')}</Text>
      <PlayerAvatar name={playerName} photoUri={photoUri} size={100} />
      <Text style={styles.name}>{playerName}</Text>

      {holdToReveal ? (
        <Pressable
          onPressIn={startHold}
          onPressOut={endHold}
          style={styles.holdArea}
        >
          <Text style={styles.holdText}>{t('passPhone.holdToReveal')}</Text>
        </Pressable>
      ) : (
        <Button
          label={t('passPhone.tapWhenReady', { name: playerName })}
          onPress={onReady}
          style={styles.readyBtn}
        />
      )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.textMuted,
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 32,
  },
  name: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 40,
  },
  holdArea: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  holdText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  readyBtn: {
    width: '100%',
  },
  hideBtn: {
    width: '100%',
    marginTop: 24,
  },
});
