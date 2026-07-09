import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Orb } from '../../components/Orb';
import { CircularWaveform } from '../../components/CircularWaveform';
import { useLiveSession } from '../../hooks/useLiveSession';
import { Mic, MicOff, RefreshCw, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function VoiceScreen() {
  const { 
    appState, 
    visualizerLevel, 
    settings, 
    startVoiceSession, 
    stopVoiceSession 
  } = useLiveSession();

  const isSessionActive = appState !== 'disconnected' && appState !== 'error';

  useEffect(() => {
    // Start live conversation on screen mount automatically if offlineMode is false
    if (!settings.offlineMode) {
      startVoiceSession();
    }
    return () => {
      stopVoiceSession();
    };
  }, []);

  const handleToggleSession = () => {
    if (isSessionActive) {
      stopVoiceSession();
    } else {
      startVoiceSession();
    }
  };

  // Human state formatter
  const getStateText = () => {
    switch (appState) {
      case 'listening': return 'LISTENING';
      case 'speaking': return 'SPEAKING';
      case 'thinking': return 'THINKING...';
      case 'connecting': return 'CONNECTING...';
      case 'reconnecting': return 'RECONNECTING...';
      case 'error': return 'CONNECTION ERROR';
      case 'idle':
      default:
        return 'IDLE';
    }
  };

  const getStateColor = () => {
    switch (appState) {
      case 'listening': return '#00E5FF';
      case 'speaking': return '#FF007F';
      case 'thinking': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6C63FF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{settings.assistantName}</Text>
        <View style={[styles.indicatorRing, { backgroundColor: getStateColor() }]} />
      </View>

      {/* Visualizer & Orb Canvas Centerpiece */}
      <View style={styles.canvasContainer}>
        <CircularWaveform appState={appState} level={visualizerLevel} />
        <Orb appState={appState} level={visualizerLevel} />
      </View>

      {/* Voice Status Overlay */}
      <View style={styles.statusSection}>
        <Text style={[styles.statusSubtitle, { color: getStateColor() }]}>
          {getStateText()}
        </Text>
        <Text style={styles.languageIndicator}>
          Active Language: {settings.language} ({settings.voice})
        </Text>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[
            styles.circleBtn, 
            isSessionActive ? styles.activeBtn : styles.inactiveBtn
          ]} 
          onPress={handleToggleSession}
        >
          {isSessionActive ? (
            <MicOff color="#FFF" size={26} />
          ) : (
            <Mic color="#FFF" size={26} />
          )}
        </TouchableOpacity>
        
        {appState === 'error' && (
          <TouchableOpacity style={styles.retryBtn} onPress={startVoiceSession}>
            <RefreshCw color="#FFF" size={18} />
            <Text style={styles.retryText}>Retry Link</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Offline Mode Alert */}
      {settings.offlineMode && (
        <View style={styles.offlineAlert}>
          <AlertTriangle color="#F59E0B" size={16} />
          <Text style={styles.offlineText}>Offline Mode active. Voice stream paused.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2D',
    justifyContent: 'space-between',
    paddingBottom: 90, // Room for bottom tab navigation
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 1.5,
  },
  indicatorRing: {
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  statusSubtitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 8,
  },
  languageIndicator: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  circleBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  activeBtn: {
    backgroundColor: '#FF007F',
    shadowColor: '#FF007F',
  },
  inactiveBtn: {
    backgroundColor: '#6C63FF',
    shadowColor: '#6C63FF',
  },
  retryBtn: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  offlineAlert: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  offlineText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '500',
  }
});
