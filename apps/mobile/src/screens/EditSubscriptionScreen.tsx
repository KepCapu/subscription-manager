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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchSubscriptionDetails, updateSubscription } from '../api/subscriptions';
import { colors } from '../theme/colors';
import { SubscriptionStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SubscriptionStackParamList, 'EditSubscription'>;

export default function EditSubscriptionScreen({ route, navigation }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [renewalDate, setRenewalDate] = useState('');
  const [status, setStatus] = useState<'active' | 'paused'>('active');
  const [cardId, setCardId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSubscription() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchSubscriptionDetails(route.params.subscriptionId);

        if (!isMounted) {
          return;
        }

        setName(data.name);
        setMonthlyPrice(data.monthlyPrice.toFixed(2));
        setRenewalDate(data.renewalDate ?? '');
        setStatus(data.status?.toLowerCase() === 'paused' ? 'paused' : 'active');
        setCardId(data.cardId);
      } catch (err) {
        console.error('Edit subscription load error:', err);

        if (isMounted) {
          setError('Could not load subscription');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [route.params.subscriptionId]);

  const canSubmit = useMemo(() => {
    return !loading && !saving && !!name.trim() && !!monthlyPrice.trim() && !!cardId;
  }, [cardId, loading, monthlyPrice, name, saving]);

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

    if (!cardId) {
      Alert.alert('Validation', 'Subscription card is missing.');
      return;
    }

    if (renewalDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(renewalDate.trim())) {
      Alert.alert('Validation', 'Renewal date must be in YYYY-MM-DD format.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateSubscription(route.params.subscriptionId, {
        name: name.trim(),
        monthlyPrice: parsedPrice,
        cardId,
        status,
        renewalDate: renewalDate.trim() ? renewalDate.trim() : null,
      });

      navigation.goBack();
    } catch (err) {
      console.error('Update subscription error:', err);
      setError('Could not update subscription');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Edit subscription</Text>
        <Text style={styles.subtitle}>Update the subscription details.</Text>

        <View style={styles.section}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.infoText}>Loading subscription...</Text>
            </View>
          ) : (
            <>
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

              <Text style={styles.label}>Status</Text>
              <View style={styles.statusRow}>
                <Pressable
                  onPress={() => setStatus('active')}
                  style={({ pressed }) => [
                    styles.statusButton,
                    status === 'active' && styles.statusButtonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.statusButtonText}>Active</Text>
                </Pressable>

                <Pressable
                  onPress={() => setStatus('paused')}
                  style={({ pressed }) => [
                    styles.statusButton,
                    status === 'paused' && styles.statusButtonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.statusButtonText}>Paused</Text>
                </Pressable>
              </View>

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
                  {saving ? 'Saving...' : 'Save changes'}
                </Text>
              </Pressable>
            </>
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
  statusRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  statusButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  statusButtonSelected: {
    borderColor: colors.text,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
