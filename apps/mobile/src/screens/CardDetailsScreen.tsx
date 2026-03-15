import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { mockCards } from '../data/mockCards';
import { mockSubscriptions } from '../data/mockSubscriptions';

type Props = {
  route: {
    params: {
      cardId: string;
    };
  };
};

export default function CardDetailsScreen({ route }: Props) {
  const card = mockCards.find((item) => item.id === route.params.cardId);

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.screenTitle}>Card not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cardLabel = ${card.name} ending ;

  const subscriptionsForCard = mockSubscriptions.filter(
    (item) => item.billingCardName === cardLabel
  );

  const recentCharges = subscriptionsForCard.map((item, index) => ({
    id: charge_,
    title: item.name,
    date: 2026-03-0,
    amount: item.monthlyPrice,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>{card.name}</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>{cardLabel}</Text>
          <Text style={styles.heroValue}>EUR {card.monthlyTotal.toFixed(2)}</Text>
          <Text style={styles.heroSubvalue}>{card.activeSubscriptionsCount} active subscriptions</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Card info</Text>

          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoLabel}>Last 4 digits</Text>
            <Text style={styles.infoValue}>{card.last4}</Text>
          </View>

          <View style={[styles.infoRow, styles.rowBorder]}>
            <Text style={styles.infoLabel}>Monthly total</Text>
            <Text style={styles.infoValue}>EUR {card.monthlyTotal.toFixed(2)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Active subscriptions</Text>
            <Text style={styles.infoValue}>{card.activeSubscriptionsCount}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Subscriptions on this card</Text>

          {subscriptionsForCard.map((item, index) => (
            <View
              key={item.id}
              style={[styles.listRow, index !== subscriptionsForCard.length - 1 && styles.rowBorder]}
            >
              <View>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSubtext}>{item.status}</Text>
              </View>
              <Text style={styles.rowValue}>EUR {item.monthlyPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent charges</Text>

          {recentCharges.map((charge, index) => (
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
          ))}
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
});
