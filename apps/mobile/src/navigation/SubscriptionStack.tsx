import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import SubscriptionDetailsScreen from '../screens/SubscriptionDetailsScreen';
import AddSubscriptionScreen from '../screens/AddSubscriptionScreen';
import EditSubscriptionScreen from '../screens/EditSubscriptionScreen';
import { colors } from '../theme/colors';
import { SubscriptionStackParamList } from './types';

const Stack = createNativeStackNavigator<SubscriptionStackParamList>();

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
        name="AddSubscription"
        component={AddSubscriptionScreen}
        options={{ title: 'Add subscription' }}
      />
      <Stack.Screen
        name="EditSubscription"
        component={EditSubscriptionScreen}
        options={{ title: 'Edit subscription' }}
      />
      <Stack.Screen
        name="SubscriptionDetails"
        component={SubscriptionDetailsScreen}
        options={{ title: 'Subscription' }}
      />
    </Stack.Navigator>
  );
}
