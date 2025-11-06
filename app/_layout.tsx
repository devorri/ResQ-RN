import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthContext } from '@/contexts/AuthContext';
import { IncidentContext } from '@/contexts/IncidentContext';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="incident-details"
        options={{
          presentation: 'card',
          headerShown: true,
          title: 'Incident Details',
        }}
      />
      <Stack.Screen
        name="report"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Report Incident',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthContext>
          <IncidentContext>
            <RootLayoutNav />
          </IncidentContext>
        </AuthContext>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
