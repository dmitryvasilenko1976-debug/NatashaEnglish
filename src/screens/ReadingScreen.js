import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform,
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

// SVG fractalNoise parchment texture (web only)
const PARCHMENT_BG = Platform.OS === 'web'
  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`
  : null;

export default function ReadingScreen({ route, navigation }) {
  const { articleId } = route.params;
  const scrollRef = useRef(null);
  const sentenceYRef = useRef({});

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

  // Auto-scroll to active sentence
  useEffect(() => {
    const y = sentenceYRef.current[currentIdx];
    if (y !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, y - 24), animated: true });
    }
  }, [currentIdx]);

  // Keyboard navigation (web)
  const handleNextRef = useRef();
  const handleBackRef = useRef();
  useEffect(() => {
    handleNextRef.current = handleNext;
    handleBackRef.current = handleBack;
  });
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleNextRef.current?.();
      else if (e.key === 'ArrowLeft') handleBackRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
    } catch {
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
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
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
          style={styles.quizBtn}
        >
          <Text style={styles.quizBtnText}>Квиз</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <OrnamentDivider />

      {/* Content */}
      <View style={styles.contentFrame}>
        <View style={styles.marginLine} />
        <ScrollView
          ref={scrollRef}
          style={[
            styles.scroll,
            Platform.OS === 'web' && {
              overflowY: 'scroll',
              backgroundImage: PARCHMENT_BG,
              backgroundRepeat: 'repeat',
            },
          ]}
          contentContainerStyle={styles.scrollContent}
        >
          {showHint && currentIdx === 0 && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>Нажми на слово — узнай значение. Стрелки ← → для навигации.</Text>
            </View>
          )}

          {article.sentences.map((sentence, idx) => (
            <View
              key={idx}
              onLayout={(e) => { sentenceYRef.current[idx] = e.nativeEvent.layout.y; }}
            >
              <SentenceBlock
                sentence={sentence}
                isActive={idx === currentIdx}
                isRead={idx < currentIdx}
                selectedWord={idx === currentIdx ? selectedWord : null}
                savedWords={savedWords}
                onWordPress={(clean, s) => handleWordPress(clean, s)}
              />
            </View>
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleBack}
          disabled={currentIdx === 0}
          activeOpacity={0.6}
        >
          <Text style={[styles.navArrowGlyph, currentIdx === 0 && styles.navArrowDisabled]}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.pageCounter}>{currentIdx + 1} / {total}</Text>

        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleNext}
          disabled={currentIdx === total - 1}
          activeOpacity={0.6}
        >
          <Text style={[styles.navArrowGlyph, currentIdx === total - 1 && styles.navArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

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
    backgroundColor: colors.parchment,
  },
  topBar: {
    backgroundColor: colors.forestGreen,
    borderBottomWidth: 2,
    borderBottomColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 6,
    minWidth: 36,
  },
  topTitle: {
    flex: 1,
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 14,
    color: '#f0e6c8',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  quizBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#c4a96a70',
    borderRadius: 3,
    minWidth: 36,
    alignItems: 'center',
  },
  quizBtnText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: '#c4a96a',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e0d8c4',
  },
  progressBarFill: {
    height: 5,
    backgroundColor: colors.gold,
  },
  contentFrame: {
    flex: 1,
    flexDirection: 'row',
  },
  marginLine: {
    width: 1.5,
    backgroundColor: '#d4b87028',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 9,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 8,
  },
  hintBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: colors.goldFaint,
    borderRadius: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hintText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#d4b87030',
    backgroundColor: colors.parchment,
  },
  navArrow: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowGlyph: {
    fontSize: 40,
    color: colors.gold,
    fontFamily: 'CrimsonText_400Regular',
    lineHeight: 48,
    includeFontPadding: false,
  },
  navArrowDisabled: {
    color: '#d4c9a860',
  },
  pageCounter: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 14,
    color: colors.inkFaint,
    letterSpacing: 0.5,
  },
});
