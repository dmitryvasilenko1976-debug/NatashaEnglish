import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, SafeAreaView, StatusBar, Platform, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import ArticleCard from '../components/ArticleCard';
import OrnamentDivider from '../components/OrnamentDivider';
import AchievementModal from '../components/AchievementModal';
import DailyQuestsPanel from '../components/DailyQuestsPanel';
import {
  getArticles, saveArticle, deleteArticle,
  getSavedWords, getProgress, getGameData, saveGameData, updateStreakWithInfo,
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
  const [xpDisplay, setXpDisplay] = useState(0);
  const [streak, setStreak] = useState(0);
  const [levelInfo, setLevelInfo] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [streakLost, setStreakLost] = useState(null); // { days: N }
  const xpRef = useRef(0);
  const isFirstLoad = useRef(true);

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
    const { game: updatedGame, streakBroken, previousStreak } = updateStreakWithInfo(game);
    await saveGameData(updatedGame);

    const newXP = updatedGame.xp;
    if (isFirstLoad.current) {
      // No animation on first load — set immediately
      xpRef.current = newXP;
      setXpDisplay(newXP);
      isFirstLoad.current = false;
    } else if (newXP !== xpRef.current) {
      // Animate XP counter from current displayed value to new value
      const from = xpRef.current;
      const to = newXP;
      const steps = 15;
      let step = 0;
      const id = setInterval(() => {
        step++;
        const current = Math.round(from + ((to - from) * step) / steps);
        setXpDisplay(current);
        if (step >= steps) {
          clearInterval(id);
          xpRef.current = to;
        }
      }, 40);
    }

    setXp(newXP);
    setStreak(updatedGame.streak.current);
    setLevelInfo(getLevelInfo(newXP));
    setDailyQuests(getDailyQuests(updatedGame));

    if (streakBroken) setStreakLost({ days: previousStreak });
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
          <Text style={styles.xpText}>✦ {xpDisplay} XP</Text>
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

      <Modal
        visible={!!streakLost}
        transparent
        animationType="fade"
        onRequestClose={() => setStreakLost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>🔥</Text>
            <Text style={styles.modalTitle}>
              Серия из {streakLost?.days} дней прервана
            </Text>
            <Text style={styles.modalBody}>
              Но ещё не всё потеряно...{'\n'}
              Прочитай хотя бы одно предложение{'\n'}
              чтобы начать новую серию.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => {
                setStreakLost(null);
                if (articles.length > 0) {
                  navigation.navigate('Reading', { articleId: articles[0].id });
                }
              }}
            >
              <Text style={styles.modalBtnText}>Читать сейчас</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStreakLost(null)}>
              <Text style={styles.modalSkip}>Позже</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#f5eedc',
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#c4a96a',
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: 'Cinzel_400Regular',
    fontSize: 15,
    color: '#4a3728',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  modalBody: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 15,
    color: '#6b5744',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 22,
  },
  modalBtn: {
    backgroundColor: '#2d5a27',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#c4a96a',
    marginBottom: 12,
  },
  modalBtnText: {
    fontFamily: 'CrimsonText_600SemiBold',
    fontSize: 15,
    color: '#f0e6c8',
    letterSpacing: 0.5,
  },
  modalSkip: {
    fontFamily: 'CrimsonText_400Regular_Italic',
    fontSize: 13,
    color: '#9a8a7a',
  },
});
