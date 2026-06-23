import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform,
  Animated, PanResponder, Dimensions,
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
  getWordMastery, incrementWordMastery,
  getSettings,
} from '../services/storageService';
import { explainWord, extractContext as deriveContext } from '../services/anthropicService';
import { addXP, addGems } from '../services/gamificationService';
import { colors } from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

const PARCHMENT_BG = Platform.OS === 'web'
  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.055'/%3E%3C/svg%3E")`
  : null;

function toRoman(n) {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1];
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];
  let r = '';
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { r += syms[i]; n -= vals[i]; }
  }
  return r;
}

export default function ReadingScreen({ route, navigation }) {
  const { articleId } = route.params;

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
  const [wordMastery, setWordMastery] = useState({});
  const [quietMode, setQuietMode] = useState(false);
  const sessionSentencesRef = useRef(0);  // for 30-sentence gem bonus
  const sessionGemBonusGiven = useRef(false);
  const completedArticlesRef = useRef(new Set());  // dedup article-complete reward

  const slideX = useRef(new Animated.Value(0)).current;
  const currentIdxRef = useRef(0);
  const articleRef = useRef(null);

  // Keep refs in sync for PanResponder closures
  useEffect(() => { currentIdxRef.current = currentIdx; }, [currentIdx]);
  useEffect(() => { articleRef.current = article; }, [article]);

  // Keyboard nav (web)
  const handleNextRef = useRef();
  const handleBackRef = useRef();
  useEffect(() => { handleNextRef.current = handleNext; handleBackRef.current = handleBack; });
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleNextRef.current?.();
      else if (e.key === 'ArrowLeft') handleBackRef.current?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Swipe gesture (no ScrollView conflict in single-sentence mode)
  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, { dx, dy }) =>
      Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy) * 1.5,
    onPanResponderRelease: (_, { dx }) => {
      if (dx < -60) handleNextRef.current?.();
      else if (dx > 60) handleBackRef.current?.();
    },
  })).current;

  useEffect(() => { loadArticle(); }, [articleId]);

  async function loadArticle() {
    const [list, settings] = await Promise.all([getArticles(), getSettings()]);
    setQuietMode(!!settings.quietMode);
    const found = list.find(a => a.id === articleId);
    if (!found) return;
    setArticle(found);
    const prog = await getProgress(articleId);
    setCurrentIdx(prog);
    currentIdxRef.current = prog;
    const words = await getSavedWords(articleId);
    setSavedWords(words);
    const mastery = await getWordMastery();
    setWordMastery(mastery);
  }

  function animateTo(newIdx, direction) {
    const dist = SCREEN_WIDTH * 0.85;
    Animated.timing(slideX, {
      toValue: -direction * dist,
      duration: 210,
      useNativeDriver: true,
    }).start(() => {
      setCurrentIdx(newIdx);
      slideX.setValue(direction * dist);
      Animated.timing(slideX, {
        toValue: 0,
        duration: 210,
        useNativeDriver: true,
      }).start();
    });
  }

  function showXPBurst(amount, options = {}) {
    if (quietMode && !options.force) return;
    const id = Date.now() + Math.random();
    setXpBursts(prev => [...prev, { id, amount, ...options }]);
  }

  async function handleWordPress(clean, sentence) {
    if (!clean || clean.length < 2) return;
    setShowHint(false);
    setSelectedWord(clean);
    setDrawerVisible(true);

    const newCount = await incrementWordMastery(clean);
    setWordMastery(prev => ({ ...prev, [clean]: newCount }));

    const cached = savedWords[clean];
    if (cached) {
      const { contextBefore, contextAfter } = deriveContext(clean, sentence);
      setWordData({ ...cached, contextBefore, contextAfter });
      setDrawerLoading(false);
      const result = await addXP(1, { wordsLookedUp: 1 });
      showXPBurst(result.earnedXP || 1);
      if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
      return;
    }

    setWordData(null);
    setDrawerLoading(true);
    const result = await addXP(1, { wordsLookedUp: 1 });
    showXPBurst(result.earnedXP || 1);
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
    const result = await addXP(5, { wordsTotal: 1, wordsSaved: 1 });
    showXPBurst(5);
    if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
  }

  async function handleNext() {
    const art = articleRef.current;
    const idx = currentIdxRef.current;
    if (!art || idx >= art.sentences.length - 1) return;
    const next = idx + 1;
    animateTo(next, 1);
    await saveProgress(articleId, next);
    const result = await addXP(2, { sentencesRead: 1 });
    if (result.isFirstSentenceBonus) {
      showXPBurst(result.earnedXP, { label: `Добро пожаловать! +${result.earnedXP} XP` });
    } else if (result.isCrit) {
      showXPBurst(result.earnedXP, { crit: true });
    } else {
      showXPBurst(result.earnedXP || 2);
    }
    if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
    if (result.newRecord) {
      showXPBurst(result.newRecord.value, { force: true, label: `🏆 Рекорд дня: ${result.newRecord.value} предл.` });
    }
    // 30-sentence session bonus (once per session)
    sessionSentencesRef.current += 1;
    if (sessionSentencesRef.current === 30 && !sessionGemBonusGiven.current) {
      sessionGemBonusGiven.current = true;
      await addGems(25);
      showXPBurst(25, { label: '◈ +25 за выносливость!' });
    }

    if (next === art.sentences.length - 1 && !completedArticlesRef.current.has(articleId)) {
      completedArticlesRef.current.add(articleId);
      const res = await addXP(50, { articlesTotal: 1 });
      showXPBurst(50);
      await addGems(100);
      if (res.newlyUnlocked.length > 0) setPendingAchievements(a => [...a, ...res.newlyUnlocked]);
      // Sage Challenge: every 3rd article completed
      if (res.articlesTotal > 0 && res.articlesTotal % 3 === 0) {
        setTimeout(() => navigation.navigate('Quiz', { articleId, sageChallenge: true }), 1800);
      }
    }
  }

  async function handleBack() {
    const idx = currentIdxRef.current;
    if (idx === 0) return;
    const prev = idx - 1;
    animateTo(prev, -1);
    await saveProgress(articleId, prev);
  }

  function handleGoBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }

  if (!article) return null;

  const total = article.sentences.length;
  const progress = (currentIdx + 1) / total;
  const sentence = article.sentences[currentIdx];

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
        <View style={[styles.progressBarFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>

      <OrnamentDivider />

      {/* Sentence area — swipeable */}
      <View
        style={[
          styles.sentenceArea,
          Platform.OS === 'web' && {
            backgroundImage: PARCHMENT_BG,
            backgroundRepeat: 'repeat',
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View style={[styles.sentenceSlide, { transform: [{ translateX: slideX }] }]}>
          {/* Roman numeral chapter label */}
          <Text style={styles.scrollLabel}>Свиток {toRoman(currentIdx + 1)}</Text>

          <SentenceBlock
            sentence={sentence}
            selectedWord={selectedWord}
            savedWords={savedWords}
            onWordPress={handleWordPress}
            wordMastery={wordMastery}
          />

          {showHint && currentIdx === 0 && (
            <Text style={styles.hintText}>
              Нажми на слово — узнай значение
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleBack}
          disabled={currentIdx === 0}
          activeOpacity={0.55}
        >
          <Text style={[styles.navArrowGlyph, currentIdx === 0 && styles.navArrowDisabled]}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.pageCounter}>{currentIdx + 1} / {total}</Text>

        <TouchableOpacity
          style={styles.navArrow}
          onPress={handleNext}
          disabled={currentIdx === total - 1}
          activeOpacity={0.55}
        >
          <Text style={[styles.navArrowGlyph, currentIdx === total - 1 && styles.navArrowDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {xpBursts.map(b => (
        <XPBurst
          key={b.id}
          amount={b.amount}
          crit={b.crit}
          label={b.label}
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
        mastery={selectedWord ? (wordMastery[selectedWord] || 0) : 0}
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
    fontFamily: 'Cinzel_400Regular',
    fontSize: 12,
    color: '#f0e6c8',
    textAlign: 'center',
    marginHorizontal: 4,
    letterSpacing: 0.5,
  },
  quizBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#c4a96a70',
    borderRadius: 3,
    minWidth: 44,
    alignItems: 'center',
  },
  quizBtnText: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: '#c4a96a',
    letterSpacing: 0.5,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e0d8c4',
  },
  progressBarFill: {
    height: 5,
    backgroundColor: colors.gold,
  },
  sentenceArea: {
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sentenceSlide: {
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  scrollLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: colors.goldLight,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 20,
  },
  hintText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.8,
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#d4b87030',
    backgroundColor: colors.parchment,
  },
  navArrow: {
    width: 60,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navArrowGlyph: {
    fontSize: 44,
    color: colors.gold,
    fontFamily: 'CrimsonText_400Regular',
    lineHeight: 52,
    includeFontPadding: false,
  },
  navArrowDisabled: {
    color: '#d4c9a850',
  },
  pageCounter: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 12,
    color: colors.inkFaint,
    letterSpacing: 1,
  },
});
