import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const summaryCards = [
  { label: 'Active subscriptions', value: '12', accent: colors.primary },
  { label: 'Next 7 days', value: 'EUR 24.97', accent: colors.success },
  { label: 'Suspected recurring', value: '2', accent: colors.warning },
];

const topSubscriptions = [
  { name: 'Netflix', price: 'EUR 15.99 / month' },
  { name: 'Adobe', price: 'EUR 24.99 / month' },
  { name: 'YouTube Premium', price: 'EUR 8.50 / month' },
];

const linkedCards = [
  { name: 'Visa ending 4421', value: 'EUR 42.48' },
  { name: 'Mastercard ending 7710', value: 'EUR 27.99' },
  { name: 'Revolut ending 0023', value: 'EUR 19.03' },
];

export default function OverviewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Overview</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Monthly Subscriptions</Text>
          <Text style={styles.heroValue}>EUR 89.50</Text>
          <Text style={styles.heroSubvalue}>/ month</Text>
        </View>

        <View style={styles.summaryRow}>
          {summaryCards.map((item) => (
            <View key={item.label} style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: item.accent }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Top expensive subscriptions</Text>
          {topSubscriptions.map((item, index) => (
            <View
              key={item.name}
              style={[styles.listRow, index !== topSubscriptions.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowValue}>{item.price}</Text>
            </View>
          ))}
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
          {linkedCards.map((item, index) => (
            <View
              key={item.name}
              style={[styles.listRow, index !== linkedCards.length - 1 && styles.rowBorder]}
            >
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
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
});
