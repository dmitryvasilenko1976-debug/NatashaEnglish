import React, { useState } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import Icon from '../components/Icon';
import OrnamentDivider from '../components/OrnamentDivider';
import { colors } from '../theme/colors';

const STEPS = [
  {
    icon: 'library-outline',
    tint: colors.forestGreen,
    title: 'Открой свиток',
    body: 'На главном экране нажми «Читать свитки» и выбери любую медицинскую статью.\n\nКаждый свиток — реальная клиническая статья на английском языке.',
    hint: 'Начни с темы, которую хорошо знаешь по-русски — так легче.',
  },
  {
    icon: 'hand-left-outline',
    tint: colors.gold,
    title: 'Нажми на слово',
    body: 'Во время чтения нажми на любое незнакомое слово — снизу появится карточка с переводом, транскрипцией и примером из текста.',
    hint: 'Кнопка 🔊 произносит слово вслух (на сайте).',
  },
  {
    icon: 'bookmark-outline',
    tint: '#7a3c10',
    title: 'Сохрани заклинание',
    body: 'Нажми «Добавить в свиток заклинаний» — слово сохранится и будет выделяться золотым при следующем чтении.\n\nСохранённые слова станут основой для испытания.',
    hint: 'Сохраняй 3–5 слов за одно занятие, не больше.',
  },
  {
    icon: 'shield-outline',
    tint: colors.forestGreen,
    title: 'Испытание в таверне',
    body: 'Когда сохранишь слова — зайди в «Испытание» из главного меню, выбери свиток и пройди тест.\n\nЗа каждый правильный ответ — XP-очки и достижения.',
    hint: 'Навигация по статье: кнопки «← Назад» и «Вперёд →».',
  },
];

export default function TutorialScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];

  function goNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  }

  function goPrev() {
    if (step > 0) setStep(s => s - 1);
  }

  function finish() {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Welcome');
  }

  return (
    <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={finish} style={styles.iconBtn}>
          <Icon name="close" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Туториал</Text>
        <View style={styles.iconBtn} />
      </View>

      {/* Step dots */}
      <View style={styles.dotsRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.body}>
        {/* Icon */}
        <View style={[styles.iconCircle, { borderColor: s.tint + '60', backgroundColor: s.tint + '18' }]}>
          <Icon name={s.icon} size={40} color={s.tint} />
        </View>

        <OrnamentDivider style={styles.divider} />

        <Text style={styles.stepNum}>Шаг {step + 1} из {STEPS.length}</Text>
        <Text style={styles.stepTitle}>{s.title}</Text>
        <Text style={styles.stepBody}>{s.body}</Text>

        {/* Hint box */}
        <View style={styles.hintBox}>
          <Icon name="bulb-outline" size={14} color={colors.gold} />
          <Text style={styles.hintText}> {s.hint}</Text>
        </View>

        <OrnamentDivider style={styles.divider} />
      </View>

      {/* Navigation */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnSecondary, step === 0 && { opacity: 0 }]}
          onPress={goPrev}
          disabled={step === 0}
        >
          <Text style={styles.navBtnSecText}>← Назад</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={goNext}>
          <Text style={styles.navBtnText}>
            {step === STEPS.length - 1 ? 'Начать читать →' : 'Далее →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ParchmentBackground>
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
  iconBtn: { width: 36, padding: 6 },
  topTitle: {
    flex: 1,
    fontFamily: 'Almendra_400Regular',
    fontSize: 16,
    color: '#f0e6c8',
    textAlign: 'center',
  },

  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.parchmentBorder,
  },
  dotActive: { backgroundColor: colors.forestGreen, width: 20 },

  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  divider: { marginVertical: 10 },
  stepNum: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  stepTitle: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 24,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 14,
  },
  stepBody: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: colors.inkMuted,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fffbe6',
    borderWidth: 1,
    borderColor: colors.goldLight,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'stretch',
  },
  hintText: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkMuted,
    lineHeight: 20,
  },

  navRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  navBtn: {
    flex: 1,
    backgroundColor: colors.forestGreen,
    paddingVertical: 13,
    borderRadius: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  navBtnSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.gold,
  },
  navBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
  navBtnSecText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: colors.forestGreen,
  },
});
