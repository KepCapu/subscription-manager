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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  createEmailAccount,
  fetchEmailAccounts,
  EmailAccount,
} from '../api/emailAccounts';
import { EmailAccountsStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<EmailAccountsStackParamList, 'EmailAccountsList'>;

function createEmailAccountId(email: string) {
  const slug = email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return 'email-' + slug + '-' + Date.now().toString().slice(-6);
}

export default function EmailAccountsScreen({ navigation }: Props) {
  const [items, setItems] = useState<EmailAccount[]>([]);
  const [email, setEmail] = useState('');
  const [provider, setProvider] = useState('gmail');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmailAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchEmailAccounts();
      setItems(data);
    } catch (err) {
      console.error('Email accounts load error:', err);
      setError('Could not load email accounts');
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
              <Pressable
                key={item.id}
                onPress={() =>
                  navigation.navigate('EmailAccountDetails', { emailAccountId: item.id })
                }
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
                </View>
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
  actionButtonDisabled: {
    opacity: 0.5,
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
    marginTop: 2,
  },
  rowStatusInactive: {
    color: colors.muted,
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
