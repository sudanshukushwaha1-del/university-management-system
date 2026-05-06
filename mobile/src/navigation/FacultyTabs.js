import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import FacultyDashboard from '../screens/faculty/FacultyDashboard';
import MarkAttendance from '../screens/faculty/MarkAttendance';
import UploadMaterials from '../screens/faculty/UploadMaterials';
import EnterGrades from '../screens/faculty/EnterGrades';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="FacultyHome" component={FacultyDashboard} options={{ title: 'Dashboard' }} />
    </Stack.Navigator>
  );
}

export default function FacultyTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Attendance': iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline'; break;
            case 'Materials': iconName = focused ? 'cloud-upload' : 'cloud-upload-outline'; break;
            case 'Grades': iconName = focused ? 'create' : 'create-outline'; break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: { backgroundColor: '#1E293B', borderTopColor: '#334155', paddingBottom: 5, height: 60 },
        headerStyle: { backgroundColor: '#1E293B' },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: { fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="Attendance" component={MarkAttendance} />
      <Tab.Screen name="Materials" component={UploadMaterials} />
      <Tab.Screen name="Grades" component={EnterGrades} />
    </Tab.Navigator>
  );
}
