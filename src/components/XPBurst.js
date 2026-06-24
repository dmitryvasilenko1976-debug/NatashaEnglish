import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function XPBurst({ amount, crit = false, label = null, yOffset = 0, onDone }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(crit ? 0.4 : 0.7)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = crit ? 1300 : 900;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: dur, delay: crit ? 200 : 100, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: crit ? -70 : -40, duration: dur, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: crit ? 3 : 5, tension: 80, useNativeDriver: true }),
      ...(crit ? [Animated.timing(rotate, { toValue: 1, duration: 500, useNativeDriver: true })] : []),
    ]).start(() => onDone && onDone());
  }, []);

  const text = label || (crit ? `✦ КРИТ! +${amount} XP` : `+${amount} XP`);
  const topBase = crit ? 65 : 75;
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });

  return (
    <Animated.Text
      style={[
        styles.burst,
        crit && styles.burstCrit,
        {
          opacity,
          top: topBase + yOffset,
          transform: [{ translateY }, { scale }, ...(crit ? [{ rotate: spin }] : [])],
        },
      ]}
    >
      {text}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  burst: {
    position: 'absolute',
    color: colors.goldBright,
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 18,
    fontWeight: '700',
    zIndex: 999,
    right: 16,
    top: 75,
    textShadowColor: 'rgba(180,130,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  burstCrit: {
    color: '#f0c030',
    fontSize: 26,
    right: 10,
    top: 65,
    textShadowColor: 'rgba(220,160,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});
