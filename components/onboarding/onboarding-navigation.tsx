import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface OnboardingNavigationProps {
  currentPage: number;
  totalPages: number;
  onSkip: () => void;
  onNext: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ArrowIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12H19M19 12L12 5M19 12L12 19"
        stroke="#0D1411"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13L9 17L19 7"
        stroke="#0D1411"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function OnboardingNavigation({
  currentPage,
  totalPages,
  onSkip,
  onNext,
}: OnboardingNavigationProps) {
  const buttonScale = useSharedValue(1);
  const isLastPage = currentPage === totalPages - 1;

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Skip button - hidden on last page */}
      <View style={styles.skipContainer}>
        {!isLastPage && (
          <Pressable onPress={onSkip} hitSlop={20}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* Next/Complete button */}
      <AnimatedPressable
        onPress={onNext}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.nextButton, buttonAnimatedStyle]}
      >
        {isLastPage ? <CheckIcon /> : <ArrowIcon />}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  skipContainer: {
    width: 60,
  },
  skipText: {
    fontFamily: 'Outfit_500Medium',
    fontSize: 16,
    color: '#8B9A92',
  },
  nextButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#B8F25B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
