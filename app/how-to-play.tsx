import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { CORE_ROLES, ROLES } from '@/src/game/roles';
import type { RoleId } from '@/src/game/types';
import { colors } from '@/src/theme/colors';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BodyText({ children }: { children: string }) {
  return <Text style={styles.body}>{children}</Text>;
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item} style={styles.listItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function RoleCard({ roleId }: { roleId: RoleId }) {
  const { t } = useTranslation();
  const team = ROLES[roleId].team;
  const teamColor =
    team === 'werewolf' ? colors.werewolf : team === 'neutral' ? colors.neutral : colors.village;

  return (
    <View style={styles.roleCard}>
      <View style={styles.roleHeader}>
        <Text style={styles.roleName}>{t(`roles.${roleId}`)}</Text>
        <View style={[styles.teamBadge, { borderColor: teamColor }]}>
          <Text style={[styles.teamText, { color: teamColor }]}>
            {t(`assign.teams.${team}`)}
          </Text>
        </View>
      </View>
      <Text style={styles.roleDescription}>{t(`roles.descriptions.${roleId}`)}</Text>
    </View>
  );
}

export default function HowToPlayScreen() {
  const { t } = useTranslation();

  const setupSteps = t('guide.setupSteps', { returnObjects: true }) as string[];
  const tips = t('guide.tips', { returnObjects: true }) as string[];

  return (
    <ScreenLayout title={t('guide.title')} subtitle={t('guide.subtitle')}>
      <Section title={t('guide.overviewTitle')}>
        <BodyText>{t('guide.overview')}</BodyText>
      </Section>

      <Section title={t('guide.setupTitle')}>
        <BulletList items={setupSteps} />
      </Section>

      <Section title={t('guide.phasesTitle')}>
        <Text style={styles.phaseName}>{t('guide.phaseNightTitle')}</Text>
        <BodyText>{t('guide.phaseNight')}</BodyText>
        <Text style={styles.phaseName}>{t('guide.phaseDayTitle')}</Text>
        <BodyText>{t('guide.phaseDay')}</BodyText>
        <Text style={styles.phaseName}>{t('guide.phaseVoteTitle')}</Text>
        <BodyText>{t('guide.phaseVote')}</BodyText>
        <Text style={styles.phaseName}>{t('guide.phaseEndTitle')}</Text>
        <BodyText>{t('guide.phaseEnd')}</BodyText>
      </Section>

      <Section title={t('guide.winTitle')}>
        <BulletList
          items={t('guide.winConditions', { returnObjects: true }) as string[]}
        />
      </Section>

      <Section title={t('guide.rolesTitle')}>
        <BodyText>{t('guide.rolesIntro')}</BodyText>
        {CORE_ROLES.map((roleId) => (
          <RoleCard key={roleId} roleId={roleId} />
        ))}
      </Section>

      <Section title={t('guide.tipsTitle')}>
        <BulletList items={tips} />
      </Section>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  list: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    color: colors.primary,
    fontSize: 15,
    lineHeight: 23,
    width: 12,
  },
  listText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  phaseName: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  roleName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  teamBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  teamText: {
    fontSize: 12,
    fontWeight: '700',
  },
  roleDescription: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
