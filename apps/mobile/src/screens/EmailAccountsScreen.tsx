import React, { useCallback, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchEmailAccounts, EmailAccount } from '../api/emailAccounts';
import { colors } from '../theme/colors';

export default function EmailAccountsScreen() {
  const [items, setItems] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadEmailAccounts() {
        try {
          setLoading(true);
          setError(null);

          const data = await fetchEmailAccounts();

          if (isMounted) {
            setItems(data);
          }
        } catch (err) {
          console.error('Email accounts load error:', err);

          if (isMounted) {
            setError('Could not load email accounts');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      loadEmailAccounts();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Email accounts</Text>
        <Text style={styles.subtitle}>
          Connected mailboxes used to detect active and historical subscriptions.
        </Text>

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
                style={({ pressed }) => [
                  styles.accountRow,
                  index !== items.length - 1 && styles.rowBorder,
                  pressed && styles.pressedRow,
                ]}
              >
                <View style={styles.leftCol}>
                  <Text style={styles.rowTitle}>{item.email}</Text>
                  <Text style={styles.rowMeta}>Provider: {item.provider}</Text>
                  <Text style={styles.rowMeta}>
                    Last synced: {item.lastSyncedAt ?? 'Not synced yet'}
                  </Text>
                </View>

                <Text style={styles.rowStatus}>{item.status}</Text>
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
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
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
