import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function XPBurst({ amount, crit = false, label = null, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(crit ? 0.6 : 1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: crit ? 1100 : 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: crit ? -55 : -30, duration: crit ? 1100 : 800, useNativeDriver: true }),
      ...(crit ? [Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true })] : []),
    ]).start(() => onDone && onDone());
  }, []);

  const text = label || (crit ? `✦ КРИТ! +${amount} XP` : `+${amount} XP`);

  return (
    <Animated.Text
      style={[
        styles.burst,
        crit && styles.burstCrit,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      {text}
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
    top: 80,
  },
  burstCrit: {
    color: '#f5c842',
    fontSize: 22,
    right: 12,
    top: 70,
    textShadowColor: 'rgba(200,150,0,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
