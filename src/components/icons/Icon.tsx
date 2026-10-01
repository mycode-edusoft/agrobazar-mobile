import { memo } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { figmaSvgs, type FigmaIconName } from './figmaSvgs';

type Direction = 'left' | 'right' | 'up' | 'down';

// Figma "angle" ikonu sola baxır — qalan istiqamətlər fırlatma ilə
const rotation: Record<Direction, string> = { left: '0deg', right: '180deg', up: '90deg', down: '-90deg' };

interface Props {
  name: FigmaIconName;
  size?: number;
  /** Yalnız mono ikonlara təsir edir (currentColor); çoxrəngli ikonlar Figma rəngində qalır */
  color?: string;
  /** chevron üçün istiqamət */
  direction?: Direction;
  style?: StyleProp<ViewStyle>;
}

/** Tətbiqin vahid ikon komponenti — bütün vektorlar Figma-dan (figmaSvgs.ts). */
export const Icon = memo(function Icon({ name, size = 24, color, direction, style }: Props) {
  const { xml } = figmaSvgs[name];
  return (
    <SvgXml
      xml={xml}
      width={size}
      height={size}
      color={color}
      style={[direction ? { transform: [{ rotate: rotation[direction] }] } : null, style]}
    />
  );
});
