import { View, Text, Pressable, Alert, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useWallet } from '@/hooks/use-wallet';
import { useNetwork } from '@/hooks/use-network';
import { NetworkSelector } from '@/components/network-selector';

export default function SettingsScreen() {
  const { resetOnboarding } = useOnboarding();
  const { resetWallet } = useWallet();
  const {
    selectedNetworkId,
    selectedNetwork,
    chainId,
    isTestnet,
    changeNetwork,
    toggleNetworkType,
  } = useNetwork();

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
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-2xl font-bold text-wallet-text">Settings</Text>
        </View>

        {/* Network Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-wallet-text mb-4">
            Network
          </Text>

          {/* Network Selector */}
          <View className="mb-4">
            <Text className="text-wallet-text-secondary text-sm mb-2">
              Select Network
            </Text>
            <NetworkSelector
              selectedNetworkId={selectedNetworkId}
              onSelect={changeNetwork}
            />
          </View>

          {/* Environment Toggle */}
          <View className="bg-wallet-card rounded-xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-wallet-text font-medium">
                  Testnet Mode
                </Text>
                <Text className="text-wallet-text-secondary text-sm mt-0.5">
                  Use test networks for development
                </Text>
              </View>
              <Switch
                value={isTestnet}
                onValueChange={toggleNetworkType}
                trackColor={{ false: '#3A3A3C', true: '#B8F25B' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Chain ID Display */}
          <View className="bg-wallet-card-light rounded-xl p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-wallet-text-secondary">Chain ID</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-wallet-text font-mono">{chainId}</Text>
                {isTestnet && (
                  <View className="bg-wallet-accent/20 px-2 py-0.5 rounded">
                    <Text className="text-wallet-accent text-xs font-medium">
                      {selectedNetwork.testnetName}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-wallet-text mb-4">
            Security
          </Text>

          <SettingsItem
            icon="shield"
            label="Recovery Phrase"
            description="View your secret recovery phrase"
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon')}
          />

          <SettingsItem
            icon="lock"
            label="App Lock"
            description="Require authentication to open"
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon')}
          />
        </View>

        {/* About Section */}
        <View className="px-5 mb-6">
          <Text className="text-lg font-semibold text-wallet-text mb-4">
            About
          </Text>

          <SettingsItem
            icon="info"
            label="Version"
            value="1.0.0"
          />

          <SettingsItem
            icon="external-link"
            label="Terms of Service"
            onPress={() => {}}
          />

          <SettingsItem
            icon="external-link"
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        {/* Dev: Reset Buttons */}
        {__DEV__ && (
          <View className="px-5 mb-8">
            <Text className="text-lg font-semibold text-wallet-text mb-4">
              Developer Tools
            </Text>

            <View className="gap-3">
              <Pressable
                onPress={handleResetOnboarding}
                className="flex-row items-center gap-3 px-4 py-3 bg-wallet-card rounded-xl active:opacity-70"
              >
                <Feather name="refresh-cw" size={18} color="#B8F25B" />
                <Text className="text-wallet-accent font-medium">
                  Reset Onboarding
                </Text>
              </Pressable>

              <Pressable
                onPress={handleResetWallet}
                className="flex-row items-center gap-3 px-4 py-3 bg-wallet-card rounded-xl active:opacity-70"
              >
                <Feather name="trash-2" size={18} color="#B8F25B" />
                <Text className="text-wallet-accent font-medium">
                  Reset Wallet
                </Text>
              </Pressable>

              <Pressable
                onPress={handleResetAll}
                className="flex-row items-center gap-3 px-4 py-3 bg-wallet-negative/20 rounded-xl active:opacity-70"
              >
                <Feather name="alert-triangle" size={18} color="#FF3B30" />
                <Text className="text-wallet-negative font-medium">
                  Reset All
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Bottom Padding for Tab Bar */}
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingsItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  value?: string;
  onPress?: () => void;
}

function SettingsItem({
  icon,
  label,
  description,
  value,
  onPress,
}: SettingsItemProps) {
  const content = (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-9 h-9 rounded-full bg-wallet-card-light items-center justify-center">
          <Feather name={icon} size={18} color="#8E8E93" />
        </View>
        <View className="flex-1">
          <Text className="text-wallet-text font-medium">{label}</Text>
          {description && (
            <Text className="text-wallet-text-secondary text-sm">
              {description}
            </Text>
          )}
        </View>
      </View>
      {value ? (
        <Text className="text-wallet-text-secondary">{value}</Text>
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color="#8E8E93" />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-70">
        {content}
      </Pressable>
    );
  }

  return content;
}
