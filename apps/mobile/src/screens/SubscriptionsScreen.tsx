import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../components/SectionCard';
import { colors } from '../theme/colors';

const subscriptions = [
  { name: 'Netflix', price: 'EUR 15.99 / month', card: 'Visa ending 4421', status: 'Active' },
  { name: 'Spotify', price: 'EUR 9.99 / month', card: 'Visa ending 4421', status: 'Active' },
  { name: 'Adobe', price: 'EUR 24.99 / month', card: 'Mastercard ending 7710', status: 'Active' },
  { name: 'YouTube Premium', price: 'EUR 8.50 / month', card: 'Visa ending 4421', status: 'Active' },
  { name: 'Apple One', price: 'EUR 16.95 / month', card: 'Mastercard ending 7710', status: 'Active' },
  { name: 'Canva', price: 'EUR 11.99 / month', card: 'Revolut ending 0023', status: 'Active' },
];

export default function SubscriptionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Subscriptions</Text>

        <View style={styles.heroCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.heroLabel}>Total active subscriptions</Text>
            <Text style={styles.heroValue}>12</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.heroLabel}>Total monthly cost</Text>
            <Text style={styles.heroValue}>EUR 89.50</Text>
          </View>
        </View>

        <SectionCard title="All subscriptions">
          {subscriptions.map((item, index) => (
            <View
              key={item.name}
              style={[styles.listRow, index !== subscriptions.length - 1 && styles.rowBorder]}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSubtext}>{item.card}</Text>
                <Text style={styles.rowStatus}>{item.status}</Text>
              </View>
              <Text style={styles.rowValue}>{item.price}</Text>
            </View>
          ))}
        </SectionCard>
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  heroLabel: {
    fontSize: 15,
    color: colors.muted,
  },
  heroValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
  rowSubtext: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 4,
  },
  rowStatus: {
    fontSize: 13,
    color: colors.success,
    marginTop: 2,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
});
