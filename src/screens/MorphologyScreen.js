import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import { MORPHOLOGY_CATEGORIES } from '../data/morphologyLessons';
import { colors } from '../theme/colors';

export default function MorphologyScreen({ route, navigation }) {
  const initialExpanded = route?.params?.expandedId || null;
  const [expandedId, setExpandedId] = useState(initialExpanded);

  function toggle(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Морфология</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Строительные блоки медицинских слов — зная ~50 морфем, вы поймёте тысячи терминов
        </Text>

        <OrnamentDivider style={styles.divider} />

        {MORPHOLOGY_CATEGORIES.map(cat => {
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
                  {cat.entries.map((entry, idx) => (
                    <View key={idx} style={styles.entryBlock}>
                      <View style={styles.morphemeChip}>
                        <Text style={styles.morphemeText}>{entry.morpheme}</Text>
                      </View>
                      <Text style={styles.meaningText}>{entry.meaning}</Text>
                      <View style={styles.examplesRow}>
                        {entry.examples.map((ex, ei) => (
                          <View key={ei} style={styles.examplePill}>
                            <Text style={styles.examplePillText}>{ex}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.tipBox}>
                        <Ionicons name="bulb-outline" size={13} color={colors.inkFaint} style={{ marginRight: 5, marginTop: 1 }} />
                        <Text style={styles.tipText}>{entry.tip}</Text>
                      </View>
                      {idx < cat.entries.length - 1 && (
                        <View style={styles.entryDivider} />
                      )}
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.quizBtn}
                    onPress={() => navigation.navigate('MorphologyQuiz', { categoryId: cat.id })}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="help-circle-outline" size={16} color="#f0e6c8" />
                    <Text style={styles.quizBtnText}>Тест</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <OrnamentDivider style={styles.divider} />

        <TouchableOpacity
          style={styles.fullQuizBtn}
          onPress={() => navigation.navigate('MorphologyQuiz', {})}
          activeOpacity={0.85}
        >
          <Ionicons name="flash-outline" size={18} color="#f0e6c8" />
          <Text style={styles.fullQuizText}>Тест по всем морфемам</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchmentDark },

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
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.goldFaint,
  },

  entryBlock: {
    marginTop: 14,
  },
  morphemeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.forestGreen,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
  },
  morphemeText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 18,
    color: '#f0e6c8',
    letterSpacing: 0.3,
  },
  meaningText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 14,
    color: colors.inkMuted,
    marginBottom: 8,
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  examplePill: {
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  examplePillText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.inkMuted,
  },
  tipBox: {
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.goldFaint,
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
    lineHeight: 18,
  },
  entryDivider: {
    height: 1,
    backgroundColor: colors.parchmentBorder,
    marginTop: 14,
  },

  quizBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
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
