import { Platform, type ViewStyle } from 'react-native';

export { colors, type TierColor } from './colors';
export { typography, fontFamily } from './typography';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 14,
  lg: 16,
  sheet: 24,
  screen: 40,
  pill: 100,
} as const;

export const layout = {
  screenPadding: 16,
  buttonHeight: 56,
  inputHeight: 56,
  headerHeight: 44,
  tabBarHeight: 80,
  cardGap: 16,
} as const;

const shadow = (
  opacity: number,
  radius: number,
  elevation: number,
  offsetY = 0,
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
    android: { elevation },
    default: {},
  }) ?? {};

export const shadows = {
  card: shadow(0.08, 14, 3),
  nav: shadow(0.1, 14, 8),
  smallButton: shadow(0.15, 2, 2),
  toast: shadow(0.1, 20, 6, 8),
} as const;
