import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useOnboarding } from '@/hooks/use-onboarding';

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();

  const handleResetOnboarding = async () => {
    await resetOnboarding();
    Alert.alert(
      'Onboarding Reset',
      'Restart the app to see the onboarding flow again.',
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

        {/* Dev: Reset Onboarding Button */}
        {__DEV__ && (
          <Pressable
            onPress={handleResetOnboarding}
            className="mt-8 px-6 py-3 bg-wallet-card rounded-full active:opacity-70"
          >
            <Text className="text-wallet-accent font-medium">Reset Onboarding (Dev)</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
