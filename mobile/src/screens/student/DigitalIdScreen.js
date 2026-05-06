import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../services/AuthContext';

export default function DigitalIdScreen() {
  const { user } = useAuth();
  const [idData, setIdData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDigitalId();
  }, []);

  const fetchDigitalId = async () => {
    try {
      const data = await studentAPI.getDigitalId();
      setIdData(data.digitalId);
    } catch (error) {
      console.error('Error fetching digital ID:', error);
      // Fallback to local user data
      setIdData({
        studentId: user?.profile?.studentId || 'N/A',
        firstName: user?.profile?.firstName || '',
        lastName: user?.profile?.lastName || '',
        email: user?.email || '',
        department: user?.profile?.department?.name || 'Computer Science',
        departmentCode: user?.profile?.department?.code || 'CS',
        validUntil: new Date(new Date().getFullYear() + 1, 5, 30).toISOString(),
      });
    } finally {
      setLoading(false);
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
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.universityInfo}>
            <Ionicons name="school" size={28} color="#6366F1" />
            <View style={styles.universityText}>
              <Text style={styles.universityName}>University of Technology</Text>
              <Text style={styles.universitySubtext}>Student Identity Card</Text>
            </View>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color="#6366F1" />
            </View>
          </View>

          {/* Student Info */}
          <View style={styles.infoSection}>
            <Text style={styles.studentName}>
              {idData?.firstName} {idData?.lastName}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student ID</Text>
              <Text style={styles.infoValue}>{idData?.studentId}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{idData?.department}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{idData?.email}</Text>
            </View>

            {idData?.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{idData.phone}</Text>
              </View>
            )}
          </View>
        </View>

        {/* QR Code Placeholder */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code" size={64} color="#6366F1" />
          </View>
          <Text style={styles.qrText}>Scan for verification</Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.validityInfo}>
            <Ionicons name="shield-checkmark" size={14} color="#10B981" />
            <Text style={styles.validityText}>
              Valid until: {idData?.validUntil ? new Date(idData.validUntil).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        This digital ID card is for identification purposes within the university campus.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  universityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityText: { marginLeft: 12 },
  universityName: { fontSize: 16, fontWeight: '700', color: '#F8FAFC' },
  universitySubtext: { fontSize: 11, color: '#64748B', marginTop: 2 },
  cardBody: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#6366F120', justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#6366F1',
  },
  infoSection: { gap: 10 },
  studentName: {
    fontSize: 20, fontWeight: '700', color: '#F8FAFC',
    textAlign: 'center', marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155',
  },
  infoLabel: { fontSize: 13, color: '#64748B' },
  infoValue: { fontSize: 13, fontWeight: '500', color: '#F8FAFC' },
  qrSection: { alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#334155' },
  qrPlaceholder: {
    width: 100, height: 100, backgroundColor: '#F8FAFC',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
  },
  qrText: { fontSize: 11, color: '#64748B', marginTop: 8 },
  cardFooter: {
    backgroundColor: '#0F172A', padding: 12, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#334155',
  },
  validityInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  validityText: { fontSize: 12, color: '#94A3B8' },
  disclaimer: {
    fontSize: 11, color: '#475569', textAlign: 'center',
    marginTop: 16, paddingHorizontal: 20,
  },
});
