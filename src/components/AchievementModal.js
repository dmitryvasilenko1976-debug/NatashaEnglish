import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from './OrnamentDivider';
import { colors } from '../theme/colors';

export default function AchievementModal({ achievements, onClose }) {
  const [index, setIndex] = useState(0);

  if (!achievements || achievements.length === 0) return null;

  const current = achievements[index];

  const handleNext = () => {
    if (index < achievements.length - 1) {
      setIndex(index + 1);
    } else {
      onClose();
    }
  };

  return (
    <Modal transparent animationType="fade" visible>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <OrnamentDivider />
          <Text style={styles.label}>Новое достижение!</Text>

          <Ionicons name={current.icon} size={40} color={colors.gold} style={styles.icon} />

          <Text style={styles.name}>{current.name}</Text>
          <Text style={styles.desc}>{current.description}</Text>

          <Text style={styles.xp}>+{current.xpBonus} XP</Text>

          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>Продолжить</Text>
          </TouchableOpacity>

          <OrnamentDivider />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 4,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  label: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: 12,
  },
  icon: {
    marginVertical: 8,
  },
  name: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 22,
    color: colors.ink,
    marginTop: 8,
    textAlign: 'center',
  },
  desc: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  xp: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 22,
    color: colors.gold,
    marginVertical: 16,
  },
  btn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 3,
  },
  btnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
});
