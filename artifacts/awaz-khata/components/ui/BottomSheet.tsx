/**
 * Bottom sheet built on RN Modal.
 *
 * Deliberately not a gesture-driven sheet library: the app only needs
 * present/dismiss, and a Modal gets correct focus handling and hardware
 * back-button behaviour on Android for free.
 */
import React, { useEffect } from 'react';
import { Modal, Pressable as RawPressable, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { Text } from './Text';
import { Pressable } from './Pressable';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  /** Optional so a caller can keep the sheet mounted while it has no content. */
  children?: React.ReactNode;
  /** Let content scroll when it exceeds the available height. */
  scrollable?: boolean;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
}: BottomSheetProps) {
  const { colors, spacing, radius, iconSize, iconStroke, duration } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: duration.normal });
  }, [visible, progress, duration.normal]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 32 }],
    opacity: progress.value,
  }));

  const Body = scrollable ? ScrollView : View;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { ...StyleSheetAbsoluteFill, backgroundColor: colors.scrim },
            scrimStyle,
          ]}
        >
          <RawPressable
            accessibilityRole="button"
            accessibilityLabel={t('a11y.close')}
            onPress={onClose}
            style={{ flex: 1 }}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              borderTopWidth: 1,
              borderColor: colors.border,
              paddingBottom: insets.bottom + spacing.lg,
              maxHeight: '88%',
            },
            sheetStyle,
          ]}
        >
          <View style={{ alignItems: 'center', paddingTop: spacing.md }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: radius.full,
                backgroundColor: colors.borderStrong,
              }}
            />
          </View>

          {title ? (
            <View
              style={{
                flexDirection: dir.row,
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.xl,
                paddingTop: spacing.lg,
                gap: spacing.md,
              }}
            >
              <Text variant="headingMedium" style={{ flexShrink: 1 }}>
                {title}
              </Text>
              <Pressable
                accessibilityLabel={t('a11y.close')}
                onPress={onClose}
                visualSize={32}
                style={{ padding: spacing.xs }}
              >
                <X size={iconSize.md} color={colors.textMuted} strokeWidth={iconStroke} />
              </Pressable>
            </View>
          ) : null}

          <Body
            {...(scrollable
              ? {
                  contentContainerStyle: {
                    padding: spacing.xl,
                    gap: spacing.lg,
                  },
                  showsVerticalScrollIndicator: false,
                  keyboardShouldPersistTaps: 'handled' as const,
                }
              : { style: { padding: spacing.xl, gap: spacing.lg } })}
          >
            {children}
          </Body>
        </Animated.View>
      </View>
    </Modal>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
