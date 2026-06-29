import { useTranslation } from 'react-i18next';
import { GameSettingsForm } from '@/src/components/GameSettingsForm';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { useGameStore } from '@/src/store/gameStore';

export default function GameSettingsScreen() {
  const { t } = useTranslation();
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);

  return (
    <ScreenLayout title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <GameSettingsForm settings={settings} onChange={setSettings} />
    </ScreenLayout>
  );
}
