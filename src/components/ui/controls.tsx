import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Switch as RNSwitch, TextInput, View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, shadows, typography } from '@/theme';
import { AppText } from './AppText';

// --- Checkbox -------------------------------------------------------------
interface CheckboxProps {
  checked: boolean;
  onChange(next: boolean): void;
  label?: ReactNode;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={styles.checkRow}
      hitSlop={6}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <Ionicons name="checkmark" size={14} color={colors.surface} /> : null}
      </View>
      {typeof label === 'string' ? (
        <AppText variant="small" color={colors.textSecondary} style={styles.flex}>
          {label}
        </AppText>
      ) : (
        label
      )}
    </Pressable>
  );
}

// --- Switch ---------------------------------------------------------------
export function Switch({ value, onChange, disabled }: { value: boolean; onChange(v: boolean): void; disabled?: boolean }) {
  return (
    <RNSwitch
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
      thumbColor={colors.surface}
      ios_backgroundColor={colors.switchTrackOff}
    />
  );
}

// --- Pill (tab-like selectable pill: green filled when active) -----------
interface PillProps {
  label: string;
  active: boolean;
  onPress(): void;
  style?: StyleProp<ViewStyle>;
  /** soft: #F8F8F8 fon (kataloq çipləri) · outline: ağ fon + #D9DCE0 haşiyə (status tabları) */
  variant?: 'soft' | 'outline';
}

export function Pill({ label, active, onPress, style, variant = 'soft' }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, variant === 'outline' && styles.pillOutline, active && styles.pillActive, style]}
    >
      <AppText variant="smallMedium" color={active ? colors.surface : colors.textSecondary}>
        {label}
      </AppText>
    </Pressable>
  );
}

// --- Chip (small rounded outline label, e.g. "Beynəlxalq çatdırılma") -----
export function Chip({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.chip, style]}>
      <AppText variant="caption" color={colors.textSecondary}>
        {label}
      </AppText>
    </View>
  );
}

// --- SegmentedControl (Aylıq / İllik) -------------------------------------
interface SegmentProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange(v: T): void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentProps<T>) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            <AppText variant="smallMedium" color={active ? colors.primary : colors.textMuted}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

// --- SearchBar ------------------------------------------------------------
interface SearchBarProps {
  value: string;
  onChange(v: string): void;
  placeholder: string;
  onFilterPress?: () => void;
  filterActive?: boolean;
  onSubmit?: () => void;
  autoFocus?: boolean;
  /** Verildikdə sahə yazıla bilmir, toxunma ayrıca axtarış ekranını açır. */
  onPress?: () => void;
  left?: ReactNode;
}

export function SearchBar({
  value, onChange, placeholder, onFilterPress, filterActive, onSubmit, autoFocus, onPress, left,
}: SearchBarProps) {
  const field = (
    <View style={styles.search}>
      <Ionicons name="search" size={18} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
        style={styles.searchInput}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoFocus={autoFocus}
        editable={!onPress}
        pointerEvents={onPress ? 'none' : 'auto'}
      />
      {value && !onPress ? (
        <Pressable onPress={() => onChange('')} hitSlop={8}>
          <Ionicons name="close-circle" size={18} color={colors.textPlaceholder} />
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <View style={styles.searchRow}>
      {left}
      {onPress ? (
        <Pressable onPress={onPress} style={styles.flex}>
          {field}
        </Pressable>
      ) : (
        field
      )}
      {onFilterPress ? (
        <Pressable onPress={onFilterPress} style={styles.filterBtn} accessibilityLabel="Filtr">
          <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
          {filterActive ? <View style={styles.filterDot} /> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

// --- Card -----------------------------------------------------------------
export function Card({ children, style, flat }: { children: ReactNode; style?: StyleProp<ViewStyle>; flat?: boolean }) {
  return <View style={[styles.card, !flat && shadows.card, style]}>{children}</View>;
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.divider, style]} />;
}

// --- EmptyState -----------------------------------------------------------
export function EmptyState({ text, icon = 'file-tray-outline' }: { text: string; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Card style={styles.empty}>
      <Ionicons name={icon} size={56} color={colors.textPlaceholder} />
      <AppText variant="body" color={colors.textPlaceholder} center>
        {text}
      </AppText>
    </Card>
  );
}

// --- ListRow (icon + label + chevron) ------------------------------------
interface ListRowProps {
  icon?: ReactNode;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  last?: boolean;
  color?: string;
}

export function ListRow({ icon, label, onPress, right, last, color = colors.textSecondary }: ListRowProps) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.row, !last && styles.rowBorder]}>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <AppText variant="body" color={color} style={styles.flex}>
        {label}
      </AppText>
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textPlaceholder} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkBox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.textPlaceholder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface,
  },
  checkBoxOn: { backgroundColor: colors.primary, borderColor: colors.primary },

  pill: {
    height: 30, paddingHorizontal: 12, borderRadius: radii.sm, backgroundColor: colors.chipBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  pillOutline: { backgroundColor: colors.surface, borderWidth: 1, borderColor: '#D9DCE0' },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },

  chip: {
    height: 22, paddingHorizontal: 8, borderRadius: radii.pill, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center',
  },

  segment: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: radii.sm, padding: 4 },
  segmentItem: { flex: 1, height: 36, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  segmentItemActive: { backgroundColor: colors.surface, ...shadows.smallButton },

  searchRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  search: {
    flex: 1, minHeight: 40, borderRadius: radii.sm, backgroundColor: colors.inputBackgroundEmpty,
    borderWidth: 1, borderColor: colors.divider,
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8,
  },
  searchInput: { flex: 1, ...typography.smallMedium, color: colors.text, padding: 0 },
  filterBtn: {
    width: 38, alignSelf: 'stretch', minHeight: 40, borderRadius: radii.sm,
    backgroundColor: colors.inputBackgroundEmpty, borderWidth: 1, borderColor: colors.divider,
    alignItems: 'center', justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.badge, borderWidth: 0.9, borderColor: colors.inputBackgroundEmpty,
  },

  card: { backgroundColor: colors.surface, borderRadius: radii.md, padding: 16 },
  divider: { height: 1, backgroundColor: colors.divider },

  empty: { alignItems: 'center', justifyContent: 'center', gap: 16, paddingVertical: 80 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: { width: 22, alignItems: 'center' },
});
