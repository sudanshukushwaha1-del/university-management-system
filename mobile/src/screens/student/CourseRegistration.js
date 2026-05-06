import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentAPI } from '../../services/api';

export default function CourseRegistration() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await studentAPI.getAvailableCourses();
      setCourses(data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (courseId, courseName) => {
    Alert.alert(
      'Confirm Registration',
      `Are you sure you want to register for "${courseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Register',
          onPress: async () => {
            setRegistering(courseId);
            try {
              await studentAPI.registerCourse(courseId);
              Alert.alert('Success', 'Successfully registered for the course!');
              fetchCourses(); // Refresh list
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setRegistering(null);
            }
          }
        }
      ]
    );
  };

  const CourseCard = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <View style={styles.codeContainer}>
          <Text style={styles.courseCode}>{item.code}</Text>
        </View>
        <View style={styles.creditsBadge}>
          <Text style={styles.creditsText}>{item.credits} Cr</Text>
        </View>
      </View>
      <Text style={styles.courseName}>{item.name}</Text>
      <Text style={styles.courseDept}>{item.department?.name}</Text>
      {item.description && (
        <Text style={styles.courseDesc} numberOfLines={2}>{item.description}</Text>
      )}
      <View style={styles.courseFooter}>
        <View style={styles.seatsInfo}>
          <Ionicons name="people-outline" size={14} color="#64748B" />
          <Text style={styles.seatsText}>{item.availableSeats} seats available</Text>
        </View>
        <TouchableOpacity
          style={[styles.registerButton, registering === item.id && styles.registerButtonDisabled]}
          onPress={() => handleRegister(item.id, item.name)}
          disabled={registering === item.id || item.availableSeats <= 0}
        >
          {registering === item.id ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              {item.availableSeats <= 0 ? 'Full' : 'Register'}
            </Text>
          )}
        </TouchableOpacity>
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
      refreshControl={<RefreshControl refreshing={false} onRefresh={fetchCourses} tintColor="#6366F1" />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Courses</Text>
        <Text style={styles.headerSubtitle}>{courses.length} courses available for registration</Text>
      </View>

      {courses.map((item, index) => (
        <CourseCard key={index} item={item} />
      ))}

      {courses.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="book-outline" size={48} color="#334155" />
          <Text style={styles.emptyText}>No courses available for registration</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { padding: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  courseCard: {
    backgroundColor: '#1E293B', borderRadius: 14, padding: 16,
    marginHorizontal: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  courseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  codeContainer: { backgroundColor: '#6366F120', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  courseCode: { fontSize: 12, fontWeight: '600', color: '#6366F1' },
  creditsBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  creditsText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  courseName: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 4 },
  courseDept: { fontSize: 12, color: '#64748B', marginBottom: 6 },
  courseDesc: { fontSize: 13, color: '#94A3B8', lineHeight: 18, marginBottom: 12 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155' },
  seatsInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  seatsText: { fontSize: 12, color: '#64748B' },
  registerButton: { backgroundColor: '#6366F1', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  registerButtonDisabled: { opacity: 0.6 },
  registerButtonText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 14, color: '#64748B', marginTop: 12 },
});
