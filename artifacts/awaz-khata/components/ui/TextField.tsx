import React, { useState } from 'react';
import {
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { useDirection } from '@/i18n';
import { fonts } from '@/theme/typography';

export interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  hint?: string;
  multiline?: boolean;
  autoFocus?: boolean;
  /** Amount fields use Inter with tabular figures and stay LTR. */
  numeric?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send';
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  hint,
  multiline = false,
  autoFocus = false,
  numeric = false,
  accessibilityLabel,
  style,
  onSubmitEditing,
  returnKeyType,
}: TextFieldProps) {
  const { colors, spacing, radius, text: textStyle } = useTheme();
  const dir = useDirection();
  const [focused, setFocused] = useState(false);

  const base = textStyle(numeric ? 'numericMedium' : 'bodyLarge');

  return (
    <View style={[{ gap: spacing.xs }, style]}>
      {label ? (
        <Text variant="label" color="textSecondary">
          {label}
        </Text>
      ) : null}

      <View
        style={{
          backgroundColor: colors.surfaceSunken,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: error
            ? colors.danger
            : focused
              ? colors.primary
              : colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: multiline ? spacing.md : spacing.sm,
          minHeight: 52,
          justifyContent: 'center',
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          multiline={multiline}
          autoFocus={autoFocus}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[
            base,
            {
              color: colors.textPrimary,
              padding: 0,
              // Nastaliq needs its generous line height; a fixed-height input
              // would clip descenders.
              minHeight: multiline ? 88 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
              ...(numeric
                ? { textAlign: 'left' as const, fontFamily: fonts.numberSemiBold }
                : {
                    textAlign: dir.textAlign,
                    writingDirection: dir.writingDirection,
                  }),
            },
          ]}
        />
      </View>

      {error ? (
        <Text variant="caption" color="danger" accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color="textMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
