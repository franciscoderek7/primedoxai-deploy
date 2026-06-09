import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

const SERVERS = [
  { id: '1', name: 'Canada — Toronto',     flag: '🇨🇦', ping: 12,  region: 'North America', pro: false },
  { id: '2', name: 'Canada — Vancouver',   flag: '🇨🇦', ping: 18,  region: 'North America', pro: false },
  { id: '3', name: 'United States — NYC',  flag: '🇺🇸', ping: 22,  region: 'North America', pro: false },
  { id: '4', name: 'United States — LA',   flag: '🇺🇸', ping: 45,  region: 'North America', pro: true  },
  { id: '5', name: 'United Kingdom',       flag: '🇬🇧', ping: 98,  region: 'Europe',        pro: true  },
  { id: '6', name: 'Germany — Frankfurt',  flag: '🇩🇪', ping: 105, region: 'Europe',        pro: true  },
  { id: '7', name: 'Netherlands',          flag: '🇳🇱', ping: 110, region: 'Europe',        pro: true  },
  { id: '8', name: 'Switzerland',          flag: '🇨🇭', ping: 115, region: 'Europe',        pro: true  },
  { id: '9', name: 'Japan — Tokyo',        flag: '🇯🇵', ping: 180, region: 'Asia Pacific',  pro: true  },
  { id: '10',name: 'Singapore',            flag: '🇸🇬', ping: 200, region: 'Asia Pacific',  pro: true  },
  { id: '11',name: 'Australia',            flag: '🇦🇺', ping: 220, region: 'Asia Pacific',  pro: true  },
];

const pingColor = (p: number) => p < 50 ? colors.success : p < 120 ? colors.warning : colors.danger;

export function ServersScreen({ navigation, route }: any) {
  const [selected, setSelected] = useState(route.params?.current?.id || '1');

  const handleSelect = (server: typeof SERVERS[0]) => {
    if (server.pro) {
      navigation.navigate('Subscribe');
      return;
    }
    setSelected(server.id);
    navigation.navigate('Home', { server });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Server</Text>
        <View style={{ width: 48 }} />
      </View>

      <FlatList
        data={SERVERS}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.card, item.id === selected && styles.cardActive]} onPress={() => handleSelect(item)}>
            <Text style={styles.flag}>{item.flag}</Text>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.region}>{item.region}</Text>
            </View>
            {item.pro ? (
              <Text style={styles.proBadge}>PRO</Text>
            ) : (
              <Text style={[styles.ping, { color: pingColor(item.ping) }]}>{item.ping} ms</Text>
            )}
            {item.id === selected && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 16, color: colors.accent, width: 48 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardActive: { borderColor: colors.accent },
  flag: { fontSize: 24, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.text },
  region: { fontSize: 11, color: colors.muted, marginTop: 2 },
  ping: { fontSize: 12, fontWeight: '700', marginRight: 8 },
  proBadge: { fontSize: 10, fontWeight: '800', color: colors.warning, borderWidth: 1, borderColor: colors.warning, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 8 },
  checkmark: { fontSize: 16, color: colors.accent },
});
