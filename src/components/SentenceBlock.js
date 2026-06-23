import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
            return <Text key={i} style={styles.word}>{raw} </Text>;
          }

          const isSaved = !!savedWords[clean];
          const isSelected = selectedWord === clean;

          return (
            <TouchableOpacity key={i} onPress={() => onWordPress(clean, sentence)} activeOpacity={0.75}>
              <View style={[
                styles.wordWrap,
                isSaved && !isSelected && styles.savedWrap,
                isSelected && styles.selectedWrap,
              ]}>
                <Text style={[
                  styles.word,
                  isSaved && !isSelected && styles.wordSaved,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    paddingLeft: 23,
    marginHorizontal: 8,
    marginBottom: 3,
    borderRadius: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  active: {
    backgroundColor: '#fffbf0',
    borderLeftColor: colors.gold,
  },
  read: {
    opacity: 0.5,
  },
  words: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
  },
  wordWrap: {
    marginBottom: 1,
  },
  savedWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    borderStyle: 'solid',
  },
  selectedWrap: {
    backgroundColor: '#d4e8d4',
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  word: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 18,
    lineHeight: 33,
    color: colors.ink,
    ...(Platform.OS === 'web' && { letterSpacing: 0.15 }),
  },
  wordSaved: {
    color: colors.inkMuted,
  },
  wordSelected: {
    fontFamily: 'CrimsonText_600SemiBold',
    color: colors.forestGreen,
  },
});
