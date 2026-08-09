import React, { useEffect } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import {
  NotoNastaliqUrdu_400Regular,
  NotoNastaliqUrdu_500Medium,
  NotoNastaliqUrdu_700Bold,
} from '@expo-google-fonts/noto-nastaliq-urdu';
import { setBaseUrl } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WelcomeVoiceIntro } from '@/components/WelcomeVoiceIntro';
import { API_BASE_URL } from '@/lib/config';
import { PreferencesProvider, usePreferences } from '@/store/preferences';
import { I18nProvider } from '@/i18n';
import { ThemeProvider, useTheme } from '@/theme';

// Expo bundles run outside the web proxy and need absolute URLs to reach the API server.
setBaseUrl(API_BASE_URL || null);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

/**
 * Sends first-run users to onboarding.
 *
 * Only the language choice and a completion flag are persisted, and only on
 * this device — onboarding state never reaches the backend.
 */
function OnboardingGate() {
  const { prefs, hydrated } = usePreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!prefs.onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (prefs.onboardingComplete && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, prefs.onboardingComplete, segments, router]);

  return null;
}

function ThemedShell() {
  const { colors, scheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <OnboardingGate />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="entry" options={{ presentation: 'modal' }} />
        <Stack.Screen name="person/[name]" />
        <Stack.Screen name="chat" />
      </Stack>
      {/*
       * Spoken self-introduction. Per the product spec this runs on every app
       * open — there is deliberately no persisted "already heard it" flag.
       */}
      <WelcomeVoiceIntro />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    NotoNastaliqUrdu_400Regular,
    NotoNastaliqUrdu_500Medium,
    NotoNastaliqUrdu_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Nastaliq must be present before the first paint or Urdu renders in a
  // fallback face and reflows. This gate is intentional — see the note in
  // theme/typography.ts.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <PreferencesProvider>
              <I18nProvider>
                <ThemeProvider>
                  <ErrorBoundary>
                    <ThemedShell />
                  </ErrorBoundary>
                </ThemeProvider>
              </I18nProvider>
            </PreferencesProvider>
          </QueryClientProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
