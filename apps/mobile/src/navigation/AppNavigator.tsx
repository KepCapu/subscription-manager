import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OverviewScreen from '../screens/OverviewScreen';
import CardsScreen from '../screens/CardsScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

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
        <Tab.Screen name="Cards" component={CardsScreen} />
        <Tab.Screen name="Subscriptions" component={SubscriptionsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
