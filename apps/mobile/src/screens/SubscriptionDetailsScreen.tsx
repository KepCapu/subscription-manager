import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { deleteSubscription, fetchSubscriptionDetails } from '../api/subscriptions';
import { colors } from '../theme/colors';
import { SubscriptionDetails } from '../types/subscriptionDetails';
import { SubscriptionStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SubscriptionStackParamList, 'SubscriptionDetails'>;

export default function SubscriptionDetailsScreen({ route, navigation }: Props) {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function loadData() {
        try {
          setLoading(true);
          setError(null);

          const data = await fetchSubscriptionDetails(route.params.subscriptionId);

          if (isMounted) {
            setSubscriptionDetails(data);
          }
        } catch (err) {
          console.error('Subscription details load error:', err);

          if (isMounted) {
            setError('Could not load subscription details');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [route.params.subscriptionId])
  );

  const chargeHistory = useMemo(() => {
    if (!subscriptionDetails) {
      return [];
    }

    return [
      { id: 'c1', date: '2026-03-01', amount: subscriptionDetails.monthlyPrice },
      { id: 'c2', date: '2026-02-01', amount: subscriptionDetails.monthlyPrice },
      { id: 'c3', date: '2026-01-01', amount: subscriptionDetails.monthlyPrice },
    ];
  }, [subscriptionDetails]);

  async function handleDelete() {
    if (!subscriptionDetails || deleting) {
      return;
    }

    try {
      setDeleting(true);
      await deleteSubscription(subscriptionDetails.id);
      navigation.goBack();
    } catch (err) {
      console.error('Delete subscription error:', err);

      if (Platform.OS === 'web') {
        if (typeof globalThis.alert === 'function') {
          globalThis.alert('Could not delete subscription');
        }
      } else {
        Alert.alert('Error', 'Could not delete subscription');
      }
    } finally {
      setDeleting(false);
    }
  }

  function confirmDelete() {
    if (!subscriptionDetails || deleting) {
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm(`Delete ${subscriptionDetails.name}?`)
          : true;

      if (!confirmed) {
        return;
      }

      void handleDelete();
      return;
    }

    Alert.alert(
      'Delete subscription',
      `Delete ${subscriptionDetails.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void handleDelete();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>
          {loading ? 'Loading...' : subscriptionDetails?.name ?? 'Subscription details'}
        </Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Monthly cost</Text>
          <Text style={styles.heroValue}>
            {loading
              ? 'Loading...'
              : `EUR ${subscriptionDetails?.monthlyPrice.toFixed(2) ?? '0.00'}`}
          </Text>
          <Text style={styles.heroSubvalue}>
            {loading ? '-' : subscriptionDetails?.status ?? '-'}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            subscriptionDetails &&
            navigation.navigate('EditSubscription', {
              subscriptionId: subscriptionDetails.id,
            })
          }
          disabled={loading || !subscriptionDetails}
          style={({ pressed }) => [
            styles.editButton,
            (loading || !subscriptionDetails) && styles.editButtonDisabled,
            pressed && !loading && subscriptionDetails && styles.editButtonPressed,
          ]}
        >
          <Text style={styles.editButtonText}>Edit subscription</Text>
        </Pressable>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subscription info</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading subscription info...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !subscriptionDetails ? (
            <Text style={styles.errorText}>Subscription not found</Text>
          ) : (
            <>
              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Billing card</Text>
                <Text style={styles.infoValue}>{subscriptionDetails.billingCardName}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: colors.success }]}>
                  {subscriptionDetails.status}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Next renewal</Text>
                <Text style={styles.infoValue}>{subscriptionDetails.renewalDate ?? '—'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Billing cycle</Text>
                <Text style={styles.infoValue}>Monthly</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Linked card</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading linked card...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !subscriptionDetails ? (
            <Text style={styles.errorText}>Subscription not found</Text>
          ) : !subscriptionDetails.billingCard ? (
            <Text style={styles.infoText}>No linked card found.</Text>
          ) : (
            <>
              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Card</Text>
                <Text style={styles.infoValue}>
                  {subscriptionDetails.billingCard.name} ending {subscriptionDetails.billingCard.last4}
                </Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Monthly total</Text>
                <Text style={styles.infoValue}>
                  EUR {subscriptionDetails.billingCard.monthlyTotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active subscriptions</Text>
                <Text style={styles.infoValue}>
                  {subscriptionDetails.billingCard.activeSubscriptionsCount}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent charges</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading recent charges...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : chargeHistory.length === 0 ? (
            <Text style={styles.infoText}>No recent charges found.</Text>
          ) : (
            chargeHistory.map((charge, index) => (
              <View
                key={charge.id}
                style={[styles.chargeRow, index !== chargeHistory.length - 1 && styles.rowBorder]}
              >
                <View>
                  <Text style={styles.chargeDate}>{charge.date}</Text>
                  <Text style={styles.chargeMeta}>Processed recurring charge</Text>
                </View>
                <Text style={styles.chargeAmount}>EUR {charge.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable
          onPress={confirmDelete}
          disabled={loading || deleting || !subscriptionDetails}
          style={({ pressed }) => [
            styles.deleteButton,
            (loading || deleting || !subscriptionDetails) && styles.deleteButtonDisabled,
            pressed && !loading && !deleting && subscriptionDetails && styles.deleteButtonPressed,
          ]}
        >
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Deleting...' : 'Delete subscription'}
          </Text>
        </Pressable>
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
    fontSize: 40,
    fontWeight: '800',
    color: colors.text,
  },
  heroSubvalue: {
    fontSize: 16,
    color: colors.success,
    marginTop: 6,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: colors.text,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editButtonPressed: {
    opacity: 0.8,
  },
  editButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  chargeDate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  chargeMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
  },
  chargeAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  deleteButton: {
    backgroundColor: '#DC2626',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
