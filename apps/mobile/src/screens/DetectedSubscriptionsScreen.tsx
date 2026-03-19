import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  confirmSubscriptionCandidate,
  fetchSubscriptionCandidates,
  SubscriptionCandidate,
  updateSubscriptionCandidateStatus,
} from '../api/subscriptionCandidates';
import { colors } from '../theme/colors';

type CandidateFilter = 'possible_subscription' | 'confirmed_subscription' | 'one_time_purchase';

export default function DetectedSubscriptionsScreen() {
  const [items, setItems] = useState<SubscriptionCandidate[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<CandidateFilter>('possible_subscription');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async (filter: CandidateFilter) => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchSubscriptionCandidates(filter);
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

          const data = await fetchSubscriptionCandidates(selectedFilter);

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
    }, [selectedFilter])
  );

  async function handleConfirm(candidateId: string) {
    try {
      setUpdatingId(candidateId);
      setError(null);

      await confirmSubscriptionCandidate(candidateId);
      await loadCandidates(selectedFilter);
    } catch (err) {
      console.error('Confirm detected subscription error:', err);
      setError('Could not confirm detected subscription');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleIgnore(candidateId: string) {
    try {
      setUpdatingId(candidateId);
      setError(null);

      await updateSubscriptionCandidateStatus(candidateId, {
        detectedStatus: 'ignored',
      });

      await loadCandidates(selectedFilter);
    } catch (err) {
      console.error('Ignore detected subscription error:', err);
      setError('Could not ignore detected subscription');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleMarkOneTime(candidateId: string) {
    try {
      setUpdatingId(candidateId);
      setError(null);

      await updateSubscriptionCandidateStatus(candidateId, {
        detectedStatus: 'one_time_purchase',
      });

      await loadCandidates(selectedFilter);
    } catch (err) {
      console.error('Mark one-time detected subscription error:', err);
      setError('Could not mark detected subscription as one-time');
    } finally {
      setUpdatingId(null);
    }
  }

  function getSectionTitle() {
    if (selectedFilter === 'confirmed_subscription') {
      return 'Confirmed subscriptions';
    }

    if (selectedFilter === 'one_time_purchase') {
      return 'One-time purchases';
    }

    return 'Possible subscriptions';
  }

  function getEmptyText() {
    if (selectedFilter === 'confirmed_subscription') {
      return 'No confirmed subscriptions found.';
    }

    if (selectedFilter === 'one_time_purchase') {
      return 'No one-time purchases found.';
    }

    return 'No possible subscriptions found.';
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Detected subscriptions</Text>
        <Text style={styles.subtitle}>
          Review possible subscriptions found from connected email accounts.
        </Text>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setSelectedFilter('possible_subscription')}
            style={({ pressed }) => [
              styles.filterButton,
              selectedFilter === 'possible_subscription' && styles.filterButtonSelected,
              pressed && styles.pressedRow,
            ]}
          >
            <Text style={styles.filterButtonText}>Possible</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedFilter('confirmed_subscription')}
            style={({ pressed }) => [
              styles.filterButton,
              selectedFilter === 'confirmed_subscription' && styles.filterButtonSelected,
              pressed && styles.pressedRow,
            ]}
          >
            <Text style={styles.filterButtonText}>Confirmed</Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedFilter('one_time_purchase')}
            style={({ pressed }) => [
              styles.filterButton,
              selectedFilter === 'one_time_purchase' && styles.filterButtonSelected,
              pressed && styles.pressedRow,
            ]}
          >
            <Text style={styles.filterButtonText}>One-time</Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{getSectionTitle()}</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading detected subscriptions...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={styles.infoText}>{getEmptyText()}</Text>
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
                    Card: {item.detectedCardLast4 ? 'ending ' + item.detectedCardLast4 : 'Unknown'}
                  </Text>
                </View>

                <View style={styles.rightCol}>
                  <Text style={styles.rowStatus}>{item.detectedStatus}</Text>
                  <Text style={styles.rowConfidence}>
                    {Math.round(item.confidence * 100)}%
                  </Text>

                  {selectedFilter === 'possible_subscription' ? (
                    <>
                      <Pressable
                        onPress={() => handleConfirm(item.id)}
                        disabled={updatingId === item.id}
                        style={({ pressed }) => [
                          styles.confirmButton,
                          updatingId === item.id && styles.actionButtonDisabled,
                          pressed && updatingId !== item.id && styles.pressedRow,
                        ]}
                      >
                        <Text style={styles.confirmButtonText}>
                          {updatingId === item.id ? 'Working...' : 'Confirm'}
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleMarkOneTime(item.id)}
                        disabled={updatingId === item.id}
                        style={({ pressed }) => [
                          styles.oneTimeButton,
                          updatingId === item.id && styles.actionButtonDisabled,
                          pressed && updatingId !== item.id && styles.pressedRow,
                        ]}
                      >
                        <Text style={styles.oneTimeButtonText}>One-time</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleIgnore(item.id)}
                        disabled={updatingId === item.id}
                        style={({ pressed }) => [
                          styles.ignoreButton,
                          updatingId === item.id && styles.actionButtonDisabled,
                          pressed && updatingId !== item.id && styles.pressedRow,
                        ]}
                      >
                        <Text style={styles.ignoreButtonText}>Ignore</Text>
                      </Pressable>
                    </>
                  ) : null}
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
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonSelected: {
    borderColor: colors.text,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
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
  confirmButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.background,
  },
  oneTimeButton: {
    marginTop: 8,
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  oneTimeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  ignoreButton: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ignoreButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  actionButtonDisabled: {
    opacity: 0.5,
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
