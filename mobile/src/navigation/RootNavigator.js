import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../services/AuthContext';
import LoginScreen from '../screens/auth/LoginScreen';
import StudentTabs from './StudentTabs';
import FacultyTabs from './FacultyTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' }}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const getDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return AdminTabs;
      case 'FACULTY':
        return FacultyTabs;
      case 'STUDENT':
      default:
        return StudentTabs;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <Stack.Screen name="Dashboard" component={getDashboard()} />
      )}
    </Stack.Navigator>
  );
}
