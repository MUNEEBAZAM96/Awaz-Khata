import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

/**
 * Decorative backdrop: two ultra-soft blobs — emerald top-right, gold
 * bottom-left — behind every screen so the cream background has gentle
 * depth without ever competing with content.
 */
export function ScreenBackground() {
  const colors = useColors();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.blobTop, { backgroundColor: colors.blobGreen }]} />
      <View style={[styles.blobBottom, { backgroundColor: colors.blobGold }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  blobTop: {
    position: 'absolute',
    top: -140,
    right: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -160,
    left: -140,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
});
