import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Platform, Image,
} from 'react-native';

const NATASHA_PORTRAIT = require('../../assets/portraits/natasha.png');
const MAP_IMAGE = require('../../assets/map-background.png');

import Icon from '../components/Icon';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { LOCATIONS, ZONES_META, OPENING_LETTER } from '../data/storyData';
import { getGameData, getArticles, getProgress } from '../services/storageService';
import { LetterModal } from '../components/StoryModal';

export default function MapScreen({ navigation }) {
  const [xp, setXp] = useState(0);
  const [articlesRead, setArticlesRead] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [showLetter, setShowLetter] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    const game = await getGameData();
    setXp(game?.xp || 0);

    const articles = await getArticles();
    setTotalArticles(articles.length || 0);
    let read = 0;
    for (const a of articles) {
      const prog = await getProgress(a.id);
      if (prog >= a.sentences.length && a.sentences.length > 0) read++;
    }
    setArticlesRead(read);

    const seen = await AsyncStorage.getItem('story_letter_seen');
    if (!seen) setShowLetter(true);
  }

  async function onLetterClose() {
    await AsyncStorage.setItem('story_letter_seen', '1');
    setShowLetter(false);
  }

  const currentZone = useMemo(() => {
    let zone = ZONES_META[0];
    for (const loc of LOCATIONS) {
      if (xp >= loc.unlock_xp) {
        const z = ZONES_META.find(z => z.id === loc.zone);
        if (z) zone = z;
      }
    }
    return zone;
  }, [xp]);

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icon name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Карта Путешествия</Text>
        <View style={styles.topRight}>
          <Image source={NATASHA_PORTRAIT} style={styles.natashaAvatar} resizeMode="cover" />
          <View style={styles.xpPill}>
            <Icon name="star-outline" size={13} color={colors.goldBright} />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>
      </View>

      <Image
        source={MAP_IMAGE}
        style={styles.mapImage}
        resizeMode="cover"
      />

      <View style={styles.bottomPanel}>
        <Text style={styles.zoneName}>⁕ {currentZone?.name || 'Долина Начала'} ⁕</Text>
        <Text style={styles.progress}>
          Прочитано {articlesRead} из {totalArticles} свитков
        </Text>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.82}
        >
          <Text style={styles.continueBtnText}>Продолжить путешествие</Text>
          <Icon name="chevron-forward" size={16} color={colors.parchment} />
        </TouchableOpacity>
      </View>

      <LetterModal visible={showLetter} text={OPENING_LETTER} onClose={onLetterClose} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.forestGreen },
  topBar: {
    backgroundColor: colors.forestGreen,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold + '50',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: { padding: 4 },
  topTitle: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 16,
    color: '#f0e6c8',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  natashaAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#c4a96a' },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold + '25',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold + '40',
  },
  xpText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 12,
    color: colors.goldBright,
  },
  mapImage: {
    flex: 1,
    width: '100%',
  },
  bottomPanel: {
    backgroundColor: colors.forestGreen,
    borderTopWidth: 1,
    borderTopColor: colors.gold + '50',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  zoneName: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 15,
    color: colors.goldBright,
    letterSpacing: 1,
  },
  progress: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 12,
    color: colors.parchment,
    opacity: 0.8,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  continueBtnText: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 15,
    color: colors.parchment,
  },
});
