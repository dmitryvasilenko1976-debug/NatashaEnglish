import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  useFonts,
  CrimsonText_400Regular,
  CrimsonText_400Regular_Italic,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';

import WelcomeScreen from './src/screens/WelcomeScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReadingScreen from './src/screens/ReadingScreen';
import QuizSelectScreen from './src/screens/QuizSelectScreen';
import QuizScreen from './src/screens/QuizScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import LeagueScreen from './src/screens/LeagueScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import StatsScreen from './src/screens/StatsScreen';
import GrammarScreen from './src/screens/GrammarScreen';
import GrammarQuizScreen from './src/screens/GrammarQuizScreen';
import MorphologyScreen from './src/screens/MorphologyScreen';
import MorphologyQuizScreen from './src/screens/MorphologyQuizScreen';
import FalseFriendsScreen from './src/screens/FalseFriendsScreen';
import ClozeScreen from './src/screens/ClozeScreen';
import MapScreen from './src/screens/MapScreen';
import { initAudio } from './src/services/audioService';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => { initAudio(); }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    // Fix iOS Safari: browser toolbar overlaps content at bottom.
    // -webkit-fill-available = viewport height excluding ALL browser chrome.
    // 100svh = same on modern browsers (iOS 15.4+, Chrome 108+).
    const style = document.createElement('style');
    style.innerHTML = `
      html { height: -webkit-fill-available; }
      body { height: -webkit-fill-available; overflow: hidden; }
      #root { height: -webkit-fill-available; display: flex; flex: 1; }
      @supports (height: 100svh) {
        html, body, #root { height: 100svh; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Almendra_400Regular: require('./assets/fonts/Almendra_400Regular.ttf'),
    Almendra_400Regular_Italic: require('./assets/fonts/Almendra_400Regular_Italic.ttf'),
    Almendra_700Bold: require('./assets/fonts/Almendra_700Bold.ttf'),
    AlmendraDisplay_400Regular: require('./assets/fonts/AlmendraDisplay_400Regular.ttf'),
    CrimsonText_400Regular,
    CrimsonText_400Regular_Italic,
    CrimsonText_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ede8d8' }}>
        <ActivityIndicator color="#2c4a2e" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Reading" component={ReadingScreen} />
        <Stack.Screen name="QuizSelect" component={QuizSelectScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="League" component={LeagueScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Stats" component={StatsScreen} />
        <Stack.Screen name="Grammar" component={GrammarScreen} />
        <Stack.Screen name="GrammarQuiz" component={GrammarQuizScreen} />
        <Stack.Screen name="Morphology" component={MorphologyScreen} />
        <Stack.Screen name="MorphologyQuiz" component={MorphologyQuizScreen} />
        <Stack.Screen name="FalseFriends" component={FalseFriendsScreen} />
        <Stack.Screen name="Cloze" component={ClozeScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
