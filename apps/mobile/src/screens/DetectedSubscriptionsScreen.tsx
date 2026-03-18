import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchSubscriptionCandidates,
  SubscriptionCandidate,
  updateSubscriptionCandidateStatus,
} from '../api/subscriptionCandidates';
import { colors } from '../theme/colors';

export default function DetectedSubscriptionsScreen() {
  const [items, setItems] = useState<SubscriptionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchSubscriptionCandidates('possible_subscription');
      setItems(data);
    } catch (err) {
      console.error('Detected subscriptions load error:', err);
      setError('Could not load detected subscriptions');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function run() {
        try {
          setLoading(true);
          setError(null);

          const data = await fetchSubscriptionCandidates('possible_subscription');

          if (isMounted) {
            setItems(data);
          }
        } catch (err) {
          console.error('Detected subscriptions load error:', err);

          if (isMounted) {
            setError('Could not load detected subscriptions');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      run();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  async function handleConfirm(candidateId: string) {
    try {
      setUpdatingId(candidateId);
      setError(null);

      await updateSubscriptionCandidateStatus(candidateId, {
        detectedStatus: 'confirmed_subscription',
      });

      await loadCandidates();
    } catch (err) {
      console.error('Confirm detected subscription error:', err);
      setError('Could not confirm detected subscription');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Detected subscriptions</Text>
        <Text style={styles.subtitle}>
          Review possible subscriptions found from connected email accounts.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Possible subscriptions</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading detected subscriptions...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={styles.infoText}>No possible subscriptions found.</Text>
          ) : (
            items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.candidateRow,
                  index !== items.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.rowTitle}>
                    {item.subscriptionName ?? item.merchantName ?? 'Unknown subscription'}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {item.currency ?? '—'} {item.amount ?? '—'}
                  </Text>
                  <Text style={styles.rowMeta}>
                    Renewal: {item.detectedRenewalDate ?? 'Unknown'}
                  </Text>
                  <Text style={styles.rowMeta}>
                    Card: {item.detectedCardLast4 ? '•••• ' + item.detectedCardLast4 : 'Unknown'}
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text style={styles.rowStatus}>{item.detectedStatus}</Text>
                  <Text style={styles.rowConfidence}>
                    {Math.round(item.confidence * 100)}%
                  </Text>

                  <Pressable
                    onPress={() => handleConfirm(item.id)}
                    disabled={updatingId === item.id}
                    style={({ pressed }) => [
                      styles.confirmButton,
                      updatingId === item.id && styles.confirmButtonDisabled,
                      pressed && updatingId !== item.id && styles.pressedRow,
                    ]}
                  >
                    <Text style={styles.confirmButtonText}>
                      {updatingId === item.id ? 'Confirming...' : 'Confirm'}
                    </Text>
                  </Pressable>
                </View>
              </View>
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
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  candidateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 14,
    gap: 16,
  },
  pressedRow: {
    opacity: 0.8,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  leftCol: {
    flex: 1,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  rowStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
    textTransform: 'capitalize',
  },
  rowConfidence: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 6,
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.background,
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
