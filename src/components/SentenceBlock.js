import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

function cleanWord(raw) {
  return raw.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').toLowerCase();
}

export default function SentenceBlock({ sentence, isActive, isRead, selectedWord, savedWords, onWordPress }) {
  const words = sentence.split(' ');

  return (
    <View style={[styles.block, isActive && styles.active, isRead && styles.read]}>
      <View style={styles.words}>
        {words.map((raw, i) => {
          const clean = cleanWord(raw);
          if (!clean) {
            return <Text key={i} style={[styles.word, isRead && styles.wordRead]}>{raw} </Text>;
          }

          const isSaved = !!savedWords[clean];
          const isSelected = selectedWord === clean;

          return (
            <TouchableOpacity key={i} onPress={() => onWordPress(clean, sentence)} activeOpacity={0.7}>
              <View style={[styles.wordWrap, isSaved && styles.savedWrap, isSelected && styles.selectedWrap]}>
                <Text style={[styles.word, isRead && styles.wordRead, isSelected && styles.selectedWord]}>
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 3,
    marginHorizontal: 12,
    marginBottom: 4,
  },
  active: {
    backgroundColor: colors.forestGreenLight,
    borderWidth: 1,
    borderColor: colors.forestGreen,
  },
  read: {
    opacity: 0.65,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  wordWrap: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#2c4a2e',
    borderStyle: 'dotted',
    marginBottom: 2,
  },
  savedWrap: {
    borderBottomColor: colors.gold,
  },
  selectedWrap: {
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderBottomColor: colors.forestGreen,
  },
  word: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    lineHeight: 26,
    color: colors.ink,
  },
  wordRead: {
    color: colors.ink,
  },
  selectedWord: {
    fontFamily: 'CrimsonText_600SemiBold',
    color: colors.forestGreen,
  },
});
