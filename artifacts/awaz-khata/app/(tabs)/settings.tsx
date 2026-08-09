import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  Contrast,
  Eye,
  Info,
  Languages,
  Moon,
  Type,
  User,
  Vibrate,
  Volume2,
} from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Segmented } from '@/components/ui/Segmented';
import { SettingsRow, SettingsSection } from '@/components/settings/SettingsRow';
import { LanguageOption } from '@/components/settings/LanguageOption';
import { useTheme } from '@/theme';
import { useI18n, useT } from '@/i18n';
import { LANGUAGE_META, LANGUAGE_ORDER, type Language } from '@/i18n/languages';
import { usePreferences, type TextSize, type ThemeMode } from '@/store/preferences';

export default function SettingsScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const t = useT();
  const { lang, setLanguage } = useI18n();
  const { prefs, setPreference } = usePreferences();

  const [picker, setPicker] = useState<'app' | 'voice' | null>(null);

  const version =
    (Constants.expoConfig?.version as string | undefined) ?? '1.0.0';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['4xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="headingLarge">{t('settings.title')}</Text>

        {/* Profile */}
        <SettingsSection title={t('settings.profile')}>
          <View style={{ padding: spacing.lg }}>
            <TextField
              label={t('settings.name')}
              value={prefs.userName}
              onChangeText={(value) => setPreference('userName', value)}
              placeholder={t('settings.namePlaceholder')}
            />
          </View>
        </SettingsSection>

        {/* Language & voice */}
        <SettingsSection title={t('settings.languageVoice')}>
          <SettingsRow
            kind="navigate"
            icon={Languages}
            label={t('settings.appLanguage')}
            value={LANGUAGE_META[lang].nativeName}
            onPress={() => setPicker('app')}
          />
          <SettingsRow
            kind="navigate"
            icon={Volume2}
            label={t('settings.voiceLanguage')}
            hint={t('settings.voiceLanguageNote')}
            value={LANGUAGE_META[prefs.voiceLanguage].nativeName}
            onPress={() => setPicker('voice')}
          />
          <SettingsRow
            kind="toggle"
            icon={Volume2}
            label={t('settings.voiceResponses')}
            value={prefs.voiceResponses}
            onValueChange={(next) => setPreference('voiceResponses', next)}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title={t('settings.appearance')}>
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Moon size={18} color={colors.textSecondary} strokeWidth={2} />
              <Text variant="bodyLarge" style={{ flex: 1 }}>
                {t('settings.theme')}
              </Text>
            </View>
            <Segmented<ThemeMode>
              options={[
                { value: 'light', label: t('settings.themeLight') },
                { value: 'dark', label: t('settings.themeDark') },
                { value: 'system', label: t('settings.themeSystem') },
              ]}
              value={prefs.themeMode}
              onChange={(value) => setPreference('themeMode', value)}
              accessibilityLabel={t('settings.theme')}
            />
          </View>
        </SettingsSection>

        {/* Accessibility */}
        <SettingsSection title={t('settings.accessibility')}>
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Type size={18} color={colors.textSecondary} strokeWidth={2} />
              <Text variant="bodyLarge" style={{ flex: 1 }}>
                {t('settings.textSize')}
              </Text>
            </View>
            <Segmented<TextSize>
              options={[
                { value: 'small', label: t('settings.textSizeSmall') },
                { value: 'default', label: t('settings.textSizeDefault') },
                { value: 'large', label: t('settings.textSizeLarge') },
                { value: 'xlarge', label: t('settings.textSizeXLarge') },
              ]}
              value={prefs.textSize}
              onChange={(value) => setPreference('textSize', value)}
              accessibilityLabel={t('settings.textSize')}
            />
          </View>
          <SettingsRow
            kind="toggle"
            icon={Contrast}
            label={t('settings.highContrast')}
            value={prefs.highContrast}
            onValueChange={(next) => setPreference('highContrast', next)}
          />
          <SettingsRow
            kind="toggle"
            icon={Vibrate}
            label={t('settings.haptics')}
            value={prefs.haptics}
            onValueChange={(next) => setPreference('haptics', next)}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title={t('settings.privacy')}>
          <SettingsRow
            kind="toggle"
            icon={Eye}
            label={t('settings.hideBalances')}
            hint={t('settings.hideBalancesHint')}
            value={prefs.hideBalances}
            onValueChange={(next) => setPreference('hideBalances', next)}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title={t('settings.about')}>
          <SettingsRow kind="static" icon={Info} label={t('settings.version')} value={version} />
          <SettingsRow
            kind="static"
            icon={User}
            label={t('common.appName')}
            value={t('common.tagline')}
          />
        </SettingsSection>
      </ScrollView>

      <BottomSheet
        visible={picker !== null}
        onClose={() => setPicker(null)}
        title={picker === 'voice' ? t('settings.voiceLanguage') : t('settings.appLanguage')}
      >
        {picker === 'voice' ? (
          <Text variant="bodySmall" color="warning">
            {t('settings.voiceLanguageNote')}
          </Text>
        ) : null}

        <View style={{ gap: spacing.sm }}>
          {LANGUAGE_ORDER.map((code: Language) => (
            <LanguageOption
              key={code}
              language={code}
              selected={
                picker === 'voice' ? prefs.voiceLanguage === code : lang === code
              }
              onSelect={() => {
                if (picker === 'voice') setPreference('voiceLanguage', code);
                else setLanguage(code);
                setPicker(null);
              }}
            />
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}
