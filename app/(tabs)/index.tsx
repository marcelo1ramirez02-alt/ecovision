import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function HomeScreen() {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetingText}>¡Hola, {profile?.full_name || 'Reciclador'}! 👋</Text>
          <Text style={styles.subGreeting}>Juntos salvamos el planeta</Text>
        </View>
        <TouchableOpacity style={styles.profileBadge} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.avatarEmoji}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Points Banner Card */}
      <Card style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>TUS ECO-PUNTOS ECOVISION</Text>
        <Text style={styles.pointsValue}>{profile?.eco_points || 0} 🌟</Text>
        <Text style={styles.pointsSubtitle}>Nivel: Reciclador Activo 🌱</Text>
      </Card>

      {/* Main Action Buttons */}
      <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/camera')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📸</Text>
          <Text style={styles.actionTitle}>Escanear Residuo</Text>
          <Text style={styles.actionDesc}>Identifica con Gemini AI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/map')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🗺️</Text>
          <Text style={styles.actionTitle}>Mapa PostGIS</Text>
          <Text style={styles.actionDesc}>Puntos de acopio cercanos</Text>
        </TouchableOpacity>
      </View>

      {/* Eco Tips */}
      <Text style={styles.sectionTitle}>Consejos de Reciclaje</Text>
      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Lavar plásticos antes de desechar</Text>
        <Text style={styles.tipBody}>
          Los recipientes limpios evitan contaminación de lotes completos de plástico reciclable.
        </Text>
      </Card>

      <Card style={styles.tipCard}>
        <Text style={styles.tipTitle}>📦 Plegar cartones y cajas</Text>
        <Text style={styles.tipBody}>
          Reduce el volumen ocupado en los contenedores de recolección comunitaria.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingText: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  subGreeting: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 2,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  pointsCard: {
    backgroundColor: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    backgroundColor: '#10B981',
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 24,
  },
  pointsLabel: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
    marginVertical: 4,
  },
  pointsSubtitle: {
    color: '#E0E7FF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-start',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  actionDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  tipCard: {
    marginBottom: 12,
  },
  tipTitle: {
    color: '#34D399',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipBody: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
});
