import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView,
} from 'react-native';
import Icon from './Icon';
import { colors } from '../theme/colors';
import { CHARACTERS } from '../data/storyData';

export default function StoryModal({ visible, dialogue, title, onDone, onClose, actionLabel = 'Продолжить' }) {
  const [lineIndex, setLineIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (visible) setLineIndex(0);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    fadeAnim.setValue(0);
    slideAnim.setValue(16);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [lineIndex, visible]);

  if (!dialogue || dialogue.length === 0) return null;

  const line = dialogue[lineIndex];
  const char = CHARACTERS[line.speaker] || { icon: 'person-outline', color: colors.inkMuted };
  const isLast = lineIndex === dialogue.length - 1;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Icon name="close" size={18} color={colors.inkFaint} />
          </TouchableOpacity>

          {/* Location title */}
          {title ? <Text style={styles.locationTitle}>{title}</Text> : null}

          {/* Character + dialogue */}
          <Animated.View style={[styles.dialogueRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={[styles.portrait, { borderColor: char.color + '60', backgroundColor: char.color + '18' }]}>
              <Icon name={char.icon} size={28} color={char.color} />
            </View>
            <View style={styles.bubble}>
              <Text style={[styles.speakerName, { color: char.color }]}>{line.speaker}</Text>
              <Text style={styles.dialogueText}>{line.text}</Text>
            </View>
          </Animated.View>

          {/* Progress dots */}
          {dialogue.length > 1 && (
            <View style={styles.dots}>
              {dialogue.map((_, i) => (
                <View key={i} style={[styles.dot, i === lineIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Action button */}
          <TouchableOpacity
            style={[styles.btn, isLast && styles.btnPrimary]}
            onPress={() => {
              if (isLast) { onDone && onDone(); }
              else setLineIndex(i => i + 1);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.btnText, isLast && styles.btnTextPrimary]}>
              {isLast ? actionLabel : 'Далее →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Special letter-style modal for the opening scene
export function LetterModal({ visible, text, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.letterBox}>
          <View style={styles.sealRow}>
            <Icon name="mail-outline" size={28} color={colors.goldBright} />
            <Text style={styles.sealText}>Международный Совет Целителей</Text>
          </View>
          <View style={styles.letterDivider} />
          <ScrollView style={styles.letterScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.letterText}>{text}</Text>
          </ScrollView>
          <TouchableOpacity style={styles.btnPrimary} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.btnTextPrimary}>Принять вызов ✦</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  box: {
    backgroundColor: colors.parchment,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.gold + '70',
    padding: 18,
    paddingTop: 36,
    ...require('react-native').Platform.select({
      web: { boxShadow: '0 -4px 24px rgba(44,26,14,0.18)' },
      default: { elevation: 8 },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 12,
    padding: 4,
  },
  locationTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dialogueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  portrait: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    flex: 1,
    backgroundColor: colors.parchmentDark,
    borderRadius: 10,
    borderTopLeftRadius: 2,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
  },
  speakerName: {
    fontFamily: 'Almendra_700Bold',
    fontSize: 12,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  dialogueText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.goldFaint,
  },
  dotActive: {
    backgroundColor: colors.goldBright,
    width: 18,
  },
  btn: {
    borderWidth: 1,
    borderColor: colors.gold + '80',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.forestGreen,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 14,
    color: colors.inkMuted,
  },
  btnTextPrimary: {
    fontFamily: 'Almendra_700Bold',
    fontSize: 14,
    color: '#f0e6c8',
  },

  // Letter modal
  letterBox: {
    backgroundColor: colors.parchment,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 20,
    maxHeight: '85%',
    ...require('react-native').Platform.select({
      web: { boxShadow: '0 4px 32px rgba(44,26,14,0.25)' },
      default: { elevation: 12 },
    }),
  },
  sealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sealText: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 13,
    color: colors.goldBright,
    letterSpacing: 0.5,
    flex: 1,
  },
  letterDivider: {
    height: 1,
    backgroundColor: colors.gold + '50',
    marginBottom: 14,
  },
  letterScroll: {
    maxHeight: 320,
    marginBottom: 16,
  },
  letterText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: colors.ink,
    lineHeight: 24,
  },
});
