import React from 'react';
import { View } from 'react-native';
import { Pressable } from './Pressable';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

/**
 * Segmented control. Selection is conveyed by fill, weight AND the
 * `selected` accessibility state — never by colour alone.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedProps<T>) {
  const { colors, spacing, radius } = useTheme();
  const dir = useDirection();
  const t = useT();

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: dir.row,
        backgroundColor: colors.surfaceSunken,
        borderRadius: radius.full,
        padding: 4,
        gap: 4,
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={
              active ? `${option.label}, ${t('a11y.selected')}` : option.label
            }
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            pressScale={0.99}
            style={{
              flex: 1,
              minHeight: 40,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing.md,
              borderRadius: radius.full,
              backgroundColor: active ? colors.surface : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: colors.border,
            }}
          >
            <Text
              variant="label"
              color={active ? 'textPrimary' : 'textMuted'}
              directional={false}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
