import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Platform, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import OrnamentDivider from '../components/OrnamentDivider';
import {
  getArticles, getSavedWords, getProgress,
  getGameData, saveGameData, updateStreak,
} from '../services/storageService';
import { colors } from '../theme/colors';

export default function WelcomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    xp: 0, streak: 0,
    articlesDone: 0, totalArticles: 0, totalWords: 0,
  });

  useFocusEffect(useCallback(() => { loadStats(); }, []));

  async function loadStats() {
    let game = await getGameData();
    game = updateStreak(game);
    await saveGameData(game);

    const articles = await getArticles();
    let done = 0, words = 0;
    for (const a of articles) {
      const prog = await getProgress(a.id);
      if (prog > 0) done++;
      const saved = await getSavedWords(a.id);
      words += Object.keys(saved).length;
    }
    setStats({
      xp: game.xp,
      streak: game.streak?.current ?? 0,
      articlesDone: done,
      totalArticles: articles.length,
      totalWords: words,
    });
  }

  const progress = stats.totalArticles > 0
    ? Math.round((stats.articlesDone / stats.totalArticles) * 100)
    : 0;

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        style={Platform.OS === 'web' ? { overflowY: 'scroll' } : undefined}
      >
        {/* App logo */}
        <View style={styles.symbolWrap}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
            onError={() => {}}
          />
        </View>

        <OrnamentDivider style={styles.divider} />

        {/* Nav cards */}
        <MenuCard
          icon="map-outline"
          label="Туториал"
          desc="Как пользоваться приложением"
          tint={colors.gold}
          onPress={() => navigation.navigate('Tutorial')}
        />

        <MenuCard
          icon="library-outline"
          label="Читать свитки"
          desc={stats.totalArticles > 0 ? `${stats.totalArticles} статей · педиатрия` : 'Загрузка…'}
          tint={colors.forestGreen}
          onPress={() => navigation.navigate('Home')}
        />

        <MenuCard
          icon="shield-outline"
          label="Испытание в таверне"
          desc={
            stats.totalWords > 0
              ? `${stats.totalWords} заклинаний готово`
              : 'Сохрани слова во время чтения'
          }
          tint="#7a3c10"
          disabled={stats.totalWords === 0}
          onPress={() => navigation.navigate('QuizSelect')}
        />

        <OrnamentDivider style={styles.divider} />

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Прочитано свитков</Text>
            <Text style={styles.progressCount}>{stats.articlesDone} / {stats.totalArticles}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
            {progress > 8 && (
              <Text style={styles.progressPct}>{progress}%</Text>
            )}
          </View>

          <View style={styles.statsRow}>
            {stats.xp > 0 && <StatPill value={stats.xp} label="XP" />}
            {stats.xp > 0 && stats.totalWords > 0 && <View style={styles.statSep} />}
            {stats.totalWords > 0 && <StatPill value={stats.totalWords} label="заклинаний" />}
            {stats.streak > 0 && (stats.xp > 0 || stats.totalWords > 0) && <View style={styles.statSep} />}
            {stats.streak > 0 && (
              <StatPill value={`🔥 ${stats.streak}`} label="дней" />
            )}
          </View>
        </View>

        {/* Achievements link */}
        <TouchableOpacity
          style={styles.achievRow}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Ionicons name="trophy-outline" size={13} color={colors.inkFaint} />
          <Text style={styles.achievText}>Достижения</Text>
          <Ionicons name="chevron-forward" size={13} color={colors.inkFaint} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuCard({ icon, label, desc, tint, onPress, disabled }) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.82}
    >
      <View style={[styles.cardIconWrap, { borderColor: tint + '50', backgroundColor: tint + '18' }]}>
        <Ionicons name={icon} size={24} color={disabled ? '#bbb' : tint} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardLabel, disabled && styles.cardLabelDim]}>{label}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={disabled ? '#ccc' : colors.gold} />
    </TouchableOpacity>
  );
}

function StatPill({ value, label }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statNum}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.parchmentDark },
  scroll: { paddingBottom: 8 },

  symbolWrap: { alignItems: 'center', marginTop: 16, marginBottom: 4 },
  logo: {
    width: 200,
    height: 200,
  },

  divider: { marginVertical: 12 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardDisabled: { opacity: 0.5 },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardBody: { flex: 1 },
  cardLabel: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 16,
    color: colors.ink,
    marginBottom: 2,
  },
  cardLabelDim: { color: '#aaa' },
  cardDesc: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },

  progressSection: {
    marginHorizontal: 16,
    marginTop: 4,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
  progressCount: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 12,
    color: colors.forestGreen,
  },
  progressBg: {
    height: 10,
    backgroundColor: colors.parchmentDark,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.forestGreen,
    borderRadius: 5,
  },
  progressPct: {
    position: 'absolute',
    left: 6,
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 7,
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  statPill: { alignItems: 'center', paddingHorizontal: 12 },
  statNum: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 20,
    color: colors.ink,
  },
  statLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
  },
  statSep: {
    width: 1,
    height: 28,
    backgroundColor: colors.parchmentBorder,
  },

  achievRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 14,
    paddingVertical: 4,
  },
  achievText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
});
