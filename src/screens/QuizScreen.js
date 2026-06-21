import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import OrnamentDivider from '../components/OrnamentDivider';
import AchievementModal from '../components/AchievementModal';
import XPBurst from '../components/XPBurst';
import { getSavedWords } from '../services/storageService';
import { addXP } from '../services/gamificationService';
import { colors } from '../theme/colors';

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildQuestions(words) {
  const entries = Object.entries(words);
  if (entries.length < 2) return [];

  return shuffle(entries).map(([word, data], i) => {
    const correct = data.translation;
    const distractors = entries
      .filter((_, j) => j !== i)
      .map(([, d]) => d.translation)
      .filter(Boolean);
    const wrongOpts = shuffle(distractors).slice(0, 3);
    const options = shuffle([correct, ...wrongOpts]);
    return { word, correct, options, data };
  });
}

export default function QuizScreen({ route, navigation }) {
  const { articleId } = route.params;
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [xpBursts, setXpBursts] = useState([]);

  useEffect(() => {
    loadWords();
  }, [articleId]);

  async function loadWords() {
    const words = await getSavedWords(articleId);
    setQuestions(buildQuestions(words));
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
      const result = await addXP(10, { quizCorrect: 1 });
      showBurst(10);
      if (result.newlyUnlocked.length > 0) setPendingAchievements(result.newlyUnlocked);
      setScore(s => s + 1);
    }

    setTimeout(async () => {
      if (current < questions.length - 1) {
        setCurrent(c => c + 1);
        setAnswered(null);
      } else {
        // Quiz complete
        const result = await addXP(25);
        showBurst(25);
        if (result.newlyUnlocked.length > 0) setPendingAchievements(a => [...a, ...result.newlyUnlocked]);
        setDone(true);
      }
    }, 1200);
  }

  const q = questions[current];

  const emptyScreen = (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Испытание в таверне</Text>
        <View style={styles.iconBtn} />
      </View>
      <View style={styles.emptyWrap}>
        <OrnamentDivider />
        <Text style={styles.emptyText}>
          Нажми на слово во время чтения, затем нажми{'\n'}«Добавить в свиток заклинаний» —{'\n'}сохранённые слова появятся здесь для испытания
        </Text>
        <OrnamentDivider />
      </View>
    </SafeAreaView>
  );

  if (questions.length === 0) return emptyScreen;

  if (done) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={22} color="#c4a96a" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Испытание в таверне</Text>
          <View style={styles.iconBtn} />
        </View>

        <View style={styles.doneWrap}>
          <OrnamentDivider />
          <Text style={styles.doneTitle}>Испытание пройдено!</Text>
          <Text style={styles.doneScore}>{score} из {questions.length}</Text>
          <Text style={styles.doneDesc}>
            {score === questions.length ? 'Безупречно. Гэндальф был бы горд.' :
             score >= questions.length * 0.7 ? 'Достойный результат, герой.' :
             'Продолжай практиковаться — Ривенделл ждёт.'}
          </Text>
          <OrnamentDivider />
          <TouchableOpacity style={styles.restartBtn} onPress={loadWords}>
            <Text style={styles.restartBtnText}>Пройти испытание заново</Text>
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Испытание в таверне</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Score */}
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
        <Text style={styles.subtitle}>Выбери верное толкование</Text>

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
          Первое речение {current + 1} из {questions.length}
        </Text>
      </ScrollView>

      {xpBursts.map(b => (
        <XPBurst key={b.id} amount={b.amount} onDone={() => setXpBursts(prev => prev.filter(x => x.id !== b.id))} />
      ))}

      {pendingAchievements.length > 0 && (
        <AchievementModal achievements={pendingAchievements} onClose={() => setPendingAchievements([])} />
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
    width: 36,
  },
  topTitle: {
    flex: 1,
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 16,
    color: '#f0e6c8',
    textAlign: 'center',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  scoreCard: {
    alignItems: 'center',
  },
  scoreNum: {
    fontFamily: 'IMFellEnglish_400Regular',
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
  quizContent: {
    padding: 24,
    paddingTop: 8,
    alignItems: 'center',
  },
  wordText: {
    fontFamily: 'IMFellEnglish_400Regular',
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
  optCorrect: {
    backgroundColor: colors.correct,
    borderColor: colors.correctBorder,
  },
  optCorrectText: {
    color: colors.correctText,
    fontFamily: 'CrimsonText_600SemiBold',
  },
  optWrong: {
    backgroundColor: colors.wrong,
    borderColor: colors.wrongBorder,
  },
  optWrongText: {
    color: colors.wrongText,
  },
  optDim: {
    opacity: 0.4,
  },
  progNote: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 12,
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
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 24,
    color: colors.ink,
    marginBottom: 8,
  },
  doneScore: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 40,
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
  },
  restartBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
});
