import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  EmailAccount,
  fetchEmailAccounts,
  triggerEmailAccountSync,
  updateEmailAccountStatus,
} from '../api/emailAccounts';
import { fetchSyncRunsByEmailAccountId } from '../api/emailSyncRuns';
import {
  fetchSubscriptionCandidatesByEmailAccountId,
  SubscriptionCandidate,
} from '../api/subscriptionCandidates';
import { EmailSyncRun } from '../types/emailSyncRun';
import { EmailAccountsStackParamList, RootTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<EmailAccountsStackParamList, 'EmailAccountDetails'>;

function formatDate(value: string | null) {
  if (!value) {
    return 'Not synced yet';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function formatAmount(amount: number | null, currency: string | null) {
  if (amount === null) {
    return '—';
  }

  return `${currency ?? 'EUR'} ${amount.toFixed(2)}`;
}

function getSyncStatusStyle(status: string) {
  if (status === 'completed') {
    return styles.syncStatusCompleted;
  }
  if (status === 'failed') {
    return styles.syncStatusFailed;
  }
  if (status === 'running') {
    return styles.syncStatusRunning;
  }
  return styles.syncStatusDefault;
}

export default function EmailAccountDetailsScreen({ route }: Props) {
  const tabNavigation = useNavigation();
  const { emailAccountId } = route.params;

  const [emailAccount, setEmailAccount] = useState<EmailAccount | null>(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [syncRuns, setSyncRuns] = useState<EmailSyncRun[]>([]);
  const [syncLoading, setSyncLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [candidates, setCandidates] = useState<SubscriptionCandidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(true);
  const [candidatesError, setCandidatesError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  const loadData = useCallback(async () => {
    setAccountLoading(true);
    setAccountError(null);
    setSyncLoading(true);
    setSyncError(null);
    setCandidatesLoading(true);
    setCandidatesError(null);

    try {
      const [accountsData, runsData, candidatesData] = await Promise.all([
        fetchEmailAccounts(),
        fetchSyncRunsByEmailAccountId(emailAccountId),
        fetchSubscriptionCandidatesByEmailAccountId(emailAccountId),
      ]);

      const matchedAccount = accountsData.find((item) => item.id === emailAccountId) ?? null;
      setEmailAccount(matchedAccount);
      setSyncRuns(runsData);
      setCandidates(candidatesData);
    } catch (err) {
      console.error('Email account details load error:', err);
      setAccountError('Could not load email account');
      setSyncError('Could not load sync history');
      setCandidatesError('Could not load candidates');
    } finally {
      setAccountLoading(false);
      setSyncLoading(false);
      setCandidatesLoading(false);
    }
  }, [emailAccountId]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function run() {
        if (!isMounted) {
          return;
        }
        await loadData();
      }

      run();

      return () => {
        isMounted = false;
      };
    }, [loadData])
  );

  async function handleRunSync() {
    if (!emailAccount || syncing) {
      return;
    }

    try {
      setSyncing(true);
      await triggerEmailAccountSync(emailAccount.id);
      await loadData();
    } catch (err) {
      console.error('Run sync error:', err);
      Alert.alert('Sync failed', 'Could not run sync for this email account.');
    } finally {
      setSyncing(false);
    }
  }

  async function handleDeactivate() {
    if (!emailAccount || deactivating) {
      return;
    }

    try {
      setDeactivating(true);
      await updateEmailAccountStatus(emailAccount.id, { status: 'inactive' });
      await loadData();
    } catch (err) {
      console.error('Deactivate email account error:', err);
      Alert.alert('Update failed', 'Could not deactivate this email account.');
    } finally {
      setDeactivating(false);
    }
  }

  function handleOpenCandidate(candidateId: string) {
    const navigation = tabNavigation as unknown as {
      navigate: (screen: keyof RootTabParamList, params: unknown) => void;
    };

    navigation.navigate('DetectedSubscriptions', {
      screen: 'DetectedSubscriptionDetails',
      params: { candidateId },
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>
          {accountLoading ? 'Loading...' : emailAccount?.email ?? 'Email account'}
        </Text>

        <View style={styles.heroCard}>
          {accountLoading ? (
            <Text style={styles.infoText}>Loading account details...</Text>
          ) : accountError ? (
            <Text style={styles.errorText}>{accountError}</Text>
          ) : !emailAccount ? (
            <Text style={styles.errorText}>Email account not found.</Text>
          ) : (
            <>
              <Text style={styles.heroLabel}>{emailAccount.provider}</Text>
              <Text style={styles.heroValue}>{emailAccount.email}</Text>
              <Text
                style={[
                  styles.heroStatus,
                  emailAccount.status === 'active' ? styles.statusActive : styles.statusInactive,
                ]}
              >
                {emailAccount.status}
              </Text>
              <Text style={styles.heroSubvalue}>
                Last synced: {formatDate(emailAccount.lastSyncedAt)}
              </Text>
            </>
          )}
        </View>

        {emailAccount?.status === 'active' ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Pressable
              onPress={handleRunSync}
              disabled={syncing}
              style={({ pressed }) => [
                styles.primaryButton,
                syncing && styles.actionButtonDisabled,
                pressed && !syncing && styles.pressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>{syncing ? 'Syncing...' : 'Run sync'}</Text>
            </Pressable>
            <Pressable
              onPress={handleDeactivate}
              disabled={deactivating}
              style={({ pressed }) => [
                styles.secondaryButton,
                deactivating && styles.actionButtonDisabled,
                pressed && !deactivating && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {deactivating ? 'Working...' : 'Deactivate'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Sync history</Text>

          {syncLoading ? (
            <Text style={styles.infoText}>Loading sync history...</Text>
          ) : syncError ? (
            <Text style={styles.errorText}>{syncError}</Text>
          ) : syncRuns.length === 0 ? (
            <Text style={styles.infoText}>No sync runs yet.</Text>
          ) : (
            syncRuns.map((run, index) => (
              <View key={run.id} style={[styles.listRow, index !== syncRuns.length - 1 && styles.rowBorder]}>
                <View style={styles.rowLeft}>
                  <Text style={[styles.syncStatus, getSyncStatusStyle(run.status)]}>{run.status}</Text>
                  <Text style={styles.rowMeta}>Started: {formatDate(run.startedAt)}</Text>
                  <Text style={styles.rowMeta}>Candidates found: {run.candidatesFound}</Text>
                  {run.status === 'failed' && run.errorMessage ? (
                    <Text style={styles.syncErrorText}>{run.errorMessage}</Text>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Detected candidates</Text>

          {candidatesLoading ? (
            <Text style={styles.infoText}>Loading candidates...</Text>
          ) : candidatesError ? (
            <Text style={styles.errorText}>{candidatesError}</Text>
          ) : candidates.length === 0 ? (
            <Text style={styles.infoText}>No candidates found.</Text>
          ) : (
            candidates.map((candidate, index) => (
              <Pressable
                key={candidate.id}
                onPress={() => handleOpenCandidate(candidate.id)}
                style={[styles.listRow, index !== candidates.length - 1 && styles.rowBorder]}
              >
                <View style={styles.rowLeft}>
                  <Text style={styles.rowTitle}>
                    {candidate.subscriptionName ?? candidate.merchantName ?? 'Unnamed candidate'}
                  </Text>
                  <Text style={styles.rowMeta}>{candidate.detectedStatus}</Text>
                  <Text style={styles.rowMeta}>
                    Confidence: {Math.round(candidate.confidence * 100)}%
                  </Text>
                </View>
                <Text style={styles.rowValue}>{formatAmount(candidate.amount, candidate.currency)}</Text>
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  heroStatus: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    textTransform: 'uppercase',
  },
  statusActive: {
    color: colors.success,
  },
  statusInactive: {
    color: colors.muted,
  },
  heroSubvalue: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 8,
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
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.card,
  },
  secondaryButton: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flex: 1,
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
  rowValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  syncStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  syncStatusCompleted: {
    color: colors.success,
  },
  syncStatusFailed: {
    color: '#DC2626',
  },
  syncStatusRunning: {
    color: colors.primary,
  },
  syncStatusDefault: {
    color: colors.muted,
  },
  syncErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
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
