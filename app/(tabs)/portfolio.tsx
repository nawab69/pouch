import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from '@expo/vector-icons/Feather';

export default function PortfolioScreen() {
  return (
    <SafeAreaView className="flex-1 bg-wallet-bg" edges={['top']}>
      <View className="flex-1 items-center justify-center gap-4 p-5 pb-28">
        <View className="w-16 h-16 rounded-full bg-wallet-card items-center justify-center">
          <Feather name="pie-chart" size={32} color="#B8F25B" />
        </View>
        <Text className="text-xl font-semibold text-wallet-text">Portfolio</Text>
        <Text className="text-wallet-text-secondary text-center">
          Track your portfolio performance and analytics here.
        </Text>
      </View>
    </SafeAreaView>
  );
}
