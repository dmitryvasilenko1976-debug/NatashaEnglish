import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import XPBurst from '../components/XPBurst';
import { FALSE_FRIENDS } from '../data/falseFriends';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

const XP_PER_CORRECT = 5;
const XP_BONUS = 10;

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuizQuestions() {
  return shuffle(FALSE_FRIENDS).map(item => {
    const correct = item.enMeaning;
    const distractors = shuffle(
      FALSE_FRIENDS.filter(f => f.id !== item.id).map(f => f.enMeaning)
    ).slice(0, 3);
    const options = shuffle([correct, ...distractors]);
    return { item, correct, options };
  });
}

export default function FalseFriendsScreen({ navigation }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Quiz state
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [xpBursts, setXpBursts] = useState([]);

  function startQuiz() {
    const qs = buildQuizQuestions();
    setQuestions(qs);
    setCurrent(0);
    setAnswered(null);
    setScore(0);
    setQuizDone(false);
    setShowQuiz(true);
  }

  function restartQuiz() {
    const qs = buildQuizQuestions();
    setQuestions(qs);
    setCurrent(0);
    setAnswered(null);
    setScore(0);
    setQuizDone(false);
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
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setAnswered(null);
      } else {
        const finalScore = score + (correct ? 1 : 0);
        if (finalScore > 0) {
          await addXP(XP_BONUS, {});
          showBurst(XP_BONUS);
        }
        setQuizDone(true);
      }
    }, 1300);
  }

  function goBack() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Home');
  }

  const topBar = (
    <View style={styles.topBar}>
      <TouchableOpacity
        onPress={() => { if (showQuiz) setShowQuiz(false); else goBack(); }}
        style={styles.iconBtn}
      >
        <Ionicons name="chevron-back" size={22} color="#c4a96a" />
      </TouchableOpacity>
      <Text style={styles.topTitle}>
        {showQuiz ? 'Тест: Слова-ловушки' : 'Слова-ловушки ⚡'}
      </Text>
      <View style={styles.iconBtn} />
    </View>
  );

  // ── Quiz view ──────────────────────────────────────────────────────────────
  if (showQuiz) {
    if (questions.length === 0) {
      return (
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
          {topBar}
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Загрузка...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (quizDone) {
      const ratio = score / questions.length;
      const doneDesc =
        ratio >= 0.9 ? 'Отлично! Ловушки вас не поймают.' :
        ratio >= 0.7 ? 'Хорошо. Обратите внимание на ошибки.' :
        ratio >= 0.5 ? 'Неплохо. Повторите список и попробуйте снова.' :
        'Слова-ловушки ещё опасны. Перечитайте список.';

      return (
        <SafeAreaView style={styles.safe}>
          <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
          {topBar}
          <View style={styles.doneWrap}>
            <OrnamentDivider />
            <Text style={styles.doneTitle}>Тест завершён</Text>
            <Text style={styles.doneScore}>{score} / {questions.length}</Text>
            <Text style={styles.doneDesc}>{doneDesc}</Text>
            <OrnamentDivider />
            <TouchableOpacity style={styles.restartBtn} onPress={restartQuiz}>
              <Text style={styles.restartBtnText}>Пройти ещё раз</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backBtn} onPress={() => setShowQuiz(false)}>
              <Text style={styles.backBtnText}>← Назад к списку</Text>
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
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        {topBar}

        <View style={styles.progressRow}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.round((current / questions.length) * 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{current + 1} / {questions.length}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.quizContent}>
          <Text style={styles.questionLabel}>В английском это значит...</Text>
          <Text style={styles.quizWord}>{q.item.enWord}</Text>
          <Text style={styles.ruHint}>по-русски: «{q.item.ruWord}»</Text>

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
            <View style={styles.dangerInfoBox}>
              <View style={styles.dangerRow}>
                <Ionicons name="warning-outline" size={16} color="#7a1f1f" style={{ marginRight: 6 }} />
                <Text style={styles.dangerText}>{q.item.danger}</Text>
              </View>
              <Text style={styles.exampleText}>{q.item.example}</Text>
            </View>
          )}

          <Text style={styles.progNote}>
            Вопрос {current + 1} из {questions.length}
          </Text>
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

  // ── List view ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      {topBar}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningIntro}>
          <Ionicons name="warning-outline" size={18} color={colors.gold} style={{ marginRight: 8 }} />
          <Text style={styles.warningIntroText}>
            15 слов, которые обманывают русских врачей
          </Text>
        </View>

        <OrnamentDivider style={styles.divider} />

        {FALSE_FRIENDS.map(item => {
          const isOpen = expandedId === item.id;
          return (
            <View key={item.id} style={[styles.card, isOpen && styles.cardOpen]}>
              <TouchableOpacity
                style={styles.cardHeader}
                onPress={() => setExpandedId(prev => prev === item.id ? null : item.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardRuWord}>{item.ruWord}</Text>
                <Text style={styles.cardSep}> ⚡ </Text>
                <Text style={styles.cardEnWord}>{item.enWord}</Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={isOpen ? colors.gold : colors.inkFaint}
                  style={{ marginLeft: 'auto' }}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.cardBody}>
                  <View style={styles.meaningsRow}>
                    <View style={styles.meaningBlock}>
                      <Text style={styles.langLabel}>ПО-РУССКИ</Text>
                      <Text style={styles.meaningBodyText}>{item.ruMeaning}</Text>
                    </View>
                    <View style={styles.meaningDivider} />
                    <View style={styles.meaningBlock}>
                      <Text style={[styles.langLabel, { color: colors.forestGreen }]}>ПО-АНГЛИЙСКИ</Text>
                      <Text style={styles.meaningBodyText}>{item.enMeaning}</Text>
                    </View>
                  </View>

                  <View style={styles.dangerBox}>
                    <View style={styles.dangerRow}>
                      <Ionicons name="alert-circle-outline" size={16} color="#7a1f1f" style={{ marginRight: 6, flexShrink: 0 }} />
                      <Text style={styles.dangerBoxText}>{item.danger}</Text>
                    </View>
                  </View>

                  <View style={styles.exampleBox}>
                    <Text style={styles.exampleLabel}>Пример:</Text>
                    <Text style={styles.exampleBodyText}>{item.example}</Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <OrnamentDivider style={styles.divider} />

        <TouchableOpacity
          style={styles.quizStartBtn}
          onPress={startQuiz}
          activeOpacity={0.85}
        >
          <Ionicons name="flash-outline" size={18} color="#f0e6c8" />
          <Text style={styles.quizStartText}>Тест по ложным словам</Text>
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
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 16,
    color: '#f0e6c8',
    textAlign: 'center',
  },

  scroll: { paddingHorizontal: 16, paddingTop: 16 },

  warningIntro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 4,
    padding: 12,
  },
  warningIntroText: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
  },

  divider: { marginVertical: 14 },

  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    marginBottom: 8,
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
    flexWrap: 'nowrap',
  },
  cardRuWord: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 16,
    color: colors.inkMuted,
  },
  cardSep: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: colors.gold,
  },
  cardEnWord: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 16,
    color: colors.forestGreen,
    flex: 1,
  },

  cardBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: colors.goldFaint,
  },

  meaningsRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  meaningBlock: { flex: 1 },
  meaningDivider: {
    width: 1,
    backgroundColor: colors.parchmentBorder,
    marginHorizontal: 4,
  },
  langLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 8,
    color: colors.inkFaint,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  meaningBodyText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
  },

  dangerBox: {
    marginTop: 10,
    backgroundColor: colors.wrong,
    borderWidth: 1,
    borderColor: colors.wrongBorder,
    borderRadius: 3,
    padding: 10,
  },
  dangerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dangerBoxText: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.wrongText,
    lineHeight: 18,
  },

  exampleBox: {
    marginTop: 8,
    backgroundColor: colors.parchmentDark,
    borderLeftWidth: 3,
    borderLeftColor: colors.forestGreen,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 2,
  },
  exampleLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 8,
    color: colors.inkFaint,
    letterSpacing: 1,
    marginBottom: 4,
  },
  exampleBodyText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 19,
  },

  quizStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gold,
    marginBottom: 8,
  },
  quizStartText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: '#f0e6c8',
    letterSpacing: 0.3,
  },

  // Quiz styles
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
    alignItems: 'center',
  },
  questionLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 10,
  },
  quizWord: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 36,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  ruHint: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: 24,
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

  dangerInfoBox: {
    width: '100%',
    marginTop: 8,
    backgroundColor: '#fdf0f0',
    borderWidth: 1,
    borderColor: colors.wrongBorder,
    borderRadius: 3,
    padding: 10,
    marginBottom: 8,
  },
  dangerText: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.wrongText,
    lineHeight: 18,
  },
  exampleText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkMuted,
    marginTop: 6,
    lineHeight: 18,
  },

  progNote: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 8,
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
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: colors.inkMuted,
  },

  doneWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  doneTitle: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 22,
    color: colors.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  doneScore: {
    fontFamily: 'IMFellEnglish_400Regular',
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
