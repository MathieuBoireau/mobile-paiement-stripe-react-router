import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import CheckoutScreen from './screens/CheckoutScreen';
import { AccueilScreen } from './screens/AccueilScreen';
import ScanScreen from './screens/ScanScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Accueil" component={AccueilScreen}></Stack.Screen>
        <Stack.Screen name="Scan" component={ScanScreen}></Stack.Screen>
        <Stack.Screen name="Panier" component={CheckoutScreen}></Stack.Screen>
      </Stack.Navigator>

      <StripeProvider
        publishableKey="pk_test_"
        merchantIdentifier="merchant.com.example"
      >
      </StripeProvider>
    </NavigationContainer>
  );
}
