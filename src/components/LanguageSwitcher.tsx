import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppLocale } from '../i18n';
import { colors } from '../theme/colors';

interface LanguageSwitcherProps {
  locale: AppLocale;
  onChange: (locale: AppLocale) => void;
}

export function LanguageSwitcher({ locale, onChange }: LanguageSwitcherProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('language.label')}</Text>
      <View style={styles.row}>
        {(['en', 'he'] as AppLocale[]).map((code) => (
          <Pressable
            key={code}
            onPress={() => onChange(code)}
            style={[styles.chip, locale === code && styles.chipActive]}
          >
            <Text style={[styles.chipText, locale === code && styles.chipTextActive]}>
              {t(`language.${code}`)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 0,
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.text,
  },
});
