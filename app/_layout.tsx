import "../global.css";
import { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ExpoSplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { PlayfairDisplay_700Bold_Italic } from '@expo-google-fonts/playfair-display';
import { SplashScreen } from '@/components/splash-screen';

const ONBOARDING_KEY = '@pouch/onboarding_complete';

export default function RootLayout() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const router = useRouter();
  const rootNavigationState = useRootNavigationState();

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    PlayfairDisplay_700Bold_Italic,
  });

  // Hide native splash immediately on mount
  useEffect(() => {
    ExpoSplashScreen.hideAsync();
  }, []);

  // Load onboarding status
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then(value => setHasSeenOnboarding(value === 'true'))
      .catch(() => setHasSeenOnboarding(false));
  }, []);

  // Navigate once router is ready
  useEffect(() => {
    if (hasSeenOnboarding === null || hasNavigated) return;
    if (!rootNavigationState?.key) return;

    setHasNavigated(true);

    if (hasSeenOnboarding) {
      router.replace('/(tabs)');
    } else {
      router.replace('/onboarding');
    }
  }, [hasSeenOnboarding, hasNavigated, rootNavigationState?.key, router]);

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1, backgroundColor: '#0D1411' }}>
          <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="light" />

          {/* Animated splash screen overlay */}
          {!splashComplete && (
            <SplashScreen onAnimationComplete={handleSplashComplete} />
          )}
        </View>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
