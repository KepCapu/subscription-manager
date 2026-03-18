import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fetchSubscriptions } from '../api/subscriptions';
import { Subscription } from '../types/subscription';
import { SubscriptionStackParamList } from '../navigation/types';

type SubscriptionsScreenNavigationProp =
  NativeStackNavigationProp<SubscriptionStackParamList, 'SubscriptionsList'>;

export default function SubscriptionsScreen() {
  const navigation = useNavigation<SubscriptionsScreenNavigationProp>();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSubscriptions() {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchSubscriptions();

        if (isMounted) {
          setSubscriptions(items);
        }
      } catch (err) {
        console.error('Subscriptions load error:', err);

        if (isMounted) {
          setError('Could not load subscriptions');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSubscriptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalActiveSubscriptions = subscriptions.length;
  const totalMonthlyCost = subscriptions
    .reduce((sum, item) => sum + item.monthlyPrice, 0)
    .toFixed(2);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Subscriptions</Text>

        <Pressable
          onPress={() => navigation.navigate('AddSubscription')}
          style={({ pressed }) => [styles.addButton, pressed && styles.pressedButton]}
        >
          <Text style={styles.addButtonText}>Add subscription</Text>
        </Pressable>

        <View style={styles.heroCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total active subscriptions</Text>
            <Text style={styles.summaryValue}>
              {loading ? '-' : totalActiveSubscriptions}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total monthly cost</Text>
            <Text style={styles.summaryValue}>
              {loading ? 'Loading...' : 'EUR ' + totalMonthlyCost}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>All subscriptions</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading subscriptions...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : subscriptions.length === 0 ? (
            <Text style={styles.infoText}>No subscriptions found.</Text>
          ) : (
            subscriptions.map((subscription, index) => (
              <Pressable
                key={subscription.id}
                onPress={() =>
                  navigation.navigate('SubscriptionDetails', {
                    subscriptionId: subscription.id,
                  })
                }
                style={({ pressed }) => [
                  styles.subscriptionRow,
                  index !== subscriptions.length - 1 && styles.rowBorder,
                  pressed && styles.pressedRow,
                ]}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.rowTitle}>{subscription.name}</Text>
                  <Text style={styles.rowSubtext}>{subscription.billingCardName}</Text>
                  <Text style={styles.rowMeta}>
                    Next renewal: {subscription.renewalDate ?? '—'}
                  </Text>
                  <Text style={styles.rowStatus}>{subscription.status}</Text>
                </View>

                <Text style={styles.rowValue}>
                  {'EUR ' + subscription.monthlyPrice.toFixed(2)}
                </Text>
              </Pressable>
            ))
          )}
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
  addButton: {
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  pressedButton: {
    opacity: 0.8,
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
  pressedRow: {
    opacity: 0.7,
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
  rowMeta: {
    fontSize: 13,
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
  infoText: {
    fontSize: 14,
    color: colors.muted,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    paddingVertical: 10,
  },
});
