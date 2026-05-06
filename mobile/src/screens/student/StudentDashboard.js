import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { studentAPI } from '../../services/api';

export default function StudentDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await studentAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const StatCard = ({ icon, title, value, color, subtitle }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const QuickAction = ({ icon, title, onPress, color }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#64748B" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
    >
      {/* Welcome Header */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Good {new Date().getHours() < 12 ? 'Morning' : 'Evening'},</Text>
          <Text style={styles.userName}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
          <Text style={styles.userRole}>{user?.profile?.studentId} • {user?.profile?.department?.name || 'Student'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="pie-chart"
          title="Attendance"
          value={`${stats?.attendancePercentage || 0}%`}
          color="#10B981"
          subtitle={`${stats?.presentClasses || 0}/${stats?.totalClasses || 0} classes`}
        />
        <StatCard
          icon="trophy"
          title="CGPA"
          value={stats?.cgpa || 'N/A'}
          color="#F59E0B"
        />
        <StatCard
          icon="book"
          title="Courses"
          value={stats?.enrolledCourses || 0}
          color="#6366F1"
          subtitle="Enrolled"
        />
        <StatCard
          icon="cash"
          title="Pending Fees"
          value={stats?.pendingFees || 0}
          color="#EF4444"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <QuickAction
            icon="add-circle-outline"
            title="Register for Courses"
            color="#6366F1"
            onPress={() => navigation.navigate('CourseRegistration')}
          />
          <QuickAction
            icon="document-text-outline"
            title="View Study Materials"
            color="#10B981"
            onPress={() => {}}
          />
          <QuickAction
            icon="receipt-outline"
            title="Fee Payment Status"
            color="#F59E0B"
            onPress={() => {}}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    width: '47%',
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 3,
  },
  statHeader: {
    marginBottom: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statTitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 14,
  },
  quickActionsContainer: {
    gap: 10,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  quickActionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#F8FAFC',
  },
});
