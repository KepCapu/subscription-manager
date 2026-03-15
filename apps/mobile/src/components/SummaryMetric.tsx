import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type SummaryMetricProps = {
  label: string;
  value: string;
  valueColor?: string;
};

export default function SummaryMetric({ label, value, valueColor }: SummaryMetricProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor != null && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 10,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
});
