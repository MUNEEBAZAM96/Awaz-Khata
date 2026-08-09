import React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { IconBadge } from '@/components/ui/IconBadge';
import { useTheme } from '@/theme';
import type { BadgeTone } from '@/components/ui/IconBadge';

export interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  tone?: BadgeTone;
  onPress: () => void;
}

export function QuickAction({ icon, label, tone = 'primary', onPress }: QuickActionProps) {
  const { colors, spacing, radius } = useTheme();

  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <IconBadge icon={icon} tone={tone} />
      <Text variant="caption" align="center" numberOfLines={2} directional={false}>
        {label}
      </Text>
    </Pressable>
  );
}

export function QuickActionRow({ children }: { children: React.ReactNode }) {
  const { spacing } = useTheme();
  // Always LTR: these are peer actions with no reading order, and mirroring
  // them would move "Speak" away from the thumb on a right-handed grip.
  return <View style={{ flexDirection: 'row', gap: spacing.md }}>{children}</View>;
}
