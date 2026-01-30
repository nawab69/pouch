import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { SwapCard } from '@/components/swap-card';

const MOCK_WALLET_ADDRESS = '0x245323';

export default function SwapScreen() {
  const router = useRouter();
  const [fromAmount, setFromAmount] = useState('7,235.02');
  const [toAmount] = useState('24,230.02');

  return (
    <SafeAreaView className="flex-1 bg-wallet-bg" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-wallet-card"
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>

          <Text className="text-lg font-semibold text-wallet-text">Swap</Text>

          <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-wallet-card">
            <Feather name="bell" size={20} color="#8B9A92" />
          </Pressable>
        </View>

        {/* Swap Cards */}
        <View className="px-5 pt-4 gap-4">
          <SwapCard
            type="from"
            walletAddress={MOCK_WALLET_ADDRESS}
            label="Available:"
            labelValue="23,234.23"
            tokenSymbol="Bitcoin"
            tokenColor="#F7931A"
            amount={fromAmount}
            usdValue="$23,234"
            onAmountChange={setFromAmount}
            onMaxPress={() => setFromAmount('23,234.23')}
            editable={true}
          />

          {/* Swap direction indicator */}
          <View className="items-center -my-2 z-10">
            <View className="w-10 h-10 rounded-full bg-wallet-card-light items-center justify-center border-4 border-wallet-bg">
              <Feather name="refresh-cw" size={20} color="#B8F25B" />
            </View>
          </View>

          <SwapCard
            type="to"
            walletAddress={MOCK_WALLET_ADDRESS}
            label="You receive:"
            labelValue="1,124.23"
            tokenSymbol="USDT"
            tokenColor="#26A17B"
            amount={toAmount}
            usdValue="$23,234"
            editable={false}
          />
        </View>

        {/* Exchange rate and fee */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center justify-between py-3 border-t border-wallet-card">
            <Text className="text-wallet-text-secondary text-sm">
              1 WETH = 6/32451 USDT
            </Text>
            <Text className="text-wallet-text-muted text-sm">
              FEE: <Text className="text-wallet-text">$0.31</Text>
            </Text>
          </View>
        </View>

        {/* Confirm button */}
        <View className="px-5 pt-4">
          <Pressable className="bg-wallet-accent active:bg-wallet-accent-dark rounded-full py-4 flex-row items-center justify-center gap-2">
            <Text className="text-wallet-bg font-semibold text-base">
              Confirm Swap
            </Text>
            <Feather name="arrow-right" size={18} color="#0D1411" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
