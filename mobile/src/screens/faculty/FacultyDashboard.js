import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../services/AuthContext';
import { facultyAPI } from '../../services/api';

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, coursesData] = await Promise.all([
        facultyAPI.getStats(),
        facultyAPI.getMyCourses()
      ]);
      setStats(statsData.stats);
      setCourses(coursesData.courses);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#6366F1" />}
    >
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>Prof. {user?.profile?.firstName} {user?.profile?.lastName}</Text>
          <Text style={styles.userRole}>{user?.profile?.department?.name || 'Faculty'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: '#6366F1' }]}>
          <Ionicons name="book" size={20} color="#6366F1" />
          <Text style={styles.statValue}>{stats?.coursesCount || 0}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
          <Ionicons name="people" size={20} color="#10B981" />
          <Text style={styles.statValue}>{stats?.totalStudents || 0}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: '#F59E0B' }]}>
          <Ionicons name="alert-circle" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{stats?.pendingAttendance || 0}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* My Courses */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Courses</Text>
        {courses.map((course, index) => (
          <View key={index} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseCodeBadge}>
                <Text style={styles.courseCodeText}>{course.code}</Text>
              </View>
              <Text style={styles.courseStudents}>{course._count?.enrollments || 0} students</Text>
            </View>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.courseDept}>{course.department?.name} • {course.credits} Credits</Text>
          </View>
        ))}
        {courses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={40} color="#334155" />
            <Text style={styles.emptyText}>No courses assigned</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  welcomeSection: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingTop: 10,
  },
  greeting: { fontSize: 14, color: '#94A3B8' },
  userName: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginTop: 2 },
  userRole: { fontSize: 13, color: '#64748B', marginTop: 4 },
  logoutButton: { padding: 10, backgroundColor: '#1E293B', borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#1E293B', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: '#334155', borderLeftWidth: 3,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#F8FAFC', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  section: { padding: 16, paddingTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#F8FAFC', marginBottom: 14 },
  courseCard: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: '#334155',
  },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  courseCodeBadge: { backgroundColor: '#6366F120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  courseCodeText: { fontSize: 12, fontWeight: '600', color: '#6366F1' },
  courseStudents: { fontSize: 12, color: '#64748B' },
  courseName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  courseDept: { fontSize: 12, color: '#64748B', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 12 },
});
