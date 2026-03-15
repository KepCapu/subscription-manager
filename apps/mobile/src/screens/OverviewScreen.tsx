import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { fetchOverview } from '../api/overview';
import { fetchSubscriptions } from '../api/subscriptions';
import { fetchCards } from '../api/cards';
import { OverviewData } from '../types/overview';
import { Subscription } from '../types/subscription';
import { Card } from '../types/card';

export default function OverviewScreen() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadOverviewData() {
      try {
        setLoading(true);
        setError(null);

        const [overviewData, subscriptionsData, cardsData] = await Promise.all([
          fetchOverview(),
          fetchSubscriptions(),
          fetchCards(),
        ]);

        if (isMounted) {
          setOverview(overviewData);
          setSubscriptions(subscriptionsData);
          setCards(cardsData);
        }
      } catch (err) {
        console.error('Overview load error:', err);

        if (isMounted) {
          setError('Could not load overview');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadOverviewData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalMonthlyCost = overview ? overview.totalMonthlyCost.toFixed(2) : '0.00';
  const activeSubscriptions = overview ? overview.activeSubscriptions : 0;
  const upcomingRenewals = overview ? overview.upcomingRenewals.toFixed(2) : '0.00';
  const possibleRecurring = overview ? overview.possibleRecurring : 0;

  const topSubscriptions = [...subscriptions]
    .sort((a, b) => b.monthlyPrice - a.monthlyPrice)
    .slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Overview</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Monthly Subscriptions</Text>
          <Text style={styles.heroValue}>
            {loading ? 'Loading...' : 'EUR ' + totalMonthlyCost}
          </Text>
          <Text style={styles.heroSubvalue}>/ month</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Active subscriptions</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {loading ? '-' : activeSubscriptions}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Upcoming renewals</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {loading ? '...' : 'EUR ' + upcomingRenewals}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Possible recurring</Text>
            <Text style={[styles.summaryValue, { color: colors.warning }]}>
              {loading ? '-' : possibleRecurring}
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.sectionCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top expensive subscriptions</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading subscriptions...</Text>
          ) : topSubscriptions.length === 0 ? (
            <Text style={styles.infoText}>No subscriptions found.</Text>
          ) : (
            topSubscriptions.map((item, index) => (
              <View
                key={item.id}
                style={[styles.listRow, index !== topSubscriptions.length - 1 && styles.rowBorder]}
              >
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowValue}>EUR {item.monthlyPrice.toFixed(2)} / month</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Yearly spending trend</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.lineChart}>
              <View style={[styles.linePoint, { left: '6%', top: '72%' }]} />
              <View style={[styles.linePoint, { left: '20%', top: '62%' }]} />
              <View style={[styles.linePoint, { left: '34%', top: '66%' }]} />
              <View style={[styles.linePoint, { left: '48%', top: '52%' }]} />
              <View style={[styles.linePoint, { left: '62%', top: '50%' }]} />
              <View style={[styles.linePoint, { left: '76%', top: '34%' }]} />
              <View style={[styles.linePoint, { left: '90%', top: '22%' }]} />
              <View style={styles.lineStroke} />
            </View>
            <View style={styles.monthRow}>
              <Text style={styles.monthLabel}>Jan</Text>
              <Text style={styles.monthLabel}>Mar</Text>
              <Text style={styles.monthLabel}>May</Text>
              <Text style={styles.monthLabel}>Jul</Text>
              <Text style={styles.monthLabel}>Sep</Text>
              <Text style={styles.monthLabel}>Nov</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Spending distribution</Text>
          <View style={styles.donutWrap}>
            <View style={styles.donut} />
            <View style={styles.legend}>
              <Text style={styles.legendItem}>Netflix - 18%</Text>
              <Text style={styles.legendItem}>Adobe - 27%</Text>
              <Text style={styles.legendItem}>Spotify - 14%</Text>
              <Text style={styles.legendItem}>Apple - 9%</Text>
              <Text style={styles.legendItem}>Others - 32%</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Linked cards</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading cards...</Text>
          ) : cards.length === 0 ? (
            <Text style={styles.infoText}>No cards found.</Text>
          ) : (
            cards.map((item, index) => (
              <View
                key={item.id}
                style={[styles.listRow, index !== cards.length - 1 && styles.rowBorder]}
              >
                <Text style={styles.rowTitle}>
                  {item.name} ending {item.last4}
                </Text>
                <Text style={styles.rowValue}>EUR {item.monthlyTotal.toFixed(2)}</Text>
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
    fontSize: 42,
    fontWeight: '800',
    color: colors.text,
  },
  heroSubvalue: {
    fontSize: 18,
    color: colors.muted,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  summaryValue: {
    fontSize: 28,
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
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  rowValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  chartPlaceholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
  },
  lineChart: {
    height: 150,
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 12,
  },
  lineStroke: {
    position: 'absolute',
    left: '6%',
    right: '4%',
    top: '58%',
    height: 3,
    backgroundColor: '#93C5FD',
    borderRadius: 999,
    transform: [{ rotate: '-12deg' }],
  },
  linePoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  donutWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  donut: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 18,
    borderTopColor: colors.primary,
    borderRightColor: colors.success,
    borderBottomColor: colors.warning,
    borderLeftColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    fontSize: 14,
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.muted,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
});
