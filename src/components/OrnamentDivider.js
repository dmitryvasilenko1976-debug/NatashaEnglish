import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function OrnamentDivider({ style }) {
  return (
    <Text style={[styles.ornament, style]}>⁕ ……… ⁕</Text>
  );
}

const styles = StyleSheet.create({
  ornament: {
    textAlign: 'center',
    color: colors.gold,
    fontSize: 14,
    marginVertical: 8,
    letterSpacing: 3,
  },
});
