import React, { useEffect, useRef, useState } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Alert, Animated, Platform
} from 'react-native';
import Icon from '../components/Icon';

import OrnamentDivider from '../components/OrnamentDivider';
import AchievementModal from '../components/AchievementModal';
import XPBurst from '../components/XPBurst';
import { getSavedWords, getGameData, saveGameData, getRestoredHearts } from '../services/storageService';
import { playSound } from '../services/audioService';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(words) {
  const entries = Object.entries(words);
  if (entries.length < 2) return [];
  return shuffle(entries).map(([word, data]) => {
    const correct = data.translation;
    const distractors = entries
      .filter(([w]) => w !== word)   // filter by word key, not by shuffled index
      .map(([, d]) => d.translation)
      .filter(Boolean);
    const wrongOpts = shuffle(distractors).slice(0, 3);
    const options = shuffle([correct, ...wrongOpts]);
    return { word, correct, options, data };
  });
}

function buildRecallQuestions(words) {
  const entries = Object.entries(words);
  if (entries.length < 2) return [];
  return shuffle(entries).map(([word, data]) => {
    const correct = word; // English word to find
    const distractors = entries
      .filter(([w]) => w !== word)
      .map(([w]) => w);
    const wrongOpts = shuffle(distractors).slice(0, 3);
    const options = shuffle([correct, ...wrongOpts]);
    // word field = Russian translation (what to show as the prompt)
    return { word: data.translation || word, correct, options, data, isRecall: true };
  });
}

const MAX_HEARTS = 3;
const HEART_COST = 50;

