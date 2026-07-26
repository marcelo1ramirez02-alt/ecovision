import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function ProfileScreen() {
  const { user, profile, trainingConsent, setTrainingConsent, signOut } = useAuth();
  const { expoPushToken } = useNotifications();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🌱</Text>
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
          <Text style={styles.statNumber}>{profile?.eco_points || 0}</Text>
          <Text style={styles.statLabel}>Eco-Puntos 🌟</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={statItemStyle}>
          <Text style={styles.statNumber}>100%</Text>
          <Text style={styles.statLabel}>Impacto Verde 🍃</Text>
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
            trackColor={{ false: '#334155', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

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
  );
}

const statItemStyle = {
  flex: 1,
  alignItems: 'center' as const,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  emailText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleTagText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 11,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
  },
  statNumber: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  settingCard: {
    marginBottom: 20,
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
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  pushTokenText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  signOutBtn: {
    marginTop: 10,
    marginBottom: 40,
  },
});
