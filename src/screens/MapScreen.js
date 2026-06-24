import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions, Animated, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { LOCATIONS, ZONES_META, OPENING_LETTER } from '../data/storyData';
import { getGameData, getSavedWords, getArticles, getProgress } from '../services/storageService';
import StoryModal, { LetterModal } from '../components/StoryModal';

// Map max-width so it looks good on desktop too
const MAP_W = Math.min(Dimensions.get('window').width, 500);

// Layout constants
const NODE_R = 28;
const V_STEP = 130;
const ZONE_BANNER_H = 48;
const ZONE_GAP = 64;
const START_Y = 24;

// Three column X positions (relative to MAP_W)
const CX = { L: Math.round(MAP_W * 0.18), C: Math.round(MAP_W * 0.5), R: Math.round(MAP_W * 0.82) };

// Zigzag column pattern for 28 nodes
const COLS = [
  'C','L','R',
  'C','L','R','C',
  'L','C','R','L','C','R','L','C',
  'R','L','C','R','L','C','R',
  'L','C','R',
  'L','C','R',
];

function buildLayout() {
  const positions = [];
  const bannerY = {};
  let y = START_Y;
  let prevZone = 0;

  LOCATIONS.forEach((loc, i) => {
    if (loc.zone !== prevZone) {
      if (i > 0) y += ZONE_GAP;
      bannerY[loc.zone] = y;
      y += ZONE_BANNER_H + 20;
      prevZone = loc.zone;
    }
    positions.push({ x: CX[COLS[i]], y: y + NODE_R });
    y += V_STEP;
  });

  return { positions, bannerY, totalH: y + NODE_R + 80 };
}

const { positions: NODE_POS, bannerY: BANNER_Y, totalH: MAP_H } = buildLayout();

function dotsPath(x1, y1, x2, y2) {
  const sx = x1, sy = y1 + NODE_R + 4;
  const ex = x2, ey = y2 - NODE_R - 4;
  const dx = ex - sx, dy = ey - sy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const n = Math.max(1, Math.floor(dist / 14));
  const dots = [];
  for (let k = 1; k <= n; k++) {
    const t = k / (n + 1);
    dots.push({ x: sx + dx * t, y: sy + dy * t });
  }
  return dots;
}

