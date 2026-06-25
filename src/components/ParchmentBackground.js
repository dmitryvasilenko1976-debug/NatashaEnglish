import React from 'react';
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
