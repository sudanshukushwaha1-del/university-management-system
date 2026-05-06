import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import StudentDashboard from '../screens/student/StudentDashboard';
import AttendanceScreen from '../screens/student/AttendanceScreen';
import GradesScreen from '../screens/student/GradesScreen';
import CourseRegistration from '../screens/student/CourseRegistration';
import DigitalIdScreen from '../screens/student/DigitalIdScreen';

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
      <Stack.Screen name="StudentHome" component={StudentDashboard} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="CourseRegistration" component={CourseRegistration} options={{ title: 'Register Courses' }} />
    </Stack.Navigator>
  );
}

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
            case 'Attendance': iconName = focused ? 'calendar' : 'calendar-outline'; break;
            case 'Grades': iconName = focused ? 'school' : 'school-outline'; break;
            case 'ID Card': iconName = focused ? 'card' : 'card-outline'; break;
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
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="Grades" component={GradesScreen} />
      <Tab.Screen name="ID Card" component={DigitalIdScreen} />
    </Tab.Navigator>
  );
}
