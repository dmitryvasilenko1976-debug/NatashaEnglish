import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import { getArticles, getSavedWords } from '../services/storageService';
import { colors } from '../theme/colors';

export default function QuizSelectScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    const articles = await getArticles();
    const result = [];
    for (const a of articles) {
      const saved = await getSavedWords(a.id);
      result.push({ ...a, wordCount: Object.keys(saved).length });
    }
    result.sort((a, b) => b.wordCount - a.wordCount);
    setItems(result);
  }

  function handleGoBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Welcome');
  }

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Выбери свиток для испытания</Text>
        <View style={styles.iconBtn} />
      </View>

      <OrnamentDivider style={styles.divider} />

      <FlatList
        data={items}
        keyExtractor={a => a.id}
        style={Platform.OS === 'web' ? { overflowY: 'scroll' } : undefined}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const ready = item.wordCount >= 2;
          return (
            <TouchableOpacity
              style={[styles.card, !ready && styles.cardDim]}
              onPress={() => ready && navigation.navigate('Quiz', { articleId: item.id })}
              activeOpacity={ready ? 0.82 : 1}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardTag}>{item.tag || 'Педиатрия'}</Text>
                <Text style={[styles.cardTitle, !ready && styles.cardTitleDim]} numberOfLines={2}>
                  {item.title}
                </Text>
              </View>
              <View style={styles.cardRight}>
                {ready ? (
                  <>
                    <Text style={styles.wordCount}>{item.wordCount}</Text>
                    <Text style={styles.wordLabel}>слов</Text>
                    <Ionicons name="chevron-forward" size={14} color={colors.gold} style={{ marginTop: 4 }} />
                  </>
                ) : (
                  <Text style={styles.noWordsHint}>нет слов</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Сохрани хотя бы 2 слова в статье, чтобы пройти испытание
            </Text>
          </View>
        }
      />
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
  iconBtn: { width: 36, padding: 6 },
  topTitle: {
    flex: 1,
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 14,
    color: '#f0e6c8',
    textAlign: 'center',
  },
  divider: { marginVertical: 6 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },

  card: {
    flexDirection: 'row',
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  cardDim: { opacity: 0.45 },
  cardLeft: { flex: 1, marginRight: 12 },
  cardTag: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardTitle: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  cardTitleDim: { color: '#aaa' },

  cardRight: { alignItems: 'center', minWidth: 44 },
  wordCount: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 22,
    color: colors.forestGreen,
  },
  wordLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
  },
  noWordsHint: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: '#bbb',
    textAlign: 'center',
  },

  footer: {
    marginTop: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
