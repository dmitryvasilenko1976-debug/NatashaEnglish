import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  useFonts,
  IMFellEnglish_400Regular,
  IMFellEnglish_400Regular_Italic,
} from '@expo-google-fonts/im-fell-english';
import {
  CrimsonText_400Regular,
  CrimsonText_400Regular_Italic,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';
import {
  Cinzel_400Regular,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';

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

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    IMFellEnglish_400Regular,
    IMFellEnglish_400Regular_Italic,
    CrimsonText_400Regular,
    CrimsonText_400Regular_Italic,
    CrimsonText_600SemiBold,
    Cinzel_400Regular,
    Cinzel_700Bold,
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
