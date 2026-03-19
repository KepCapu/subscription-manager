import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { fetchCards } from '../api/cards';
import { createSubscription } from '../api/subscriptions';
import { Card } from '../types/card';

function createSubscriptionId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return 'sub-' + slug + '-' + Date.now().toString().slice(-6);
}

export default function AddSubscriptionScreen() {
  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCards() {
      try {
        setLoadingCards(true);
        setError(null);

        const items = await fetchCards();

        if (!isMounted) {
          return;
        }

        setCards(items);

        if (items.length > 0) {
          setSelectedCardId(items[0].id);
        }
      } catch (err) {
        console.error('Cards load error:', err);

        if (isMounted) {
          setError('Could not load cards');
        }
      } finally {
        if (isMounted) {
          setLoadingCards(false);
        }
      }
    }

    loadCards();

    return () => {
      isMounted = false;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      monthlyPrice.trim().length > 0 &&
      selectedCardId !== null &&
      !loadingCards &&
      !submitting
    );
  }, [loadingCards, monthlyPrice, name, selectedCardId, submitting]);

  async function handleSave() {
    const parsedPrice = Number(monthlyPrice.replace(',', '.'));

    if (!name.trim()) {
      Alert.alert('Validation', 'Enter subscription name.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      Alert.alert('Validation', 'Enter a valid monthly price.');
      return;
    }

    if (!selectedCardId) {
      Alert.alert('Validation', 'Select a card.');
      return;
    }

    if (renewalDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(renewalDate.trim())) {
      Alert.alert('Validation', 'Renewal date must be in YYYY-MM-DD format.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await createSubscription({
        id: createSubscriptionId(name),
        name: name.trim(),
        monthlyPrice: parsedPrice,
        cardId: selectedCardId,
        status: 'active',
        renewalDate: renewalDate.trim() ? renewalDate.trim() : null,
      });

      Alert.alert('Success', 'Subscription created.');
      setName('');
      setMonthlyPrice('');
      setRenewalDate('');
    } catch (err) {
      console.error('Create subscription error:', err);
      setError('Could not create subscription');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Add subscription</Text>
        <Text style={styles.subtitle}>Create a new subscription linked to a card.</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Netflix"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          <Text style={styles.label}>Monthly price</Text>
          <TextInput
            value={monthlyPrice}
            onChangeText={setMonthlyPrice}
            placeholder="12.99"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <Text style={styles.label}>Renewal date</Text>
          <TextInput
            value={renewalDate}
            onChangeText={setRenewalDate}
            placeholder="2026-03-28"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.label}>Card</Text>

          {loadingCards ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.infoText}>Loading cards...</Text>
            </View>
          ) : cards.length === 0 ? (
            <Text style={styles.errorText}>No cards available.</Text>
          ) : (
            <View style={styles.cardsList}>
              {cards.map((card) => {
                const selected = card.id === selectedCardId;

                return (
                  <Pressable
                    key={card.id}
                    onPress={() => setSelectedCardId(card.id)}
                    style={({ pressed }) => [
                      styles.cardOption,
                      selected && styles.cardOptionSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={styles.cardOptionTitle}>{card.name}</Text>
                    <Text style={styles.cardOptionText}>ending {card.last4}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            onPress={handleSave}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.saveButton,
              !canSubmit && styles.saveButtonDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
          >
            <Text style={styles.saveButtonText}>
              {submitting ? 'Saving...' : 'Save subscription'}
            </Text>
          </Pressable>
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
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 20,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  cardsList: {
    gap: 10,
    marginTop: 4,
  },
  cardOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.background,
  },
  cardOptionSelected: {
    borderColor: colors.text,
  },
  cardOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardOptionText: {
    fontSize: 13,
    color: colors.muted,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.text,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.muted,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 12,
  },
  pressed: {
    opacity: 0.8,
  },
});
