import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useWallet } from '@/hooks/use-wallet';

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();
  const { resetWallet } = useWallet();

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Alert.alert(
      'Onboarding Reset',
      'Restart the app to see the onboarding flow again.',
      [{ text: 'OK' }]
    );
  };

  const handleResetWallet = async () => {
    await resetWallet();
    Alert.alert(
      'Wallet Reset',
      'Restart the app to see the wallet setup flow again.',
      [{ text: 'OK' }]
    );
  };

  const handleResetAll = async () => {
    await resetOnboarding();
    await resetWallet();
    Alert.alert(
      'Full Reset',
      'Restart the app to see the complete flow from the beginning.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-wallet-bg" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-4 p-5 pb-28">
        <View className="w-16 h-16 rounded-full bg-wallet-card items-center justify-center">
          <Feather name="settings" size={32} color="#B8F25B" />
        </View>
        <Text className="text-xl font-semibold text-wallet-text">Settings</Text>
        <Text className="text-wallet-text-secondary text-center">
          Configure your wallet preferences and security settings.
        </Text>

        {/* Dev: Reset Buttons */}
        {__DEV__ && (
          <View className="mt-8 gap-3">
            <Pressable
              onPress={handleResetOnboarding}
              className="px-6 py-3 bg-wallet-card rounded-full active:opacity-70"
            >
              <Text className="text-wallet-accent font-medium text-center">Reset Onboarding (Dev)</Text>
            </Pressable>
            <Pressable
              onPress={handleResetWallet}
              className="px-6 py-3 bg-wallet-card rounded-full active:opacity-70"
            >
              <Text className="text-wallet-accent font-medium text-center">Reset Wallet (Dev)</Text>
            </Pressable>
            <Pressable
              onPress={handleResetAll}
              className="px-6 py-3 bg-wallet-negative/20 rounded-full active:opacity-70"
            >
              <Text className="text-wallet-negative font-medium text-center">Reset All (Dev)</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