export default function MapScreen({ navigation }) {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [masteredWords, setMasteredWords] = useState(0);
  const [articlesRead, setArticlesRead] = useState(0);
  const [totalArticles, setTotalArticles] = useState(10);
  const [showLetter, setShowLetter] = useState(false);
  const [storyModal, setStoryModal] = useState(null); // { location, dialogue }
  const scrollRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    const game = await getGameData();
    const newXp = game?.xp || 0;
    setXp(newXp);
    setStreak(game?.streak?.current || 0);

    // Count mastered words across all articles
    const articles = await getArticles();
    setTotalArticles(articles.length || 10);
    let mastered = 0;
    let read = 0;
    for (const a of articles) {
      const prog = await getProgress(a.id);
      if (prog >= a.sentences.length && a.sentences.length > 0) read++;
      const words = await getSavedWords(a.id);
      mastered += Object.values(words).filter(w => (w.repetitions || 0) >= 8).length;
    }
    setMasteredWords(mastered);
    setArticlesRead(read);

    // Show opening letter once
    const seen = await AsyncStorage.getItem('story_letter_seen');
    if (!seen) setShowLetter(true);
  }

  async function onLetterClose() {
    await AsyncStorage.setItem('story_letter_seen', '1');
    setShowLetter(false);
  }

  const currentNodeIndex = useMemo(() => {
    let last = -1;
    LOCATIONS.forEach((loc, i) => {
      if (xp >= loc.unlock_xp && isConditionMet(loc, streak, masteredWords, articlesRead, totalArticles)) {
        last = i;
      }
    });
    return last;
  }, [xp, streak, masteredWords, articlesRead, totalArticles]);

  function isConditionMet(loc, str, mw, ar, total) {
    if (!loc.unlock_condition) return true;
    if (loc.unlock_condition.includes('Стрик 30')) return str >= 30;
    if (loc.unlock_condition.includes('50 слов')) return mw >= 50;
    if (loc.unlock_condition.includes('Все статьи')) return ar >= total;
    return true;
  }

  function nodeState(i) {
    if (i > currentNodeIndex) return 'locked';
    if (i === currentNodeIndex) return 'current';
    return 'completed';
  }

  function onNodePress(i) {
    const loc = LOCATIONS[i];
    setStoryModal({ location: loc, dialogue: loc.arrival_dialogue });
  }

  function onModalDone() {
    const loc = storyModal?.location;
    setStoryModal(null);
    if (loc?.screen) navigation.navigate(loc.screen);
  }

  // Auto-scroll to current node
  useEffect(() => {
    if (scrollRef.current && currentNodeIndex >= 0) {
      const pos = NODE_POS[currentNodeIndex];
      const screenH = Dimensions.get('window').height;
      const scrollY = Math.max(0, pos.y - screenH * 0.45);
      setTimeout(() => scrollRef.current?.scrollTo({ y: scrollY, animated: true }), 400);
    }
  }, [currentNodeIndex]);

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Карта Путешествия</Text>
        <View style={styles.topRight}>
          <Text style={styles.natashaAvatar}>👩‍⚕️</Text>
          <View style={styles.xpPill}>
            <Ionicons name="star-outline" size={13} color={colors.goldBright} />
            <Text style={styles.xpText}>{xp} XP</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Center the fixed-width map on wide screens */}
        <View style={styles.mapOuter}>
          <View style={[styles.mapInner, { height: MAP_H }]}>

        {/* Zone backgrounds */}
        {ZONES_META.map((zone, zi) => {
          const startY = BANNER_Y[zone.id] ?? 0;
          const nextZone = ZONES_META[zi + 1];
          const endY = nextZone ? (BANNER_Y[nextZone.id] ?? MAP_H) : MAP_H;
          return (
            <View key={zone.id} style={[styles.zoneBg, { top: startY, height: endY - startY, backgroundColor: zone.bg }]} />
          );
        })}

        {/* Zone banners */}
        {ZONES_META.map(zone => (
          <View key={`b${zone.id}`} style={[styles.zoneBanner, { top: BANNER_Y[zone.id] ?? 0, borderColor: zone.accent + '80' }]}>
            <View style={[styles.zoneBannerLine, { backgroundColor: zone.accent + '70' }]} />
            <Text style={[styles.zoneBannerText, { color: zone.accent }]}>⁕ {zone.name} ⁕</Text>
            <View style={[styles.zoneBannerLine, { backgroundColor: zone.accent + '70' }]} />
          </View>
        ))}

        {/* Path dots between nodes */}
        {NODE_POS.map((pos, i) => {
          if (i === 0) return null;
          const prev = NODE_POS[i - 1];
          const completed = i <= currentNodeIndex;
          const dots = dotsPath(prev.x, prev.y, pos.x, pos.y);
          return dots.map((d, k) => (
            <View
              key={`d${i}_${k}`}
              style={[
                styles.pathDot,
                {
                  left: d.x - 5,
                  top: d.y - 5,
                  backgroundColor: completed ? colors.goldBright : '#8B7355',
                  opacity: completed ? 0.9 : 0.65,
                },
              ]}
            />
          ));
        })}

        {/* Nodes */}
        {LOCATIONS.map((loc, i) => {
          const pos = NODE_POS[i];
          const state = nodeState(i);
          const isCurrent = state === 'current';
          const isCompleted = state === 'completed';
          const isLocked = state === 'locked';
          const zone = ZONES_META.find(z => z.id === loc.zone);
          const accent = zone?.accent || colors.gold;

          return (
            <View key={loc.name_en} style={[styles.nodeWrap, { left: pos.x - NODE_R, top: pos.y - NODE_R }]}>
              {/* Glow ring for current — animated pulse */}
              {isCurrent && (
                <Animated.View style={[styles.glowRing, { borderColor: accent + '60', opacity: pulseAnim }]} />
              )}

              <TouchableOpacity
                onPress={() => !isLocked && onNodePress(i)}
                activeOpacity={isLocked ? 1 : 0.75}
                style={[
                  styles.node,
                  isCompleted && { backgroundColor: colors.parchment, borderColor: accent, borderWidth: 2 },
                  isCurrent && { backgroundColor: accent, borderColor: accent, borderWidth: 2 },
                  isLocked && styles.nodeLocked,
                ]}
              >
                <Ionicons
                  name={loc.icon}
                  size={20}
                  color={isLocked ? '#c0b89a' : isCurrent ? '#fff' : accent}
                />
              </TouchableOpacity>

              {/* Checkmark badge */}
              {isCompleted && (
                <View style={[styles.checkBadge, { backgroundColor: accent }]}>
                  <Ionicons name="checkmark" size={8} color="#fff" />
                </View>
              )}

              {/* Lock badge */}
              {isLocked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={8} color="#b0a080" />
                </View>
              )}

              {/* Name label */}
              <Text
                style={[styles.nodeLabel, isLocked && styles.nodeLabelLocked]}
                numberOfLines={2}
              >
                {loc.name_ru}
              </Text>

            </View>
          );
        })}

        {/* Fog overlay on zones 5-6 if not yet reached */}
        {currentNodeIndex < 21 && (
          <View style={[styles.fogOverlay, { top: BANNER_Y[5] ?? MAP_H - 200 }]} pointerEvents="none" />
        )}

          </View>{/* mapInner */}
        </View>{/* mapOuter */}
      </ScrollView>

      {/* Letter modal */}
      <LetterModal visible={showLetter} text={OPENING_LETTER} onClose={onLetterClose} />

      {/* Story dialogue modal */}
      <StoryModal
        visible={!!storyModal}
        dialogue={storyModal?.dialogue}
        title={storyModal?.location?.name_ru}
        onClose={() => setStoryModal(null)}
        onDone={onModalDone}
        actionLabel={storyModal?.location?.screen ? 'Отправиться туда →' : 'Закрыть'}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.forestGreen,
  },
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
  scroll: {
    flex: 1,
    backgroundColor: '#f0ebe0',
  },
  mapOuter: {
    alignItems: 'center',
    backgroundColor: '#f0ebe0',
  },
  mapInner: {
    width: MAP_W,
    position: 'relative',
    overflow: 'hidden',
  },

  // Zone backgrounds (absolute)
  zoneBg: {
    position: 'absolute',
    left: 0,
    right: 0,
  },

  // Zone banners
  zoneBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: ZONE_BANNER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
  },
  zoneBannerLine: {
    flex: 1,
    height: 1,
  },
  zoneBannerText: {
    fontFamily: 'AlmendraDisplay_400Regular',
    fontSize: 13,
    letterSpacing: 1,
  },

  // Path
  pathDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Nodes
  nodeWrap: {
    position: 'absolute',
    width: NODE_R * 2,
    alignItems: 'center',
  },
  node: {
    width: NODE_R * 2,
    height: NODE_R * 2,
    borderRadius: NODE_R,
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(44,26,14,0.12)' },
      default: { elevation: 3 },
    }),
  },
  nodeLocked: {
    backgroundColor: '#e8e0d0',
    borderColor: '#c8c0a8',
    opacity: 0.65,
  },
  glowRing: {
    position: 'absolute',
    width: NODE_R * 2 + 14,
    height: NODE_R * 2 + 14,
    borderRadius: NODE_R + 7,
    borderWidth: 2,
    top: -7,
    left: -7,
  },
  checkBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.parchment,
  },
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#c8c0a8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.parchment,
  },
  nodeLabel: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 12,
    color: colors.ink,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 16,
    width: 96,
  },
  nodeLabelLocked: {
    color: '#7a6a50',
  },

  // Natasha in header
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  natashaAvatar: { fontSize: 20 },

  // Fog
  fogOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(240,235,220,0.55)',
    pointerEvents: 'none',
  },
});
