import React, { useEffect, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { fetchCards } from '../api/cards';
import { fetchSubscriptions } from '../api/subscriptions';
import { Card } from '../types/card';
import { Subscription } from '../types/subscription';
import { CardsStackParamList } from '../navigation/types';

type CardsScreenNavigationProp = NativeStackNavigationProp<CardsStackParamList, 'CardsList'>;

export default function CardsScreen() {
  const navigation = useNavigation<CardsScreenNavigationProp>();
  const [cards, setCards] = useState<Card[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [cardsData, subscriptionsData] = await Promise.all([
          fetchCards(),
          fetchSubscriptions(),
        ]);

        if (isMounted) {
          setCards(cardsData);
          setSubscriptions(subscriptionsData);
        }
      } catch (err) {
        console.error('Cards load error:', err);

        if (isMounted) {
          setError('Could not load cards');
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
  }, []);

  const totalMonthlyCost = cards.reduce((sum, item) => sum + item.monthlyTotal, 0).toFixed(2);
  const totalActiveSubscriptions = subscriptions.length;
  const linkedServices = [...new Set(subscriptions.map((item) => item.name))].slice(0, 5);

  function getNextRenewalForCard(card: Card): string {
    const dates = subscriptions
      .filter((item) => item.cardId === card.id && item.renewalDate)
      .map((item) => item.renewalDate as string)
      .sort((a, b) => a.localeCompare(b));

    return dates[0] ?? '—';
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Cards</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total subscriptions across all cards</Text>
          <Text style={styles.heroValue}>
            {loading ? 'Loading...' : 'EUR ' + totalMonthlyCost}
          </Text>
          <Text style={styles.heroSubvalue}>
            {loading ? '-' : totalActiveSubscriptions + ' active subscriptions'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Linked cards</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading cards...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : cards.length === 0 ? (
            <Text style={styles.infoText}>No cards found.</Text>
          ) : (
            cards.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => navigation.navigate('CardDetails', { cardId: item.id })}
                style={({ pressed }) => [
                  styles.cardRow,
                  index !== cards.length - 1 && styles.rowBorder,
                  pressed && styles.pressedRow,
                ]}
              >
                <View>
                  <Text style={styles.rowTitle}>
                    {item.name} ending {item.last4}
                  </Text>
                  <Text style={styles.rowSubtitle}>
                    {item.activeSubscriptionsCount} subscriptions
                  </Text>
                  <Text style={styles.rowMeta}>
                    Next renewal: {getNextRenewalForCard(item)}
                  </Text>
                </View>
                <Text style={styles.rowValue}>
                  {'EUR ' + item.monthlyTotal.toFixed(2) + ' / month'}
                </Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Yearly trend across cards</Text>
          <View style={styles.chartPlaceholder}>
            <View style={styles.lineChart}>
              <View style={[styles.linePoint, { left: '8%', top: '72%' }]} />
              <View style={[styles.linePoint, { left: '24%', top: '64%' }]} />
              <View style={[styles.linePoint, { left: '40%', top: '60%' }]} />
              <View style={[styles.linePoint, { left: '56%', top: '50%' }]} />
              <View style={[styles.linePoint, { left: '72%', top: '38%' }]} />
              <View style={[styles.linePoint, { left: '88%', top: '28%' }]} />
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
          <Text style={styles.sectionTitle}>Spending share by service</Text>
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
          <Text style={styles.sectionTitle}>Connected services</Text>

          {loading ? (
            <Text style={styles.infoText}>Loading services...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : linkedServices.length === 0 ? (
            <Text style={styles.infoText}>No services found.</Text>
          ) : (
            linkedServices.map((service, index) => (
              <View
                key={service}
                style={[styles.listRow, index !== linkedServices.length - 1 && styles.rowBorder]}
              >
                <Text style={styles.rowTitle}>{service}</Text>
                <Text style={styles.rowSubtitle}>Detected recurring payment</Text>
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
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 16,
  },
  pressedRow: {
    opacity: 0.7,
  },
  listRow: {
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
  rowSubtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  rowMeta: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4,
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
    left: '8%',
    right: '6%',
    top: '56%',
    height: 3,
    backgroundColor: '#93C5FD',
    borderRadius: 999,
    transform: [{ rotate: '-10deg' }],
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
    paddingVertical: 10,
  },
});
