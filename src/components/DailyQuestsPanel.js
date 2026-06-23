import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function DailyQuestsPanel({ quests }) {
  if (!quests || quests.length === 0) return null;
  const allDone = quests.every(q => q.completed);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Задания дня</Text>
        {allDone && <Text style={styles.allDoneText}>✦ Все выполнены</Text>}
      </View>
      <View style={styles.row}>
        {quests.map(quest => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
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
  icon: {
    marginBottom: 4,
  },
  label: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.inkMuted,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 6,
    minHeight: 30,
  },
  labelDone: {
    color: colors.inkFaint,
  },
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
  barFillDone: {
    backgroundColor: colors.gold,
  },
  counter: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 11,
    color: colors.inkMuted,
    marginBottom: 3,
  },
  counterDone: {
    color: colors.inkFaint,
  },
  reward: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 11,
    color: colors.forestGreen,
  },
  rewardDone: {
    color: colors.gold,
  },
});
