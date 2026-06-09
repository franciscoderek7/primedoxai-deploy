import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: '$9.99',
    period: '/month',
    billed: 'Billed monthly — cancel anytime',
    badge: null,
    skuId: 'omniaguard_vpn_monthly',
  },
  {
    id: 'yearly',
    name: 'Annual',
    price: '$49.99',
    period: '/year',
    billed: 'Save 58% — $4.17/month',
    badge: 'BEST VALUE',
    skuId: 'omniaguard_vpn_annual',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$99.99',
    period: 'one-time',
    billed: 'Pay once, protected forever',
    badge: 'POPULAR',
    skuId: 'omniaguard_vpn_lifetime',
  },
];

const FEATURES = [
  '✓  11 global server locations',
  '✓  Unlimited bandwidth',
  '✓  WireGuard® protocol',
  '✓  Kill switch',
  '✓  Split tunneling',
  '✓  Ad & tracker blocking',
  '✓  No-logs policy',
  '✓  5 simultaneous devices',
];

export function SubscribeScreen({ navigation }: any) {
  const [selected, setSelected] = useState('yearly');

  const handlePurchase = async () => {
    const plan = PLANS.find(p => p.id === selected)!;
    // RevenueCat Purchases integration — swap for your API key
    // await Purchases.purchasePackage(plan.skuId);
    // For now: navigate to web checkout
    // Linking.openURL(`https://omniaguard.com/subscribe?plan=${plan.id}`);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroIcon}>🛡️</Text>
          <Text style={styles.heroTitle}>OmniaGuard Pro</Text>
          <Text style={styles.heroSub}>Complete network protection — everywhere you go</Text>
        </View>

        {PLANS.map(plan => (
          <TouchableOpacity key={plan.id} style={[styles.planCard, plan.id === selected && styles.planCardActive]} onPress={() => setSelected(plan.id)}>
            <View style={styles.planLeft}>
              <View style={[styles.radio, plan.id === selected && styles.radioActive]}>
                {plan.id === selected && <View style={styles.radioDot} />}
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[styles.planName, plan.id === selected && styles.planNameActive]}>{plan.name}</Text>
                  {plan.badge && <Text style={styles.badge}>{plan.badge}</Text>}
                </View>
                <Text style={styles.planBilled}>{plan.billed}</Text>
              </View>
            </View>
            <View style={styles.planRight}>
              <Text style={[styles.planPrice, plan.id === selected && styles.planPriceActive]}>{plan.price}</Text>
              <Text style={styles.planPeriod}>{plan.period}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.featureList}>
          {FEATURES.map(f => (
            <Text key={f} style={styles.featureItem}>{f}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase} activeOpacity={0.85}>
          <LinearGradient colors={[colors.accent, colors.accentDark]} style={styles.purchaseGrad}>
            <Text style={styles.purchaseText}>Start Protection</Text>
            <Text style={styles.purchaseSub}>{PLANS.find(p => p.id === selected)?.price} {PLANS.find(p => p.id === selected)?.period}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.legal}>Protected by 256-bit AES encryption · WireGuard® protocol · No-logs policy · Cancel anytime</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.md, alignItems: 'flex-end' },
  back: { fontSize: 20, color: colors.muted, padding: 4 },
  hero: { alignItems: 'center', paddingVertical: spacing.xl, paddingHorizontal: spacing.md },
  heroIcon: { fontSize: 60, marginBottom: 12 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 8 },
  heroSub: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  planCard: { marginHorizontal: spacing.md, marginBottom: 10, backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  planCardActive: { borderColor: colors.accent, backgroundColor: 'rgba(0,212,180,0.04)' },
  planLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.muted, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: colors.accent },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  planName: { fontSize: 15, fontWeight: '700', color: colors.muted },
  planNameActive: { color: colors.text },
  planBilled: { fontSize: 11, color: colors.muted, marginTop: 2 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.warning, borderWidth: 1, borderColor: colors.warning, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  planRight: { alignItems: 'flex-end' },
  planPrice: { fontSize: 20, fontWeight: '800', color: colors.muted },
  planPriceActive: { color: colors.accent },
  planPeriod: { fontSize: 11, color: colors.muted },
  featureList: { marginHorizontal: spacing.md, marginVertical: spacing.md, backgroundColor: colors.cardBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border },
  featureItem: { fontSize: 13, color: colors.text, paddingVertical: 5 },
  purchaseBtn: { marginHorizontal: spacing.md, borderRadius: 14, overflow: 'hidden', marginBottom: spacing.md },
  purchaseGrad: { padding: 18, alignItems: 'center' },
  purchaseText: { fontSize: 17, fontWeight: '800', color: '#0a0f1a', marginBottom: 2 },
  purchaseSub: { fontSize: 12, color: 'rgba(10,15,26,0.6)' },
  legal: { fontSize: 11, color: colors.muted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, lineHeight: 18 },
});
