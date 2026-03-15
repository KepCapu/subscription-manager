import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { mockSubscriptions } from '../data/mockSubscriptions';

type Props = {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
};

const totalActiveSubscriptions = mockSubscriptions.length;
const totalMonthlyCost = mockSubscriptions
  .reduce((sum, item) => sum + item.monthlyPrice, 0)
  .toFixed(2);

export default function SubscriptionsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Subscriptions</Text>

        <View style={styles.heroCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total active subscriptions</Text>
            <Text style={styles.summaryValue}>{totalActiveSubscriptions}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total monthly cost</Text>
            <Text style={styles.summaryValue}>EUR {totalMonthlyCost}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>All subscriptions</Text>

          {mockSubscriptions.map((subscription, index) => (
            <TouchableOpacity
              key={subscription.id}
              onPress={() =>
                navigation.navigate('SubscriptionDetails', {
                  subscriptionId: subscription.id,
                })
              }
              activeOpacity={0.8}
              style={[
                styles.subscriptionRow,
                index !== mockSubscriptions.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.leftCol}>
                <Text style={styles.rowTitle}>{subscription.name}</Text>
                <Text style={styles.rowSubtext}>{subscription.billingCardName}</Text>
                <Text style={styles.rowStatus}>{subscription.status}</Text>
              </View>

              <Text style={styles.rowValue}>
                EUR {subscription.monthlyPrice.toFixed(2)}
              </Text>
            </TouchableOpacity>
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
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftCol: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtext: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  rowStatus: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
    marginTop: 6,
  },
  rowValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
});
