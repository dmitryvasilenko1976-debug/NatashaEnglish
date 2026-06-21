import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import SentenceBlock from '../components/SentenceBlock';
import WordDrawer from '../components/WordDrawer';
import AchievementModal from '../components/AchievementModal';
import XPBurst from '../components/XPBurst';
import OrnamentDivider from '../components/OrnamentDivider';
import {
  getArticles, getSavedWords, saveWord,
  getProgress, saveProgress,
} from '../services/storageService';
import { explainWord } from '../services/anthropicService';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

export default function ReadingScreen({ route, navigation }) {
  const { articleId } = route.params;
  const scrollRef = useRef(null);

  const [article, setArticle] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [savedWords, setSavedWords] = useState({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordData, setWordData] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [xpBursts, setXpBursts] = useState([]);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  async function loadArticle() {
    const list = await getArticles();
    const found = list.find(a => a.id === articleId);
    if (!found) return;
    setArticle(found);

    const prog = await getProgress(articleId);
    setCurrentIdx(prog);

    const words = await getSavedWords(articleId);
    setSavedWords(words);
  }

  function showXPBurst(amount) {
    const id = Date.now();
    setXpBursts(prev => [...prev, { id, amount }]);
  }

  async function handleWordPress(clean, sentence) {
    if (!clean || clean.length < 2) return;
    setShowHint(false);
    setSelectedWord(clean);
    setDrawerVisible(true);

    const cached = savedWords[clean];
    if (cached) {
      setWordData(cached);
      setDrawerLoading(false);
      const result = await addXP(1);
      showXPBurst(1);
      if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
      return;
    }

    setWordData(null);
    setDrawerLoading(true);

    const result = await addXP(1);
    showXPBurst(1);
    if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);

    try {
      const data = await explainWord(clean, sentence);
      setWordData(data);
    } catch (e) {
      setWordData(null);
    } finally {
      setDrawerLoading(false);
    }
  }

  async function handleSaveWord() {
    if (!selectedWord || !wordData) return;
    await saveWord(articleId, selectedWord, wordData);
    const updated = await getSavedWords(articleId);
    setSavedWords(updated);

    const result = await addXP(5, { wordsTotal: 1 });
    showXPBurst(5);
    if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
  }

  async function handleNext() {
    if (!article) return;
    const next = Math.min(currentIdx + 1, article.sentences.length - 1);
    setCurrentIdx(next);
    await saveProgress(articleId, next);

    const result = await addXP(2);
    showXPBurst(2);
    if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);

    if (next === article.sentences.length - 1) {
      const res = await addXP(50, { articlesTotal: 1 });
      showXPBurst(50);
      if (res.newlyUnlocked.length > 0) setPendingAchievements(a => [...a, ...res.newlyUnlocked]);
    }
  }

  async function handleBack() {
    if (!article) return;
    const prev = Math.max(currentIdx - 1, 0);
    setCurrentIdx(prev);
    await saveProgress(articleId, prev);
  }

  function handleGoBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }

  if (!article) return null;

  const total = article.sentences.length;
  const progress = Math.round(((currentIdx + 1) / total) * 100);

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleGoBack} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{article.title}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Quiz', { articleId })}
          style={styles.iconBtn}
        >
          <Ionicons name="color-wand-outline" size={22} color="#c4a96a" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      {/* Navigation row */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navBtn} onPress={handleBack} disabled={currentIdx === 0}>
          <Text style={[styles.navBtnText, currentIdx === 0 && styles.navBtnDisabled]}>← Назад</Text>
        </TouchableOpacity>

        <Text style={styles.progress}>{currentIdx + 1} / {total}</Text>

        <TouchableOpacity style={styles.navBtn} onPress={handleNext} disabled={currentIdx === total - 1}>
          <Text style={[styles.navBtnText, currentIdx === total - 1 && styles.navBtnDisabled]}>Вперёд →</Text>
        </TouchableOpacity>
      </View>

      <OrnamentDivider />

      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, Platform.OS === 'web' && { overflowY: 'scroll' }]}
        contentContainerStyle={styles.scrollContent}
      >
        {showHint && currentIdx === 0 && (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>💡 Нажми на любое слово чтобы узнать его значение</Text>
          </View>
        )}

        {article.sentences.map((sentence, idx) => (
          <SentenceBlock
            key={idx}
            sentence={sentence}
            isActive={idx === currentIdx}
            isRead={idx < currentIdx}
            selectedWord={idx === currentIdx ? selectedWord : null}
            savedWords={savedWords}
            onWordPress={(clean, s) => handleWordPress(clean, s)}
          />
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>

      {xpBursts.map(b => (
        <XPBurst
          key={b.id}
          amount={b.amount}
          onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))}
        />
      ))}

      <WordDrawer
        visible={drawerVisible}
        word={selectedWord}
        wordData={wordData}
        loading={drawerLoading}
        isSaved={!!savedWords[selectedWord]}
        onSave={handleSaveWord}
        onClose={() => setDrawerVisible(false)}
      />

      {pendingAchievements.length > 0 && (
        <AchievementModal
          achievements={pendingAchievements}
          onClose={() => setPendingAchievements([])}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.parchmentDark,
  },
  topBar: {
    backgroundColor: colors.forestGreen,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
  },
  topTitle: {
    flex: 1,
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 14,
    color: '#f0e6c8',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: '#d4c9a8',
  },
  progressBarFill: {
    height: 3,
    backgroundColor: colors.forestGreen,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f0e4',
    borderBottomWidth: 1,
    borderBottomColor: colors.goldLight,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  navBtn: {
    backgroundColor: colors.parchmentDark,
    borderWidth: 1,
    borderColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
  },
  navBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.forestGreen,
  },
  navBtnDisabled: {
    color: '#ccc',
  },
  progress: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  hintBox: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: colors.goldLight,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
