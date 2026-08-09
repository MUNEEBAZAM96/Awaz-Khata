import React from 'react';
import { Switch, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { IconBadge } from '@/components/ui/IconBadge';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { disabledOpacity } from '@/theme/tokens';

interface BaseProps {
  icon?: LucideIcon;
  label: string;
  hint?: string;
  /** Renders the row inert with an explanatory badge. Never fakes success. */
  unavailable?: boolean;
}

export type SettingsRowProps =
  | (BaseProps & {
      kind: 'navigate';
      value?: string;
      onPress: () => void;
    })
  | (BaseProps & {
      kind: 'toggle';
      value: boolean;
      onValueChange: (next: boolean) => void;
    })
  | (BaseProps & {
      kind: 'select';
      selected: boolean;
      onPress: () => void;
    })
  | (BaseProps & { kind: 'static'; value: string });

export function SettingsRow(props: SettingsRowProps) {
  const { colors, spacing, iconSize, iconStroke, touchTarget } = useTheme();
  const dir = useDirection();
  const t = useT();
  const Chevron = dir.forwardChevron === 'left' ? ChevronLeft : ChevronRight;

  const content = (
    <View
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.md,
        minHeight: touchTarget.comfortable,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        opacity: props.unavailable ? disabledOpacity : 1,
      }}
    >
      {props.icon ? <IconBadge icon={props.icon} size="sm" tone="neutral" /> : null}

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyLarge">{props.label}</Text>
        {props.hint ? (
          <Text variant="caption" color="textMuted">
            {props.hint}
          </Text>
        ) : null}
        {props.unavailable ? (
          <Text variant="caption" color="warning">
            {t('settings.unavailable')}
          </Text>
        ) : null}
      </View>

      {props.kind === 'toggle' ? (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          disabled={props.unavailable}
          trackColor={{ false: colors.borderStrong, true: colors.primary }}
          thumbColor={colors.surface}
          accessibilityLabel={props.label}
        />
      ) : null}

      {props.kind === 'navigate' ? (
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.xs }}>
          {props.value ? (
            <Text variant="bodySmall" color="textMuted" numberOfLines={1}>
              {props.value}
            </Text>
          ) : null}
          <Chevron size={iconSize.sm} color={colors.textMuted} strokeWidth={iconStroke} />
        </View>
      ) : null}

      {props.kind === 'select' && props.selected ? (
        <Check size={iconSize.md} color={colors.primary} strokeWidth={iconStroke} />
      ) : null}

      {props.kind === 'static' ? (
        <Text variant="bodySmall" color="textMuted" directional={false}>
          {props.value}
        </Text>
      ) : null}
    </View>
  );

  if (props.kind === 'static' || props.kind === 'toggle') {
    return content;
  }

  return (
    <Pressable
      accessibilityLabel={
        props.kind === 'select' && props.selected
          ? `${props.label}, ${t('a11y.selected')}`
          : props.label
      }
      accessibilityRole={props.kind === 'select' ? 'radio' : 'button'}
      accessibilityState={
        props.kind === 'select' ? { selected: props.selected } : undefined
      }
      onPress={props.onPress}
      disabled={props.unavailable}
      pressScale={0.995}
    >
      {content}
    </Pressable>
  );
}

export function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        variant="label"
        color="textMuted"
        style={{ paddingHorizontal: spacing.lg }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: 'hidden',
        }}
      >
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, index) => (
            <View key={index}>
              {index > 0 ? (
                <View style={{ height: 1, backgroundColor: colors.border, marginStart: spacing.lg }} />
              ) : null}
              {child}
            </View>
          ))}
      </View>
    </View>
  );
}
