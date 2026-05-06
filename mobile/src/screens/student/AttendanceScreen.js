import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  ActivityIndicator, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentAPI } from '../../services/api';

export default function AttendanceScreen() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const data = await studentAPI.getAttendance();
      setAttendance(data.attendance);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PRESENT': return '#10B981';
      case 'ABSENT': return '#EF4444';
      case 'LATE': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 75) return '#10B981';
    if (pct >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const CourseSummaryCard = ({ item }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <Text style={styles.courseCode}>{item.courseCode}</Text>
        </View>
        <View style={[styles.percentageBadge, { backgroundColor: getPercentageColor(item.percentage) + '20' }]}>
          <Text style={[styles.percentageText, { color: getPercentageColor(item.percentage) }]}>
            {item.percentage}%
          </Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${item.percentage}%`, backgroundColor: getPercentageColor(item.percentage) }]} />
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.statLabel}>Present: {item.present}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.statLabel}>Absent: {item.absent}</Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.statLabel}>Late: {item.late}</Text>
        </View>
      </View>
    </View>
  );

  const AttendanceRecord = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
      <View style={styles.recordInfo}>
        <Text style={styles.recordCourse}>{item.course?.name}</Text>
        <Text style={styles.recordDate}>
          {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
    </View>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAttendance(); }} tintColor="#6366F1" />}
    >
      {/* Course Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course-wise Attendance</Text>
        {summary.map((item, index) => (
          <CourseSummaryCard key={index} item={item} />
        ))}
      </View>

      {/* Recent Records */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Records</Text>
        {attendance.slice(0, 20).map((item, index) => (
          <AttendanceRecord key={index} item={item} />
        ))}
        {attendance.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No attendance records yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  section: { padding: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#F8FAFC', marginBottom: 14 },
  summaryCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  courseName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  courseCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  percentageBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  percentageText: { fontSize: 14, fontWeight: '700' },
  progressBar: { height: 6, backgroundColor: '#334155', borderRadius: 3, marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statLabel: { fontSize: 12, color: '#94A3B8' },
  recordItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', borderRadius: 10, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  statusIndicator: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  recordInfo: { flex: 1 },
  recordCourse: { fontSize: 14, fontWeight: '500', color: '#F8FAFC' },
  recordDate: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 12 },
});
