import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { colors } from '../theme/colors';

export default function ArticleCard({ article, progress, wordCount, onPress, onLongPress }) {
  const total = article.sentences.length;
  const pct = total > 0 ? Math.min(progress / total, 1) : 0;
  const done = pct >= 1;
  const started = pct > 0;

  return (
    <TouchableOpacity
      style={[styles.card, done && styles.cardDone]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.82}
      delayLongPress={600}
    >
      <View style={styles.innerFrame} pointerEvents="none" />

      <View style={styles.headerRow}>
        <Text style={[styles.tag, done && styles.tagDone]}>{article.tag}</Text>
        {done && <Text style={styles.doneIcon}>✓</Text>}
      </View>

      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>

      <View style={styles.progressBg}>
        <View style={[
          styles.progressFill,
          { width: `${Math.round(pct * 100)}%` },
          done && styles.progressFillDone,
        ]} />
      </View>

      <Text style={[styles.meta, done && styles.metaDone]}>
        {total} предл.
        {done
          ? (wordCount > 0 ? ` · ${wordCount} слов · Пройден` : ' · Пройден')
          : started
            ? (wordCount > 0 ? ` · ${wordCount} слов · ${Math.round(pct * 100)}%` : ` · ${Math.round(pct * 100)}%`)
            : ' · Не открывался'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1.5,
    borderColor: colors.gold + '90',
    borderRadius: 6,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(44,26,14,0.10), 0 1px 2px rgba(184,151,90,0.15)',
        transition: 'box-shadow 0.15s ease',
      },
      default: { elevation: 2 },
    }),
  },
  cardDone: {
    borderColor: colors.forestGreen,
    backgroundColor: '#f4f9f4',
  },
  innerFrame: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderWidth: 0.5,
    borderColor: '#c4a96a35',
    borderRadius: 3,
    pointerEvents: 'none',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tag: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
  },
  tagDone: {
    color: colors.forestGreen,
  },
  doneIcon: {
    fontSize: 13,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  title: {
    fontFamily: 'Almendra_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
    lineHeight: 21,
  },
  progressBg: {
    height: 5,
    backgroundColor: colors.goldFaint,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 7,
  },
  progressFill: {
    height: 5,
    backgroundColor: colors.forestGreenBright,
    borderRadius: 3,
  },
  progressFillDone: {
    backgroundColor: colors.emerald,
  },
  meta: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
  },
  metaDone: {
    color: colors.forestGreen,
    fontWeight: '600',
  },
});
