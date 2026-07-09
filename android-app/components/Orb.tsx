import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withRepeat, 
  withSequence, 
  interpolateColor 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppState } from '../types';

const { width } = Dimensions.get('window');
const ORB_SIZE = width * 0.55;

interface OrbProps {
  appState: AppState;
  level: number; // 0 to 1 visualizer level
}

export const Orb: React.FC<OrbProps> = ({ appState, level }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Map AppState to theme colors
  const colorProgress = useSharedValue(0);

  useEffect(() => {
    // Rotation Loop
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );

    // Pulse Loop
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 1500 }),
        withTiming(0.96, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  // Update scale based on dynamic real-time microphone level
  useEffect(() => {
    scale.value = withTiming(1 + level * 0.45, { duration: 80 });
  }, [level]);

  // Handle color transitions on state changes
  useEffect(() => {
    let target = 0;
    switch (appState) {
      case 'idle': target = 0; break;
      case 'listening': target = 1; break;
      case 'speaking': target = 2; break;
      case 'thinking': target = 3; break;
      case 'connecting':
      case 'reconnecting': target = 4; break;
      case 'error': target = 5; break;
      default: target = 0; break;
    }
    colorProgress.value = withTiming(target, { duration: 500 });
  }, [appState]);

  // Orb Animated Style
  const orbAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulse.value },
        { rotate: `${rotation.value}deg` }
      ],
    };
  });

  // Dynamic glow ring scale
  const glowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pulse.value * 1.25 }
      ],
      opacity: withTiming(appState === 'listening' || appState === 'speaking' ? 0.75 : 0.35, { duration: 300 }),
    };
  });

  // Helper to interpolate between colors for the dynamic orb background
  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      colorProgress.value,
      [0, 1, 2, 3, 4, 5],
      [
        '#6C63FF', // idle (indigo)
        '#00E5FF', // listening (cyan)
        '#FF007F', // speaking (hot pink)
        '#F59E0B', // thinking (orange)
        '#3B82F6', // connecting (blue)
        '#EF4444'  // error (red)
      ]
    );

    return {
      backgroundColor,
    };
  });

  return (
    <View style={styles.container}>
      {/* Outer Cosmic Glow Rings */}
      <Animated.View style={[styles.glowRing, glowAnimatedStyle, { borderColor: '#6C63FF' }]} />
      <Animated.View style={[styles.glowRing, glowAnimatedStyle, { borderColor: '#FF007F', transform: [{ scale: scale.value * pulse.value * 1.45 }], opacity: 0.15 }]} />

      {/* Main Core Orb Component */}
      <Animated.View style={[styles.orbCore, orbAnimatedStyle]}>
        <LinearGradient
          colors={['#141B41', '#0A0F2D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Animated Fluid Color Morph Overlay */}
          <Animated.View style={[styles.overlay, overlayAnimatedStyle]} />

          {/* Core Sparkle Ring */}
          <View style={styles.sparkleRing} />
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: ORB_SIZE * 1.6,
    height: ORB_SIZE * 1.6,
  },
  orbCore: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    overflow: 'hidden',
    elevation: 30,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  gradient: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
    borderRadius: ORB_SIZE / 2,
  },
  glowRing: {
    position: 'absolute',
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  sparkleRing: {
    width: ORB_SIZE * 0.85,
    height: ORB_SIZE * 0.85,
    borderRadius: (ORB_SIZE * 0.85) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'absolute',
  }
});

export default Orb;
