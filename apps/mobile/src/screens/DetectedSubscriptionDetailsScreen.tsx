import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchSubscriptionCandidateById, SubscriptionCandidate } from '../api/subscriptionCandidates';
import { DetectedSubscriptionsStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<
  DetectedSubscriptionsStackParamList,
  'DetectedSubscriptionDetails'
>;

export default function DetectedSubscriptionDetailsScreen({ route }: Props) {
  const [candidate, setCandidate] = useState<SubscriptionCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCandidate() {
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

    loadCandidate();

    return () => {
      isMounted = false;
    };
  }, [route.params.candidateId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>
          {loading ? 'Loading...' : candidate?.subscriptionName ?? candidate?.merchantName ?? 'Detected candidate'}
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
                <Text style={styles.infoValue}>{Math.round(candidate.confidence * 100)}%</Text>
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
