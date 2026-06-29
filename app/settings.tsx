import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { LanguageSwitcher } from '@/src/components/LanguageSwitcher';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useSettingsStore } from '@/src/store/settingsStore';
import { colors } from '@/src/theme/colors';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const locale = useSettingsStore((s) => s.locale);
  const setLocale = useSettingsStore((s) => s.setLocale);

  return (
    <ScreenLayout title={t('settingsPage.title')} subtitle={t('settingsPage.subtitle')}>
      <View style={styles.section}>
        <View style={styles.card}>
          <LanguageSwitcher locale={locale} onChange={setLocale} />
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
