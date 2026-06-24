import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import OrnamentDivider from '../components/OrnamentDivider';
import XPBurst from '../components/XPBurst';
import AchievementModal from '../components/AchievementModal';
import { getWordsForReview, updateWordSRS, getSavedWords, getGameData, saveGameData, getWordMastery } from '../services/storageService';
import { addXP, addGems, getMasteryLevel, isArticleMastered, MASTERY_NAMES } from '../services/gamificationService';
import { colors } from '../theme/colors';

const GRADES = [
  { grade: 0, label: 'Снова',  color: '#b03030', xp: 0 },
  { grade: 2, label: 'Сложно', color: '#b06020', xp: 2 },
  { grade: 4, label: 'Хорошо', color: '#2d6e2b', xp: 5 },
  { grade: 5, label: 'Легко',  color: '#a07c20', xp: 8 },
];

const SESSION_LIMIT = 20; // max cards per review session

function formatNextReview(grade, interval) {
  if (grade <= 1) return 'завтра';
  if (interval === 1) return 'завтра';
  if (interval < 7) return `через ${interval} дн.`;
  if (interval < 30) return `через ${Math.round(interval / 7)} нед.`;
  return `через ${Math.round(interval / 30)} мес.`;
}

export default function ReviewScreen({ navigation }) {
  const [cards, setCards]       = useState([]);
  const [current, setCurrent]   = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone]         = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpBursts, setXpBursts] = useState([]);
  const [masteredScrolls, setMasteredScrolls] = useState([]);
  const [pendingAchievements, setPendingAchievements] = useState([]);

  const revealAnim = useRef(new Animated.Value(0)).current;
  const masteredIdsRef = useRef(new Set());
  const newMasteredRef = useRef([]);  // scrolls newly mastered THIS session
  const wordMasteryRef = useRef({});  // global lookup counts for isArticleMastered

  useEffect(() => { loadCards(); }, []);

  async function loadCards() {
    const [all, game, wm] = await Promise.all([getWordsForReview(), getGameData(), getWordMastery()]);
    masteredIdsRef.current = new Set(game.stats?.masteredArticleIds || []);
    newMasteredRef.current = [];
    wordMasteryRef.current = wm;
    setCards(all.slice(0, SESSION_LIMIT));
    setCurrent(0);
    setRevealed(false);
    setDone(false);
    setXpEarned(0);
    setMasteredScrolls([]);
    revealAnim.setValue(0);
  }

  function showReveal() {
    setRevealed(true);
    Animated.timing(revealAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }

  async function handleGrade(gradeObj) {
    const item = cards[current];
    const { grade, xp } = gradeObj;

    await updateWordSRS(item.articleId, item.word, grade);

    // Check article mastery — deduplicated across sessions via masteredIdsRef
    const allWords = await getSavedWords(item.articleId);
    if (isArticleMastered(allWords, wordMasteryRef.current) && !masteredIdsRef.current.has(item.articleId)) {
      masteredIdsRef.current.add(item.articleId);
      const scroll = { id: item.articleId, title: item.articleTitle };
      newMasteredRef.current = [...newMasteredRef.current, scroll];
      setMasteredScrolls(prev => [...prev, scroll]);
    }

    // Always count the SRS review; only add XP if earned
    const result = await addXP(xp, { srsReview: 1 });
    if (xp > 0) {
      const id = Date.now() + Math.random();
      setXpBursts(prev => [...prev, { id, amount: xp }]);
      setXpEarned(prev => prev + xp);
    }

    // Advance
    revealAnim.setValue(0);
    setRevealed(false);
    const nextIdx = current + 1;
    if (nextIdx < cards.length) {
      setCurrent(nextIdx);
    } else {
      // Award newly mastered scrolls and persist all IDs
      if (newMasteredRef.current.length > 0) {
        const game = await getGameData();
        game.stats.masteredArticleIds = [...masteredIdsRef.current];
        await saveGameData(game);
        const allUnlocked = [];
        for (const _scroll of newMasteredRef.current) {
          const masteryResult = await addXP(200);
          if (masteryResult.newlyUnlocked?.length > 0) allUnlocked.push(...masteryResult.newlyUnlocked);
          await addGems(100);
        }
        if (allUnlocked.length > 0) setPendingAchievements(allUnlocked);
      }
      setDone(true);
    }
  }

  function goBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }

  const topBar = (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={goBack} style={styles.iconBtn}>
        <Ionicons name="chevron-back" size={22} color="#c4a96a" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>Свиток Памяти</Text>
      {!done && cards.length > 0 && (
        <Text style={styles.progress}>{current + 1}/{cards.length}</Text>
      )}
      {(done || cards.length === 0) && <View style={styles.iconBtn} />}
    </View>
  );

  // ── Empty ──────────────────────────────────────────────────────────────────
  if (cards.length === 0 && !done) {
    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyIcon}>📜</Text>
          <Text style={styles.emptyTitle}>Свиток Памяти пуст</Text>
          <OrnamentDivider />
          <Text style={styles.emptyBody}>
            Сохраняй слова во время чтения —{'\n'}они появятся здесь для повторения.{'\n\n'}
            Каждое слово возвращается ровно тогда,{'\n'}когда ты вот-вот забудешь его.
          </Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>Вернуться к свиткам</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  if (done) {
    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.doneWrap}>
          <Text style={styles.doneIcon}>✦</Text>
          <Text style={styles.doneTitle}>Повторение завершено</Text>
          <Text style={styles.doneXP}>+{xpEarned} XP</Text>
          <Text style={styles.doneCount}>Пройдено {cards.length} слов</Text>

          {masteredScrolls.length > 0 && (
            <View style={styles.masteredBox}>
              <OrnamentDivider />
              {masteredScrolls.map(s => (
                <View key={s.id} style={styles.masteredRow}>
                  <Text style={styles.masteredIcon}>📜</Text>
                  <View>
                    <Text style={styles.masteredTitle}>Свиток освоен!</Text>
                    <Text style={styles.masteredName} numberOfLines={1}>{s.title}</Text>
                    <Text style={styles.masteredBonus}>+200 XP · +100 ◈</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <OrnamentDivider />
          <TouchableOpacity style={styles.restartBtn} onPress={loadCards}>
            <Text style={styles.restartBtnText}>Повторить ещё</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 14 }} onPress={goBack}>
            <Text style={styles.homeLinkText}>Вернуться</Text>
          </TouchableOpacity>
        </View>

        {xpBursts.map(b => (
          <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
        ))}
        {pendingAchievements.length > 0 && (
          <AchievementModal achievements={pendingAchievements} onClose={() => setPendingAchievements([])} />
        )}
      </SafeAreaView>
    );
  }

  // ── Card ───────────────────────────────────────────────────────────────────
  const item = cards[current];
  const level = getMasteryLevel(item.data, 0);

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      {topBar}

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.round(((current + 1) / cards.length) * 100)}%` }]} />
      </View>

      <View style={styles.cardArea}>
        {/* Mastery badge */}
        <Text style={styles.levelBadge}>
          {'◆'.repeat(level)}{'◇'.repeat(5 - level)}  {MASTERY_NAMES[level]}
        </Text>

        {/* Article source */}
        <Text style={styles.articleSource} numberOfLines={1}>{item.articleTitle}</Text>

        <OrnamentDivider />

        {/* Word — always visible */}
        <Text style={styles.cardWord}>{item.word}</Text>

        {!revealed ? (
          <>
            <Text style={styles.transcriptionPlaceholder}>
              {item.data?.transcription ? item.data.transcription : ''}
            </Text>
            <TouchableOpacity style={styles.revealBtn} onPress={showReveal}>
              <Text style={styles.revealBtnText}>Показать перевод</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View style={{ opacity: revealAnim }}>
            <Text style={styles.transcription}>{item.data?.transcription}</Text>
            <Text style={styles.translation}>{item.data?.translation}</Text>
            {item.data?.explanation ? (
              <Text style={styles.explanation} numberOfLines={3}>{item.data.explanation}</Text>
            ) : null}

            <OrnamentDivider />

            {/* Grade buttons */}
            <View style={styles.gradeRow}>
              {GRADES.map(g => (
                <TouchableOpacity
                  key={g.grade}
                  style={[styles.gradeBtn, { backgroundColor: g.color }]}
                  onPress={() => handleGrade(g)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.gradeBtnText}>{g.label}</Text>
                  {g.xp > 0 && <Text style={styles.gradeBtnXP}>+{g.xp}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      </View>

      {xpBursts.map(b => (
        <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
      ))}
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
  iconBtn: { padding: 6, width: 50 },
  topTitle: {
    flex: 1,
    fontFamily: 'Almendra_400Regular',
    fontSize: 16,
    color: '#f0e6c8',
    textAlign: 'center',
  },
  progress: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 12,
    color: '#c4a96a',
    width: 50,
    textAlign: 'right',
  },
  progressBg: {
    height: 4,
    backgroundColor: colors.parchmentBorder,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gold,
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  levelBadge: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 4,
  },
  articleSource: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardWord: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    marginVertical: 12,
  },
  transcriptionPlaceholder: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: 24,
    minHeight: 20,
  },
  revealBtn: {
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: colors.forestGreen,
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 4,
  },
  revealBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
    letterSpacing: 0.4,
  },
  transcription: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 14,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: 4,
  },
  translation: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  explanation: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 4,
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 4,
  },
  gradeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    maxWidth: 80,
  },
  gradeBtnText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 13,
    color: '#f0e6c8',
  },
  gradeBtnXP: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 10,
    color: '#f0e6c880',
    marginTop: 2,
  },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: { fontSize: 52, marginBottom: 16 },
  emptyTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 22,
    color: colors.ink,
    marginBottom: 12,
  },
  emptyBody: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 16,
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 4,
    marginTop: 8,
  },
  backBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: colors.inkMuted,
  },

  // Done
  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  doneIcon: { fontSize: 48, color: colors.gold, marginBottom: 12 },
  doneTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 24,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  doneXP: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 38,
    color: colors.forestGreen,
    marginBottom: 4,
  },
  doneCount: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    marginBottom: 12,
  },
  masteredBox: { width: '100%', marginBottom: 8 },
  masteredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eef5ea',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.forestGreen,
    padding: 12,
    marginBottom: 8,
  },
  masteredIcon: { fontSize: 28 },
  masteredTitle: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 11,
    color: colors.forestGreen,
    letterSpacing: 1,
  },
  masteredName: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginTop: 2,
  },
  masteredBonus: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 12,
    color: colors.gold,
    marginTop: 2,
  },
  restartBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: 8,
  },
  restartBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
  homeLinkText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },
});
