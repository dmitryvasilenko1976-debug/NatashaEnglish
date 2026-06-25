import os, re

BASE = os.path.dirname(os.path.abspath(__file__))
COMP_DIR = os.path.join(BASE, 'src', 'components')
SCREENS_DIR = os.path.join(BASE, 'src', 'screens')

pb_content = """import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

export default function ParchmentBackground({ children, style }) {
  return (
    <ImageBackground
      source={require('../../assets/parchment.png')}
      style={[styles.bg, style]}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
});
"""
os.makedirs(COMP_DIR, exist_ok=True)
with open(os.path.join(COMP_DIR, 'ParchmentBackground.js'), 'w', encoding='utf-8') as f:
    f.write(pb_content)
print('Created ParchmentBackground.js')

SCREENS = [
    'HomeScreen','ReadingScreen','QuizScreen','QuizSelectScreen',
    'AchievementsScreen','GrammarScreen','GrammarQuizScreen',
    'MorphologyScreen','MorphologyQuizScreen','FalseFriendsScreen',
    'ClozeScreen','LeagueScreen','ReviewScreen','StatsScreen',
    'WelcomeScreen','TutorialScreen',
]
IMPORT_LINE = "import ParchmentBackground from '../components/ParchmentBackground';\n"

for name in SCREENS:
    path = os.path.join(SCREENS_DIR, name + '.js')
    if not os.path.exists(path):
        print(f'SKIP {name}.js (not found)')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'ParchmentBackground' in content:
        print(f'SKIP {name}.js (already patched)')
        continue
    idx = content.index('\n', content.index('import ')) + 1
    content = content[:idx] + IMPORT_LINE + content[idx:]
    content = re.sub(r"(safe:\s*\{[^}]*?)backgroundColor:\s*colors\.\w+,?\s*", r"\1", content)
    content = re.sub(r"safe:\s*\{\s*flex:\s*1,\s*\}", "safe: { flex: 1, backgroundColor: 'transparent' }", content)
    content = re.sub(r"(safe:\s*\{\s*\n\s*flex:\s*1,)", r"\1\n    backgroundColor: 'transparent',", content)
    content = re.sub(r"(<SafeAreaView style=\{)", r'<ParchmentBackground>\n    <SafeAreaView style={', content, count=1)
    content = re.sub(r"(</SafeAreaView>\s*\n(\s*)\);)", r'</SafeAreaView>\n    </ParchmentBackground>\n\2);', content, count=1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK {name}.js')

print('\nDone! Now run:')
print('  git checkout -b claude/epic-shannon-0amv7j')
print('  git add src/')
print('  git commit -m "ui: parchment texture background"')
print('  git push -u origin claude/epic-shannon-0amv7j')
