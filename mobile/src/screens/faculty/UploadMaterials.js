import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { facultyAPI } from '../../services/api';

export default function UploadMaterials() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
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

  const handleUpload = async () => {
    if (!selectedCourse || !title.trim() || !fileUrl.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await facultyAPI.uploadMaterial({
        title: title.trim(),
        description: description.trim(),
        fileUrl: fileUrl.trim(),
        fileType: fileUrl.split('.').pop() || 'pdf',
        courseId: selectedCourse.id
      });

      Alert.alert('Success', 'Study material uploaded successfully!');
      setTitle('');
      setDescription('');
      setFileUrl('');
      setSelectedCourse(null);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upload Study Material</Text>
        <Text style={styles.headerSubtitle}>Share resources with your students</Text>
      </View>

      {/* Course Selection */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Select Course *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
          {courses.map((course, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.courseChip, selectedCourse?.id === course.id && styles.courseChipActive]}
              onPress={() => setSelectedCourse(course)}
            >
              <Text style={[styles.courseChipText, selectedCourse?.id === course.id && styles.courseChipTextActive]}>
                {course.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Title */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Chapter 5 - Lecture Notes"
          placeholderTextColor="#64748B"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      {/* Description */}
      <View style={styles.formSection}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief description of the material..."
          placeholderTextColor="#64748B"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* File URL */}
      <View style={styles.formSection}>
        <Text style={styles.label}>File URL *</Text>
        <TextInput
          style={styles.input}
          placeholder="https://drive.google.com/..."
          placeholderTextColor="#64748B"
          value={fileUrl}
          onChangeText={setFileUrl}
          keyboardType="url"
          autoCapitalize="none"
        />
        <Text style={styles.hint}>Paste a link to the file (Google Drive, Dropbox, etc.)</Text>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[styles.uploadButton, submitting && styles.uploadButtonDisabled]}
        onPress={handleUpload}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>Upload Material</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  header: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#F8FAFC' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4 },
  formSection: { paddingHorizontal: 16, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#CBD5E1', marginBottom: 8 },
  courseScroll: { flexDirection: 'row' },
  courseChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155', marginRight: 10,
  },
  courseChipActive: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  courseChipText: { fontSize: 13, fontWeight: '500', color: '#94A3B8' },
  courseChipTextActive: { color: '#FFFFFF' },
  input: {
    backgroundColor: '#1E293B', borderRadius: 12, padding: 14,
    fontSize: 15, color: '#F8FAFC', borderWidth: 1, borderColor: '#334155',
  },
  textArea: { height: 90, textAlignVertical: 'top' },
  hint: { fontSize: 11, color: '#64748B', marginTop: 6 },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#6366F1', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 30,
  },
  uploadButtonDisabled: { opacity: 0.6 },
  uploadButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
