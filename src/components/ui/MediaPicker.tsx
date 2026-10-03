import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii } from '@/theme';
import { AppText } from './AppText';
import { useToast } from './Toast';

interface ImagesProps {
  uris: string[];
  onChange(uris: string[]): void;
  max: number;
  min?: number;
  hint?: string;
  maxBytes?: number;
  error?: string;
}

export function ImagesPicker({ uris, onChange, max, min, hint, maxBytes, error }: ImagesProps) {
  const toast = useToast();

  const pick = async () => {
    const remaining = max - uris.length;
    if (remaining <= 0) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast('Qalereyaya giriş icazəsi verilmədi', 'error');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: remaining > 1,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (res.canceled) return;
    const accepted = res.assets.filter((a) => !maxBytes || a.fileSize == null || a.fileSize <= maxBytes);
    if (accepted.length < res.assets.length) toast(`Bəzi şəkillər limitdən böyükdür (max ${Math.round((maxBytes ?? 0) / 1024)} KB)`, 'error');
    onChange([...uris, ...accepted.map((a) => a.uri)].slice(0, max));
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {uris.map((uri) => (
          <View key={uri} style={styles.thumb}>
            <Image source={uri} style={styles.thumbImg} contentFit="cover" />
            <Pressable onPress={() => onChange(uris.filter((u) => u !== uri))} style={styles.remove} hitSlop={6}>
              <Ionicons name="close" size={14} color={colors.surface} />
            </Pressable>
          </View>
        ))}
        {uris.length < max ? (
          <Pressable onPress={pick} style={[styles.thumb, styles.add, !!error && styles.addError]}>
            <Ionicons name="camera-outline" size={26} color="#959595" />
            <AppText variant="caption" color={colors.textMuted}>
              {uris.length}/{max}
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {hint ? (
        <AppText variant="caption" color={error ? colors.danger : colors.textMuted}>
          {error ?? hint}
        </AppText>
      ) : null}
      {min != null && !hint && error ? (
        <AppText variant="caption" color={colors.danger}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

interface SingleProps {
  uri: string | null;
  onChange(uri: string | null): void;
  label: string;
  hint?: string;
  maxBytes?: number;
  aspect?: [number, number];
}

export function SingleImagePicker({ uri, onChange, label, hint, maxBytes, aspect = [1, 1] }: SingleProps) {
  const toast = useToast();
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast('Qalereyaya giriş icazəsi verilmədi', 'error');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.8 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (maxBytes && asset.fileSize != null && asset.fileSize > maxBytes) {
      toast(`Şəkil limitdən böyükdür (max ${Math.round(maxBytes / 1024)} KB)`, 'error');
      return;
    }
    onChange(asset.uri);
  };

  const wide = aspect[0] > aspect[1];
  return (
    <View style={styles.wrap}>
      <AppText variant="bodyBold" color={colors.textSecondary}>
        {label}
      </AppText>
      <Pressable onPress={pick} style={[styles.single, wide && styles.singleWide]}>
        {uri ? (
          <Image source={uri} style={styles.thumbImg} contentFit="cover" />
        ) : (
          <Ionicons name="camera-outline" size={28} color={colors.textMuted} />
        )}
        {uri ? (
          <Pressable onPress={() => onChange(null)} style={styles.remove} hitSlop={6}>
            <Ionicons name="close" size={12} color={colors.surface} />
          </Pressable>
        ) : null}
      </Pressable>
      {hint ? (
        <AppText variant="caption" color={colors.textMuted}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

interface VideoProps {
  uri: string | null;
  onChange(uri: string | null): void;
  label: string;
  maxBytes: number;
}

export function VideoPicker({ uri, onChange, label, maxBytes }: VideoProps) {
  const toast = useToast();
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'] });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.fileSize != null && asset.fileSize > maxBytes) {
      toast(`Video limitdən böyükdür (max ${Math.round(maxBytes / 1024 / 1024)} MB)`, 'error');
      return;
    }
    onChange(asset.uri);
  };

  return (
    <Pressable onPress={uri ? () => onChange(null) : pick} style={styles.video}>
      <Ionicons name={uri ? 'checkmark-circle' : 'videocam-outline'} size={22} color={uri ? colors.primary : colors.textMuted} />
      <AppText variant="small" color={colors.textSecondary} style={styles.flex} numberOfLines={1}>
        {uri ? uri.split('/').pop() : label}
      </AppText>
      {uri ? <Ionicons name="close" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

// Figma "Yeni elan" şəkilləri: 130×130, radius 14, haşiyə #C4C4C4; əlavə et plitəsi #EAEAEA, qırıq haşiyə
const THUMB = 130;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  thumb: { width: THUMB, height: THUMB, borderRadius: 14, backgroundColor: colors.background, borderWidth: 1, borderColor: '#C4C4C4' },
  thumbImg: { width: '100%', height: '100%', borderRadius: 13 },
  add: { alignItems: 'center', justifyContent: 'center', gap: 4, borderStyle: 'dashed', backgroundColor: '#EAEAEA' },
  addError: { borderColor: colors.danger },
  remove: {
    position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.surface,
    backgroundColor: 'rgba(0,0,0,0.54)', alignItems: 'center', justifyContent: 'center',
  },
  single: {
    width: 120, height: 120, borderRadius: radii.sm, backgroundColor: colors.background, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.textPlaceholder,
  },
  singleWide: { width: '100%', height: 140 },
  video: {
    flexDirection: 'row', alignItems: 'center', gap: 12, height: 56, paddingHorizontal: 16,
    borderRadius: radii.sm, backgroundColor: colors.inputBackgroundEmpty,
  },
});
