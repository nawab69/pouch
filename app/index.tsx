import { View, Text, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';

export default function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-gray-950"
      contentContainerClassName="flex-1 items-center justify-center p-6 gap-8"
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Logo */}
      <View className="w-20 h-20 bg-gray-900 rounded-3xl items-center justify-center shadow-lg">
        <Image
          source={require('@/assets/images/icon.png')}
          className="w-12 h-12"
        />
      </View>

      {/* Title */}
      <View className="items-center gap-2">
        <Text className="text-3xl font-bold text-white">
          Pouch
        </Text>
        <Text className="text-base text-gray-400 text-center">
          Your crypto, your pocket
        </Text>
      </View>

      {/* Feature Cards */}
      <View className="w-full max-w-sm gap-3">
        <FeatureCard
          icon="⚡"
          title="Fast Refresh"
          description="See changes instantly as you code"
        />
        <FeatureCard
          icon="🎨"
          title="Tailwind CSS"
          description="Style with utility classes"
        />
        <FeatureCard
          icon="📱"
          title="Cross Platform"
          description="iOS, Android, and Web"
        />
      </View>

      {/* CTA Button */}
      <Pressable className="bg-blue-500 active:bg-blue-600 px-8 py-4 rounded-2xl">
        <Text className="text-white font-semibold text-base">
          Get Started
        </Text>
      </Pressable>

      {/* Footer */}
      <Text className="text-sm text-gray-500">
        Edit app/index.tsx to begin
      </Text>
    </ScrollView>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <View className="flex-row items-center gap-4 bg-gray-900 p-4 rounded-2xl">
      <View className="w-10 h-10 bg-gray-800 rounded-xl items-center justify-center">
        <Text className="text-lg">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-white">{title}</Text>
        <Text className="text-sm text-gray-400">{description}</Text>
      </View>
    </View>
  );
}
