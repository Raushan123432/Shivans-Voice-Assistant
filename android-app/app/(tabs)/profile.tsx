import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLiveSession } from '../../hooks/useLiveSession';
import { AndroidIntents } from '../../services/AndroidIntents';
import { User, Phone, MapPin, Camera, Play, Sparkles, MessageSquare } from 'lucide-react-native';

export default function ProfileScreen() {
  const { profile, messages, memories } = useLiveSession();

  const handleLaunchIntent = async (actionName: string) => {
    try {
      let res: any;
      switch (actionName) {
        case 'camera':
          res = await AndroidIntents.openCamera();
          break;
        case 'maps':
          res = await AndroidIntents.openGoogleMaps('New Delhi, India');
          break;
        case 'dialer':
          res = await AndroidIntents.openPhoneDialer();
          break;
        case 'youtube':
          res = await AndroidIntents.openYouTube('AI Assistant');
          break;
        case 'whatsapp':
          res = await AndroidIntents.openWhatsApp();
          break;
        default:
          break;
      }
      if (res && res.success) {
        // App opened successfully
      }
    } catch (e: any) {
      Alert.alert('Intent Launch Error', e.message || 'Required application is not installed on this device.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <User color="#6C63FF" size={24} />
        <Text style={styles.headerTitle}>User Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          
          {/* Active streak */}
          <View style={styles.streakBadge}>
            <Sparkles color="#F59E0B" size={14} />
            <Text style={styles.streakText}>{profile.streak} Days Active Streak</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{messages.length}</Text>
            <Text style={styles.statLbl}>Messages Logged</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{memories.length}</Text>
            <Text style={styles.statLbl}>Stored Facts</Text>
          </View>
        </View>

        {/* Launcher Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Babu Device Integrations</Text>
          <Text style={styles.sectionDesc}>Interact with native Android utilities directly via intents:</Text>
          
          <View style={styles.grid}>
            <TouchableOpacity style={styles.gridItem} onPress={() => handleLaunchIntent('camera')}>
              <Camera color="#FF007F" size={20} />
              <Text style={styles.gridLabel}>Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleLaunchIntent('maps')}>
              <MapPin color="#00E5FF" size={20} />
              <Text style={styles.gridLabel}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleLaunchIntent('dialer')}>
              <Phone color="#10B981" size={20} />
              <Text style={styles.gridLabel}>Phone Dialer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleLaunchIntent('youtube')}>
              <Play color="#EF4444" size={20} />
              <Text style={styles.gridLabel}>YouTube App</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.gridItem} onPress={() => handleLaunchIntent('whatsapp')}>
              <MessageSquare color="#25D366" size={20} />
              <Text style={styles.gridLabel}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2D',
    paddingBottom: 90,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileCard: {
    backgroundColor: '#141B41',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#6C63FF',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
  },
  email: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
    marginBottom: 14,
  },
  streakBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
  },
  streakText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#141B41',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#00E5FF',
  },
  statLbl: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#141B41',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(10, 15, 45, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  gridLabel: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  }
});
