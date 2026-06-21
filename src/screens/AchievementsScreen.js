import React, { useEffect, useState } from 'react';
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

export default function AchievementsScreen({ navigation }) {
  const [unlockedMap, setUnlockedMap] = useState({});
  const [xp, setXp] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const game = await getGameData();
    setUnlockedMap(game.achievements || {});
    setXp(game.xp || 0);
  }

  const unlocked = ACHIEVEMENTS.filter(a => unlockedMap[a.id]).length;
  const totalXpFromAchievements = ACHIEVEMENTS
    .filter(a => unlockedMap[a.id])
    .reduce((sum, a) => sum + a.xpBonus, 0);

  const renderItem = ({ item }) => {
    const isUnlocked = !!unlockedMap[item.id];
    return (
      <View style={[styles.tile, isUnlocked && styles.tileUnlocked, !isUnlocked && styles.tileLocked]}>
        <Ionicons
          name={item.icon}
          size={28}
          color={isUnlocked ? colors.gold : '#ccc'}
        />
        <Text
          style={[styles.tileName, !isUnlocked && styles.tileNameLocked]}
          numberOfLines={2}
        >
          {isUnlocked ? item.name : '?????'}
        </Text>
        <Text style={styles.tileCondition} numberOfLines={2}>
          {item.condition}
        </Text>
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

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          Получено {unlocked} из {ACHIEVEMENTS.length} достижений · {xp} XP заработано
        </Text>
      </View>

      <OrnamentDivider />

      <FlatList
        data={ACHIEVEMENTS}
        keyExtractor={a => a.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={renderItem}
        ListFooterComponent={<View style={{ height: 24 }} />}
      />
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
  statsRow: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  statsText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
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
  tileUnlocked: {
    backgroundColor: colors.forestGreenLight,
    borderColor: colors.forestGreen,
  },
  tileLocked: {
    opacity: 0.5,
  },
  tileName: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 13,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  tileNameLocked: {
    color: '#bbb',
  },
  tileCondition: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
    textAlign: 'center',
  },
});
