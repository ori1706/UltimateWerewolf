import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { Button } from '@/src/components/Button';
import { PlayerCard } from '@/src/components/PlayerCard';
import { ScreenLayout } from '@/src/components/ScreenLayout';
import { MIN_PLAYERS } from '@/src/game/rules';
import type { Player } from '@/src/game/types';
import { useGameStore } from '@/src/store/gameStore';
import { colors } from '@/src/theme/colors';
import { persistPhotoUri } from '@/src/utils/photos';

export default function PlayersSetupScreen() {
  const { t } = useTranslation();
  const setupPlayers = useGameStore((s) => s.setupPlayers);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const reorderPlayers = useGameStore((s) => s.reorderPlayers);
  const savedRosters = useGameStore((s) => s.savedRosters);
  const saveRoster = useGameStore((s) => s.saveRoster);
  const loadRoster = useGameStore((s) => s.loadRoster);
  const deleteRoster = useGameStore((s) => s.deleteRoster);

  const [name, setName] = useState('');
  const [rosterName, setRosterName] = useState('');

  const pickPhoto = async (playerId: string, useCamera: boolean) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true, aspect: [1, 1] });

    if (!result.canceled && result.assets[0]) {
      const uri = await persistPhotoUri(result.assets[0].uri);
      updatePlayer(playerId, { photoUri: uri });
    }
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert(t('errors.nameRequired'));
      return;
    }
    if (setupPlayers.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert(t('errors.duplicateName'));
      return;
    }
    addPlayer(trimmed);
    setName('');
  };

  const handleDragEnd = useCallback(
    ({ data }: { data: Player[] }) => {
      reorderPlayers(data);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [reorderPlayers]
  );

  const renderPlayer = useCallback(
    ({ item, drag, isActive, getIndex }: RenderItemParams<Player>) => {
      const index = getIndex() ?? 0;
      return (
        <ScaleDecorator>
          <View style={[styles.playerRow, isActive && styles.playerRowActive]}>
            <View style={styles.playerHeader}>
              <View style={styles.seatBadge}>
                <Text style={styles.seatNumber}>{index + 1}</Text>
              </View>
              <Pressable
                onPressIn={drag}
                style={styles.dragHandle}
                accessibilityLabel={t('setup.dragHandle')}
              >
                <Text style={styles.dragHandleIcon}>⠿</Text>
              </Pressable>
            </View>
            <PlayerCard player={item} />
            <View style={styles.playerActions}>
              <Pressable onPress={() => pickPhoto(item.id, false)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>{t('setup.photoFromLibrary')}</Text>
              </Pressable>
              <Pressable onPress={() => pickPhoto(item.id, true)} style={styles.smallBtn}>
                <Text style={styles.smallBtnText}>{t('setup.photoFromCamera')}</Text>
              </Pressable>
              {item.photoUri ? (
                <Pressable
                  onPress={() => updatePlayer(item.id, { photoUri: undefined })}
                  style={styles.smallBtn}
                >
                  <Text style={styles.smallBtnText}>{t('setup.removePhoto')}</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => removePlayer(item.id)} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>{t('common.delete')}</Text>
              </Pressable>
            </View>
          </View>
        </ScaleDecorator>
      );
    },
    [pickPhoto, removePlayer, t, updatePlayer]
  );

  const canContinue = setupPlayers.length >= MIN_PLAYERS;

  const listHeader = (
    <>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={t('setup.playerNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleAdd}
        />
        <Button label={t('common.add')} onPress={handleAdd} style={styles.addBtn} />
      </View>

      {setupPlayers.length > 0 ? (
        <View style={styles.orderSection}>
          <Text style={styles.orderTitle}>{t('setup.seatingOrder')}</Text>
          <Text style={styles.orderHint}>{t('setup.reorderHint')}</Text>
        </View>
      ) : null}
    </>
  );

  const listFooter = (
    <View style={styles.rosterSection}>
      <Text style={styles.sectionTitle}>{t('setup.savedRosters')}</Text>
      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={t('setup.rosterNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          value={rosterName}
          onChangeText={setRosterName}
        />
        <Button
          label={t('setup.saveRoster')}
          variant="secondary"
          onPress={() => {
            if (!rosterName.trim() || setupPlayers.length === 0) return;
            saveRoster(rosterName.trim());
            setRosterName('');
          }}
          style={styles.addBtn}
          disabled={setupPlayers.length === 0}
        />
      </View>
      {savedRosters.map((roster) => (
        <View key={roster.id} style={styles.rosterRow}>
          <Text style={styles.rosterName}>
            {roster.name} ({roster.players.length})
          </Text>
          <View style={styles.rosterActions}>
            <Pressable onPress={() => loadRoster(roster.id)}>
              <Text style={styles.link}>{t('setup.loadRoster')}</Text>
            </Pressable>
            <Pressable onPress={() => deleteRoster(roster.id)}>
              <Text style={styles.deleteText}>{t('common.delete')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScreenLayout
      title={t('setup.playersTitle')}
      subtitle={t('setup.minPlayersHint', { count: MIN_PLAYERS })}
      scroll={false}
      style={styles.screenBody}
      footer={
        <Button
          label={t('setup.nextRoles')}
          onPress={() => router.push('/setup/roles')}
          disabled={!canContinue}
        />
      }
    >
      <DraggableFlatList
        data={setupPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        onDragEnd={handleDragEnd}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={styles.listContent}
        containerStyle={styles.list}
        activationDistance={8}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    padding: 0,
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 32,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    marginTop: 4,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
  addBtn: {
    paddingHorizontal: 16,
    minWidth: 80,
  },
  orderSection: {
    marginBottom: 16,
  },
  orderTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  orderHint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  playerRow: {
    marginBottom: 8,
  },
  playerRowActive: {
    opacity: 0.92,
    transform: [{ scale: 1.02 }],
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  seatBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatNumber: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  dragHandle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dragHandleIcon: {
    color: colors.textMuted,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  playerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    paddingLeft: 4,
  },
  smallBtn: {
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  deleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: colors.danger,
    fontSize: 13,
  },
  rosterSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  rosterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rosterName: {
    color: colors.text,
    fontSize: 16,
  },
  rosterActions: {
    flexDirection: 'row',
    gap: 16,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
});
