import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { facultyAPI } from '../../services/api';

export default function MarkAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await facultyAPI.getMyCourses();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCourse = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const data = await facultyAPI.getCourseStudents(course.id);
      setStudents(data.students);
      // Initialize all as PRESENT
      const initial = {};
      data.students.forEach(s => { initial[s.id] = 'PRESENT'; });
      setAttendance(initial);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId];
      const next = current === 'PRESENT' ? 'ABSENT' : current === 'ABSENT' ? 'LATE' : 'PRESENT';
      return { ...prev, [studentId]: next };
    });
  };

  const submitAttendance = async () => {
    setSubmitting(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId, status
      }));

      await facultyAPI.markAttendance({
        courseId: selectedCourse.id,
        date: new Date().toISOString(),
        records
      });

      Alert.alert('Success', 'Attendance marked successfully!');
      setSelectedCourse(null);
      setStudents([]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PRESENT': return { bg: '#10B98120', color: '#10B981', icon: 'checkmark-circle' };
      case 'ABSENT': return { bg: '#EF444420', color: '#EF4444', icon: 'close-circle' };
      case 'LATE': return { bg: '#F59E0B20', color: '#F59E0B', icon: 'time' };
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // Course Selection
  if (!selectedCourse) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>Select a course to mark attendance</Text>
        </View>
        {courses.map((course, index) => (
          <TouchableOpacity key={index} style={styles.courseItem} onPress={() => selectCourse(course)}>
            <View style={styles.courseItemLeft}>
              <View style={styles.courseIcon}>
                <Ionicons name="book" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.courseItemName}>{course.name}</Text>
                <Text style={styles.courseItemCode}>{course.code} • {course._count?.enrollments || 0} students</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // Attendance Marking
  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{selectedCourse.name}</Text>
            <Text style={styles.headerSubtitle}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendText}>Tap to toggle: </Text>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendLabel}>Present</Text>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendLabel}>Absent</Text>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendLabel}>Late</Text>
        </View>

        {/* Student List */}
        {students.map((student, index) => {
          const status = attendance[student.id] || 'PRESENT';
          const style = getStatusStyle(status);
          return (
            <TouchableOpacity
              key={index}
              style={styles.studentItem}
              onPress={() => toggleStatus(student.id)}
            >
              <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                  <Text style={styles.studentId}>{student.studentId}</Text>
                </View>
              </View>
              <View style={[styles.statusButton, { backgroundColor: style.bg }]}>
                <Ionicons name={style.icon} size={20} color={style.color} />
                <Text style={[styles.statusLabel, { color: style.color }]}>{status}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={submitAttendance}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit Attendance</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backButton: { padding: 8, backgroundColor: '#1E293B', borderRadius: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  legendText: { fontSize: 12, color: '#64748B' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 10, marginRight: 4 },
  legendLabel: { fontSize: 11, color: '#94A3B8' },
  courseItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#334155',
  },
  courseItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#6366F120', justifyContent: 'center', alignItems: 'center' },
  courseItemName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  courseItemCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  studentItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 10, padding: 14,
    marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentAvatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#334155',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  studentName: { fontSize: 14, fontWeight: '500', color: '#F8FAFC' },
  studentId: { fontSize: 11, color: '#64748B', marginTop: 1 },
  statusButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusLabel: { fontSize: 11, fontWeight: '600' },
  submitContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6366F1', borderRadius: 12, padding: 16,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
