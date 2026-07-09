import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  withSequence, 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const WAVEFORM_SIZE = width * 0.72;
const NUM_BARS = 36; // 36 bars in 360 degrees circle

interface CircularWaveformProps {
  appState: string;
  level: number;
}

export const CircularWaveform: React.FC<CircularWaveformProps> = ({ appState, level }) => {
  const bars = Array.from({ length: NUM_BARS });
  
  // Shared values for each bar's animation multiplier
  const waveScales = Array.from({ length: NUM_BARS }, () => useSharedValue(1));

  useEffect(() => {
    // Generate a beautiful, flowing circular wave ripple in idle or speaking states
    waveScales.forEach((scale, index) => {
      if (appState === 'listening' || appState === 'speaking') {
        // High reactivity to audio input
        const delay = (index % 12) * 80;
        scale.value = withTiming(1 + level * 1.8 * (0.5 + Math.random() * 0.5), { duration: 100 });
      } else {
        // Gentle breathing ripple
        scale.value = withRepeat(
          withSequence(
            withTiming(1 + 0.15 * Math.sin(index * 0.3), { duration: 1000 + (index % 5) * 200 }),
            withTiming(1, { duration: 1000 + (index % 5) * 200 })
          ),
          -1,
          true
        );
      }
    });
  }, [appState, level]);

  // Map AppState to waveform glow color
  const getWaveColor = () => {
    switch (appState) {
      case 'listening': return '#00E5FF'; // Cyan
      case 'speaking': return '#FF007F';  // Pink
      case 'thinking': return '#F59E0B';  // Orange
      case 'error': return '#EF4444';     // Red
      default: return '#6C63FF';          // Indigo
    }
  };

  const waveColor = getWaveColor();

  return (
    <View style={styles.container}>
      {bars.map((_, i) => {
        const angle = (i * 360) / NUM_BARS;
        
        const animatedStyle = useAnimatedStyle(() => {
          return {
            height: 12 * waveScales[i].value,
            transform: [
              { rotate: `${angle}deg` },
              { translateY: -WAVEFORM_SIZE / 2 }
            ],
            opacity: appState === 'idle' ? 0.45 : 0.85,
          };
        });

        return (
          <Animated.View 
            key={i} 
            style={[
              styles.bar, 
              animatedStyle, 
              { backgroundColor: waveColor, shadowColor: waveColor }
            ]} 
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: WAVEFORM_SIZE,
    height: WAVEFORM_SIZE,
  },
  bar: {
    position: 'absolute',
    width: 3.5,
    borderRadius: 2,
    elevation: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  }
});

export default CircularWaveform;
