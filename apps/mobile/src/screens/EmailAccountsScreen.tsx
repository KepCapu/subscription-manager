import React, { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  createEmailAccount,
  fetchEmailAccounts,
  EmailAccount,
  triggerEmailAccountSync,
  updateEmailAccountStatus,
} from '../api/emailAccounts';
import { fetchSyncRunsByEmailAccountId } from '../api/emailSyncRuns';
import { EmailSyncRun } from '../types/emailSyncRun';
import { colors } from '../theme/colors';

type SyncRunsByAccountMap = Record<string, EmailSyncRun[]>;
type SyncHistoryErrorByAccountMap = Record<string, string | null>;
type SyncHistoryLoadingByAccountMap = Record<string, boolean>;

function createEmailAccountId(email: string) {
  const slug = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return 'email-' + slug + '-' + Date.now().toString().slice(-6);
}

function formatSyncDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
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

export default function EmailAccountsScreen() {
  const [items, setItems] = useState<EmailAccount[]>([]);
  const [syncRunsByAccount, setSyncRunsByAccount] = useState<SyncRunsByAccountMap>({});
  const [syncHistoryErrorByAccount, setSyncHistoryErrorByAccount] =
    useState<SyncHistoryErrorByAccountMap>({});
  const [syncHistoryLoadingByAccount, setSyncHistoryLoadingByAccount] =
    useState<SyncHistoryLoadingByAccountMap>({});
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEmailAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchEmailAccounts();
      setItems(data);

      const nextSyncHistoryLoadingByAccount = data.reduce<SyncHistoryLoadingByAccountMap>(
        (acc, account) => {
          acc[account.id] = true;
          return acc;
        },
        {}
      );
      setSyncHistoryLoadingByAccount(nextSyncHistoryLoadingByAccount);
      setSyncHistoryErrorByAccount({});

      const syncRunResults = await Promise.all(
        data.map(async (account) => {
          try {
            const runs = await fetchSyncRunsByEmailAccountId(account.id);
            return { accountId: account.id, runs, error: null as string | null };
          } catch (err) {
            console.error('Sync runs load error for account ' + account.id + ':', err);
            return {
              accountId: account.id,
              runs: [] as EmailSyncRun[],
              error: 'Could not load sync history',
            };
          }
        })
      );

      const nextSyncRunsByAccount = syncRunResults.reduce<SyncRunsByAccountMap>((acc, result) => {
        acc[result.accountId] = result.runs;
        return acc;
      }, {});
      const nextSyncHistoryErrorByAccount = syncRunResults.reduce<SyncHistoryErrorByAccountMap>(
        (acc, result) => {
          acc[result.accountId] = result.error;
          return acc;
        },
        {}
      );
      const nextSyncHistoryLoadingDone = data.reduce<SyncHistoryLoadingByAccountMap>(
        (acc, account) => {
          acc[account.id] = false;
          return acc;
        },
        {}
      );

      setSyncRunsByAccount(nextSyncRunsByAccount);
      setSyncHistoryErrorByAccount(nextSyncHistoryErrorByAccount);
      setSyncHistoryLoadingByAccount(nextSyncHistoryLoadingDone);
    } catch (err) {
      console.error('Email accounts load error:', err);
      setError('Could not load email accounts');
      setSyncRunsByAccount({});
      setSyncHistoryErrorByAccount({});
      setSyncHistoryLoadingByAccount({});
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function run() {
        try {
          await loadEmailAccounts();
        } catch (err) {
          if (isMounted) {
            console.error('Email accounts load error:', err);
          }
        }
      }

      run();

      return () => {
        isMounted = false;
      };
    }, [loadEmailAccounts])
  );

  async function handleAddEmailAccount() {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedProvider = provider.trim().toLowerCase();

    if (!trimmedEmail) {
      Alert.alert('Validation', 'Enter email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      Alert.alert('Validation', 'Enter a valid email address.');
      return;
    }

    if (!trimmedProvider) {
      Alert.alert('Validation', 'Enter provider.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createEmailAccount({
        id: createEmailAccountId(trimmedEmail),
        email: trimmedEmail,
        provider: trimmedProvider,
        status: 'active',
      });

      setEmail('');
      setProvider('gmail');
      await loadEmailAccounts();
    } catch (err) {
      console.error('Create email account error:', err);
      setError('Could not create email account');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(emailAccountId: string) {
    try {
      setUpdatingId(emailAccountId);
      setError(null);

      await updateEmailAccountStatus(emailAccountId, {
        status: 'inactive',
      });

      await loadEmailAccounts();
    } catch (err) {
      console.error('Deactivate email account error:', err);
      setError('Could not deactivate email account');
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleRunSync(emailAccountId: string) {
    try {
      setSyncingId(emailAccountId);
      setError(null);

      await triggerEmailAccountSync(emailAccountId);
      await loadEmailAccounts();
    } catch (err) {
      console.error('Run sync error:', err);
      Alert.alert('Sync failed', 'Could not run sync for this email account.');
    } finally {
      setSyncingId(null);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Email accounts</Text>
        <Text style={styles.subtitle}>
          Connected mailboxes used to detect active and historical subscriptions.
        </Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Add email account</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="user@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>Provider</Text>
          <TextInput
            value={provider}
            onChangeText={setProvider}
            placeholder="gmail"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={styles.input}
          />

          <Pressable
            onPress={handleAddEmailAccount}
            disabled={submitting}
            style={({ pressed }) => [
              styles.addButton,
              submitting && styles.actionButtonDisabled,
              pressed && !submitting && styles.pressedRow,
            ]}
          >
            <Text style={styles.addButtonText}>
              {submitting ? 'Adding...' : 'Add email account'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Connected accounts</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading email accounts...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : items.length === 0 ? (
            <Text style={styles.infoText}>No email accounts connected yet.</Text>
          ) : (
            items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.accountRow,
                  index !== items.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.rowTitle}>{item.email}</Text>
                  <Text style={styles.rowMeta}>Provider: {item.provider}</Text>
                  <Text style={styles.rowMeta}>
                    Last synced: {item.lastSyncedAt ?? 'Not synced yet'}
                  </Text>

                  <View style={styles.syncHistoryWrap}>
                    <Text style={styles.syncHistoryTitle}>Sync history</Text>

                    {syncHistoryLoadingByAccount[item.id] ? (
                      <Text style={styles.infoText}>Loading sync history...</Text>
                    ) : syncHistoryErrorByAccount[item.id] ? (
                      <Text style={styles.errorText}>{syncHistoryErrorByAccount[item.id]}</Text>
                    ) : (syncRunsByAccount[item.id] ?? []).length === 0 ? (
                      <Text style={styles.infoText}>No sync runs yet.</Text>
                    ) : (
                      <>
                        {(syncRunsByAccount[item.id] ?? []).slice(0, 3).map((run) => (
                          <View key={run.id} style={styles.syncRunItem}>
                            <Text style={[styles.syncStatus, getSyncStatusStyle(run.status)]}>
                              {run.status}
                            </Text>
                            <Text style={styles.syncMeta}>
                              Started: {formatSyncDate(run.startedAt)}
                            </Text>
                            <Text style={styles.syncMeta}>
                              Candidates found: {run.candidatesFound}
                            </Text>
                            {run.status === 'failed' && run.errorMessage ? (
                              <Text style={styles.syncErrorText}>{run.errorMessage}</Text>
                            ) : null}
                          </View>
                        ))}
                        <Text style={styles.syncMetaNote}>
                          Showing last {Math.min(3, (syncRunsByAccount[item.id] ?? []).length)} of{' '}
                          {(syncRunsByAccount[item.id] ?? []).length}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={styles.rightCol}>
                  <Text
                    style={[
                      styles.rowStatus,
                      item.status !== 'active' && styles.rowStatusInactive,
                    ]}
                  >
                    {item.status}
                  </Text>

                  {item.status === 'active' ? (
                    <>
                      <Pressable
                        onPress={() => handleRunSync(item.id)}
                        disabled={syncingId === item.id}
                        style={({ pressed }) => [
                          styles.syncButton,
                          syncingId === item.id && styles.actionButtonDisabled,
                          pressed && syncingId !== item.id && styles.pressedRow,
                        ]}
                      >
                        <Text style={styles.syncButtonText}>
                          {syncingId === item.id ? 'Syncing...' : 'Run sync'}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDeactivate(item.id)}
                        disabled={updatingId === item.id}
                        style={({ pressed }) => [
                          styles.deactivateButton,
                          updatingId === item.id && styles.actionButtonDisabled,
                          pressed && updatingId !== item.id && styles.pressedRow,
                        ]}
                      >
                        <Text style={styles.deactivateButtonText}>
                          {updatingId === item.id ? 'Working...' : 'Deactivate'}
                        </Text>
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
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  addButton: {
    marginTop: 20,
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  accountRow: {
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
  syncHistoryWrap: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  syncHistoryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  syncRunItem: {
    paddingVertical: 8,
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
  syncMeta: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
  },
  syncMetaNote: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 6,
  },
  syncErrorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
  rowStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
    marginTop: 2,
  },
  rowStatusInactive: {
    color: colors.muted,
  },
  deactivateButton: {
    marginTop: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  syncButton: {
    marginTop: 10,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  deactivateButtonText: {
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
