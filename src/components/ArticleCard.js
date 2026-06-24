import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function ArticleCard({ article, progress, wordCount, onPress, onLongPress }) {
  const total = article.sentences.length;
  const pct = total > 0 ? Math.min(progress / total, 1) : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      delayLongPress={600}
    >
      <View style={styles.innerFrame} pointerEvents="none" />

      <Text style={styles.tag}>{article.tag}</Text>
      <Text style={styles.title} numberOfLines={2}>{article.title}</Text>

      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>

      <Text style={styles.meta}>
        {pct >= 1
          ? (wordCount > 0 ? `${wordCount} слов · Свиток пройден ✓` : 'Свиток пройден ✓')
          : pct > 0
            ? (wordCount > 0 ? `${wordCount} слов · ${Math.round(pct * 100)}% прочитано` : `${Math.round(pct * 100)}% прочитано`)
            : 'Свиток не открывался'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 3,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  innerFrame: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    borderWidth: 0.5,
    borderColor: '#c4a96a50',
    borderRadius: 2,
    pointerEvents: 'none',
  },
  tag: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  title: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 15,
    color: colors.ink,
    marginBottom: 10,
  },
  progressBg: {
    height: 3,
    backgroundColor: colors.goldFaint,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.forestGreen,
    borderRadius: 2,
  },
  meta: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 10,
    color: colors.inkFaint,
  },
});
