import type { TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Roboto_400Regular',
  medium: 'Roboto_500Medium',
  bold: 'Roboto_700Bold',
} as const;

const make = (
  family: keyof typeof fontFamily,
  fontSize: number,
  lineHeight: number,
  extra: TextStyle = {},
): TextStyle => ({ fontFamily: fontFamily[family], fontSize, lineHeight, ...extra });

export const typography = {
  tabLabel: make('medium', 10, 12),
  caption: make('regular', 12, 20),
  captionMedium: make('medium', 12, 20),
  small: make('regular', 14, 20),
  smallMedium: make('medium', 14, 22),
  body: make('regular', 16, 24),
  bodyMedium: make('medium', 16, 24),
  bodyBold: make('bold', 16, 24),
  button: make('medium', 16, 19),
  buttonLarge: make('medium', 18, 28),
  title: make('medium', 16, 24),
  input: make('regular', 16, 24),
  otp: make('regular', 20, 28),
  balance: make('bold', 29, 34),
  price: make('medium', 15, 21, { letterSpacing: -0.09 }),
} as const;
