import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import type { RenderItemParams } from 'react-native-draggable-flatlist';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '../game/types';
import { colors } from '../theme/colors';

interface SetupPlayerRowProps extends RenderItemParams<Player> {
  expanded: boolean;
  onToggleExpand: (id: string) => void;
  onPickLibrary: (id: string) => void;
  onPickCamera: (id: string) => void;
  onRemovePhoto: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SetupPlayerRow({
  item,
  drag,
  isActive,
  expanded,
  onToggleExpand,
  onPickLibrary,
  onPickCamera,
  onRemovePhoto,
  onDelete,
}: SetupPlayerRowProps) {
  const { t } = useTranslation();
  const swipeRef = useRef<Swipeable>(null);

  const renderDelete = () => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => {
        swipeRef.current?.close();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onDelete(item.id);
      }}
    >
      <Text style={styles.deleteActionText}>{t('common.delete')}</Text>
    </Pressable>
  );

  const handleRowPress = () => {
    onToggleExpand(item.id);
  };

  const handleLongPress = () => {
    swipeRef.current?.close();
    drag();
  };

  return (
    <ScaleDecorator>
      <View style={[styles.wrap, isActive && styles.wrapActive]}>
        <Swipeable
          ref={swipeRef}
          renderRightActions={I18nManager.isRTL ? undefined : renderDelete}
          renderLeftActions={I18nManager.isRTL ? renderDelete : undefined}
          overshootRight={false}
          overshootLeft={false}
          friction={2}
          enabled={!isActive && !expanded}
        >
          <View style={[styles.card, expanded && styles.cardExpanded]}>
            <Pressable
              onPress={handleRowPress}
              onLongPress={handleLongPress}
              delayLongPress={200}
              style={({ pressed }) => [
                styles.mainRow,
                pressed && !isActive && styles.mainRowPressed,
              ]}
            >
              <PlayerAvatar name={item.name} photoUri={item.photoUri} size={36} />
              <Text style={styles.name} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.menuBtn, expanded && styles.menuBtnActive]}>
                <Text style={[styles.menuIcon, expanded && styles.menuIconActive]}>
                  ⋯
                </Text>
              </View>
            </Pressable>

            {expanded ? (
              <View style={styles.options}>
                <Pressable
                  style={styles.optionBtn}
                  onPress={() => onPickLibrary(item.id)}
                >
                  <Text style={styles.optionText}>{t('setup.photoFromLibrary')}</Text>
                </Pressable>
                <Pressable
                  style={styles.optionBtn}
                  onPress={() => onPickCamera(item.id)}
                >
                  <Text style={styles.optionText}>{t('setup.photoFromCamera')}</Text>
                </Pressable>
                {item.photoUri ? (
                  <Pressable
                    style={styles.optionBtn}
                    onPress={() => onRemovePhoto(item.id)}
                  >
                    <Text style={[styles.optionText, styles.optionDanger]}>
                      {t('setup.removePhoto')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null}
          </View>
        </Swipeable>
      </View>
    </ScaleDecorator>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  wrapActive: {
    opacity: 0.92,
    transform: [{ scale: 1.015 }],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardExpanded: {
    borderColor: colors.primary,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 10,
    minHeight: 52,
  },
  mainRowPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnActive: {
    backgroundColor: colors.surfaceElevated,
  },
  menuIcon: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: -2,
  },
  menuIconActive: {
    color: colors.primary,
  },
  options: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  optionBtn: {
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  optionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  optionDanger: {
    color: colors.danger,
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  deleteActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
