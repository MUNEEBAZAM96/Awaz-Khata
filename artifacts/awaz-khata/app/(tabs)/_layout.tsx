import React from 'react';
import { Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, House, Mic, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { useI18n, useT } from '@/i18n';
import { fontFamilyFor } from '@/theme/typography';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_HEIGHT_WEB } from '@/constants/layout';

export const unstable_settings = {
  initialRouteName: 'index',
};

/**
 * Four destinations, with Awaz raised into a pill so the microphone — the
 * product's core interaction — is never buried behind a tab label.
 */
export default function TabLayout() {
  const { colors, iconSize, iconStroke, radius, spacing } = useTheme();
  const { script, isRTL } = useI18n();
  const t = useT();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: isWeb ? TAB_BAR_HEIGHT_WEB : TAB_BAR_CONTENT_HEIGHT + insets.bottom + 6,
          paddingTop: 8,
          // Mirror the tab order for right-to-left languages so Home sits
          // under the thumb on the same side as the reading direction.
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarLabelStyle: {
          fontFamily: fontFamilyFor(script, 'medium'),
          fontSize: 10,
          lineHeight: script === 'nastaliq' ? 20 : 14,
          marginTop: script === 'nastaliq' ? -2 : 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarAccessibilityLabel: t('a11y.tabHome'),
          tabBarIcon: ({ color }) => (
            <House size={iconSize.lg} color={color} strokeWidth={iconStroke} />
          ),
        }}
      />

      <Tabs.Screen
        name="awaz"
        options={{
          title: t('nav.awaz'),
          tabBarAccessibilityLabel: t('a11y.tabAwaz'),
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 52,
                height: 32,
                borderRadius: radius.full,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: focused ? colors.primary : colors.primarySoft,
                marginBottom: spacing.xs,
              }}
            >
              <Mic
                size={iconSize.md}
                color={focused ? colors.textOnPrimary : colors.primary}
                strokeWidth={iconStroke}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="khata"
        options={{
          title: t('nav.khata'),
          tabBarAccessibilityLabel: t('a11y.tabKhata'),
          tabBarIcon: ({ color }) => (
            <BookOpen size={iconSize.lg} color={color} strokeWidth={iconStroke} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarAccessibilityLabel: t('a11y.tabSettings'),
          tabBarIcon: ({ color }) => (
            <SettingsIcon size={iconSize.lg} color={color} strokeWidth={iconStroke} />
          ),
        }}
      />
    </Tabs>
  );
}
