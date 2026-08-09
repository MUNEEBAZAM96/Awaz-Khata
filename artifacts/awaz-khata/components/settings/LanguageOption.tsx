import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Pressable } from '@/components/ui/Pressable';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { LANGUAGE_META, type Language } from '@/i18n/languages';
import { fontFamilyFor, lineHeightFor } from '@/theme/typography';

export interface LanguageOptionProps {
  language: Language;
  selected: boolean;
  onSelect: () => void;
}

/**
 * A language row shows its own name in its own script — a user who cannot
 * read the current UI language must still be able to find their own.
 */
export function LanguageOption({ language, selected, onSelect }: LanguageOptionProps) {
  const { colors, spacing, radius, iconSize, iconStroke } = useTheme();
  const dir = useDirection();
  const t = useT();
  const meta = LANGUAGE_META[language];

  // The native name is rendered in ITS script, not the active UI script.
  const nativeSize = 18;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={
        selected
          ? `${meta.englishName}, ${t('a11y.selected')}`
          : meta.englishName
      }
      onPress={onSelect}
      pressScale={0.99}
      style={{
        flexDirection: dir.row,
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.lg,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.surface,
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            fontFamily: fontFamilyFor(meta.script, 'medium'),
            fontSize: nativeSize,
            lineHeight: lineHeightFor(meta.script, nativeSize),
            color: colors.textPrimary,
            textAlign: meta.dir === 'rtl' ? 'right' : 'left',
            writingDirection: meta.dir,
          }}
          directional={false}
        >
          {meta.nativeName}
        </Text>
        <Text variant="caption" color="textMuted" directional={false}>
          {meta.englishName}
        </Text>
      </View>

      {selected ? (
        <Check size={iconSize.md} color={colors.primary} strokeWidth={iconStroke} />
      ) : null}
    </Pressable>
  );
}
