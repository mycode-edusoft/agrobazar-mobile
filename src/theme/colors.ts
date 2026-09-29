export const colors = {
  primary: '#52C234',
  primaryDark: '#175800',
  primaryTint: '#F5FDF0',
  primaryLightText: '#B1DF39',

  text: '#262626',
  textSecondary: '#595959',
  textMuted: '#8C8C8C',
  textPlaceholder: '#BFBFBF',
  textHelper: '#9DA4AE',
  textDark: '#354052',

  background: '#F5F5F5',
  surface: '#FFFFFF',
  inputBackground: '#F9F9F9',
  inputBackgroundEmpty: '#F5F5F5',
  divider: '#F0F0F0',
  borderSubtle: '#D2D6DB',
  iconBackground: '#F3F4F6',

  danger: '#EF4444',
  dangerIcon: '#DC0812',
  badge: '#FF4D4F',
  price: '#FF5964',
  error: '#DE1135',

  link: '#276EF1',
  focus: '#005AFF',
  success: '#22C55E',
  successAlt: '#0BBA20',

  // Ana səhifə (Figma: Home / Guess)
  heading: '#181725',
  linkGreen: '#53B175',
  chipBackground: '#F8F8F8',
  chipText: '#175800',
  cardImageTint: '#E9F4E6',
  serviceLabel: '#0E121B',
  bannerAccent: '#CCF500',
  premiumBadge: { from: '#FF866B', to: '#F66848' },

  disabledBackground: '#E5E7EA',
  disabledText: '#9EA2AE',

  overlay: 'rgba(0, 0, 0, 0.6)',
  switchTrackOff: 'rgba(120, 120, 128, 0.16)',

  tier: {
    green: { from: '#F4EE36', to: '#52C234', text: '#B1DF39' },
    purple: { from: '#A16DF3', to: '#4E17A4', text: '#824CD5' },
    red: { from: '#E36B50', to: '#DD191D', text: '#E0493B' },
  },

  splashGradient: ['#52C234', '#175800'] as const,
} as const;

export type TierColor = keyof typeof colors.tier;
