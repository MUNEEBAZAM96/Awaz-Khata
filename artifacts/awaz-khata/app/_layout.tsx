import React, { useEffect } from 'react';
import { ActivityIndicator, Text as RNText, View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
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
import { CLERK_PUBLISHABLE_KEY } from '@/lib/clerk';
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
 * Routes the user to the right place for their session and first-run state.
 *
 * Order matters: authentication first, then the existing on-device onboarding.
 * Onboarding remains a local preference — it is never sent to Clerk or to the
 * API server, which still has no concept of a user.
 *
 * `isLoaded === false` means Clerk has not yet restored the session from the
 * secure store. That is emphatically *not* "signed out", so nothing routes
 * until both Clerk and the preference store are ready.
 */
function AuthGate({ ready }: { ready: boolean }) {
  const { isSignedIn } = useAuth();
  const { prefs } = usePreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;

    const inAuth = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isSignedIn) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }

    // Signed in: onboarding is the only thing that may still come first.
    if (!prefs.onboardingComplete) {
      if (!inOnboarding) router.replace('/onboarding');
      return;
    }

    if (inAuth || inOnboarding) router.replace('/(tabs)');
  }, [ready, isSignedIn, prefs.onboardingComplete, segments, router]);

  return null;
}

/** Covers the app while the session is being restored, so no screen flashes. */
function StartupOverlay() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function ThemedShell() {
  const { colors, scheme } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const { hydrated } = usePreferences();

  const ready = isLoaded && hydrated;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <AuthGate ready={ready} />
      {/*
       * The navigator is always mounted — routing away before the root layout
       * exists throws — so the startup state is an overlay rather than a
       * different tree.
       */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        {/* There is no `entry/_layout`, so the route is the leaf file itself. */}
        <Stack.Screen name="entry/new" options={{ presentation: 'modal' }} />
        <Stack.Screen name="person/[name]" />
        <Stack.Screen name="chat" />
      </Stack>
      {/*
       * Spoken self-introduction. Per the product spec this runs on every app
       * open — there is deliberately no persisted "already heard it" flag. It
       * stays inside the authenticated app: nobody wants the assistant talking
       * over the sign-in screen.
       */}
      {ready && isSignedIn ? <WelcomeVoiceIntro /> : null}
      {ready ? null : <StartupOverlay />}
    </View>
  );
}

/**
 * Shown instead of the app when the publishable key is missing, since
 * `ClerkProvider` cannot be constructed without one.
 *
 * This is a build-configuration fault, not a user-facing state, so it is
 * intentionally untranslated and unstyled — the theme and i18n providers sit
 * below Clerk and are not mounted yet. It names the variable to set and never
 * echoes a value.
 */
function MissingClerkKey() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#F7F3EA',
      }}
    >
      <RNText style={{ fontSize: 17, fontWeight: '600', color: '#1C2A24', marginBottom: 8 }}>
        Authentication is not configured
      </RNText>
      <RNText style={{ fontSize: 14, color: '#4A5952', textAlign: 'center', lineHeight: 20 }}>
        Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the app environment, then restart
        the bundler.
      </RNText>
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

  if (!CLERK_PUBLISHABLE_KEY) return <MissingClerkKey />;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
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
          </ClerkProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
