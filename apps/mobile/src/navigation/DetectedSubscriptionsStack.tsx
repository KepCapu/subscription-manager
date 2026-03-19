import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DetectedSubscriptionsScreen from '../screens/DetectedSubscriptionsScreen';
import DetectedSubscriptionDetailsScreen from '../screens/DetectedSubscriptionDetailsScreen';
import { colors } from '../theme/colors';
import { DetectedSubscriptionsStackParamList } from './types';

const Stack = createNativeStackNavigator<DetectedSubscriptionsStackParamList>();

export default function DetectedSubscriptionsStack() {
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
        name="DetectedSubscriptionsList"
        component={DetectedSubscriptionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetectedSubscriptionDetails"
        component={DetectedSubscriptionDetailsScreen}
        options={{ title: 'Detected candidate' }}
      />
    </Stack.Navigator>
  );
}
