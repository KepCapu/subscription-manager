import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import EmailAccountsScreen from '../screens/EmailAccountsScreen';
import EmailAccountDetailsScreen from '../screens/EmailAccountDetailsScreen';
import { colors } from '../theme/colors';
import { EmailAccountsStackParamList } from './types';

const Stack = createNativeStackNavigator<EmailAccountsStackParamList>();

export default function EmailAccountsStack() {
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
        name="EmailAccountsList"
        component={EmailAccountsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailAccountDetails"
        component={EmailAccountDetailsScreen}
        options={{ title: 'Email account' }}
      />
    </Stack.Navigator>
  );
}
