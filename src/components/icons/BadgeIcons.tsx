import Svg, { Circle, Path } from 'react-native-svg';

// Figma "ideate/power2" — "Star 9" (dalğalı 8 guşəli nişan) + içində ✓.
// Vektor MCP olmadan alına bilmədiyi üçün forma kodla qurulur (24×24, nişan 20×20 mərkəzdə).
const STAR = (() => {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? 10 : 8.2;
    const a = (Math.PI / 8) * i - Math.PI / 2;
    pts.push(`${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
})();

const CHECK = 'M9.6 12.2l1.7 1.7 3.2-3.4';

/** solid: rəngli dolu nişan + ağ ✓ (Aktif tarif kartı). line: ağ konturlu nişan (gradient pill/dairə içində). */
export function PowerBadgeIcon({ size = 24, color = '#FFFFFF', variant = 'solid' }: { size?: number; color?: string; variant?: 'solid' | 'line' }) {
  const solid = variant === 'solid';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={STAR} fill={solid ? color : 'none'} stroke={color} strokeWidth={solid ? 1.2 : 1.8} strokeLinejoin="round" />
      <Path d={CHECK} fill="none" stroke={solid ? '#FFFFFF' : color} strokeWidth={solid ? 1.5 : 1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Figma "Group 1436" (Mağazaya keçid): yaşıl "yönləndir" oxu, 22×18.6
export function ForwardArrowIcon({ size = 22, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size * 0.846} viewBox="0 0 22 18.62">
      <Path d="M12.2 2.4 19.6 9.3 12.2 16.2V12C7.6 12 4.6 13.4 2.4 16.6 3.2 11.6 6.2 7.4 12.2 6.6Z" fill={color} />
    </Svg>
  );
}

// Figma "circle-plus": dolu dairə, içində fon rəngli "+"
export function CirclePlusIcon({ size = 16, color = '#FFFFFF', bg }: { size?: number; color?: string; bg: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Circle cx={8} cy={8} r={8} fill={color} />
      <Path d="M8 4.8v6.4M4.8 8h6.4" stroke={bg} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

// Figma "Iconly/Regular/Light/Edit Square" (mağaza səhifəsi başlığında redaktə)
export function EditSquareIcon({ size = 20, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M11.49 2.79H7.75C4.68 2.79 2.75 4.97 2.75 8.05v8.31c0 3.08 1.92 5.26 5 5.26h8.83c3.08 0 5-2.18 5-5.26v-4.03" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path fillRule="evenodd" d="M8.83 10.92l7.47-7.47a2.38 2.38 0 0 1 3.37 0l1.22 1.22a2.38 2.38 0 0 1 0 3.37l-7.51 7.51a2.17 2.17 0 0 1-1.54.64H8.1l.09-3.78c.01-.56.24-1.09.64-1.49z" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M15.17 4.6l4.56 4.57" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Iconly Regular/Light "Chart" — kvadrat çərçivə + 3 sütun
export function ChartIcon({ size = 18, color, strokeWidth = 1.5 }: { size?: number; color: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M7.33 10.2v6.86M12.03 6.92v10.14M16.67 13.83v3.23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Path fillRule="evenodd" d="M16.73 2H7.27C4.17 2 2.25 4.19 2.25 7.3v9.4c0 3.11 1.92 5.3 5.02 5.3h9.46c3.1 0 5.02-2.19 5.02-5.3V7.3C21.75 4.19 19.83 2 16.73 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// Iconly Regular/Light "Delete" — səbət
export function DeleteIcon({ size = 18, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19.32 9.47s-.54 6.74-.86 9.58c-.15 1.36-.99 2.15-2.36 2.18-2.6.05-5.21.05-7.81 0-1.32-.03-2.15-.83-2.3-2.17-.32-2.86-.86-9.59-.86-9.59" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M20.71 6.24H3.75M17.44 6.24c-.79 0-1.46-.56-1.62-1.33l-.24-1.22a1.29 1.29 0 0 0-1.25-.96h-4.21c-.58 0-1.09.39-1.25.96l-.24 1.22c-.16.77-.83 1.33-1.62 1.33" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
