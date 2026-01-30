# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pouch is a React Native/Expo crypto wallet app. Currently in the initial template phase - ready for feature development.

**Stack:** Expo SDK 54, React Native 0.81, React 19, TypeScript 5.9, Tailwind CSS v3 + NativeWind v4

## Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run web version
npm run lint       # Run ESLint
```

For development, prefer `npm start` and scan QR with Expo Go before creating custom builds.

## Architecture

```
app/                    # Expo Router file-based routes
  _layout.tsx          # Root layout with Stack navigator
  index.tsx            # Home screen

global.css             # Tailwind CSS entry point
components/            # Reusable UI components (add your own)
hooks/                 # Custom hooks (useColorScheme, useThemeColor)
constants/theme.ts     # Colors and Fonts definitions
```

**Routing:** File-based with expo-router. Routes in `app/`, components elsewhere.

**Theming:** Light/dark mode via `useColorScheme()` hook and Tailwind `dark:` variants.

## Code Conventions

From `.agents/skills/` guidelines:

- Use kebab-case for file names
- Use `expo-image` not `<Image>` from react-native
- Use `react-native-safe-area-context` not react-native SafeAreaView
- Use `Pressable` over `TouchableOpacity`
- Wrap root components in ScrollView with `contentInsetAdjustmentBehavior="automatic"`
- Animate only `transform` and `opacity` for performance
- Use FlashList for large lists
- Memoize list items and stabilize callback references

## Tailwind Usage

Use `className` directly on React Native components:

```tsx
import { View, Text, ScrollView } from 'react-native';

<ScrollView className="flex-1 bg-white dark:bg-black">
  <View className="p-4 gap-4">
    <Text className="text-xl font-bold text-black dark:text-white">Hello</Text>
  </View>
</ScrollView>
```

Tailwind config is in `tailwind.config.js`. Global styles in `global.css`.
