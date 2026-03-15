import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function SubscriptionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Subscriptions</Text>
        <Text style={styles.subtitle}>All subscriptions will be listed here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
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
  },
});
