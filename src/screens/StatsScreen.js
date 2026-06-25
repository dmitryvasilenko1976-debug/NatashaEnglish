import React, { useState, useCallback } from 'react';
import ParchmentBackground from '../components/ParchmentBackground';
import {
  View, Text, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator, Platform
} from 'react-native';
import Icon from '../components/Icon';
import { useFocusEffect } from '@react-navigation/native';

import OrnamentDivider from '../components/OrnamentDivider';
import { getGameData, getWordMastery } from '../services/storageService';
import { colors } from '../theme/colors';

const BAR_MAX = 80;

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push({
      date: d.toISOString().split('T')[0],
      label: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'][d.getDay()],
    });
  }
  return days;
}

function StatTile({ icon, value, label }) {
  return (
    <View style={styles.tile}>
      <Icon name={icon} size={20} color={colors.forestGreen} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.tileLabel}>{label}</Text>
    </View>
  );
}

export default function StatsScreen({ navigation }) {
  const [game, setGame] = useState(null);
  const [wordMastery, setWordMastery] = useState({});

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  async function load() {
    const [g, wm] = await Promise.all([getGameData(), getWordMastery()]);
    setGame(g);
    setWordMastery(wm);
  }

  if (!game) {
    return (
      <ParchmentBackground>
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="chevron-back" size={22} color="#c4a96a" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Путь Мастера</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      </SafeAreaView>
    </ParchmentBackground>
    );
  }

  const stats = game.stats || {};
  const days = getLast7Days();
  const todayStr = new Date().toISOString().split('T')[0];
  const activities = days.map(d => ({ ...d, count: stats.dailyActivity?.[d.date] || 0 }));
  const maxCount = Math.max(...activities.map(a => a.count), 1);
  const hasAnyActivity = activities.some(a => a.count > 0);
  const BAR_MAX = 80;

  const top5 = Object.entries(wordMastery)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const records = stats.records || {};

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Путь Мастера</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* 7-day activity chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Активность — 7 дней</Text>
          {hasAnyActivity ? (
            <View style={styles.chartRow}>
              {activities.map((a, i) => (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barCount}>{a.count > 0 ? a.count : ''}</Text>
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { height: Math.max(4, Math.round((a.count / maxCount) * BAR_MAX)) },
                        a.date === todayStr && styles.barToday,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, a.date === todayStr && styles.barLabelToday]}>
                    {a.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noActivity}>Начни читать — здесь появится твой прогресс</Text>
          )}
        </View>

        <OrnamentDivider />

        {/* Stats tiles 2×2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Общая статистика</Text>
          <View style={styles.tilesRow}>
            <StatTile icon="bookmark-outline" value={stats.wordsTotal || 0} label="слов сохранено" />
            <StatTile icon="book-outline"     value={stats.articlesTotal || 0} label="свитков прочитано" />
          </View>
          <View style={[styles.tilesRow, { marginTop: 8 }]}>
            <StatTile icon="help-circle-outline" value={stats.quizCorrect || 0} label="верных ответов" />
            <StatTile icon="repeat-outline"      value={stats.srsReview || 0}   label="повторений" />
          </View>
        </View>

        <OrnamentDivider />

        {/* Top-5 words */}
        {top5.length > 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Самые изученные слова</Text>
              {top5.map(([word, count], i) => (
                <View key={word} style={styles.wordRow}>
                  <Text style={styles.wordRank}>{i + 1}.</Text>
                  <Text style={styles.wordText}>{word}</Text>
                  <Text style={styles.wordCount}>{count}×</Text>
                </View>
              ))}
            </View>
            <OrnamentDivider />
          </>
        )}

        {/* Personal records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Личные рекорды</Text>
          {records.bestDaySentences ? (
            <View style={styles.recordRow}>
              <Icon name="trophy-outline" size={22} color={colors.gold} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.recordValue}>
                  {records.bestDaySentences.count} предложений
                </Text>
                <Text style={styles.recordLabel}>
                  Лучший день · {records.bestDaySentences.date}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.noRecords}>
              Рекорды появятся после первого активного дня
            </Text>
          )}
        </View>

      </ScrollView>
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
  scroll: { paddingBottom: 40 },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 1.5,
    marginBottom: 14,
    textAlign: 'center',
  },

  // Bar chart
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
  },
  barCount: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 10,
    color: colors.inkFaint,
    marginBottom: 4,
    minHeight: 14,
    textAlign: 'center',
  },
  barBg: {
    width: 20,
    height: BAR_MAX,
    backgroundColor: colors.parchmentBorder,
    borderRadius: 3,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#3a7a38',
    borderRadius: 3,
  },
  barToday: { backgroundColor: colors.gold },
  barLabel: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    marginTop: 5,
  },
  barLabelToday: { color: colors.gold },

  noActivity: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    paddingVertical: 20,
  },

  // Stats tiles
  tilesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 14,
    alignItems: 'center',
  },
  tileValue: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 30,
    color: colors.ink,
    marginTop: 6,
  },
  tileLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: 2,
  },

  // Top words
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchmentBorder,
  },
  wordRank: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.inkFaint,
    width: 22,
  },
  wordText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 16,
    color: colors.ink,
    flex: 1,
  },
  wordCount: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.inkMuted,
  },

  // Records
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.goldFaint,
    borderRadius: 4,
    padding: 14,
  },
  recordValue: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 18,
    color: colors.ink,
  },
  recordLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginTop: 3,
  },
  noRecords: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.inkFaint,
    textAlign: 'center',
    paddingVertical: 12,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
