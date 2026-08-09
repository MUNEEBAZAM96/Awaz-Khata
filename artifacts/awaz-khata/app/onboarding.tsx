import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, Sparkles, Wallet } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { Surface } from '@/components/ui/Surface';
import { IconBadge } from '@/components/ui/IconBadge';
import { LanguageOption } from '@/components/settings/LanguageOption';
import { ScreenBackground } from '@/components/ScreenBackground';
import { useTheme } from '@/theme';
import { useDirection, useI18n, useT } from '@/i18n';
import { LANGUAGE_ORDER, type Language } from '@/i18n/languages';
import { usePreferences } from '@/store/preferences';

type Step = 0 | 1 | 2 | 3;
const LAST_STEP: Step = 3;

/**
 * Four short screens: what the app is, language, why the mic, one thing to try.
 *
 * The language choice and the completion flag are stored on-device only —
 * the backend has no notion of a user and must never receive onboarding state.
 */
export default function OnboardingScreen() {
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();
  const { lang, setLanguage } = useI18n();
  const { setPreference } = usePreferences();
  const router = useRouter();

  const [step, setStep] = useState<Step>(0);

  const finish = () => {
    setPreference('onboardingComplete', true);
    router.replace('/(tabs)');
  };

  const next = () => {
    if (step === LAST_STEP) finish();
    else setStep((current) => (current + 1) as Step);
  };

  const suggestions = [
    t('suggestions.todaySpend'),
    t('suggestions.monthSummary'),
    t('suggestions.topCategory'),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenBackground />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          paddingHorizontal: spacing.xl,
        }}
      >
        {/* Skip */}
        <View style={{ flexDirection: dir.rowReverse, minHeight: 32 }}>
          {step < LAST_STEP ? (
            <Pressable
              accessibilityLabel={t('onboarding.skip')}
              onPress={finish}
              visualSize={32}
              style={{ padding: spacing.sm }}
            >
              <Text variant="label" color="textMuted" directional={false}>
                {t('onboarding.skip')}
              </Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.xl }}
          showsVerticalScrollIndicator={false}
        >
          {step === 0 ? (
            <View style={{ alignItems: 'center', gap: spacing.lg }}>
              <IconBadge icon={Wallet} tone="primary" size="lg" />
              <Text variant="display" align="center">
                {t('onboarding.welcomeTitle')}
              </Text>
              <Text variant="bodyLarge" color="textSecondary" align="center">
                {t('onboarding.welcomeBody')}
              </Text>
              <Text variant="bodySmall" color="textMuted" align="center">
                {t('common.tagline')}
              </Text>
            </View>
          ) : null}

          {step === 1 ? (
            <View style={{ gap: spacing.lg }}>
              <View style={{ gap: spacing.xs }}>
                <Text variant="headingLarge" align="center">
                  {t('onboarding.languageTitle')}
                </Text>
                <Text variant="bodySmall" color="textMuted" align="center">
                  {t('onboarding.languageBody')}
                </Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                {LANGUAGE_ORDER.map((code: Language) => (
                  <LanguageOption
                    key={code}
                    language={code}
                    selected={lang === code}
                    onSelect={() => setLanguage(code)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {step === 2 ? (
            <View style={{ alignItems: 'center', gap: spacing.lg }}>
              <IconBadge icon={Mic} tone="primary" size="lg" />
              <Text variant="headingLarge" align="center">
                {t('onboarding.micTitle')}
              </Text>
              <Text variant="bodyLarge" color="textSecondary" align="center">
                {t('onboarding.micBody')}
              </Text>
            </View>
          ) : null}

          {step === 3 ? (
            <View style={{ gap: spacing.lg }}>
              <View style={{ alignItems: 'center', gap: spacing.sm }}>
                <IconBadge icon={Sparkles} tone="accent" size="lg" />
                <Text variant="headingLarge" align="center">
                  {t('onboarding.tryTitle')}
                </Text>
                <Text variant="bodySmall" color="textMuted" align="center">
                  {t('onboarding.tryBody')}
                </Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                {suggestions.map((suggestion) => (
                  <Surface key={suggestion} padding="lg" sunken bordered={false}>
                    <Text variant="bodyMedium">{suggestion}</Text>
                  </Surface>
                ))}
              </View>
            </View>
          ) : null}
        </ScrollView>

        {/* Progress + advance */}
        <View style={{ gap: spacing.lg }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: spacing.sm,
            }}
          >
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={{
                  width: index === step ? 20 : 8,
                  height: 8,
                  borderRadius: radius.full,
                  backgroundColor: index === step ? colors.primary : colors.border,
                }}
              />
            ))}
          </View>

          <Button
            label={step === LAST_STEP ? t('onboarding.start') : t('onboarding.next')}
            onPress={next}
            size="lg"
            fullWidth
          />
        </View>
      </View>
    </View>
  );
}
