import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { fonts } from '@/constants/typography';
import { TAB_BAR_CONTENT_HEIGHT, TAB_BAR_HEIGHT_WEB } from '@/constants/layout';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: isWeb
            ? TAB_BAR_HEIGHT_WEB
            : TAB_BAR_CONTENT_HEIGHT + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.urdu,
          fontSize: 10,
          lineHeight: 20,
        },
      }}
    >
      {/* Declared right-to-left feel: Home is the rightmost tab */}
      <Tabs.Screen
        name="ledger"
        options={{
          title: 'کھاتہ',
          tabBarIcon: ({ color }) => <Feather name="book" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'چیٹ',
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'ہوم',
          tabBarIcon: ({ color }) => <Feather name="mic" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
