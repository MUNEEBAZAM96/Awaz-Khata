import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';
import { fonts, urduLine } from '@/constants/typography';

const SUGGESTIONS = [
  'آج کتنا خرچ ہوا؟',
  'اس مہینے کا حساب بتاؤ',
  'سب سے زیادہ خرچ کس چیز پر ہوا؟',
];

function Pill({
  text,
  disabled,
  onPress,
}: {
  text: string;
  disabled: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 300 });
        }}
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text style={[styles.pillText, { color: colors.secondaryForeground }]}>
          {text}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

interface Props {
  /** Fires with the suggestion text — routed through the voice pipeline. */
  onAsk: (text: string) => void;
  /** Disable while the assistant is listening/processing/speaking. */
  disabled?: boolean;
}

/** Horizontal example questions that teach users what they can ask. */
export function SuggestionPills({ onAsk, disabled = false }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <Text style={[styles.heading, { color: colors.mutedForeground }]}>
        آپ یہ بھی پوچھ سکتے ہیں
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SUGGESTIONS.map((s) => (
          <Pill key={s} text={s} disabled={disabled} onPress={() => onAsk(s)} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  heading: {
    fontSize: 12,
    lineHeight: urduLine(12),
    fontFamily: fonts.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row-reverse',
    gap: 8,
    paddingVertical: 2,
    paddingHorizontal: 1,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1C2A24',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pillText: {
    fontSize: 13,
    lineHeight: urduLine(13),
    fontFamily: fonts.urduMedium,
    writingDirection: 'rtl',
  },
});
