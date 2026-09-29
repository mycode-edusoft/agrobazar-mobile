import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { colors } from '@/theme';

const logo = require('../../../assets/brand/logo-white.png');

// Figma "Onboarding 2": linear-gradient(156.5deg, #52C234 0.77% → #175800 98.39%), loqo 207×95 mərkəzdə
const GRADIENT_START = { x: 0.3, y: 0 };
const GRADIENT_END = { x: 0.7, y: 1 };

interface Props {
  /** true olanda splash yumşaq sönür və `onHidden` çağırılır */
  done: boolean;
  onHidden(): void;
}

export function BrandSplash({ done, onHidden }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!done) return;
    Animated.timing(opacity, { toValue: 0, duration: 280, delay: 120, useNativeDriver: true }).start(
      ({ finished }) => finished && onHidden(),
    );
  }, [done, opacity, onHidden]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity }]} pointerEvents={done ? 'none' : 'auto'}>
      <StatusBar style="light" />
      <LinearGradient
        colors={colors.splashGradient}
        locations={[0.0077, 0.9839]}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={StyleSheet.absoluteFill}
      />
      <Image source={logo} style={styles.logo} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  logo: { width: 207, height: 95 },
});
