/**
 * Card / panel surface.
 *
 * Elevation is expressed as a token rather than per-component shadow values,
 * because heavy shadows are the fastest way to make a finance app look cheap.
 * On dark backgrounds shadows read as mud, so elevation switches to a border
 * instead of a drop shadow.
 */
import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import { radius as radiusTokens, spacing as spacingTokens } from '@/theme/tokens';

export type Elevation = 'flat' | 'raised';

export interface SurfaceProps extends ViewProps {
  elevation?: Elevation;
  padding?: keyof typeof spacingTokens;
  radius?: keyof typeof radiusTokens;
  /** Use the sunken tone, e.g. for inputs and segmented tracks. */
  sunken?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Surface({
  elevation = 'flat',
  padding = 'lg',
  radius = 'lg',
  sunken = false,
  bordered = true,
  style,
  ...rest
}: SurfaceProps) {
  const { colors, scheme } = useTheme();

  const shadow: ViewStyle =
    elevation === 'raised' && scheme === 'light'
      ? {
          shadowColor: '#1C2A24',
          shadowOpacity: 0.06,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 2,
        }
      : {};

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: sunken
            ? colors.surfaceSunken
            : elevation === 'raised'
              ? colors.surfaceElevated
              : colors.surface,
          borderRadius: radiusTokens[radius],
          padding: spacingTokens[padding],
          ...(bordered
            ? {
                borderWidth: 1,
                borderColor: elevation === 'raised' && scheme === 'dark'
                  ? colors.borderStrong
                  : colors.border,
              }
            : {}),
          ...shadow,
        },
        style,
      ]}
    />
  );
}
