/**
 * The only Text component the app uses.
 *
 * It binds a semantic type variant and a semantic colour token together, so a
 * screen can never accidentally hardcode a font size, family or hex value.
 * Writing direction follows the active language automatically.
 */
import React, { useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { useDirection } from '@/i18n';
import type { TypeVariant } from '@/theme/typography';
import type { Palette } from '@/theme/palette';

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  color?: keyof Palette;
  align?: TextStyle['textAlign'];
  /**
   * Follow the reading direction of the active language. On by default.
   * Numerals and Latin-only content can opt out.
   */
  directional?: boolean;
}

export function Text({
  variant = 'bodyMedium',
  color = 'textPrimary',
  align,
  directional = true,
  style,
  ...rest
}: TextProps) {
  const { text, colors } = useTheme();
  const dir = useDirection();

  const resolved = useMemo<TextStyle>(
    () => ({
      ...text(variant),
      color: colors[color],
      ...(directional
        ? { writingDirection: dir.writingDirection, textAlign: align ?? dir.textAlign }
        : align
          ? { textAlign: align }
          : {}),
    }),
    [text, variant, colors, color, directional, dir, align],
  );

  return <RNText {...rest} style={[resolved, style]} />;
}
