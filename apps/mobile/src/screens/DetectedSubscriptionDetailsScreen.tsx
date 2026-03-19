import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  confirmSubscriptionCandidate,
  fetchSubscriptionCandidateById,
  SubscriptionCandidate,
  updateSubscriptionCandidateStatus,
} from '../api/subscriptionCandidates';
import { DetectedSubscriptionsStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  DetectedSubscriptionsStackParamList,
  'DetectedSubscriptionDetails'
>;

export default function DetectedSubscriptionDetailsScreen({ route, navigation }: Props) {
  const [candidate, setCandidate] = useState<SubscriptionCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCandidate() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchSubscriptionCandidateById(route.params.candidateId);
      setCandidate(data);
    } catch (err) {
      console.error('Detected candidate load error:', err);
      setError('Could not load detected candidate');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchSubscriptionCandidateById(route.params.candidateId);

        if (isMounted) {
          setCandidate(data);
        }
      } catch (err) {
        console.error('Detected candidate load error:', err);

        if (isMounted) {
          setError('Could not load detected candidate');
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
  }, [route.params.candidateId]);

  async function handleConfirm() {
    if (!candidate || working) {
      return;
    }

    try {
      setWorking(true);
      setError(null);

      await confirmSubscriptionCandidate(candidate.id);
      navigation.goBack();
    } catch (err) {
      console.error('Confirm candidate error:', err);
      setError('Could not confirm candidate');
    } finally {
      setWorking(false);
    }
  }

  async function handleOneTime() {
    if (!candidate || working) {
      return;
    }

    try {
      setWorking(true);
      setError(null);

      await updateSubscriptionCandidateStatus(candidate.id, {
        detectedStatus: 'one_time_purchase',
      });

      navigation.goBack();
    } catch (err) {
      console.error('Mark one-time candidate error:', err);
      setError('Could not mark candidate as one-time');
    } finally {
      setWorking(false);
    }
  }

  async function handleIgnore() {
    if (!candidate || working) {
      return;
    }

    try {
      setWorking(true);
      setError(null);

      await updateSubscriptionCandidateStatus(candidate.id, {
        detectedStatus: 'ignored',
      });

      navigation.goBack();
    } catch (err) {
      console.error('Ignore candidate error:', err);
      setError('Could not ignore candidate');
    } finally {
      setWorking(false);
    }
  }

  const showActions = candidate?.detectedStatus === 'possible_subscription';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {loading
            ? 'Loading...'
            : candidate?.subscriptionName ?? candidate?.merchantName ?? 'Detected candidate'}
        </Text>
        <Text style={styles.subtitle}>
          Review candidate details detected from email ingestion.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Candidate details</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading candidate details...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !candidate ? (
            <Text style={styles.errorText}>Candidate not found.</Text>
          ) : (
            <>
              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Candidate ID</Text>
                <Text style={styles.infoValue}>{candidate.id}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={styles.infoValue}>{candidate.detectedStatus}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Confidence</Text>
                <Text style={styles.infoValue}>
                  {Math.round(candidate.confidence * 100)}%
                </Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Merchant</Text>
                <Text style={styles.infoValue}>{candidate.merchantName ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Subscription</Text>
                <Text style={styles.infoValue}>{candidate.subscriptionName ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Amount</Text>
                <Text style={styles.infoValue}>
                  {candidate.currency ?? '—'} {candidate.amount ?? '—'}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Detected charge date</Text>
                <Text style={styles.infoValue}>{candidate.detectedChargeDate ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Detected renewal date</Text>
                <Text style={styles.infoValue}>{candidate.detectedRenewalDate ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Detected card</Text>
                <Text style={styles.infoValue}>
                  {candidate.detectedCardLast4 ? 'ending ' + candidate.detectedCardLast4 : '—'}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>From</Text>
                <Text style={styles.infoValue}>{candidate.rawFrom ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Subject</Text>
                <Text style={styles.infoValue}>{candidate.rawSubject ?? '—'}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue}>{candidate.sourceLanguage ?? '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue}>{candidate.sourceCountry ?? '—'}</Text>
              </View>
            </>
          )}
        </View>

        {showActions ? (
          <View style={styles.actionsCard}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <Pressable
              onPress={handleConfirm}
              disabled={working}
              style={({ pressed }) => [
                styles.confirmButton,
                working && styles.actionButtonDisabled,
                pressed && !working && styles.pressed,
              ]}
            >
              <Text style={styles.confirmButtonText}>
                {working ? 'Working...' : 'Confirm'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleOneTime}
              disabled={working}
              style={({ pressed }) => [
                styles.secondaryButton,
                working && styles.actionButtonDisabled,
                pressed && !working && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>One-time</Text>
            </Pressable>

            <Pressable
              onPress={handleIgnore}
              disabled={working}
              style={({ pressed }) => [
                styles.secondaryButton,
                working && styles.actionButtonDisabled,
                pressed && !working && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Ignore</Text>
            </Pressable>
          </View>
        ) : null}
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
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 20,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  actionsCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.muted,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  confirmButton: {
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
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
