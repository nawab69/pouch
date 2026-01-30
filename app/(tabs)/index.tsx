import { View, Text, ScrollView, Pressable, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Header } from '@/components/header';
import { BalanceDisplay } from '@/components/balance-display';
import { ActionButton } from '@/components/action-button';
import { AssetItem } from '@/components/asset-item';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MOCK_WALLET_ADDRESS = '0x245323';

const MOCK_ASSETS = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    amount: '0.23234145',
    price: '$102,241.02',
    percentageChange: 0.23,
    color: '#F7931A',
  },
  {
    id: '2',
    name: 'Stellar',
    symbol: 'XLM',
    amount: '23.3562',
    price: '$0.1351',
    percentageChange: -1.43,
    color: '#7D8B8A',
  },
  {
    id: '3',
    name: 'Ethereum',
    symbol: 'ETH',
    amount: '425.135115',
    price: '$4,223',
    percentageChange: 23.23,
    color: '#627EEA',
  },
  {
    id: '4',
    name: 'Tether',
    symbol: 'USDT',
    amount: '5,234.00',
    price: '$1.00',
    percentageChange: 0.23,
    color: '#26A17B',
  },
  {
    id: '5',
    name: 'Polkadot',
    symbol: 'DOT',
    amount: '156.42',
    price: '$7.23',
    percentageChange: 4.56,
    color: '#E6007A',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-wallet-bg" edges={['top']}>
      {/* Ambient green glow */}
      <View style={styles.glowContainer} pointerEvents="none">
        <Svg width={SCREEN_WIDTH} height={500}>
          <Defs>
            <RadialGradient
              id="glow"
              cx="0%"
              cy="0%"
              rx="70%"
              ry="60%"
            >
              <Stop offset="0%" stopColor="#B8F25B" stopOpacity="0.15" />
              <Stop offset="40%" stopColor="#B8F25B" stopOpacity="0.06" />
              <Stop offset="100%" stopColor="#B8F25B" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_WIDTH} height={500} fill="url(#glow)" />
        </Svg>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <Header
          walletAddress={MOCK_WALLET_ADDRESS}
          onProfilePress={() => {}}
          onNotificationPress={() => {}}
          onWalletPress={() => {}}
        />

        <BalanceDisplay
          balance={98230.02}
          percentageChange={0.23}
          timeframe="1d"
        />

        <View className="flex-row justify-center gap-12 py-6">
          <ActionButton type="receive" onPress={() => {}} />
          <ActionButton type="send" onPress={() => {}} />
          <ActionButton type="swap" onPress={() => router.push('/swap')} />
        </View>

        {/* Assets Card */}
        <View className="mt-8 bg-wallet-card rounded-t-3xl flex-1 min-h-[400px]">
          <View className="flex-row items-center justify-between px-5 pt-6 pb-3">
            <Text className="text-xl font-bold text-wallet-text">My assets</Text>
            <Pressable className="bg-wallet-card-light px-4 py-2 rounded-full">
              <Text className="text-sm text-wallet-text-secondary">see all</Text>
            </Pressable>
          </View>

          <View className="px-5 pb-32">
            {MOCK_ASSETS.map((asset, index) => (
              <AssetItem
                key={asset.id}
                name={asset.name}
                symbol={asset.symbol}
                amount={asset.amount}
                price={asset.price}
                percentageChange={asset.percentageChange}
                color={asset.color}
                onPress={() => {}}
                showDivider={index < MOCK_ASSETS.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  glowContainer: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    zIndex: 0,
  },
});
