import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface GameScreenLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
}

export function GameScreenLayout({
  children,
  header,
  footer,
  scroll = false,
  contentStyle,
}: GameScreenLayoutProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, contentStyle]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <View style={styles.body}>
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
