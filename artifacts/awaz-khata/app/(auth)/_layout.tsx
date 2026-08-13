import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

/**
 * Unauthenticated stack.
 *
 * Redirection in and out of this group is handled centrally by the gate in
 * the root layout, so nothing here needs to know about session state — this
 * is only the navigator, not a second guard.
 */
export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
