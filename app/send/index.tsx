import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import { NetworkBadge } from '@/components/network-badge';
import { useWallet } from '@/hooks/use-wallet';
import { useNetwork } from '@/hooks/use-network';
import { useTokens } from '@/hooks/use-tokens';
import { Token } from '@/types/blockchain';

export default function SendTokenSelectScreen() {
  const router = useRouter();
  const { tokenAddress } = useLocalSearchParams<{ tokenAddress?: string }>();
  const { walletAddress } = useWallet();
  const { selectedNetworkId, selectedNetwork, networkType } = useNetwork();
  const { tokens, isLoading, error, refreshTokens, getToken } = useTokens({
    address: walletAddress,
    networkId: selectedNetworkId,
    networkType,
  });

  const hasRedirected = useRef(false);

  // If tokenAddress is provided, skip token selection and go directly to amount
  useEffect(() => {
    if (tokenAddress && !isLoading && tokens.length > 0 && !hasRedirected.current) {
      const contractAddr = tokenAddress === 'native' ? null : tokenAddress;
      const token = getToken(contractAddr);

      if (token) {
        hasRedirected.current = true;
        router.replace({
          pathname: '/send/amount',
          params: {
            tokenAddress: token.contractAddress ?? 'native',
            tokenSymbol: token.symbol,
            tokenName: token.name,
            tokenDecimals: token.decimals.toString(),
            tokenBalance: token.balance,
            tokenBalanceFormatted: token.balanceFormatted,
            isNative: token.isNative ? 'true' : 'false',
          },
        });
      }
    }
  }, [tokenAddress, isLoading, tokens, getToken, router]);

  const handleSelectToken = (token: Token) => {
    // Navigate to amount screen with token data
    router.push({
      pathname: '/send/amount',
      params: {
        tokenAddress: token.contractAddress ?? 'native',
        tokenSymbol: token.symbol,
        tokenName: token.name,
        tokenDecimals: token.decimals.toString(),
        tokenBalance: token.balance,
        tokenBalanceFormatted: token.balanceFormatted,
        isNative: token.isNative ? 'true' : 'false',
      },
    });
  };

  // Show loading while redirecting
  if (tokenAddress && (isLoading || !hasRedirected.current)) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" edges={['bottom']}>
        <ActivityIndicator size="large" color="#B8F25B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={['bottom']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-wallet-card items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </Pressable>

        <Text className="text-xl font-bold text-wallet-text">Send</Text>

        <View className="w-10" />
      </View>

      {/* Network Badge */}
      <View className="items-center mb-4">
        <NetworkBadge
          network={selectedNetwork}
          networkType={networkType}
          size="medium"
        />
      </View>

      {/* Token List */}
      <View className="flex-1 px-5">
        <Text className="text-wallet-text-secondary text-sm mb-3">
          Select token to send
        </Text>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#B8F25B" />
            <Text className="text-wallet-text-secondary mt-4">
              Loading tokens...
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Feather name="alert-circle" size={48} color="#FF3B30" />
            <Text className="text-wallet-negative mt-4 text-center">{error}</Text>
            <Pressable
              onPress={refreshTokens}
              className="mt-4 bg-wallet-card px-6 py-3 rounded-full"
            >
              <Text className="text-wallet-accent font-medium">Try Again</Text>
            </Pressable>
          </View>
        ) : tokens.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Feather name="inbox" size={48} color="#8E8E93" />
            <Text className="text-wallet-text-secondary mt-4 text-center">
              No tokens found
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="gap-2 pb-8">
              {tokens.map((token) => (
                <TokenItem
                  key={token.contractAddress ?? 'native'}
                  token={token}
                  onPress={() => handleSelectToken(token)}
                />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

interface TokenItemProps {
  token: Token;
  onPress: () => void;
}

function TokenItem({ token, onPress }: TokenItemProps) {
  const hasBalance = parseFloat(token.balanceFormatted) > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={!hasBalance}
      className={`flex-row items-center justify-between p-4 bg-wallet-card rounded-xl active:opacity-70 ${
        !hasBalance ? 'opacity-50' : ''
      }`}
    >
      <View className="flex-row items-center gap-3">
        {token.logoUrl ? (
          <Image
            source={{ uri: token.logoUrl }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: token.isNative ? '#627EEA' : '#8E8E93' }}
          >
            <Text className="text-white font-bold text-lg">
              {token.symbol.charAt(0)}
            </Text>
          </View>
        )}

        <View>
          <Text className="text-wallet-text font-medium">{token.symbol}</Text>
          <Text className="text-wallet-text-secondary text-sm">{token.name}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-wallet-text font-medium">
          {token.balanceFormatted}
        </Text>
        {token.balanceUsd !== null && (
          <Text className="text-wallet-text-secondary text-sm">
            ${token.balanceUsd.toFixed(2)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
