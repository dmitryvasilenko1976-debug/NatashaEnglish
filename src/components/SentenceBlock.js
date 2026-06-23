import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

function cleanWord(raw) {
  return raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
}

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

          const isSaved = !!savedWords[clean];
          const isSelected = selectedWord === clean;
          const lookups = mastery[clean] || 0;
          const isFamiliar = !isSaved && lookups >= 10 && lookups < 20;
          const isKnown = !isSaved && lookups >= 20;

          return (
            <TouchableOpacity key={i} onPress={() => onWordPress(clean, sentence)} activeOpacity={0.7}>
              <View style={[
                styles.wordWrap,
                isSaved && !isSelected && styles.savedWrap,
                isFamiliar && !isSelected && styles.familiarWrap,
                isKnown && !isSelected && styles.knownWrap,
                isSelected && styles.selectedWrap,
              ]}>
                <Text style={[
                  styles.word,
                  isSaved && !isSelected && styles.wordSaved,
                  isFamiliar && !isSelected && styles.wordFamiliar,
                  isKnown && !isSelected && styles.wordKnown,
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
  savedWrap: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.gold,
    borderStyle: 'solid',
  },
  selectedWrap: {
    backgroundColor: '#cfe8cf',
    borderRadius: 4,
    paddingHorizontal: 3,
  },
  word: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 21,
    lineHeight: 40,
    color: colors.ink,
    textAlign: 'center',
    ...(Platform.OS === 'web' && { letterSpacing: 0.2 }),
  },
  wordSaved: {
    color: colors.inkMuted,
  },
  familiarWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inkFaint,
    borderStyle: 'dotted',
  },
  wordFamiliar: {
    color: colors.inkFaint,
  },
  knownWrap: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.goldLight,
    borderStyle: 'solid',
  },
  wordKnown: {
    color: colors.goldLight,
  },
  wordSelected: {
    fontFamily: 'IMFellEnglish_400Regular_Italic',
    color: colors.forestGreen,
  },
});
