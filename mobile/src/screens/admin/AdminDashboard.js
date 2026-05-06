import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#6366F1" />}
    >
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Admin Panel</Text>
          <Text style={styles.userName}>{user?.profile?.firstName} {user?.profile?.lastName}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
          <Ionicons name="people" size={24} color="#6366F1" />
          <Text style={styles.statValue}>{stats?.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="person" size={24} color="#10B981" />
          <Text style={styles.statValue}>{stats?.totalFaculty || 0}</Text>
          <Text style={styles.statLabel}>Faculty</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Ionicons name="book" size={24} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.totalCourses || 0}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#8B5CF6' }]}>
          <Ionicons name="business" size={24} color="#8B5CF6" />
          <Text style={styles.statValue}>{stats?.totalDepartments || 0}</Text>
          <Text style={styles.statLabel}>Departments</Text>
        </View>
      </View>

      {/* Alerts */}
      {stats?.pendingFees > 0 && (
        <View style={styles.alertCard}>
          <Ionicons name="warning" size={20} color="#F59E0B" />
          <Text style={styles.alertText}>{stats.pendingFees} students with pending/overdue fees</Text>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'person-add', label: 'Onboard User', color: '#6366F1' },
            { icon: 'book', label: 'Create Course', color: '#10B981' },
            { icon: 'business', label: 'Departments', color: '#8B5CF6' },
            { icon: 'cash', label: 'Fee Tracking', color: '#F59E0B' },
          ].map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  welcomeSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20,
  },
  greeting: { fontSize: 14, color: '#94A3B8' },
  userName: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginTop: 2 },
  logoutButton: { padding: 10, backgroundColor: '#1E293B', borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 14, gap: 10 },
  statCard: {
    width: '47%', backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#334155', borderLeftWidth: 3,
  },
  statValue: { fontSize: 28, fontWeight: '700', color: '#F8FAFC', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 2 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F59E0B10', borderRadius: 12, padding: 14,
    marginHorizontal: 16, marginTop: 16, borderWidth: 1, borderColor: '#F59E0B30',
  },
  alertText: { fontSize: 13, color: '#F59E0B', flex: 1 },
  section: { padding: 16, paddingTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#F8FAFC', marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: {
    width: '47%', backgroundColor: '#1E293B', borderRadius: 14, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: '#334155',
  },
  actionIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '500', color: '#CBD5E1' },
});
