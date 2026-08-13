import React, { useState, type ReactNode } from 'react';
import {
  TextInput,
  View,
  type KeyboardTypeOptions,
  type StyleProp,
  type TextInputProps,
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
  /**
   * Credential fields (email, password, one-time code) stay LTR in Inter even
   * in Urdu — an email address or a code is never Nastaliq content.
   */
  latin?: boolean;
  secureTextEntry?: boolean;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  editable?: boolean;
  maxLength?: number;
  /** Rendered inside the field box, after the input (e.g. a reveal toggle). */
  trailing?: ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'send' | 'go';
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
  latin = false,
  secureTextEntry = false,
  autoCapitalize,
  autoComplete,
  textContentType,
  editable = true,
  maxLength,
  trailing,
  accessibilityLabel,
  style,
  onSubmitEditing,
  returnKeyType,
}: TextFieldProps) {
  const { colors, spacing, radius, text: textStyle } = useTheme();
  const dir = useDirection();
  const [focused, setFocused] = useState(false);

  const base = textStyle(numeric ? 'numericMedium' : 'bodyLarge');
  // Both numeric amounts and credentials render as Latin, LTR, in Inter.
  const forceLatin = numeric || latin;

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
          flexDirection: dir.row,
          // A multiline field grows downward; centring would float a short
          // value in the middle of the box instead of pinning it to the top.
          alignItems: multiline ? 'flex-start' : 'center',
          gap: spacing.sm,
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
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityLabel={accessibilityLabel ?? label}
          style={[
            base,
            {
              flex: 1,
              color: colors.textPrimary,
              padding: 0,
              // Nastaliq needs its generous line height; a fixed-height input
              // would clip descenders.
              minHeight: multiline ? 88 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
              ...(forceLatin
                ? {
                    textAlign: 'left' as const,
                    writingDirection: 'ltr' as const,
                    fontFamily: numeric ? fonts.numberSemiBold : fonts.number,
                  }
                : {
                    textAlign: dir.textAlign,
                    writingDirection: dir.writingDirection,
                  }),
            },
          ]}
        />

        {trailing}
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
