import React, { useEffect, useRef, useState } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Animated, Platform
} from 'react-native';
import Icon from '../components/Icon';
import OrnamentDivider from '../components/OrnamentDivider';
import XPBurst from '../components/XPBurst';
import { MORPHEME_QUIZ_POOL, MORPHOLOGY_CATEGORIES } from '../data/morphologyLessons';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

const XP_PER_CORRECT = 5;
const XP_BONUS = 20;
const MAX_QUESTIONS = 20;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(categoryId) {
  let pool = categoryId
    ? MORPHEME_QUIZ_POOL.filter(e => e.categoryId === categoryId)
    : MORPHEME_QUIZ_POOL;

  if (pool.length < 2) return [];

  const allMeanings = MORPHEME_QUIZ_POOL.map(e => e.meaning);

  return shuffle(pool).slice(0, MAX_QUESTIONS).map(entry => {
    const correct = entry.meaning;

    // Prefer distractors from same category first
    const sameCat = pool.filter(e => e.morpheme !== entry.morpheme).map(e => e.meaning);
    const otherCat = MORPHEME_QUIZ_POOL
      .filter(e => e.morpheme !== entry.morpheme && e.categoryId !== entry.categoryId)
      .map(e => e.meaning);

    const distractorPool = shuffle([...new Set([...sameCat, ...otherCat])]).filter(m => m !== correct);
    const wrongOpts = distractorPool.slice(0, 3);
    const options = shuffle([correct, ...wrongOpts]);

    return { entry, correct, options };
  });
}

export default function MorphologyQuizScreen({ route, navigation }) {
  const { categoryId } = route.params || {};
  const category = categoryId ? MORPHOLOGY_CATEGORIES.find(c => c.id === categoryId) : null;
  const title = category ? category.title : 'Все морфемы';

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xpBursts, setXpBursts] = useState([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { init(); }, [categoryId]);

  function init() {
    const qs = buildQuestions(categoryId);
    setQuestions(qs);
    setCurrent(0);
    setAnswered(null);
    setScore(0);
    setDone(false);
  }

  function showBurst(amount) {
    const id = Date.now() + Math.random();
    setXpBursts(prev => [...prev, { id, amount }]);
  }

  async function handleAnswer(option) {
    if (answered !== null) return;
    const q = questions[current];
    const correct = option === q.correct;
    setAnswered(option);

    if (correct) {
      await addXP(XP_PER_CORRECT, {});
      showBurst(XP_PER_CORRECT);
      setScore(s => s + 1);
    }

    setTimeout(async () => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(async () => {
        if (current < questions.length - 1) {
          setCurrent(c => c + 1);
          setAnswered(null);
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        } else {
          const finalScore = score + (correct ? 1 : 0);
          if (finalScore > 0) {
            await addXP(XP_BONUS, {});
            showBurst(XP_BONUS);
          }
          setDone(true);
          Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        }
      });
    }, 1100);
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
      <Text style={styles.topTitle} numberOfLines={1}>
        Морфология · {title}
      </Text>
      <View style={styles.iconBtn} />
    </View>
  );

  if (questions.length === 0) {
    return (
      <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.emptyWrap}>
          <OrnamentDivider />
          <Text style={styles.emptyText}>
            Нет морфем для теста.{'\n'}Попробуй другой раздел.
          </Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ParchmentBackground>
    );
  }

  if (done) {
    const ratio = score / questions.length;
    const doneDesc =
      ratio >= 0.9 ? 'Превосходно! Морфемы освоены.' :
      ratio >= 0.7 ? 'Хороший результат. Продолжай практиковаться.' :
      ratio >= 0.5 ? 'Неплохо. Перечитай раздел и повтори.' :
      'Не сдавайся — перечитай морфемы и попробуй снова.';

    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.doneWrap}>
          <OrnamentDivider />
          <Text style={styles.doneTitle}>Тест завершён</Text>
          <Text style={styles.doneScore}>{score} / {questions.length}</Text>
          <Text style={styles.doneDesc}>{doneDesc}</Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.restartBtn} onPress={init}>
            <Text style={styles.restartBtnText}>Пройти ещё раз</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Text style={styles.backBtnText}>К морфологии</Text>
          </TouchableOpacity>
        </View>
        {xpBursts.map(b => (
          <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
        ))}
      </SafeAreaView>
    );
  }

  const q = questions[current];

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      {topBar}

      <View style={styles.progressRow}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round((current / questions.length) * 100)}%` }]} />
        </View>
        <Text style={styles.progressText}>{current + 1} / {questions.length}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.quizContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.questionLabel}>Что означает эта часть слова?</Text>
          <Text style={styles.wordText}>{q.entry.morpheme}</Text>

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
              <TouchableOpacity
                key={i}
                style={btnStyle}
                onPress={() => handleAnswer(opt)}
                activeOpacity={0.8}
              >
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}

          {answered !== null && (
            <View style={styles.infoBox}>
              <Text style={styles.infoExamples}>
                {q.entry.examples.join(', ')}
              </Text>
              <Text style={styles.infoTip}>{q.entry.tip}</Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.scoreBar}>
        <Text style={styles.scoreText}>✦ {score} верно</Text>
        <Text style={styles.scoreXpHint}>+{XP_PER_CORRECT} XP за ответ</Text>
      </View>

      {xpBursts.map(b => (
        <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
      ))}
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
    fontSize: 15,
    color: '#f0e6c8',
    textAlign: 'center',
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.parchment,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  progressBg: {
    flex: 1,
    height: 4,
    backgroundColor: colors.parchmentBorder,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    width: 40,
    textAlign: 'right',
  },

  quizContent: {
    padding: 24,
    paddingTop: 20,
    flexGrow: 1,
  },
  questionLabel: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 12,
  },
  wordText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 28,
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

  infoBox: {
    marginTop: 12,
    backgroundColor: colors.parchmentDark,
    borderLeftWidth: 3,
    borderLeftColor: colors.forestGreen,
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoExamples: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 13,
    color: colors.forestGreen,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoTip: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkMuted,
    lineHeight: 18,
  },

  scoreBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.parchment,
    borderTopWidth: 1,
    borderTopColor: colors.parchmentBorder,
  },
  scoreText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 14,
    color: colors.forestGreen,
  },
  scoreXpHint: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },

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
    fontSize: 48,
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
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  restartBtnText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: '#f0e6c8',
  },
  backBtn: { paddingVertical: 6 },
  backBtnText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },
});
