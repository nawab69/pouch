import { useState } from 'react';
import { View, Text, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '@/hooks/use-auth';
import { PinSetupModal } from './pin-setup-modal';
import { getBiometricTypeName } from '@/services/auth/biometric-service';
import type { AutoLockTimeout } from '@/types/auth';

const AUTO_LOCK_OPTIONS: { value: AutoLockTimeout; label: string }[] = [
  { value: 'immediate', label: 'Immediately' },
  { value: '1min', label: 'After 1 minute' },
  { value: '5min', label: 'After 5 minutes' },
  { value: '15min', label: 'After 15 minutes' },
  { value: 'never', label: 'Never' },
];

export function AppLockSettings() {
  const router = useRouter();
  const {
    lockSettings,
    biometricType,
    hasBiometricHardware,
    setupPin,
    removePin,
    updateLockSettings,
  } = useAuth();

  const [showPinSetup, setShowPinSetup] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showTimeoutPicker, setShowTimeoutPicker] = useState(false);

  const handleSetupPin = async (pin: string) => {
    try {
      await setupPin(pin);
      setShowPinSetup(false);
      setIsChangingPin(false);
    } catch {
      Alert.alert('Error', 'Failed to set up PIN. Please try again.');
    }
  };

  const handleToggleAppLock = async (enabled: boolean) => {
    if (enabled && !lockSettings.hasPin) {
      // Need to set up PIN first
      setShowPinSetup(true);
    } else if (!enabled) {
      // Confirm before disabling
      Alert.alert(
        'Disable App Lock',
        'Are you sure you want to disable app lock? Your wallet will no longer be protected by PIN or biometrics.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              await removePin();
            },
          },
        ]
      );
    } else {
      await updateLockSettings({ isEnabled: enabled });
    }
  };

  const handleToggleBiometric = async (enabled: boolean) => {
    await updateLockSettings({ useBiometric: enabled });
  };

  const handleToggleLockOnBackground = async (enabled: boolean) => {
    await updateLockSettings({ lockOnBackground: enabled });
  };

  const handleChangePin = () => {
    setIsChangingPin(true);
    setShowPinSetup(true);
  };

  const handleSelectTimeout = async (timeout: AutoLockTimeout) => {
    await updateLockSettings({ autoLockTimeout: timeout });
    setShowTimeoutPicker(false);
  };

  const currentTimeoutLabel =
    AUTO_LOCK_OPTIONS.find((opt) => opt.value === lockSettings.autoLockTimeout)?.label ||
    'Immediately';

  return (
    <SafeAreaView className="flex-1 bg-wallet-bg" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-wallet-card items-center justify-center active:opacity-70"
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-wallet-text mr-10">
          App Lock
        </Text>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Main Toggle */}
        <View className="bg-wallet-card rounded-xl p-4 mt-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-wallet-text font-medium">Enable App Lock</Text>
              <Text className="text-wallet-text-secondary text-sm mt-0.5">
                Require authentication to open the app
              </Text>
            </View>
            <Switch
              value={lockSettings.isEnabled}
              onValueChange={handleToggleAppLock}
              trackColor={{ false: '#3A3A3C', true: '#B8F25B' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {lockSettings.isEnabled && (
          <>
            {/* Biometric Option */}
            {hasBiometricHardware && biometricType && (
              <View className="bg-wallet-card rounded-xl p-4 mt-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-4">
                    <Text className="text-wallet-text font-medium">
                      Use {getBiometricTypeName(biometricType)}
                    </Text>
                    <Text className="text-wallet-text-secondary text-sm mt-0.5">
                      Unlock with biometrics for faster access
                    </Text>
                  </View>
                  <Switch
                    value={lockSettings.useBiometric}
                    onValueChange={handleToggleBiometric}
                    trackColor={{ false: '#3A3A3C', true: '#B8F25B' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            )}

            {/* Change PIN */}
            <Pressable
              onPress={handleChangePin}
              className="bg-wallet-card rounded-xl p-4 mt-4 flex-row items-center justify-between active:opacity-70"
            >
              <View>
                <Text className="text-wallet-text font-medium">Change PIN</Text>
                <Text className="text-wallet-text-secondary text-sm mt-0.5">
                  Set a new 6-digit PIN
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#8E8E93" />
            </Pressable>

            {/* Auto-Lock Timeout */}
            <Pressable
              onPress={() => setShowTimeoutPicker(!showTimeoutPicker)}
              className="bg-wallet-card rounded-xl p-4 mt-4 active:opacity-70"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-wallet-text font-medium">Auto-Lock</Text>
                  <Text className="text-wallet-text-secondary text-sm mt-0.5">
                    Lock after period of inactivity
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-wallet-accent">{currentTimeoutLabel}</Text>
                  <Feather
                    name={showTimeoutPicker ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#8E8E93"
                  />
                </View>
              </View>

              {/* Timeout Options */}
              {showTimeoutPicker && (
                <View className="mt-4 pt-4 border-t border-wallet-card-light">
                  {AUTO_LOCK_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      onPress={() => handleSelectTimeout(option.value)}
                      className="flex-row items-center justify-between py-3"
                    >
                      <Text className="text-wallet-text">{option.label}</Text>
                      {lockSettings.autoLockTimeout === option.value && (
                        <Feather name="check" size={20} color="#B8F25B" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </Pressable>

            {/* Lock on Background */}
            <View className="bg-wallet-card rounded-xl p-4 mt-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-wallet-text font-medium">Lock on Background</Text>
                  <Text className="text-wallet-text-secondary text-sm mt-0.5">
                    Lock immediately when app goes to background
                  </Text>
                </View>
                <Switch
                  value={lockSettings.lockOnBackground}
                  onValueChange={handleToggleLockOnBackground}
                  trackColor={{ false: '#3A3A3C', true: '#B8F25B' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </>
        )}

        {/* Security Note */}
        <View className="mt-6 p-4 bg-wallet-card-light rounded-xl">
          <View className="flex-row items-start gap-3">
            <Feather name="info" size={18} color="#8E8E93" />
            <Text className="flex-1 text-wallet-text-secondary text-sm">
              App lock protects access to your wallet. Even with app lock disabled, your
              recovery phrase is stored securely and requires authentication to view.
            </Text>
          </View>
        </View>

        <View className="h-20" />
      </ScrollView>

      {/* PIN Setup Modal */}
      <PinSetupModal
        visible={showPinSetup}
        onClose={() => {
          setShowPinSetup(false);
          setIsChangingPin(false);
        }}
        onComplete={handleSetupPin}
        isChanging={isChangingPin}
      />
    </SafeAreaView>
  );
}
