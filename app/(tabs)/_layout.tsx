import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const { user } = useAuth();

  const tabBarActiveTintColor = '#3B82F6';
  const tabBarInactiveTintColor = '#9CA3AF';

  const isAdmin = user?.role === 'admin';
  const isStation = ['police_station', 'fire_station', 'ambulance'].includes(user?.role ?? '');

  const commonScreenOptions = {
    tabBarActiveTintColor,
    tabBarInactiveTintColor,
    headerShown: false,
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
    },
  };

  const Icon = ({ name, color }: { name: string; color?: string }) => (
    <Ionicons name={name as any} size={24} color={color} />
  );

  if (isAdmin) {
    return (
      <Tabs screenOptions={commonScreenOptions}>
        <Tabs.Screen
          name="home"
          options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
        />
        <Tabs.Screen
          name="incidents"
          options={{ title: 'Incidents', tabBarIcon: ({ color }) => <Icon name="list" color={color} /> }}
        />
        <Tabs.Screen
          name="map"
          options={{ title: 'Map', tabBarIcon: ({ color }) => <Icon name="map" color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="person" color={color} /> }}
        />
      </Tabs>
    );
  }

  if (isStation) {
    return (
      <Tabs screenOptions={commonScreenOptions}>
        <Tabs.Screen
          name="home"
          options={{ title: 'Incidents', tabBarIcon: ({ color }) => <Icon name="list" color={color} /> }}
        />
        <Tabs.Screen
          name="map"
          options={{ title: 'Map', tabBarIcon: ({ color }) => <Icon name="map" color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="person" color={color} /> }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs screenOptions={commonScreenOptions}>
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <Icon name="map" color={color} /> }}
      />
      <Tabs.Screen
        name="incidents"
        options={{ title: 'My Incidents', tabBarIcon: ({ color }) => <Icon name="list" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="person" color={color} /> }}
      />
    </Tabs>
  );
}
