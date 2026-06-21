import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Animated, ActivityIndicator, TouchableWithoutFeedback, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from './OrnamentDivider';
import { colors } from '../theme/colors';

function speakWord(word) {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
    const utt = new window.SpeechSynthesisUtterance(word);
    utt.lang = 'en-US';
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
  }
}

export default function WordDrawer({ visible, wordData, word, loading, isSaved, onSave, onClose }) {
  const slideY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
    } else {
      Animated.timing(slideY, { toValue: 300, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateY: slideY }] }]}>
        <View style={styles.handle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <OrnamentDivider style={styles.divider} />

          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={colors.forestGreen} size="large" />
              <Text style={styles.loadingText}>Листаю свиток заклинаний…</Text>
            </View>
          ) : wordData ? (
            <>
              <View style={styles.titleRow}>
                <Text style={styles.wordTitle}>{wordData.baseForm || word}</Text>
                {Platform.OS === 'web' && (
                  <TouchableOpacity
                    onPress={() => speakWord(wordData.baseForm || word)}
                    style={styles.speakBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="volume-medium-outline" size={20} color={colors.forestGreen} />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.transcription}>{wordData.transcription}</Text>

              {wordData.grammaticalForm ? (
                <View style={styles.gramBadge}>
                  <Text style={styles.gramText}>{wordData.grammaticalForm}</Text>
                </View>
              ) : null}

              <Text style={styles.translation}>{wordData.translation}</Text>

              {wordData.explanation ? (
                <Text style={styles.explanation}>{wordData.explanation}</Text>
              ) : null}

              {(wordData.contextBefore || wordData.contextAfter) ? (
                <View style={styles.contextBlock}>
                  <Text style={styles.contextText}>
                    <Text>{wordData.contextBefore ? wordData.contextBefore + ' ' : ''}</Text>
                    <Text style={styles.contextHighlight}>{wordData.baseForm || word}</Text>
                    <Text>{wordData.contextAfter ? ' ' + wordData.contextAfter : ''}</Text>
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.saveBtn, isSaved && styles.saveBtnDone]}
                onPress={!isSaved ? onSave : undefined}
                activeOpacity={isSaved ? 1 : 0.8}
              >
                <Text style={[styles.saveBtnText, isSaved && styles.saveBtnDoneText]}>
                  {isSaved ? 'Заклинание встречено ✓' : '✦ Добавить в свиток заклинаний'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.errorText}>Слово не найдено в свитке</Text>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000040',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '58%',
    backgroundColor: colors.parchment,
    borderTopWidth: 2,
    borderTopColor: colors.gold,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.goldFaint,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
  },
  content: {
    padding: 20,
    paddingTop: 4,
  },
  divider: {
    marginBottom: 12,
  },
  loadingBlock: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordTitle: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 22,
    color: colors.ink,
    flex: 1,
  },
  speakBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: colors.goldLight,
    borderRadius: 20,
    backgroundColor: colors.parchmentDark,
  },
  transcription: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 2,
    marginBottom: 8,
  },
  gramBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.correct,
    borderWidth: 1,
    borderColor: '#2c4a2e40',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  gramText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.forestGreen,
  },
  translation: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 17,
    color: colors.ink,
    marginBottom: 6,
  },
  explanation: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  contextBlock: {
    backgroundColor: colors.parchmentDark,
    borderLeftWidth: 2,
    borderLeftColor: colors.forestGreen,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 2,
    marginBottom: 16,
  },
  contextText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
  },
  contextHighlight: {
    fontFamily: 'CrimsonText_600SemiBold',
    color: colors.forestGreen,
  },
  errorText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 14,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  saveBtn: {
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDone: {
    backgroundColor: '#aaaaaa',
  },
  saveBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: '#f0e6c8',
  },
  saveBtnDoneText: {
    color: '#eeeeee',
  },
});
