import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
  };
}

function daysUntilSunday() {
  const dow = new Date().getDay();
  return dow === 0 ? 7 : 7 - dow;
}

export default function DailyQuestsPanel({ quests, weeklyQuest, quietMode }) {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeUntilMidnight()), 60000);
    return () => clearInterval(id);
  }, []);

  if (!quests || quests.length === 0) return null;
  const allDone = quests.every(q => q.completed);

  const timerColor = quietMode
    ? colors.inkFaint
    : timeLeft.hours >= 8 ? colors.inkFaint
    : timeLeft.hours >= 4 ? colors.gold
    : '#e05a00';

  return (
    <View style={styles.container}>
      {weeklyQuest && <WeeklyQuestCard quest={weeklyQuest} />}

      <View style={styles.header}>
        <Text style={styles.headerText}>Задания дня</Text>
        {allDone
          ? <Text style={styles.allDoneText}>✦ Все выполнены</Text>
          : <Text style={[styles.timerText, { color: timerColor }]}>
              {!quietMode && timeLeft.hours < 4 ? '⚠ ' : ''}{timeLeft.hours}ч {timeLeft.minutes}м
            </Text>
        }
      </View>
      <View style={styles.row}>
        {quests.map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </View>
    </View>
  );
}

function WeeklyQuestCard({ quest }) {
  const pct = quest.target > 0 ? Math.min(1, quest.progress / quest.target) : 0;
  const done = quest.completed;
  const daysLeft = daysUntilSunday();

  return (
    <View style={[wq.card, done && wq.cardDone]}>
      <View style={wq.topRow}>
        <Text style={wq.weekLabel}>⚔️ НЕДЕЛЬНОЕ ИСПЫТАНИЕ</Text>
        {!done
          ? <Text style={wq.daysLeft}>{daysLeft} дн.</Text>
          : <Text style={wq.completedBadge}>✓ Выполнено</Text>
        }
      </View>
      <View style={wq.bodyRow}>
        <Ionicons name={done ? 'checkmark-circle' : quest.icon} size={18} color={done ? colors.gold : colors.forestGreen} />
        <Text style={[wq.label, done && wq.labelDone]} numberOfLines={1}>{quest.label}</Text>
      </View>
      <View style={wq.bar}>
        <View style={[wq.barFill, { width: `${Math.round(pct * 100)}%` }, done && wq.barFillDone]} />
      </View>
      <View style={wq.bottomRow}>
        <Text style={wq.counter}>{Math.min(quest.progress, quest.target)}/{quest.target}</Text>
        <Text style={[wq.reward, done && wq.rewardDone]}>
          {done ? '✓ ' : '+'}◈ {quest.reward}
        </Text>
      </View>
    </View>
  );
}

function QuestCard({ quest }) {
  const pct = quest.target > 0 ? quest.progress / quest.target : 0;
  const done = quest.completed;

  return (
    <View style={[styles.card, done && styles.cardDone]}>
      <Ionicons
        name={done ? 'checkmark-circle' : quest.icon}
        size={18}
        color={done ? colors.gold : colors.forestGreen}
        style={styles.icon}
      />
      <Text style={[styles.label, done && styles.labelDone]} numberOfLines={2}>
        {quest.label}
      </Text>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }, done && styles.barFillDone]} />
      </View>
      <Text style={[styles.counter, done && styles.counterDone]}>
        {quest.progress}/{quest.target}
      </Text>
      <Text style={[styles.reward, done && styles.rewardDone]}>
        {done ? '✓' : '+'}{quest.xpReward} XP
      </Text>
    </View>
  );
}

// ── Weekly quest styles ───────────────────────────────────────────────────────
const wq = StyleSheet.create({
  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  cardDone: {
    backgroundColor: '#f5f0e0',
    borderColor: colors.goldFaint,
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  weekLabel: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 9,
    color: colors.inkFaint,
    letterSpacing: 1,
  },
  daysLeft: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: '#e05a00',
  },
  completedBadge: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.gold,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 13,
    color: colors.inkMuted,
    flex: 1,
  },
  labelDone: { color: colors.inkFaint },
  bar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.parchmentBorder,
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: 4,
    backgroundColor: '#3a7a38',
    borderRadius: 2,
  },
  barFillDone: { backgroundColor: colors.gold },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counter: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.inkFaint,
  },
  reward: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 13,
    color: '#7ec8e3',
  },
  rewardDone: { color: colors.gold },
});

// ── Daily quest styles ────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  headerText: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 1.5,
  },
  allDoneText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.gold,
  },
  timerText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchmentBorder,
    borderRadius: 4,
    padding: 10,
    alignItems: 'center',
  },
  cardDone: {
    backgroundColor: '#f5f0e0',
    borderColor: colors.goldFaint,
    opacity: 0.85,
  },
  icon: { marginBottom: 4 },
  label: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6,
    minHeight: 30,
  },
  labelDone: { color: colors.inkFaint },
  bar: {
    width: '100%',
    height: 3,
    backgroundColor: colors.parchmentBorder,
    borderRadius: 2,
    marginBottom: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: 3,
    backgroundColor: colors.forestGreen,
    borderRadius: 2,
  },
  barFillDone: { backgroundColor: colors.gold },
  counter: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.inkMuted,
    marginBottom: 3,
  },
  counterDone: { color: colors.inkFaint },
  reward: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 11,
    color: colors.forestGreen,
  },
  rewardDone: { color: colors.gold },
});
