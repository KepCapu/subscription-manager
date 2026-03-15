import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { mockSubscriptions } from '../data/mockSubscriptions';

type Props = {
  route: {
    params: {
      subscriptionId: string;
    };
  };
};

export default function SubscriptionDetailsScreen({ route }: Props) {
  const subscription = mockSubscriptions.find(
    (item) => item.id === route.params.subscriptionId
  );

  if (!subscription) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Subscription not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const mockChargeHistory = [
    { id: 'c1', date: '2026-03-01', amount: subscription.monthlyPrice },
    { id: 'c2', date: '2026-02-01', amount: subscription.monthlyPrice },
    { id: 'c3', date: '2026-01-01', amount: subscription.monthlyPrice },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{subscription.name}</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Monthly cost</Text>
          <Text style={styles.heroValue}>EUR {subscription.monthlyPrice.toFixed(2)}</Text>
          <Text style={styles.heroSubvalue}>{subscription.status}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subscription info</Text>

          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoLabel}>Billing card</Text>
            <Text style={styles.infoValue}>{subscription.billingCardName}</Text>
          </View>

          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: colors.success }]}>
              {subscription.status}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Billing cycle</Text>
            <Text style={styles.infoValue}>Monthly</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent charges</Text>

          {mockChargeHistory.map((charge, index) => (
            <View
              key={charge.id}
              style={[styles.chargeRow, index !== mockChargeHistory.length - 1 && styles.rowBorder]}
            >
              <View>
                <Text style={styles.chargeDate}>{charge.date}</Text>
                <Text style={styles.chargeMeta}>Processed recurring charge</Text>
              </View>
              <Text style={styles.chargeAmount}>EUR {charge.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  screenTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 10,
  },
  heroValue: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
  },
  heroSubvalue: {
    fontSize: 16,
    color: colors.success,
    marginTop: 6,
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  chargeDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chargeMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  chargeAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
