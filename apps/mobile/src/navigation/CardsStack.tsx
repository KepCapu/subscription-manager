import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CardsScreen from '../screens/CardsScreen';
import CardDetailsScreen from '../screens/CardDetailsScreen';
import { colors } from '../theme/colors';
import { CardsStackParamList } from './types';

const Stack = createNativeStackNavigator<CardsStackParamList>();

export default function CardsStack() {
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
        name="CardsList"
        component={CardsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CardDetails"
        component={CardDetailsScreen}
        options={{ title: 'Card' }}
      />
    </Stack.Navigator>
  );
}
