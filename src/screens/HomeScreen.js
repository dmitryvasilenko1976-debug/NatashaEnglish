import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ArticleCard from '../components/ArticleCard';
import OrnamentDivider from '../components/OrnamentDivider';
import AchievementModal from '../components/AchievementModal';
import DailyQuestsPanel from '../components/DailyQuestsPanel';
import {
  getArticles, saveArticle, deleteArticle,
  getSavedWords, getProgress, getGameData, saveGameData, updateStreak,
} from '../services/storageService';
import { getLevelInfo, getDailyQuests } from '../services/gamificationService';
import { pickAndParsePDF } from '../services/pdfService';
import { sampleArticle } from '../data/sampleArticle';
import { colors } from '../theme/colors';

export default function HomeScreen({ navigation }) {
  const [articles, setArticles] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [wordCountMap, setWordCountMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [pendingAchievements, setPendingAchievements] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  async function loadAll() {
    let list = await getArticles();

    if (list.length === 0) {
      await saveArticle(sampleArticle);
      list = [sampleArticle];
    }

    const progMap = {};
    const wcMap = {};
    for (const a of list) {
      progMap[a.id] = await getProgress(a.id);
      const words = await getSavedWords(a.id);
      wcMap[a.id] = Object.keys(words).length;
    }

    setArticles(list);
    setProgressMap(progMap);
    setWordCountMap(wcMap);

    let game = await getGameData();
    game = updateStreak(game);
    await saveGameData(game);
    setXp(game.xp);
    setStreak(game.streak.current);
    setLevelInfo(getLevelInfo(game.xp));
    setDailyQuests(getDailyQuests(game));
  }

  async function handleAddScroll() {
    setLoading(true);
    try {
      const article = await pickAndParsePDF();
      if (article) {
        await saveArticle(article);
        await loadAll();
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось открыть свиток: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLongPress(article) {
    Alert.alert(
      'Удалить свиток?',
      `"${article.title}" будет удалён вместе со свитком заклинаний`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await deleteArticle(article.id);
            await loadAll();
          },
        },
      ]
    );
  }

  const streakLabel =
    streak >= 30 ? 'Хранитель Кольца' :
    streak >= 7 ? 'Назгул повержен!' :
    `${streak} дней подряд`;

  return (
    <SafeAreaView style={[styles.safe, Platform.OS === 'web' && { height: '100vh' }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.forestGreen} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome')}
          style={styles.iconBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#c4a96a" />
        </TouchableOpacity>
        <Text style={styles.appTitle}>Свитки</Text>
        <View style={styles.topRight}>
          {levelInfo && (
            <Text style={styles.levelText}>{levelInfo.title}</Text>
          )}
          <Text style={styles.xpText}>✦ {xp} XP</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Achievements')} style={styles.iconBtn}>
            <Ionicons name="trophy-outline" size={20} color="#c4a96a" />
          </TouchableOpacity>
        </View>
      </View>

      {streak > 0 && (
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={14} color={streak >= 7 ? '#e05a00' : colors.gold} />
          <Text style={styles.streakText}> {streakLabel}</Text>
        </View>
      )}

      <OrnamentDivider style={styles.topDivider} />

      <FlatList
        data={articles}
        keyExtractor={(a) => a.id}
        style={[{ flex: 1 }, Platform.OS === 'web' && { overflowY: 'scroll' }]}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {levelInfo && (
              <View style={styles.levelBar}>
                <View style={styles.levelBarBg}>
                  <View style={[styles.levelBarFill, { width: `${Math.round(levelInfo.progress * 100)}%` }]} />
                </View>
                <Text style={styles.levelBarLabel}>
                  {levelInfo.title} {levelInfo.subtitle}
                  {levelInfo.nextXP ? `  →  ${levelInfo.nextXP - xp} XP до следующего` : '  ✦ Максимальный уровень'}
                </Text>
              </View>
            )}
            <DailyQuestsPanel quests={dailyQuests} />
            <Text style={styles.listHeader}>Свитки</Text>
          </>
        }
        renderItem={({ item }) => (
          <ArticleCard
            article={item}
            progress={progressMap[item.id] || 0}
            wordCount={wordCountMap[item.id] || 0}
            onPress={() => navigation.navigate('Reading', { articleId: item.id })}
            onLongPress={() => handleLongPress(item)}
          />
        )}
        ListFooterComponent={
          Platform.OS !== 'web' ? (
            <TouchableOpacity
              style={[styles.addBtn, loading && styles.addBtnDisabled]}
              onPress={handleAddScroll}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#f0e6c8" size="small" />
              ) : (
                <Text style={styles.addBtnText}>+ Добавить свиток</Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      {pendingAchievements.length > 0 && (
        <AchievementModal
          achievements={pendingAchievements}
          onClose={() => setPendingAchievements([])}
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appTitle: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 18,
    color: '#f0e6c8',
    flex: 1,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 14,
    color: '#c4a96a',
  },
  levelText: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 10,
    color: '#d4b870',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  iconBtn: {
    padding: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: colors.parchmentDark,
  },
  streakText: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: colors.gold,
  },
  topDivider: {
    marginVertical: 0,
    paddingVertical: 4,
    backgroundColor: colors.parchmentDark,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  levelBar: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  levelBarBg: {
    height: 4,
    backgroundColor: colors.parchmentBorder,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  levelBarFill: {
    height: 4,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },
  levelBarLabel: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 11,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  listHeader: {
    fontFamily: 'IMFellEnglish_400Regular',
    fontSize: 13,
    color: colors.inkFaint,
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 8,
    letterSpacing: 1,
  },
  addBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.forestGreen,
    paddingVertical: 12,
    borderRadius: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
  addBtnText: {
    fontFamily: 'CrimsonText_400Regular',
    fontSize: 15,
    color: '#f0e6c8',
  },
});
