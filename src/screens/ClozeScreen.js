import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import XPBurst from '../components/XPBurst';
import { getArticles, getSavedWords } from '../services/storageService';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

const XP_PER_CORRECT = 5;
const XP_BONUS = 20;
const MAX_QUESTIONS = 20;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function ClozeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [allItems, setAllItems] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [xpBursts, setXpBursts] = useState([]);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const articles = await getArticles();
      const items = [];
      for (const article of articles) {
        const saved = await getSavedWords(article.id);
        for (const [word, data] of Object.entries(saved)) {
          if (data.contextBefore || data.contextAfter) {
            items.push({
              word,
              contextBefore: data.contextBefore || '',
              contextAfter: data.contextAfter || '',
              translation: data.translation || '',
              articleTitle: article.title || '',
            });
          }
        }
      }
      setAllItems(items);
      if (items.length >= 2) {
        buildQuestions(items);
      }
    } catch (e) {
      // ignore
    }
    setLoading(false);
  }

  function buildQuestions(items) {
    const pool = items || allItems;
    if (pool.length < 2) return;

    const shuffled = shuffle(pool).slice(0, MAX_QUESTIONS);
    const qs = shuffled.map(item => {
      const distractors = shuffle(pool.filter(p => p.word !== item.word)).slice(0, 3).map(p => p.word);
      const options = shuffle([item.word, ...distractors]);
      return { ...item, correct: item.word, options };
    });
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
    }, 1200);
  }

  function goHome() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }

  const topBar = (
    <View style={styles.topBar}>
      <TouchableOpacity onPress={goHome} style={styles.iconBtn}>
        <Ionicons name="chevron-back" size={22} color="#c4a96a" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>В контексте</Text>
      <View style={styles.iconBtn} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Загрузка слов...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (allItems.length < 2) {
    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.emptyWrap}>
          <OrnamentDivider />
          <Ionicons name="book-outline" size={40} color={colors.inkFaint} style={{ marginBottom: 16 }} />
          <Text style={styles.emptyText}>
            Сохрани слова во время чтения — они появятся здесь как упражнения
          </Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
            <Text style={styles.homeBtnText}>На главную</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (done) {
    const ratio = score / questions.length;
    const doneDesc =
      ratio >= 0.9 ? 'Превосходно! Ты чувствуешь контекст.' :
      ratio >= 0.7 ? 'Хорошо! Продолжай практиковаться.' :
      ratio >= 0.5 ? 'Неплохо. Перечитай статьи и попробуй снова.' :
      'Читай больше — контекст придёт с практикой.';

    return (
      <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}
        <View style={styles.doneWrap}>
          <OrnamentDivider />
          <Text style={styles.doneTitle}>Упражнение завершено</Text>
          <Text style={styles.doneScore}>{score} / {questions.length}</Text>
          <Text style={styles.doneDesc}>{doneDesc}</Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.restartBtn} onPress={() => buildQuestions()}>
            <Text style={styles.restartBtnText}>Ещё раз</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={goHome}>
            <Text style={styles.backBtnText}>На главную</Text>
          </TouchableOpacity>
        </View>
        {xpBursts.map(b => (
          <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
        ))}
      </SafeAreaView>
    );
  }

  const q = questions[current];

  // Build sentence display: contextBefore ___ contextAfter
  const hasBefore = q.contextBefore && q.contextBefore.trim().length > 0;
  const hasAfter = q.contextAfter && q.contextAfter.trim().length > 0;

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
          <Text style={styles.questionLabel}>Найди слово по его роли в предложении</Text>

          <View style={styles.sentenceBox}>
            <Text style={styles.sentenceText}>
              {hasBefore && (
                <Text style={styles.contextText}>{q.contextBefore.trim()} </Text>
              )}
              <Text style={styles.blankText}>_______</Text>
              {hasAfter && (
                <Text style={styles.contextText}> {q.contextAfter.trim()}</Text>
              )}
            </Text>
          </View>

          {q.translation ? (
            <Text style={styles.translationHint}>
              Перевод: {q.translation}
            </Text>
          ) : null}

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

          <Text style={styles.articleHint}>{q.articleTitle}</Text>
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
    padding: 20,
    paddingTop: 20,
    flexGrow: 1,
  },
  questionLabel: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 16,
  },

  sentenceBox: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
  },
  sentenceText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 18,
    color: colors.ink,
    lineHeight: 30,
    textAlign: 'center',
  },
  contextText: {
    color: colors.inkMuted,
  },
  blankText: {
    color: colors.forestGreen,
    fontFamily: 'Almendra_400Regular',
    fontSize: 20,
    textDecorationLine: 'underline',
  },

  translationHint: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
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
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  optCorrect: { backgroundColor: colors.correct, borderColor: colors.correctBorder },
  optCorrectText: { color: colors.correctText, fontFamily: 'CrimsonText_600SemiBold' },
  optWrong: { backgroundColor: colors.wrong, borderColor: colors.wrongBorder },
  optWrongText: { color: colors.wrongText },
  optDim: { opacity: 0.4 },

  articleHint: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 12,
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
  homeBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.forestGreen,
  },
  homeBtnText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: colors.forestGreen,
  },
  backBtn: { paddingVertical: 6 },
  backBtnText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
  },
});
