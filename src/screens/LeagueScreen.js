import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import OrnamentDivider from '../components/OrnamentDivider';
import { getGameData } from '../services/storageService';
import { getLeagueTierName } from '../services/gamificationService';
import { colors } from '../theme/colors';

const POSITION_MEDALS = ['🥇', '🥈', '🥉'];

function daysUntilSunday() {
  const dow = new Date().getDay(); // 0=Sun
  return dow === 0 ? 7 : 7 - dow;
}

export default function LeagueScreen({ navigation }) {
  const [rows, setRows] = useState([]);
  const [tierName, setTierName] = useState('');
  const [userPos, setUserPos] = useState(null);
  const [daysLeft, setDaysLeft] = useState(daysUntilSunday());

  useFocusEffect(
    useCallback(() => {
      load();
      setDaysLeft(daysUntilSunday());
    }, [])
  );

  async function load() {
    const game = await getGameData();
    const rivals = game.league?.rivals || [];
    const tier = game.league?.tier || 0;
    setTierName(getLeagueTierName(tier));

    const all = [
      { name: 'Ты', xp: game.xp, isUser: true },
      ...rivals.map(r => ({ ...r, isUser: false })),
    ];
    all.sort((a, b) => b.xp - a.xp);
    setRows(all);
    setUserPos(all.findIndex(r => r.isUser) + 1);
  }

  const renderItem = ({ item, index }) => {
    const pos = index + 1;
    const medal = pos <= 3 ? POSITION_MEDALS[pos - 1] : null;
    return (
      <View style={[styles.row, item.isUser && styles.rowUser]}>
        <View style={styles.posCol}>
          {medal
            ? <Text style={styles.medal}>{medal}</Text>
            : <Text style={[styles.posNum, item.isUser && styles.posNumUser]}>{pos}</Text>
          }
        </View>
        <Text style={[styles.name, item.isUser && styles.nameUser]} numberOfLines={1}>
          {item.name}
          {item.isUser ? ' (ты)' : ''}
        </Text>
        <Text style={[styles.xp, item.isUser && styles.xpUser]}>
          {item.xp} XP
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
        <Text style={styles.topTitle}>{tierName || 'Лига'}</Text>
        <View style={styles.iconBtn} />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r, i) => r.name + i}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <View style={styles.summaryRow}>
              {userPos !== null && (
                <Text style={styles.summaryText}>
                  Твоя позиция: #{userPos} из {rows.length}
                </Text>
              )}
              <Text style={styles.daysLeft}>
                Лига заканчивается через {daysLeft} дн.
              </Text>
            </View>
            <OrnamentDivider />
          </>
        }
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              Соперники обновляются при каждом входе.{'\n'}
              Победители повышаются в лиге.
            </Text>
          </View>
        }
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
  list: { paddingBottom: 24, paddingTop: 4 },
  summaryRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 16,
    color: colors.ink,
  },
  daysLeft: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.parchment,
  },
  rowUser: {
    backgroundColor: '#eef5ea',
    borderLeftWidth: 3,
    borderLeftColor: colors.forestGreen,
  },
  posCol: { width: 36, alignItems: 'center' },
  medal: { fontSize: 20 },
  posNum: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 14,
    color: colors.inkFaint,
  },
  posNumUser: { color: colors.forestGreen, fontFamily: 'Cinzel_700Bold' },
  name: {
    flex: 1,
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginLeft: 8,
  },
  nameUser: {
    fontFamily: 'CrimsonText_600SemiBold',
    color: colors.forestGreen,
  },
  xp: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: colors.inkMuted,
    minWidth: 70,
    textAlign: 'right',
  },
  xpUser: {
    fontFamily: 'CrimsonText_600SemiBold',
    color: colors.forestGreen,
  },
  sep: {
    height: 1,
    backgroundColor: colors.parchmentBorder,
    marginHorizontal: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerNote: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
    lineHeight: 18,
  },
});
