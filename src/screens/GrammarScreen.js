import React, { useState } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import { GRAMMAR_CATEGORIES } from '../data/grammarLessons';
import commonWords from '../data/commonWords';
import { colors } from '../theme/colors';

export default function GrammarScreen({ route, navigation }) {
  const initialExpanded = route?.params?.expandedId || null;
  const [expandedId, setExpandedId] = useState(initialExpanded);
  const [selectedWord, setSelectedWord] = useState(null);

  function toggle(id) {
    if (expandedId === id) {
      setExpandedId(null);
      setSelectedWord(null);
    } else {
      setExpandedId(id);
      setSelectedWord(null);
    }
  }

  function handleWordTap(word) {
    setSelectedWord(prev => prev === word ? null : word);
  }

  const expandedCategory = GRAMMAR_CATEGORIES.find(c => c.id === expandedId);

  return (
    <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Грамматика</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Базовая грамматика английского языка — служебные слова, которые встречаются в каждом медицинском тексте.
        </Text>

        <OrnamentDivider style={styles.divider} />

        {GRAMMAR_CATEGORIES.map(cat => {
          const isOpen = expandedId === cat.id;
          return (
            <View key={cat.id} style={[styles.card, isOpen && styles.cardOpen]}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => toggle(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.iconWrap, isOpen && styles.iconWrapOpen]}>
                  <Ionicons
                    name={cat.icon}
                    size={22}
                    color={isOpen ? '#f0e6c8' : colors.forestGreen}
                  />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.cardTitle, isOpen && styles.cardTitleOpen]}>
                    {cat.title}
                  </Text>
                  <Text style={styles.cardSubtitle}>{cat.subtitle}</Text>
                </View>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={isOpen ? colors.gold : colors.inkFaint}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.cardBody}>
                  <Text style={styles.lessonText}>{cat.lesson}</Text>

                  <OrnamentDivider style={styles.innerDivider} />

                  <Text style={styles.wordsLabel}>Слова раздела</Text>
                  <View style={styles.chipsWrap}>
                    {cat.words.map(w => (
                      <TouchableOpacity
                        key={w}
                        style={[styles.chip, selectedWord === w && styles.chipSelected]}
                        onPress={() => handleWordTap(w)}
                        activeOpacity={0.75}
                      >
                        <Text style={[styles.chipText, selectedWord === w && styles.chipTextSelected]}>
                          {w}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {selectedWord && commonWords[selectedWord] && (
                    <View style={styles.miniCard}>
                      <View style={styles.miniCardRow}>
                        <Text style={styles.miniWord}>{commonWords[selectedWord].baseForm}</Text>
                        <Text style={styles.miniTranscription}>
                          {commonWords[selectedWord].transcription}
                        </Text>
                      </View>
                      {commonWords[selectedWord].grammaticalForm ? (
                        <View style={styles.gramBadge}>
                          <Text style={styles.gramText}>
                            {commonWords[selectedWord].grammaticalForm}
                          </Text>
                        </View>
                      ) : null}
                      <Text style={styles.miniTranslation}>
                        {commonWords[selectedWord].translation}
                      </Text>
                      {commonWords[selectedWord].explanation ? (
                        <Text style={styles.miniExplanation}>
                          {commonWords[selectedWord].explanation}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.quizBtn}
                    onPress={() => navigation.navigate('GrammarQuiz', { categoryId: cat.id })}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="help-circle-outline" size={16} color="#f0e6c8" />
                    <Text style={styles.quizBtnText}>Пройти тест по разделу</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <OrnamentDivider style={styles.divider} />

        <TouchableOpacity
          style={styles.fullQuizBtn}
          onPress={() => navigation.navigate('GrammarQuiz', {})}
          activeOpacity={0.85}
        >
          <Ionicons name="flash-outline" size={18} color="#f0e6c8" />
          <Text style={styles.fullQuizText}>Тест по всем разделам</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
    </ParchmentBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },

  topBar: {
    backgroundColor: colors.forestGreen,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: { padding: 6, width: 36 },
  topTitle: {
    flex: 1,
    fontFamily: 'Almendra_400Regular',
    fontSize: 18,
    color: '#f0e6c8',
    textAlign: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  intro: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  divider: { marginVertical: 16 },
  innerDivider: { marginVertical: 12 },

  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  cardOpen: {
    borderColor: colors.gold,
    borderWidth: 1.5,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.forestGreen + '40',
    backgroundColor: colors.forestGreenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOpen: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.gold,
  },
  cardHeaderText: { flex: 1 },
  cardTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 16,
    color: colors.ink,
    marginBottom: 2,
  },
  cardTitleOpen: { color: colors.forestGreen },
  cardSubtitle: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
  },

  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.goldFaint,
  },

  lessonText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 21,
    marginTop: 14,
  },

  wordsLabel: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    marginBottom: 10,
  },

  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: colors.forestGreen,
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.inkMuted,
  },
  chipTextSelected: {
    color: '#f0e6c8',
    fontFamily: 'CrimsonText_600SemiBold',
  },

  miniCard: {
    marginTop: 10,
    marginBottom: 4,
    backgroundColor: colors.parchmentDark,
    borderLeftWidth: 3,
    borderLeftColor: colors.forestGreen,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  miniCardRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  miniWord: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 18,
    color: colors.ink,
  },
  miniTranscription: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
  gramBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.correct,
    borderWidth: 1,
    borderColor: colors.forestGreen + '40',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 6,
  },
  gramText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.forestGreen,
  },
  miniTranslation: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 4,
  },
  miniExplanation: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },

  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    backgroundColor: colors.forestGreen,
    paddingVertical: 11,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  quizBtnText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 14,
    color: '#f0e6c8',
  },

  fullQuizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.inkMuted,
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: 8,
  },
  fullQuizText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: '#f0e6c8',
    letterSpacing: 0.3,
  },
});
