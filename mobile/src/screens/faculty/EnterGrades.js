import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { facultyAPI } from '../../services/api';

export default function EnterGrades() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
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
      const initial = {};
      data.students.forEach(s => {
        initial[s.id] = { midterm: '', final: '', assignment: '' };
      });
      setGrades(initial);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGrade = (studentId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const calculateTotal = (studentId) => {
    const g = grades[studentId];
    if (!g) return 0;
    const mid = parseFloat(g.midterm) || 0;
    const fin = parseFloat(g.final) || 0;
    const asn = parseFloat(g.assignment) || 0;
    return ((mid * 0.3) + (fin * 0.5) + (asn * 0.2)).toFixed(1);
  };

  const getLetterGrade = (total) => {
    if (total >= 90) return { grade: 'A+', gpa: 4.0 };
    if (total >= 85) return { grade: 'A', gpa: 4.0 };
    if (total >= 80) return { grade: 'B+', gpa: 3.5 };
    if (total >= 75) return { grade: 'B', gpa: 3.0 };
    if (total >= 70) return { grade: 'C+', gpa: 2.5 };
    if (total >= 65) return { grade: 'C', gpa: 2.0 };
    if (total >= 60) return { grade: 'D', gpa: 1.5 };
    return { grade: 'F', gpa: 0.0 };
  };

  const submitGrades = async () => {
    setSubmitting(true);
    try {
      const gradeRecords = Object.entries(grades).map(([studentId, marks]) => {
        const total = parseFloat(calculateTotal(studentId));
        const { grade, gpa } = getLetterGrade(total);
        return {
          studentId,
          midterm: parseFloat(marks.midterm) || null,
          final: parseFloat(marks.final) || null,
          assignment: parseFloat(marks.assignment) || null,
          totalMarks: total,
          grade,
          gpa
        };
      });

      await facultyAPI.enterGrades({
        courseId: selectedCourse.id,
        semester: 'SPRING_2025',
        grades: gradeRecords
      });

      Alert.alert('Success', 'Grades submitted successfully!');
      setSelectedCourse(null);
      setStudents([]);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!selectedCourse) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Enter Grades</Text>
          <Text style={styles.headerSubtitle}>Select a course to enter grades</Text>
        </View>
        {courses.map((course, index) => (
          <TouchableOpacity key={index} style={styles.courseItem} onPress={() => selectCourse(course)}>
            <View style={styles.courseItemLeft}>
              <View style={styles.courseIcon}>
                <Ionicons name="create" size={20} color="#6366F1" />
              </View>
              <View>
                <Text style={styles.courseItemName}>{course.name}</Text>
                <Text style={styles.courseItemCode}>{course.code}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color="#F8FAFC" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>{selectedCourse.name}</Text>
            <Text style={styles.headerSubtitle}>Spring 2025 • Midterm (30%) + Final (50%) + Assignment (20%)</Text>
          </View>
        </View>

        {students.map((student, index) => {
          const total = calculateTotal(student.id);
          const { grade } = getLetterGrade(parseFloat(total));
          return (
            <View key={index} style={styles.studentCard}>
              <View style={styles.studentHeader}>
                <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                <View style={styles.totalBadge}>
                  <Text style={styles.totalText}>{total} • {grade}</Text>
                </View>
              </View>
              <View style={styles.marksRow}>
                <View style={styles.markInput}>
                  <Text style={styles.markLabel}>Midterm</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0-100"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={grades[student.id]?.midterm}
                    onChangeText={(v) => updateGrade(student.id, 'midterm', v)}
                    maxLength={3}
                  />
                </View>
                <View style={styles.markInput}>
                  <Text style={styles.markLabel}>Final</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0-100"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={grades[student.id]?.final}
                    onChangeText={(v) => updateGrade(student.id, 'final', v)}
                    maxLength={3}
                  />
                </View>
                <View style={styles.markInput}>
                  <Text style={styles.markLabel}>Assignment</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0-100"
                    placeholderTextColor="#475569"
                    keyboardType="numeric"
                    value={grades[student.id]?.assignment}
                    onChangeText={(v) => updateGrade(student.id, 'assignment', v)}
                    maxLength={3}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitDisabled]}
          onPress={submitGrades}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" />
              <Text style={styles.submitText}>Submit Grades</Text>
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
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  courseItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 12, padding: 16,
    marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#334155',
  },
  courseItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  courseIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#6366F120', justifyContent: 'center', alignItems: 'center' },
  courseItemName: { fontSize: 15, fontWeight: '600', color: '#F8FAFC' },
  courseItemCode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  studentCard: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 14,
    marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#334155',
  },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  studentName: { fontSize: 14, fontWeight: '600', color: '#F8FAFC' },
  totalBadge: { backgroundColor: '#6366F120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  totalText: { fontSize: 12, fontWeight: '600', color: '#6366F1' },
  marksRow: { flexDirection: 'row', gap: 10 },
  markInput: { flex: 1 },
  markLabel: { fontSize: 11, color: '#64748B', marginBottom: 4 },
  input: {
    backgroundColor: '#0F172A', borderRadius: 8, padding: 10,
    fontSize: 14, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155', textAlign: 'center',
  },
  submitContainer: { padding: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  submitButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6366F1', borderRadius: 12, padding: 16,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
