import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radii } from '@/theme';

type Name = keyof typeof MaterialCommunityIcons.glyphMap;

interface Props {
  icon: string;
  imageUrl?: string | null;
  size?: number;
}

export function CategoryIcon({ icon, imageUrl, size = 56 }: Props) {
  const name = (icon in MaterialCommunityIcons.glyphMap ? icon : 'shape-outline') as Name;
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radii.sm }]}>
      {imageUrl ? (
        <Image source={imageUrl} style={styles.image} contentFit="contain" transition={120} />
      ) : (
        <MaterialCommunityIcons name={name} size={size * 0.5} color={colors.primary} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.inputBackgroundEmpty,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: { width: '86%', height: '86%' },
});
