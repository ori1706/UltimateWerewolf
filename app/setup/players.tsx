import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  type RenderItemParams,
} from 'react-native-draggable-flatlist';
import * as Haptics from 'expo-haptics';
import { Button } from '@/src/components/Button';
import { SetupPlayerRow } from '@/src/components/SetupPlayerRow';
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [listData, setListData] = useState<Player[]>(setupPlayers);

  useEffect(() => {
    setListData((prev) => {
      const prevOrder = prev.map((p) => p.id).join();
      const nextOrder = setupPlayers.map((p) => p.id).join();
      if (prevOrder !== nextOrder) {
        return setupPlayers;
      }
      return prev.map((p) => setupPlayers.find((s) => s.id === p.id) ?? p);
    });
  }, [setupPlayers]);

  const pickPhoto = useCallback(
    async (playerId: string, useCamera: boolean) => {
      const perm = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
          })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.8,
            allowsEditing: true,
            aspect: [1, 1],
          });

      if (!result.canceled && result.assets[0]) {
        const uri = await persistPhotoUri(result.assets[0].uri);
        updatePlayer(playerId, { photoUri: uri });
      }
    },
    [updatePlayer]
  );

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

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((current) => (current === id ? null : id));
    Haptics.selectionAsync();
  }, []);

  const handleDragEnd = useCallback(
    ({ data }: { data: Player[] }) => {
      setListData(data);
      reorderPlayers(data);
      setExpandedId(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [reorderPlayers]
  );

  const renderPlayer = useCallback(
    (params: RenderItemParams<Player>) => (
      <SetupPlayerRow
        {...params}
        expanded={expandedId === params.item.id}
        onToggleExpand={toggleExpand}
        onPickLibrary={(id) => pickPhoto(id, false)}
        onPickCamera={(id) => pickPhoto(id, true)}
        onRemovePhoto={(id) => updatePlayer(id, { photoUri: undefined })}
        onDelete={(id) => {
          removePlayer(id);
          setExpandedId(null);
        }}
      />
    ),
    [expandedId, pickPhoto, removePlayer, toggleExpand, updatePlayer]
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

      {listData.length > 0 ? (
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
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderPlayer}
        onDragEnd={handleDragEnd}
        extraData={expandedId}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={styles.listContent}
        containerStyle={styles.list}
        activationDistance={12}
        autoscrollThreshold={80}
        autoscrollSpeed={120}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenBody: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 0,
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
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
    marginBottom: 12,
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
  deleteText: {
    color: colors.danger,
    fontSize: 13,
  },
});
