import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

function cleanWord(raw) {
  return raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
}

// 0 Незнакомое · 1 Замеченное · 2 Знакомое · 3 Изученное · 4 Освоенное · 5 Мастерское
function getMasteryLevel(wordData, lookupCount) {
  const reps = wordData?.repetitions || 0;
  if (reps >= 8) return 5;
  if (reps >= 5) return 4;
  if (reps >= 3) return 3;
  const lc = lookupCount || 0;
  if (lc >= 20) return 3;
  if (lc >= 10) return 2;
  if (lc >= 3)  return 1;
  return 0;
}

const WRAP_STYLES = [
  null,                 // 0 default
  'level1Wrap',         // 1 Замеченное
  'level2Wrap',         // 2 Знакомое
  'level3Wrap',         // 3 Изученное
  'level4Wrap',         // 4 Освоенное
  'level5Wrap',         // 5 Мастерское
];
const TEXT_STYLES = [
  null,
  'level1Text',
  'level2Text',
  'level3Text',
  'level4Text',
  'level5Text',
];

export default function SentenceBlock({ sentence, selectedWord, savedWords, onWordPress, wordMastery }) {
  const words = sentence.split(' ');
  const mastery = wordMastery || {};

  return (
    <View style={styles.block}>
      <View style={styles.words}>
        {words.map((raw, i) => {
          const clean = cleanWord(raw);
          if (!clean) {
            return <Text key={i} style={styles.word}>{raw} </Text>;
          }

          const isSelected = selectedWord === clean;
          const wordData = savedWords[clean] || null;
          const level = getMasteryLevel(wordData, mastery[clean]);
          const wrapKey = WRAP_STYLES[level];
          const textKey = TEXT_STYLES[level];

          return (
            <TouchableOpacity key={i} onPress={() => onWordPress(clean, sentence)} activeOpacity={0.7}>
              <View style={[
                styles.wordWrap,
                wrapKey && !isSelected && styles[wrapKey],
                isSelected && styles.selectedWrap,
              ]}>
                <Text style={[
                  styles.word,
                  textKey && !isSelected && styles[textKey],
                  isSelected && styles.wordSelected,
                ]}>
                  {raw}{' '}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  wordWrap: {
    marginBottom: 2,
  },
  selectedWrap: {
    backgroundColor: '#cfe8cf',
    borderRadius: 4,
    paddingHorizontal: 3,
  },
  word: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 21,
    lineHeight: 40,
    color: colors.ink,
    textAlign: 'center',
    ...(Platform.OS === 'web' && { letterSpacing: 0.2 }),
  },
  wordSelected: {
    fontFamily: 'Almendra_400Regular_Italic',
    color: colors.forestGreen,
  },

  // Level 1 — Замеченное: faint dotted
  level1Wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inkFaint,
    borderStyle: 'dotted',
  },
  level1Text: { color: colors.inkFaint },

  // Level 2 — Знакомое: solid thin underline
  level2Wrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inkMuted,
    borderStyle: 'solid',
  },
  level2Text: { color: colors.inkMuted },

  // Level 3 — Изученное: gold light underline
  level3Wrap: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.goldLight,
    borderStyle: 'solid',
  },
  level3Text: { color: colors.inkMuted },

  // Level 4 — Освоенное: gold bold underline
  level4Wrap: {
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    borderStyle: 'solid',
  },
  level4Text: { color: colors.inkMuted },

  // Level 5 — Мастерское: gold + glow bg
  level5Wrap: {
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    borderStyle: 'solid',
    backgroundColor: '#f5eecc30',
    borderRadius: 2,
    paddingHorizontal: 2,
  },
  level5Text: {
    color: colors.gold,
  },
});
