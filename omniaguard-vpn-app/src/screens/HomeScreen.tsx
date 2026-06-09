import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
  Dimensions, StatusBar, ScrollView, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { VpnService, VpnStatus } from '../services/VpnService';

const { width } = Dimensions.get('window');
const SHIELD_SIZE = width * 0.55;

export function HomeScreen({ navigation }: any) {
  const [status, setStatus] = useState<VpnStatus>('disconnected');
  const [stats, setStats] = useState({ bytesIn: 0, bytesOut: 0, duration: 0 });
  const [selectedServer, setSelectedServer] = useState({ name: 'Canada — Toronto', flag: '🇨🇦', ping: 12 });
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const subscription = VpnService.onStatusChange(setStatus);
    const statsInterval = setInterval(() => {
      if (status === 'connected') {
        setStats(prev => ({
          bytesIn: prev.bytesIn + Math.floor(Math.random() * 50000),
          bytesOut: prev.bytesOut + Math.floor(Math.random() * 10000),
          duration: prev.duration + 1,
        }));
      }
    }, 1000);
    return () => {
      subscription.remove();
      clearInterval(statsInterval);
    };
  }, [status]);

  useEffect(() => {
    if (status === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        ])
      ).start();
      Animated.timing(shieldAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    } else {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      Animated.timing(shieldAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [status]);

  const handleToggle = async () => {
    if (status === 'disconnected') {
      await VpnService.connect(selectedServer);
    } else if (status === 'connected') {
      await VpnService.disconnect();
      setStats({ bytesIn: 0, bytesOut: 0, duration: 0 });
    }
  };

  const shieldColor = status === 'connected'
    ? colors.accent
    : status === 'connecting'
    ? colors.warning
    : '#1e293b';

  const statusLabel = {
    connected: 'PROTECTED',
    connecting: 'CONNECTING...',
    disconnected: 'UNPROTECTED',
    disconnecting: 'DISCONNECTING...',
  }[status];

  const formatBytes = (b: number) => b > 1048576 ? `${(b/1048576).toFixed(1)} MB` : `${(b/1024).toFixed(0)} KB`;
  const formatDuration = (s: number) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>OmniaGuard</Text>
            <Text style={styles.brandSub}>VPN Protection</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Shield Button */}
        <View style={styles.shieldWrap}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              onPress={handleToggle}
              activeOpacity={0.85}
              disabled={status === 'connecting' || status === 'disconnecting'}
            >
              <LinearGradient
                colors={status === 'connected'
                  ? ['#00d4b4', '#0099cc']
                  : status === 'connecting'
                  ? ['#f59e0b', '#d97706']
                  : ['#1e293b', '#0f172a']
                }
                style={[styles.shield, { width: SHIELD_SIZE, height: SHIELD_SIZE, borderRadius: SHIELD_SIZE / 2 }]}
              >
                <Text style={styles.shieldIcon}>
                  {status === 'connected' ? '🛡️' : status === 'connecting' ? '⟳' : '🔓'}
                </Text>
                <Text style={styles.shieldLabel}>{status === 'connected' ? 'TAP TO DISCONNECT' : 'TAP TO CONNECT'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
          <View style={[styles.statusDot, { backgroundColor: status === 'connected' ? colors.success : status === 'connecting' ? colors.warning : colors.danger }]} />
          <Text style={[styles.statusLabel, { color: status === 'connected' ? colors.accent : status === 'connecting' ? colors.warning : colors.muted }]}>
            {statusLabel}
          </Text>
        </View>

        {/* Server Selector */}
        <TouchableOpacity style={styles.serverCard} onPress={() => navigation.navigate('Servers')}>
          <View style={styles.serverLeft}>
            <Text style={styles.serverFlag}>{selectedServer.flag}</Text>
            <View>
              <Text style={styles.serverName}>{selectedServer.name}</Text>
              <Text style={styles.serverPing}>{selectedServer.ping} ms</Text>
            </View>
          </View>
          <Text style={styles.serverChevron}>›</Text>
        </TouchableOpacity>

        {/* Stats (shown when connected) */}
        {status === 'connected' && (
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatBytes(stats.bytesIn)}</Text>
              <Text style={styles.statLabel}>↓ Download</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatDuration(stats.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatBytes(stats.bytesOut)}</Text>
              <Text style={styles.statLabel}>↑ Upload</Text>
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: '🚫', label: 'Ad Blocking', active: true },
            { icon: '👁️', label: 'Tracker Blocking', active: true },
            { icon: '🔐', label: 'Kill Switch', active: false },
            { icon: '🌍', label: 'Location Mask', active: status === 'connected' },
          ].map(f => (
            <View key={f.label} style={[styles.featureChip, f.active && styles.featureChipActive]}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureLabel, f.active && styles.featureLabelActive]}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade (if free) */}
        <TouchableOpacity style={styles.upgradeBanner} onPress={() => navigation.navigate('Subscribe')}>
          <LinearGradient colors={['rgba(0,212,180,0.12)', 'rgba(0,153,204,0.06)']} style={styles.upgradeGrad}>
            <Text style={styles.upgradeTitle}>Upgrade to OmniaGuard Pro</Text>
            <Text style={styles.upgradeSub}>Unlimited servers · Kill switch · Split tunneling · $9.99/mo</Text>
            <Text style={styles.upgradeArrow}>Upgrade Now →</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  brandName: { fontSize: 20, fontWeight: '800', color: colors.accent, letterSpacing: 0.5 },
  brandSub: { fontSize: 12, color: colors.muted, marginTop: 1 },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 20 },
  shieldWrap: { alignItems: 'center', paddingVertical: spacing.xl },
  shield: { alignItems: 'center', justifyContent: 'center', shadowColor: colors.accent, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 15 },
  shieldIcon: { fontSize: 64, marginBottom: 8 },
  shieldLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, fontWeight: '600' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 16, marginBottom: 8 },
  statusLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  serverCard: { marginHorizontal: spacing.md, backgroundColor: colors.cardBg, borderRadius: 12, padding: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  serverLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  serverFlag: { fontSize: 28 },
  serverName: { fontSize: 14, fontWeight: '600', color: colors.text },
  serverPing: { fontSize: 11, color: colors.success, marginTop: 2 },
  serverChevron: { fontSize: 24, color: colors.muted },
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.md, marginBottom: spacing.md, gap: 8 },
  statBox: { flex: 1, backgroundColor: colors.cardBg, borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statValue: { fontSize: 14, fontWeight: '700', color: colors.accent },
  statLabel: { fontSize: 10, color: colors.muted, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 },
  features: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.md, gap: 8, marginBottom: spacing.md },
  featureChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#0d1526', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  featureChipActive: { borderColor: colors.border, backgroundColor: 'rgba(0,212,180,0.06)' },
  featureIcon: { fontSize: 13 },
  featureLabel: { fontSize: 12, color: colors.muted },
  featureLabelActive: { color: colors.accent },
  upgradeBanner: { marginHorizontal: spacing.md, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  upgradeGrad: { padding: spacing.md },
  upgradeTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 4 },
  upgradeSub: { fontSize: 12, color: colors.muted, marginBottom: 10 },
  upgradeArrow: { fontSize: 13, fontWeight: '700', color: colors.accent },
});
