import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler';
import type { RenderItemParams } from 'react-native-draggable-flatlist';
import { ScaleDecorator } from 'react-native-draggable-flatlist';
import { PlayerAvatar } from './PlayerAvatar';
import type { Player } from '../game/types';
import { colors } from '../theme/colors';

interface SetupPlayerRowProps extends RenderItemParams<Player> {
  expanded: boolean;
  pickingPhoto: boolean;
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
  pickingPhoto,
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

  const handleLongPress = () => {
    if (expanded) return;
    swipeRef.current?.close();
    drag();
  };

  const handleMenuPress = () => {
    onToggleExpand(item.id);
  };

  const handleNamePress = () => {
    onToggleExpand(item.id);
  };

  return (
    <ScaleDecorator>
      <View style={[styles.wrap, isActive && styles.wrapActive]}>
        <View style={[styles.card, expanded && styles.cardExpanded]}>
          <Swipeable
            ref={swipeRef}
            renderRightActions={I18nManager.isRTL ? undefined : renderDelete}
            renderLeftActions={I18nManager.isRTL ? renderDelete : undefined}
            overshootRight={false}
            overshootLeft={false}
            friction={2}
            enabled={!isActive && !expanded}
          >
            <View style={styles.mainRow}>
              <Pressable
                onPress={handleNamePress}
                onLongPress={handleLongPress}
                delayLongPress={250}
                style={({ pressed }) => [
                  styles.nameArea,
                  pressed && !isActive && styles.nameAreaPressed,
                ]}
              >
                <PlayerAvatar name={item.name} photoUri={item.photoUri} size={36} />
                <Text style={styles.name} numberOfLines={1}>
                  {item.name}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleMenuPress}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.menuBtn,
                  expanded && styles.menuBtnActive,
                  pressed && styles.menuBtnPressed,
                ]}
              >
                <Text style={[styles.menuIcon, expanded && styles.menuIconActive]}>⋯</Text>
              </Pressable>
            </View>
          </Swipeable>

          {expanded ? (
            <View style={styles.options}>
              <TouchableOpacity
                style={styles.optionBtn}
                activeOpacity={0.65}
                disabled={pickingPhoto}
                onPress={() => onPickLibrary(item.id)}
              >
                <Text style={styles.optionText}>{t('setup.photoFromLibrary')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionBtn}
                activeOpacity={0.65}
                disabled={pickingPhoto}
                onPress={() => onPickCamera(item.id)}
              >
                <Text style={styles.optionText}>{t('setup.photoFromCamera')}</Text>
              </TouchableOpacity>
              {item.photoUri ? (
                <TouchableOpacity
                  style={styles.optionBtn}
                  activeOpacity={0.65}
                  disabled={pickingPhoto}
                  onPress={() => onRemovePhoto(item.id)}
                >
                  <Text style={[styles.optionText, styles.optionDanger]}>
                    {t('setup.removePhoto')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </View>
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
    minHeight: 52,
    backgroundColor: colors.surface,
  },
  nameArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 4,
    gap: 10,
    minHeight: 52,
  },
  nameAreaPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuBtn: {
    width: 44,
    height: 44,
    marginRight: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuBtnActive: {
    backgroundColor: colors.surfaceElevated,
  },
  menuBtnPressed: {
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
    backgroundColor: colors.surface,
  },
  optionBtn: {
    paddingVertical: 13,
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
