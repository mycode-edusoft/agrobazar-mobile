import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, LinearGradient, Path, Stop, Text as SvgText } from 'react-native-svg';
import { AppText } from '@/components/ui';
import { t } from '@/i18n/az';
import { colors, typography } from '@/theme';

const LINE = '#2D6EFF';
const GRID = 'rgba(230, 230, 230, 0.5)';
const AXIS = '#828282';
const AXIS_FONT = typography.small.fontFamily;
// Figma "Chart": 282 hündürlük, xətlər 59-dan 240-a qədər hər ~36px, X oxu yazıları 244-də
const HEIGHT = 282;
const PAD = 16;
const TOP = 59;
const BOTTOM = 240;
const ROWS = 5;

/** Yuvarlaq maksimum: 7 → 10, 23 → 25, 140 → 150 — Y oxu yazıları səliqəli olsun */
function niceMax(v: number) {
  if (v <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= v) ?? 10;
  return step * pow;
}

const short = (n: number) => (n >= 1000 ? `${Math.round(n / 100) / 10}K` : String(Math.round(n)));

/**
 * Figma "Statistika" qrafiki: ağ kart (#E0E0E0 haşiyə, radius 14), boz şəbəkə xətləri,
 * mavi xətt + aşağı solğunlaşan doldurma, sonuncu nöqtədə parıltılı nöqtə.
 * Seriya yoxdursa (backend hələ vermir) şəbəkə + izah mətni göstərilir.
 */
export function InsightsChart({ points }: { points: { label: string; value: number }[] | null | undefined }) {
  const [width, setWidth] = useState(0);
  const has = !!points && points.length > 1;
  const max = has ? niceMax(Math.max(...points.map((p) => p.value))) : 0;
  const right = width - PAD;
  const x = (i: number) => PAD + ((right - PAD) * i) / ((points?.length ?? 2) - 1);
  const y = (v: number) => BOTTOM - ((BOTTOM - TOP) * v) / (max || 1);

  let line = '';
  let area = '';
  if (has && width > 0) {
    line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(' ');
    area = `${line} L${right} ${BOTTOM} L${PAD} ${BOTTOM} Z`;
  }
  // X oxunda ən çoxu 7 bərabər paylanmış yazı (ilk və son daxil) — 30 günlük seriyada üst-üstə düşməsin
  const ticks = new Set<number>();
  if (has) {
    const k = Math.min(points.length, 7);
    for (let j = 0; j < k; j++) ticks.add(Math.round((j * (points.length - 1)) / (k - 1)));
  }
  const last = has ? points[points.length - 1] : null;

  return (
    <View style={styles.card} onLayout={(e) => setWidth(e.nativeEvent.layout.width - 2)}>
      <AppText style={styles.title}>{t.stats.chartTitle}</AppText>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT - 2} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={LINE} stopOpacity={0.15} />
              <Stop offset="1" stopColor={LINE} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          {Array.from({ length: ROWS + 1 }, (_, i) => {
            const gy = TOP + ((BOTTOM - TOP) * i) / ROWS;
            return (
              <Line key={i} x1={PAD} x2={right} y1={gy} y2={gy} stroke={i === ROWS ? '#E6E6E6' : GRID} strokeWidth={1} />
            );
          })}
          {has
            ? Array.from({ length: ROWS }, (_, i) => (
                <SvgText key={i} x={PAD} y={TOP + ((BOTTOM - TOP) * i) / ROWS + 15} fontSize={10} fill={AXIS} fontFamily={AXIS_FONT}>
                  {short((max * (ROWS - i)) / ROWS)}
                </SvgText>
              ))
            : null}
          {has ? <Path d={area} fill="url(#fill)" /> : null}
          {has ? <Path d={line} stroke={LINE} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
          {last ? (
            <>
              <Circle cx={right} cy={y(last.value)} r={15} fill={LINE} opacity={0.1} />
              <Circle cx={right} cy={y(last.value)} r={4} fill={LINE} />
            </>
          ) : null}
          {has
            ? points.map((p, i) =>
                ticks.has(i) ? (
                  <SvgText
                    key={p.label + i}
                    x={x(i)}
                    y={BOTTOM + 14}
                    fontSize={10}
                    fill={AXIS}
                    fontFamily={AXIS_FONT}
                    textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
                  >
                    {p.label}
                  </SvgText>
                ) : null,
              )
            : null}
        </Svg>
      ) : null}
      {!has ? (
        <View style={styles.empty}>
          <AppText variant="small" color={colors.textMuted} center>
            {t.stats.chartEmpty}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: HEIGHT, borderRadius: 14, borderWidth: 1, borderColor: '#E0E0E0', backgroundColor: colors.surface, overflow: 'hidden',
  },
  title: { position: 'absolute', left: PAD, top: PAD, fontFamily: typography.tabLabelActive.fontFamily, fontSize: 14, lineHeight: 20, color: '#000' },
  empty: { position: 'absolute', left: 40, right: 40, top: TOP, bottom: HEIGHT - BOTTOM, alignItems: 'center', justifyContent: 'center' },
});
