import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function SubscriptionStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Stack.Screen
        name="SubscriptionsList"
        component={SubscriptionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetailsScreen}
        options={{ title: 'Subscription' }}
      />
    </Stack.Navigator>
  );
}
