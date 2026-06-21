import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function XPBurst({ amount, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -30, duration: 800, useNativeDriver: true }),
    ]).start(() => onDone && onDone());
  }, []);

  return (
    <Animated.Text style={[styles.burst, { opacity, transform: [{ translateY }] }]}>
      +{amount} XP
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    color: colors.gold,
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 999,
    right: 16,
  },
});
