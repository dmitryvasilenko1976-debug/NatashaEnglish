import React, { useState, useCallback } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView, Platform, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../components/Icon';
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
    <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        style={Platform.OS === 'web' ? { overflowY: 'scroll' } : undefined}
      >
        {/* App logo */}
        <View style={styles.symbolWrap}>
          <Image
            source={require('../../assets/logo-welcome.png')}
            style={styles.welcomeLogo}
            resizeMode="contain"
          />
        </View>

        {/* Map card — главный вход в историю */}
        <TouchableOpacity
          style={styles.mapCard}
          onPress={() => navigation.navigate('Map')}
          activeOpacity={0.82}
        >
          <View style={styles.mapCardLeft}>
            <Icon name="compass-outline" size={26} color={colors.goldBright} />
          </View>
          <View style={styles.mapCardBody}>
            <Text style={styles.mapCardTitle}>Волшебная Карта</Text>
            <Text style={styles.mapCardDesc}>Путешествие Наташи · 28 локаций · 6 зон</Text>
          </View>
          <Icon name="chevron-forward" size={16} color={colors.goldBright} />
        </TouchableOpacity>

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
          desc={stats.totalArticles > 0 ? `${stats.totalArticles} свитков · Свитки целителя` : 'Загрузка…'}
          tint={colors.forestGreen}
          onPress={() => navigation.navigate('Home')}
        />

        <MenuCard
          icon="shield-outline"
          label="Испытание в таверне"
          desc={
            stats.totalWords > 0
              ? `${stats.totalWords} заклинаний готово`
              : 'Собери заклинания, читая свитки'
          }
          tint="#7a3c10"
          disabled={stats.totalWords === 0}
          onPress={() => navigation.navigate('QuizSelect')}
        />

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
          <Icon name="trophy-outline" size={13} color={colors.inkFaint} />
          <Text style={styles.achievText}>Достижения</Text>
          <Icon name="chevron-forward" size={13} color={colors.inkFaint} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
    </ParchmentBackground>
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
        <Icon name={icon} size={24} color={disabled ? '#bbb' : tint} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardLabel, disabled && styles.cardLabelDim]}>{label}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>
      <Icon name={disabled ? 'lock-closed-outline' : 'chevron-forward'} size={18} color={disabled ? '#aaa' : colors.gold} />
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
  safe: { flex: 1, backgroundColor: 'transparent' },
  scroll: { paddingBottom: 40 },

  symbolWrap: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  welcomeLogo: {
    width: 300,
    height: 372,
    borderRadius: 12,
    overflow: 'hidden',
  },

  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: colors.forestGreen,
    borderWidth: 1.5,
    borderColor: colors.goldBright + '80',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '0 2px 12px rgba(44,26,14,0.18)' },
      default: { elevation: 4 },
    }),
  },
  mapCardLeft: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.goldBright + '60',
    backgroundColor: colors.goldBright + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCardBody: { flex: 1 },
  mapCardTitle: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 17,
    color: '#f0e6c8',
    marginBottom: 2,
  },
  mapCardDesc: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.goldBright,
    opacity: 0.85,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.parchment,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardDisabled: { opacity: 0.65 },
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
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.inkFaint,
  },

  progressSection: {
    marginHorizontal: 16,
    marginTop: 24,
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
    fontFamily: 'CrimsonText_400Regular',
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
    fontFamily: 'CrimsonText_400Regular',
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
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.inkFaint,
  },
});
