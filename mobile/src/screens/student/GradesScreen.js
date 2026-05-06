import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentAPI } from '../../services/api';

export default function GradesScreen() {
  const [grades, setGrades] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const data = await studentAPI.getGrades();
      setGrades(data.grades);
      setCgpa(data.cgpa);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return '#64748B';
    if (grade.startsWith('A')) return '#10B981';
    if (grade.startsWith('B')) return '#6366F1';
    if (grade.startsWith('C')) return '#F59E0B';
    return '#EF4444';
  };

  const GradeCard = ({ item }) => (
    <View style={styles.gradeCard}>
      <View style={styles.gradeHeader}>
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{item.course?.name}</Text>
          <Text style={styles.courseCode}>{item.course?.code} • {item.course?.credits} Credits</Text>
        </View>
        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(item.grade) + '20' }]}>
          <Text style={[styles.gradeText, { color: getGradeColor(item.grade) }]}>
            {item.grade || 'N/A'}
          </Text>
        </View>
      </View>

      <View style={styles.marksGrid}>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Midterm</Text>
          <Text style={styles.markValue}>{item.midterm ?? '-'}</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Final</Text>
          <Text style={styles.markValue}>{item.final ?? '-'}</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Assignment</Text>
          <Text style={styles.markValue}>{item.assignment ?? '-'}</Text>
        </View>
        <View style={styles.markItem}>
          <Text style={styles.markLabel}>Total</Text>
          <Text style={[styles.markValue, styles.markTotal]}>{item.totalMarks ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.gpaRow}>
        <Text style={styles.gpaLabel}>GPA Points</Text>
        <Text style={styles.gpaValue}>{item.gpa?.toFixed(1) ?? 'N/A'}</Text>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchGrades(); }} tintColor="#6366F1" />}
    >
      {/* CGPA Card */}
      <View style={styles.cgpaCard}>
        <View style={styles.cgpaContent}>
          <Ionicons name="trophy" size={32} color="#F59E0B" />
          <View style={styles.cgpaInfo}>
            <Text style={styles.cgpaLabel}>Cumulative GPA</Text>
            <Text style={styles.cgpaValue}>{cgpa || 'N/A'}</Text>
          </View>
        </View>
        <Text style={styles.cgpaSubtext}>{grades.length} course(s) graded</Text>
      </View>

      {/* Grades List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Course Grades</Text>
        {grades.map((item, index) => (
          <GradeCard key={index} item={item} />
        ))}
        {grades.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color="#334155" />
            <Text style={styles.emptyText}>No grades available yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  cgpaCard: {
    backgroundColor: '#1E293B', borderRadius: 16, padding: 20, margin: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  cgpaContent: { flexDirection: 'row', alignItems: 'center' },
  cgpaInfo: { marginLeft: 16 },
  cgpaLabel: { fontSize: 13, color: '#94A3B8' },
  cgpaValue: { fontSize: 32, fontWeight: '700', color: '#F8FAFC' },
  cgpaSubtext: { fontSize: 12, color: '#64748B', marginTop: 10 },
  section: { padding: 16, paddingTop: 0 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: '#F8FAFC', marginBottom: 14 },
  gradeCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#334155',
  },
  gradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  courseInfo: { flex: 1, marginRight: 12 },
  courseName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  courseCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  gradeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  gradeText: { fontSize: 16, fontWeight: '700' },
  marksGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  markItem: { alignItems: 'center' },
  markLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  markValue: { fontSize: 16, fontWeight: '600', color: '#CBD5E1' },
  markTotal: { color: '#F8FAFC' },
  gpaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155',
  },
  gpaLabel: { fontSize: 13, color: '#94A3B8' },
  gpaValue: { fontSize: 15, fontWeight: '600', color: '#6366F1' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 12 },
});
