import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

import OrnamentDivider from '../components/OrnamentDivider';
import { getGameData } from '../services/storageService';
import { ACHIEVEMENTS } from '../data/achievements';
import { colors } from '../theme/colors';

// ── Heatmap calendar ──────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];
const DAY_LABELS = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

function getCellColor(count) {
  if (!count) return '#e8e0cc';
  if (count < 6)  return '#8bc48a';
  if (count < 21) return '#3a8f38';
  return '#2d6e2b';
}

function HeatmapCalendar({ dailyActivity }) {
  const today = new Date();
  const year  = today.getFullYear();
  const month = today.getMonth();
  const firstDow = new Date(year, month, 1).getDay();   // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDay = today.getDate();

  // Build weeks (rows of 7, padded)
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <View style={hm.container}>
      <Text style={hm.title}>{MONTH_NAMES[month]} {year}</Text>
      <View style={hm.dayRow}>
        {DAY_LABELS.map(d => (
          <Text key={d} style={hm.dayLabel}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={hm.weekRow}>
          {week.map((day, di) => {
            if (!day) return <View key={di} style={hm.cell} />;
            const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const count = (dailyActivity || {})[dateStr] || 0;
            const isToday = day === todayDay;
            return (
              <View
                key={di}
                style={[hm.cell, { backgroundColor: getCellColor(count) }, isToday && hm.cellToday]}
              />
            );
          })}
        </View>
      ))}
      <View style={hm.legend}>
        {[0, 3, 10, 21].map((n, i) => (
          <View key={i} style={hm.legendItem}>
            <View style={[hm.legendDot, { backgroundColor: getCellColor(n || null) }]} />
            <Text style={hm.legendText}>
              {i === 0 ? '0' : i === 1 ? '1–5' : i === 2 ? '6–20' : '21+'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const CELL = 36;

const hm = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 12,
  },
  title: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  dayRow: { flexDirection: 'row', marginBottom: 4 },
  dayLabel: {
    width: CELL,
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  weekRow: { flexDirection: 'row', marginBottom: 3 },
  cell: {
    width: CELL - 3,
    height: CELL - 3,
    marginRight: 3,
    borderRadius: 3,
    backgroundColor: '#e8e0cc',
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 10,
    color: colors.inkFaint,
  },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export default function AchievementsScreen({ navigation }) {
  const [unlockedMap, setUnlockedMap] = useState({});
  const [xp, setXp] = useState(0);
  const [gems, setGems] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [dailyActivity, setDailyActivity] = useState({});

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  async function loadData() {
    const game = await getGameData();
    setUnlockedMap(game.achievements || {});
    setXp(game.xp || 0);
    setGems(game.gems || 0);
    setShieldActive(!!game.streakShield);
    setDailyActivity(game.stats?.dailyActivity || {});
  }

  const unlocked = ACHIEVEMENTS.filter(a => unlockedMap[a.id]).length;

  const renderItem = ({ item }) => {
    const isUnlocked = !!unlockedMap[item.id];
    return (
      <View style={[styles.tile, isUnlocked && styles.tileUnlocked, !isUnlocked && styles.tileLocked]}>
        <Ionicons name={item.icon} size={28} color={isUnlocked ? colors.gold : '#ccc'} />
        <Text style={[styles.tileName, !isUnlocked && styles.tileNameLocked]} numberOfLines={2}>
          {isUnlocked ? item.name : '?????'}
        </Text>
        <Text style={styles.tileCondition} numberOfLines={2}>{item.condition}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Орден Хранителей</Text>
        <View style={styles.iconBtn} />
      </View>

      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={a => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListHeaderComponent={
          <>
            <HeatmapCalendar dailyActivity={dailyActivity} />

            {/* Gems + Shield row */}
            <View style={styles.gemsRow}>
              <Text style={styles.gemsLabel}>◈ {gems} самоцветов</Text>
              {shieldActive
                ? <Text style={styles.shieldStatus}>🛡 Щит активен</Text>
                : (
                  <TouchableOpacity
                    style={[styles.shieldBtn, gems < 100 && styles.shieldBtnDisabled]}
                    onPress={async () => {
                      const { buyStreakShield: buy } = await import('../services/gamificationService');
                      const result = await buy();
                      if (result.success) { setGems(result.gems); setShieldActive(true); }
                    }}
                  >
                    <Text style={[styles.shieldBtnText, gems < 100 && styles.shieldBtnTextDisabled]}>
                      🛡 Купить щит серии — 100◈
                    </Text>
                  </TouchableOpacity>
                )
              }
            </View>

            <OrnamentDivider />
            <Text style={styles.achievementsHeader}>
              Достижения · {unlocked} / {ACHIEVEMENTS.length}
            </Text>
          </>
        }
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
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
  gemsRow: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gemsLabel: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 14,
    color: '#7ec8e3',
  },
  shieldStatus: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.gold,
  },
  shieldBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 4,
  },
  shieldBtnDisabled: {
    borderColor: colors.parchmentBorder,
  },
  shieldBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 12,
    color: colors.inkMuted,
  },
  shieldBtnTextDisabled: {
    color: colors.inkFaint,
  },
  achievementsHeader: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  grid: { paddingHorizontal: 12, paddingTop: 4 },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  tile: {
    flex: 0.48,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 3,
    padding: 12,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
  },
  tileUnlocked: { backgroundColor: colors.forestGreenLight, borderColor: colors.forestGreen },
  tileLocked: { opacity: 0.5 },
  tileName: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  tileNameLocked: { color: '#bbb' },
  tileCondition: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
