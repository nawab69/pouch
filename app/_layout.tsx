import "@/utils/crypto-polyfill";
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
import { NetworkProvider } from '@/contexts/network-context';

const ONBOARDING_KEY = '@pouch/onboarding_complete';
const WALLET_KEY = '@pouch/has_wallet';

export default function RootLayout() {
  const [splashComplete, setSplashComplete] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean | null>(null);
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

  // Load onboarding and wallet status
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ONBOARDING_KEY),
      AsyncStorage.getItem(WALLET_KEY),
    ])
      .then(([onboardingValue, walletValue]) => {
        setHasSeenOnboarding(onboardingValue === 'true');
        setHasWallet(walletValue === 'true');
      })
      .catch(() => {
        setHasSeenOnboarding(false);
        setHasWallet(false);
      });
  }, []);

  // Navigate once router is ready
  // Flow: Onboarding → Wallet Setup → Home
  useEffect(() => {
    if (hasSeenOnboarding === null || hasWallet === null || hasNavigated) return;
    if (!rootNavigationState?.key) return;

    setHasNavigated(true);

    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
    } else if (!hasWallet) {
      router.replace('/wallet-setup');
    } else {
      router.replace('/(tabs)');
    }
  }, [hasSeenOnboarding, hasWallet, hasNavigated, rootNavigationState?.key, router]);

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <NetworkProvider>
          <View style={{ flex: 1, backgroundColor: '#0D1411' }}>
            <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
              <Stack.Screen name="onboarding" />
              <Stack.Screen name="wallet-setup" />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <StatusBar style="light" />

            {/* Animated splash screen overlay */}
            {!splashComplete && (
              <SplashScreen onAnimationComplete={handleSplashComplete} />
            )}
          </View>
        </NetworkProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
