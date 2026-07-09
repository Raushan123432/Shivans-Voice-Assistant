import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLiveSession } from '../../hooks/useLiveSession';
import { MemoryEntry } from '../../types';
import { BrainCircuit, CloudLightning, Plus, Trash2, ShieldCheck, HelpCircle } from 'lucide-react-native';

export default function MemoryScreen() {
  const { memories, addMemory, deleteMemory, syncCloud, profile } = useLiveSession();
  const [isSyncing, setIsSyncing] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryEntry['category']>('preference');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncCloud();
      Alert.alert('Cloud Synchronization', res.message);
    } catch (e: any) {
      Alert.alert('Cloud Synchronization', e.message || 'Error occurred during sync.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      Alert.alert('Error', 'Please fill in both key and value.');
      return;
    }
    await addMemory(newKey.trim(), newValue.trim(), newCategory);
    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const renderMemoryItem = ({ item }: { item: MemoryEntry }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <Text style={[styles.badgeText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Text>
            {item.synced === 1 && (
              <ShieldCheck color="#10B981" size={14} />
            )}
          </View>
          <TouchableOpacity onPress={() => deleteMemory(item.id)}>
            <Trash2 color="rgba(255, 255, 255, 0.4)" size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.cardKey}>{item.key}</Text>
        <Text style={styles.cardValue}>{item.value}</Text>
      </View>
    );
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'preference': return '#00E5FF';
      case 'personal': return '#FF007F';
      case 'fact': return '#F59E0B';
      default: return '#6C63FF';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.titleCol}>
          <Text style={styles.headerTitle}>Persistent Memory</Text>
          <Text style={styles.headerSubtitle}>Personalized context synced to cloud</Text>
        </View>
        <TouchableOpacity style={styles.syncBtn} onPress={handleSync} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <CloudLightning color="#FFF" size={18} />
          )}
        </TouchableOpacity>
      </View>

      {/* Floating Add Trigger */}
      {!showAddForm ? (
        <TouchableOpacity style={styles.addTrigger} onPress={() => setShowAddForm(true)}>
          <Plus color="#FFF" size={16} />
          <Text style={styles.addTriggerText}>Add Custom Context</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.addForm}>
          <TextInput
            style={styles.formInput}
            placeholder="Key (e.g. Favorite food, User's partner)"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={newKey}
            onChangeText={setNewKey}
          />
          <TextInput
            style={styles.formInput}
            placeholder="Value (e.g. Spicy Biryani, Priya)"
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            value={newValue}
            onChangeText={setNewValue}
          />
          
          <View style={styles.categoryRow}>
            {['preference', 'personal', 'fact'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.catSelector,
                  newCategory === cat && styles.catSelected,
                  { borderColor: getCategoryColor(cat) }
                ]}
                onPress={() => setNewCategory(cat as any)}
              >
                <Text style={[styles.catText, { color: getCategoryColor(cat) }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddForm(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleAddMemory}>
              <Text style={styles.saveText}>Save memory</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Memory List */}
      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoryItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BrainCircuit color="rgba(255, 255, 255, 0.15)" size={64} />
            <Text style={styles.emptyTitle}>Memory is Empty</Text>
            <Text style={styles.emptySubtitle}>
              BABU AI remembers user preferences, instruction guides, and facts spoken during voice chats. Add some above to start!
            </Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  titleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.45)',
    marginTop: 2,
  },
  syncBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6C63FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTrigger: {
    flexDirection: 'row',
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addTriggerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addForm: {
    backgroundColor: '#141B41',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  formInput: {
    height: 44,
    backgroundColor: 'rgba(10, 15, 45, 0.6)',
    borderRadius: 8,
    color: '#FFF',
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  catSelector: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  catSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  catText: {
    fontSize: 11,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#6C63FF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: '#141B41',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardKey: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.45)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
