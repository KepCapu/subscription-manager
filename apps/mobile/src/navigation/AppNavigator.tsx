import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../screens/OverviewScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CardsStack from './CardsStack';
import SubscriptionStack from './SubscriptionStack';
import DetectedSubscriptionsStack from './DetectedSubscriptionsStack';
import EmailAccountsStack from './EmailAccountsStack';
import { colors } from '../theme/colors';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            backgroundColor: colors.card,
            borderTopColor: colors.border,
          },
        }}
      >
        <Tab.Screen name="Overview" component={OverviewScreen} />
        <Tab.Screen name="Cards" component={CardsStack} />
        <Tab.Screen name="Subscriptions" component={SubscriptionStack} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="EmailAccounts" component={EmailAccountsStack} />
        <Tab.Screen name="DetectedSubscriptions" component={DetectedSubscriptionsStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
