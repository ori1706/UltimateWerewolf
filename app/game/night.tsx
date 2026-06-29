import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/Button';
import { GameScreenLayout } from '@/src/components/GameScreenLayout';
import { NightActorBanner } from '@/src/components/NightActorBanner';
import { PassPhoneGate } from '@/src/components/PassPhoneGate';
import { PhaseIntro } from '@/src/components/PhaseIntro';
import { PlayerCard } from '@/src/components/PlayerCard';
import { PlayerPicker } from '@/src/components/PlayerPicker';
import {
  canBodyguardProtect,
  getCurrentNightStep,
  getLivingWerewolfIds,
  getLoverPartner,
  getMasonPartners,
  getPriorWolfVoteCounts,
  getWerewolves,
} from '@/src/game/engine';
import { getPlayerById } from '@/src/game/rules';
import { formatInspectionResultLabel, inspectPlayer } from '@/src/game/roleReveal';
import type { RoleId } from '@/src/game/types';
import { useGamePhaseScreen } from '@/src/hooks/useGamePhaseScreen';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';

export default function NightScreen() {
  const { t } = useTranslation();
  const game = useGamePhaseScreen('night');
  const submitNightAction = useGameStore((s) => s.submitNightAction);
  const [phaseIntroDismissed, setPhaseIntroDismissed] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [seerResult, setSeerResult] = useState<string | null>(null);
  const [seerTargetId, setSeerTargetId] = useState<string | null>(null);

  useEffect(() => {
    setPhaseIntroDismissed(false);
    setGateOpen(false);
    setSelected([]);
    setSeerResult(null);
  }, [game?.dayNumber]);

  useEffect(() => {
    setGateOpen(false);
    setSelected([]);
    setSeerResult(null);
    setSeerTargetId(null);
  }, [game?.currentNightStepIndex]);

  if (!game) {
    return null;
  }

  if (!phaseIntroDismissed) {
    return (
      <PhaseIntro
        variant="night"
        dayNumber={game.dayNumber}
        onContinue={() => setPhaseIntroDismissed(true)}
      />
    );
  }

  const step = getCurrentNightStep(game);
  if (!step) {
    return null;
  }

  const resetSelection = () => {
    setSelected([]);
    setSeerResult(null);
    setSeerTargetId(null);
    setGateOpen(false);
  };

  const actorId = step.actorId;
  const actor = actorId ? getPlayerById(game.players, actorId) : undefined;

  const getInstruction = (): string => {
    switch (step.type) {
      case 'cupid':
        return t('night.cupid');
      case 'masonReveal':
        return t('night.mason');
      case 'minionReveal':
        return t('night.minion');
      case 'loverReveal':
        return t('night.loverReveal');
      case 'bodyguard':
        return t('night.bodyguard');
      case 'werewolfKill':
        return t('night.werewolf');
      case 'seerInspect':
        return t('night.seer');
      case 'pass':
        return t('night.noActionPass');
      default:
        return '';
    }
  };

  const handleConfirm = () => {
    if (step.type === 'cupid' && selected.length !== 2) return;
    if (step.type !== 'cupid' && selected.length !== 1) return;

    if (step.type === 'seerInspect') {
      const target = getPlayerById(game.players, selected[0]);
      if (!target?.role) return;

      const inspection = inspectPlayer(target, 'seerInspect', game.settings);
      setSeerResult(formatInspectionResultLabel(inspection, target.name, t));
      setSeerTargetId(selected[0]);
      return;
    }

    submitNightAction({ type: step.type, targetIds: selected });
    resetSelection();
  };

  if (!gateOpen && actor) {
    return (
      <PassPhoneGate
        key={`${step.type}-${actor.id}-${game.currentNightStepIndex}`}
        playerName={actor.name}
        photoUri={actor.photoUri}
        onReady={() => setGateOpen(true)}
      />
    );
  }

  const nightHeader = (
    <Text style={styles.phase}>{t('night.title', { number: game.dayNumber })}</Text>
  );

  const getActorDisplayRole = (): RoleId | undefined => {
    if (!actor?.role) return undefined;
    if (
      step.type === 'seerInspect' &&
      actor.role === 'apprenticeSeer' &&
      game.apprenticePromoted
    ) {
      return 'seer';
    }
    return actor.role;
  };

  const actorContent = actor ? (
    <NightActorBanner player={actor} displayRole={getActorDisplayRole()} />
  ) : null;

  if (step.type === 'pass' && actor) {
    return (
      <GameScreenLayout
        scroll
        header={nightHeader}
        contentStyle={styles.passContent}
        footer={
          <Button
            label={t('common.continue')}
            onPress={() => {
              submitNightAction({ type: 'pass', targetIds: [] });
              resetSelection();
            }}
          />
        }
      >
        {actorContent}
        <Text style={[styles.instruction, styles.passInstruction]}>{getInstruction()}</Text>
      </GameScreenLayout>
    );
  }

  if (step.type === 'masonReveal' && actor) {
    const partners = getMasonPartners(game, actor.id);
    return (
      <GameScreenLayout
        scroll
        header={nightHeader}
        footer={
          <Button
            label={t('common.continue')}
            onPress={() => {
              submitNightAction({ type: 'masonReveal', targetIds: partners.map((p) => p.id) });
              resetSelection();
            }}
          />
        }
      >
        {actorContent}
        <Text style={styles.instruction}>{getInstruction()}</Text>
        {partners.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </GameScreenLayout>
    );
  }

  if (step.type === 'minionReveal' && actor) {
    const wolves = getWerewolves(game);
    return (
      <GameScreenLayout
        scroll
        header={nightHeader}
        footer={
          <Button
            label={t('common.continue')}
            onPress={() => {
              submitNightAction({ type: 'minionReveal', targetIds: wolves.map((w) => w.id) });
              resetSelection();
            }}
          />
        }
      >
        {actorContent}
        <Text style={styles.instruction}>{getInstruction()}</Text>
        {wolves.map((p) => (
          <PlayerCard key={p.id} player={p} />
        ))}
      </GameScreenLayout>
    );
  }

  if (step.type === 'loverReveal' && actor) {
    const partner = getLoverPartner(game, actor.id);
    return (
      <GameScreenLayout
        scroll
        header={nightHeader}
        footer={
          <Button
            label={t('common.continue')}
            onPress={() => {
              submitNightAction({ type: 'loverReveal', targetIds: partner ? [partner.id] : [] });
              resetSelection();
            }}
          />
        }
      >
        {actorContent}
        <Text style={styles.instruction}>{getInstruction()}</Text>
        <Text style={styles.loverHint}>{t('night.loverRevealHint')}</Text>
        {partner ? (
          <PlayerCard player={partner} subtitle={t('night.loverPartner')} />
        ) : null}
      </GameScreenLayout>
    );
  }

  const wolfVoteCounts =
    step.type === 'werewolfKill' && actor
      ? getPriorWolfVoteCounts(game, actor.id)
      : {};

  const hasPriorWolfVotes = Object.keys(wolfVoteCounts).length > 0;

  const excludeIds =
    step.type === 'bodyguard' && actor
      ? game.lastBodyguardTarget
        ? [actor.id, game.lastBodyguardTarget]
        : [actor.id]
      : step.type === 'werewolfKill'
        ? getLivingWerewolfIds(game)
        : actor
          ? [actor.id]
          : [];

  const toggleSelect = (id: string) => {
    if (step.type === 'cupid') {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
      );
    } else {
      setSelected([id]);
    }
  };

  const bodyguardBlocked =
    step.type === 'bodyguard' &&
    selected.length === 1 &&
    !canBodyguardProtect(game, selected[0]);

  return (
    <GameScreenLayout
      scroll
      header={nightHeader}
      footer={
        seerResult ? (
          <Button
            label={t('common.continue')}
            onPress={() => {
              if (!seerTargetId) return;
              submitNightAction({ type: 'seerInspect', targetIds: [seerTargetId] });
              resetSelection();
            }}
          />
        ) : (
          <Button
            label={t('common.confirm')}
            onPress={handleConfirm}
            disabled={
              (step.type === 'cupid' ? selected.length !== 2 : selected.length !== 1) ||
              bodyguardBlocked
            }
          />
        )
      }
    >
      {actorContent}
      <Text style={styles.instruction}>{getInstruction()}</Text>
      <Text style={styles.private}>{t('passPhone.privateAction')}</Text>

      {step.type === 'werewolfKill' && hasPriorWolfVotes ? (
        <Text style={styles.wolfVoteHint}>{t('night.wolfVoteHint')}</Text>
      ) : null}

      {seerResult ? (
        <View style={styles.seerBox}>
          <Text style={styles.seerLabel}>{t('night.seerReveal')}</Text>
          <Text style={styles.seerText}>{seerResult}</Text>
        </View>
      ) : (
        <PlayerPicker
          players={game.players}
          selectedIds={selected}
          onToggle={toggleSelect}
          maxSelections={step.type === 'cupid' ? 2 : 1}
          excludeIds={excludeIds}
          voteCounts={wolfVoteCounts}
        />
      )}

      {bodyguardBlocked ? (
        <Text style={styles.error}>{t('errors.cannotProtectSame')}</Text>
      ) : null}
    </GameScreenLayout>
  );
}

const styles = StyleSheet.create({
  phase: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  instruction: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  private: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  wolfVoteHint: {
    color: colors.werewolf,
    fontSize: 14,
    marginBottom: 12,
  },
  loverHint: {
    color: colors.lover,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  passInstruction: {
    textAlign: 'center',
    lineHeight: 32,
  },
  passContent: {
    flexGrow: 1,
    paddingTop: 8,
  },
  seerBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 24,
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  seerLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  seerText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    marginTop: 12,
  },
});
