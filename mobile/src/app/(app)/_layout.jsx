import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAlertas } from '../../contexts/alertas';
import { cores } from '../../theme';

export default function AbasLayout() {
  const { naoLidos } = useAlertas();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.marca,
        tabBarInactiveTintColor: cores.suave,
        headerStyle: { backgroundColor: cores.fundo },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', color: cores.tinta },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Indicadores',
          tabBarIcon: ({ color, size }) => <Ionicons name="speedometer-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alertas"
        options={{
          title: 'Alertas',
          tabBarBadge: naoLidos > 0 ? (naoLidos > 99 ? '99+' : naoLidos) : undefined,
          tabBarBadgeStyle: { backgroundColor: cores.ruim },
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
