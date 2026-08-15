import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const { user, profile, trainingConsent, setTrainingConsent, signOut } = useAuth();
  const { expoPushToken } = useNotifications();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={32} color="#059669" />
          </View>
          <Text style={styles.nameText}>{profile?.full_name || 'Usuario EcoVision'}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>ROL: {(profile?.role || 'user').toUpperCase()}</Text>
          </View>
        </View>

        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={20} color="#059669" style={styles.statIcon} />
            <Text style={styles.statNumber}>{profile?.eco_points || 0}</Text>
            <Text style={styles.statLabel}>Eco-Puntos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="leaf-outline" size={20} color="#059669" style={styles.statIcon} />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Impacto Verde</Text>
          </View>
        </Card>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Configuración de Privacidad y Datos</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Consentimiento para Dataset IA</Text>
              <Text style={styles.settingDesc}>
                Permitir que tus fotos anonimizadas entrenen futuros modelos de EcoVision AI.
              </Text>
            </View>
            <Switch
              value={trainingConsent}
              onValueChange={setTrainingConsent}
              trackColor={{ false: '#E2E8F0', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Card>

        {/* Device Information */}
        <Text style={styles.sectionTitle}>Notificaciones Push</Text>
        <Card style={styles.settingCard}>
          <Text style={styles.settingTitle}>Token de Dispositivo Expo</Text>
          <Text style={styles.pushTokenText}>
            {expoPushToken ? expoPushToken : 'No registrado en este dispositivo/navegador'}
          </Text>
        </Card>

        <Button
          title="Cerrar Sesión"
          variant="danger"
          onPress={signOut}
          style={styles.signOutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  nameText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  emailText: {
    color: '#475569',
    fontSize: 14,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleTagText: {
    color: '#047857',
    fontWeight: '700',
    fontSize: 11,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 6,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  statNumber: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  settingCard: {
    marginBottom: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  settingDesc: {
    color: '#475569',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  pushTokenText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 16,
  },
  signOutBtn: {
    marginTop: 10,
    marginBottom: 40,
  },
});