export default function QuizScreen({ route, navigation }) {
  const { articleId, sageChallenge, recallMode } = route.params || {};

  const [questions, setQuestions]           = useState([]);
  const [current, setCurrent]               = useState(0);
  const [answered, setAnswered]             = useState(null);
  const [score, setScore]                   = useState(0);
  const [done, setDone]                     = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [xpBursts, setXpBursts]            = useState([]);
  const [hearts, setHearts]                 = useState(MAX_HEARTS);
  const [outOfHearts, setOutOfHearts]       = useState(false);
  const [minutesUntilHeart, setMinutesUntilHeart] = useState(120);
  const [sageIntro, setSageIntro]           = useState(!!sageChallenge);
  const [gems, setGems]                     = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadWords(); }, [articleId]);

  async function loadWords() {
    const game = await getGameData();
    const { hearts: restored, minutesUntilNext } = getRestoredHearts(game);
    if (restored !== game.quiz?.hearts) {
      game.quiz = { hearts: restored, lastHeartRestore: restored >= 3 ? null : game.quiz?.lastHeartRestore };
      await saveGameData(game);
    }
    setHearts(restored);
    setMinutesUntilHeart(minutesUntilNext);
    setGems(game.gems || 0);

    const words = await getSavedWords(articleId);
    const questions = recallMode ? buildRecallQuestions(words) : buildQuestions(words);
    setQuestions(questions);
    setCurrent(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
    setOutOfHearts(false);
  }

  function shakeHearts() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  }

  function showBurst(amount, options = {}) {
    const id = Date.now() + Math.random();
    setXpBursts(prev => [...prev, { id, amount, ...options }]);
  }

  async function handleAnswer(option) {
    if (answered !== null) return;
    const q = questions[current];
    const correct = option === q.correct;
    setAnswered(option);

    if (correct) {
      playSound('correct');
      const result = await addXP(10, { quizCorrect: 1 });
      showBurst(10);
      if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
      setScore(s => s + 1);
    } else {
      playSound('wrong');
      // Lose a heart
      const newHearts = hearts - 1;
      setHearts(newHearts);
      shakeHearts();
      const game = await getGameData();
      // Only start the 2-hour restoration timer when losing the first heart;
      // subsequent losses preserve the existing timer so elapsed time isn't wasted
      game.quiz = {
        hearts: newHearts,
        lastHeartRestore: hearts === MAX_HEARTS ? Date.now() : (game.quiz.lastHeartRestore || Date.now()),
      };
      await saveGameData(game);

      if (newHearts <= 0) {
        const { minutesUntilNext } = getRestoredHearts(game);
        setMinutesUntilHeart(minutesUntilNext || 120);
        setTimeout(() => setOutOfHearts(true), 900);
        return;
      }
    }

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setAnswered(null);
      } else {
        await finishQuiz(score + (correct ? 1 : 0));
      }
    }, 1200);
  }

  async function finishQuiz(finalScore) {
    const isSage = !!sageChallenge;
    let xpBonus = 25;
    let sageLabel = '';

    if (isSage) {
      const ratio = finalScore / questions.length;
      if (ratio >= 0.7) { xpBonus = 200; sageLabel = `✦ +${xpBonus} XP`; }
      else if (ratio >= 0.5) { xpBonus = 100; sageLabel = `+${xpBonus} XP`; }
      else { xpBonus = 0; }
    }

    if (xpBonus > 0) {
      const result = await addXP(xpBonus);
      showBurst(xpBonus, sageLabel ? { label: sageLabel } : {});
      if (result.newlyUnlocked.length > 0) setPendingAchievements(a => [...a, ...result.newlyUnlocked]);
    }
    setDone(true);
  }

  async function handleBuyHearts() {
    const game = await getGameData();
    if ((game.gems || 0) < HEART_COST) {
      Alert.alert('Недостаточно самоцветов', `Нужно ${HEART_COST} ◈ для восстановления сердец.`);
      return;
    }
    game.gems -= HEART_COST;
    game.quiz = { hearts: MAX_HEARTS, lastHeartRestore: null };
    await saveGameData(game);
    setHearts(MAX_HEARTS);
    setGems(game.gems);
    setOutOfHearts(false);
  }

  function goBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }

  const topBar = (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={goBack} style={styles.iconBtn}>
        <Icon name="chevron-back" size={22} color="#c4a96a" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>
        {sageChallenge ? 'Испытание Мудреца' : recallMode ? 'Вспоминание' : 'Испытание в таверне'}
      </Text>
      <Animated.View style={[styles.heartsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[1, 2, 3].map(n => (
          <Text key={n} style={styles.heart}>{n <= hearts ? '❤️' : '🖤'}</Text>
        ))}
      </Animated.View>
    </View>
  );

  // ── Sage intro ─────────────────────────────────────────────────────────────
  if (sageIntro) {
    return (
      <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.sageWrap}>
          <Text style={styles.sageIcon}>⚔️</Text>
          <Text style={styles.sageTitle}>Ты встречаешь{'\n'}Серого Странника</Text>
          <OrnamentDivider />
          <Text style={styles.sageQuote}>
            "Назови мне слова из этого Свитка,{'\n'}
            и я открою тебе следующий путь.{'\n\n'}
            Семь из десяти — и я буду доволен."
          </Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.sageStartBtn} onPress={() => setSageIntro(false)}>
            <Text style={styles.sageStartText}>Принять Испытание</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ marginTop: 16 }} onPress={goBack}>
            <Text style={styles.sageDeferText}>Не сейчас</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ParchmentBackground>
    );
  }

  // ── No words ───────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.emptyWrap}>
          <OrnamentDivider />
          <Text style={styles.emptyText}>
            Нажми на слово во время чтения, затем нажми{'\n'}«Добавить в свиток заклинаний» —{'\n'}сохранённые слова появятся здесь для испытания
          </Text>
          <OrnamentDivider />
        </View>
      </SafeAreaView>
    );
  }

  // ── Done screen ────────────────────────────────────────────────────────────
  if (done) {
    const isSage = !!sageChallenge;
    const ratio = score / questions.length;
    const doneDesc = isSage
      ? ratio >= 0.7 ? 'Гэндальф удовлетворён. Путь открыт.' :
        ratio >= 0.5 ? 'Достойный результат, герой.' :
        'Учись прежде, чем странствовать.'
      : score === questions.length ? 'Безупречно. Гэндальф был бы горд.' :
        score >= questions.length * 0.7 ? 'Достойный результат, герой.' :
        'Продолжай практиковаться — Ривенделл ждёт.';

    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.doneWrap}>
          <OrnamentDivider />
          <Text style={styles.doneTitle}>
            {isSage ? '⚔️ Испытание пройдено' : 'Испытание пройдено!'}
          </Text>
          <Text style={styles.doneScore}>{score} из {questions.length}</Text>
          <Text style={styles.doneDesc}>{doneDesc}</Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.restartBtn} onPress={loadWords}>
            <Text style={styles.restartBtnText}>Пройти ещё раз</Text>
          </TouchableOpacity>
          {!recallMode ? (
            <TouchableOpacity
              style={styles.recallToggleBtn}
              onPress={() => navigation.replace('Quiz', { articleId, recallMode: true })}
            >
              <Text style={styles.recallToggleText}>Режим вспоминания →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.recallToggleBtn}
              onPress={() => navigation.replace('Quiz', { articleId, recallMode: false })}
            >
              <Text style={styles.recallToggleText}>← Узнавание</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.homeBtn} onPress={goBack}>
            <Text style={styles.homeBtnText}>Вернуться</Text>
          </TouchableOpacity>
        </View>
        {xpBursts.map(b => (
          <XPBurst key={b.id} amount={b.amount} label={b.label} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
        ))}
        {pendingAchievements.length > 0 && (
          <AchievementModal achievements={pendingAchievements} onClose={() => setPendingAchievements([])} />
        )}
      </SafeAreaView>
    );
  }

  // ── Active quiz ────────────────────────────────────────────────────────────
  const q = questions[current];

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      {topBar}

      <View style={styles.scoreRow}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNum}>{score}</Text>
          <Text style={styles.scoreLabel}>угадано</Text>
        </View>
        <Text style={styles.scoreSep}>·</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreNum}>{questions.length}</Text>
          <Text style={styles.scoreLabel}>всего</Text>
        </View>
      </View>

      <OrnamentDivider />

      <ScrollView contentContainerStyle={styles.quizContent}>
        <Text style={styles.wordText}>{q.word}</Text>
        <Text style={styles.subtitle}>{recallMode ? 'Выбери английское слово' : 'Выбери верное толкование'}</Text>

        {q.options.map((opt, i) => {
          let btnStyle = styles.optBtn;
          let textStyle = styles.optText;
          if (answered !== null) {
            if (opt === q.correct) {
              btnStyle = [styles.optBtn, styles.optCorrect];
              textStyle = [styles.optText, styles.optCorrectText];
            } else if (opt === answered && opt !== q.correct) {
              btnStyle = [styles.optBtn, styles.optWrong];
              textStyle = [styles.optText, styles.optWrongText];
            } else {
              btnStyle = [styles.optBtn, styles.optDim];
            }
          }
          return (
            <TouchableOpacity key={i} style={btnStyle} onPress={() => handleAnswer(opt)} activeOpacity={0.8}>
              <Text style={textStyle}>{opt}</Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.progNote}>
          Речение {current + 1} из {questions.length}
        </Text>
      </ScrollView>

      {/* Out of hearts overlay */}
      {outOfHearts && (
        <View style={styles.ohOverlay}>
          <View style={styles.ohBox}>
            <Text style={styles.ohEmoji}>💔</Text>
            <Text style={styles.ohTitle}>Сердца иссякли</Text>
            <Text style={styles.ohBody}>
              Следующее сердце через{'\n'}{minutesUntilHeart} мин
            </Text>
            <TouchableOpacity
              style={[styles.ohBuyBtn, gems < HEART_COST && styles.ohBuyBtnDisabled]}
              onPress={handleBuyHearts}
            >
              <Text style={styles.ohBuyText}>
                ◈ Восстановить за {HEART_COST} самоцветов
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goBack} style={{ marginTop: 14 }}>
              <Text style={styles.ohLeave}>Уйти</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {xpBursts.map(b => (
        <XPBurst key={b.id} amount={b.amount} label={b.label} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
      ))}
      {pendingAchievements.length > 0 && (
        <AchievementModal achievements={pendingAchievements} onClose={() => setPendingAchievements([])} />
      )}
    </SafeAreaView>
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
    fontSize: 16,
    color: '#f0e6c8',
    textAlign: 'center',
  },
  heartsRow: {
    flexDirection: 'row',
    width: 60,
    justifyContent: 'flex-end',
    gap: 2,
  },
  heart: { fontSize: 14 },

  // Sage intro
  sageWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  sageIcon: { fontSize: 52, marginBottom: 16 },
  sageTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 22,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 12,
  },
  sageQuote: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 16,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 16,
  },
  sageStartBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    marginTop: 8,
  },
  sageStartText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 16,
    color: '#f0e6c8',
    letterSpacing: 0.4,
  },
  sageDeferText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },

  // Score
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  scoreCard: { alignItems: 'center' },
  scoreNum: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 28,
    color: colors.ink,
  },
  scoreLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
  },
  scoreSep: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 24,
    color: colors.gold,
  },

  // Quiz
  quizContent: {
    padding: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  wordText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 29,
    color: colors.ink,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 20,
  },
  optBtn: {
    width: '100%',
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 3,
    paddingVertical: 13,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  optText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: colors.ink,
    textAlign: 'center',
  },
  optCorrect: { backgroundColor: colors.correct, borderColor: colors.correctBorder },
  optCorrectText: { color: colors.correctText, fontFamily: 'CrimsonText_600SemiBold' },
  optWrong: { backgroundColor: colors.wrong, borderColor: colors.wrongBorder },
  optWrongText: { color: colors.wrongText },
  optDim: { opacity: 0.4 },
  progNote: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 12,
  },

  // Empty
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginVertical: 16,
  },

  // Done
  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  doneTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 22,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  doneScore: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 44,
    color: colors.forestGreen,
    marginBottom: 12,
  },
  doneDesc: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  restartBtn: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 3,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  restartBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
  homeBtn: { marginTop: 14 },
  homeBtnText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },
  recallToggleBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.forestGreen,
  },
  recallToggleText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: colors.forestGreen,
    textAlign: 'center',
  },

  // Out of hearts overlay
  ohOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ohBox: {
    backgroundColor: '#f5eedc',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c4a96a',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  ohEmoji: { fontSize: 48, marginBottom: 12 },
  ohTitle: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 16,
    color: '#4a3728',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  ohBody: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: '#6b5744',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  ohBuyBtn: {
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  ohBuyBtnDisabled: { opacity: 0.4 },
  ohBuyText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 14,
    color: '#f0e6c8',
  },
  ohLeave: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: '#9a8a7a',
  },
});
