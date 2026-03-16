import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fetchCardDetails } from '../api/cards';
import { colors } from '../theme/colors';
import { CardDetails } from '../types/cardDetails';

export default function CardDetailsScreen({ route }: any) {
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchCardDetails(route.params.cardId);

        if (isMounted) {
          setCardDetails(data);
        }
      } catch (err) {
        console.error('Card details load error:', err);

        if (isMounted) {
          setError('Could not load card details');
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
  }, [route.params.cardId]);

  const cardLabel = useMemo(() => {
    if (!cardDetails) {
      return '';
    }

    return `${cardDetails.name} ending ${cardDetails.last4}`;
  }, [cardDetails]);

  const recentCharges = useMemo(() => {
    if (!cardDetails) {
      return [];
    }

    return cardDetails.subscriptions.map((item, index) => ({
      id: `charge_${item.id}`,
      title: item.name,
      date: `2026-03-${String(index + 1).padStart(2, '0')}`,
      amount: item.monthlyPrice,
    }));
  }, [cardDetails]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{loading ? 'Loading...' : cardDetails?.name ?? 'Card details'}</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{loading ? 'Loading card...' : cardLabel}</Text>
          <Text style={styles.heroValue}>
            {loading ? 'Loading...' : `EUR ${cardDetails?.monthlyTotal.toFixed(2) ?? '0.00'}`}
          </Text>
          <Text style={styles.heroSubvalue}>
            {loading
              ? '-'
              : `${cardDetails?.activeSubscriptionsCount ?? 0} active subscriptions`}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Card info</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading card info...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !cardDetails ? (
            <Text style={styles.errorText}>Card not found</Text>
          ) : (
            <>
              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Last 4 digits</Text>
                <Text style={styles.infoValue}>{cardDetails.last4}</Text>
              </View>

              <View style={[styles.infoRow, styles.rowBorder]}>
                <Text style={styles.infoLabel}>Monthly total</Text>
                <Text style={styles.infoValue}>EUR {cardDetails.monthlyTotal.toFixed(2)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active subscriptions</Text>
                <Text style={styles.infoValue}>{cardDetails.activeSubscriptionsCount}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subscriptions on this card</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading subscriptions...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : !cardDetails || cardDetails.subscriptions.length === 0 ? (
            <Text style={styles.infoText}>No subscriptions found.</Text>
          ) : (
            cardDetails.subscriptions.map((item, index) => (
              <View
                key={item.id}
                style={[styles.listRow, index !== cardDetails.subscriptions.length - 1 && styles.rowBorder]}
              >
                <View>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  <Text style={styles.rowSubtext}>{item.status}</Text>
                </View>
                <Text style={styles.rowValue}>EUR {item.monthlyPrice.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent charges</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading recent charges...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : recentCharges.length === 0 ? (
            <Text style={styles.infoText}>No recent charges found.</Text>
          ) : (
            recentCharges.map((charge, index) => (
              <View
                key={charge.id}
                style={[styles.listRow, index !== recentCharges.length - 1 && styles.rowBorder]}
              >
                <View>
                  <Text style={styles.rowTitle}>{charge.title}</Text>
                  <Text style={styles.rowSubtext}>{charge.date}</Text>
                </View>
                <Text style={styles.rowValue}>EUR {charge.amount.toFixed(2)}</Text>
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
    color: colors.muted,
    marginTop: 6,
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
  infoLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowSubtext: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
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
