import { Stack } from 'expo-router';

export default function SendLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#0A0A0A' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="amount" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
