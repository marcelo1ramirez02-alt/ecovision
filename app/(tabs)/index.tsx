import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { useRecognition } from '../../hooks/useRecognition';
import { Card } from '../../components/ui/Card';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { history, loadHistory } = useRecognition();
  const router = useRouter();

  useEffect(() => {
    loadHistory();
  }, []);

  const points = profile?.eco_points || 0;
  const pointsToNextLevel = 500;
  const progress = Math.min(points / pointsToNextLevel, 1);
  const nextLevelPoints = Math.max(pointsToNextLevel - points, 0);

  // User Initials for Avatar
  const getInitials = (name?: string) => {
    if (!name) return 'R';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Recent scans (take up to 3 items)
  const recentScans = history.slice(0, 3);

  // Dynamic single eco-tip based on day/points
  const ecoTip = {
    title: "Lava y seca los envases",
    body: "Los recipientes limpios y secos evitan que se contaminen lotes completos de materiales reciclables."
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingText}>Hola, {profile?.full_name?.split(' ')[0] || 'Reciclador'}</Text>
            <Text style={styles.subGreeting}>Tu impacto ecológico cuenta</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>{getInitials(profile?.full_name)}</Text>
          </TouchableOpacity>
        </View>

        {/* Gamified Points Card */}
        <Card style={styles.pointsCard}>
          <View style={styles.pointsHeader}>
            <View style={styles.levelBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#059669" style={styles.levelBadgeIcon} />
              <Text style={styles.levelBadgeText}>Reciclador Activo</Text>
            </View>
          </View>

          <Text style={styles.pointsValue}>{points}</Text>
          <Text style={styles.pointsLabel}>Eco-Puntos Totales</Text>

          {/* Level Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progreso al Siguiente Nivel</Text>
              <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            {nextLevelPoints > 0 ? (
              <Text style={styles.progressSubtext}>Te faltan {nextLevelPoints} puntos para subir de nivel</Text>
            ) : (
              <Text style={styles.progressSubtext}>¡Has alcanzado la meta del nivel!</Text>
            )}
          </View>
        </Card>

        {/* Main Action Buttons */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/camera')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconWrapper}>
              <Ionicons name="camera-outline" size={24} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>Escanear Residuo</Text>
            <Text style={styles.actionDesc}>Identifica con Gemini AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/map')}
            activeOpacity={0.85}
          >
            <View style={styles.actionIconWrapper}>
              <Ionicons name="map-outline" size={24} color="#059669" />
            </View>
            <Text style={styles.actionTitle}>Mapa de Acopio</Text>
            <Text style={styles.actionDesc}>Centros cercanos</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')} activeOpacity={0.7}>
              <Text style={styles.seeAllLink}>Ver todo</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentScans.length > 0 ? (
          <View style={styles.recentList}>
            {recentScans.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/recognition/${item.id}`)}
                activeOpacity={0.8}
              >
                <Card style={styles.recentCard}>
                  <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName} numberOfLines={1}>{item.material_name}</Text>
                    <Text style={styles.recentDate}>
                      {new Date(item.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </Text>
                  </View>
                  <View style={styles.recentBadge}>
                    <Text style={styles.recentBadgeText}>+{item.eco_points_earned}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyRecentCard}>
            <Ionicons name="leaf-outline" size={24} color="#94A3B8" style={styles.emptyRecentIcon} />
            <Text style={styles.emptyRecentText}>Aún no tienes registros de reciclaje</Text>
          </Card>
        )}

        {/* Eco Tip of the Day */}
        <Text style={styles.sectionTitle}>Consejo del Día</Text>
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={18} color="#059669" style={styles.tipIcon} />
            <Text style={styles.tipTitle}>{ecoTip.title}</Text>
          </View>
          <Text style={styles.tipBody}>{ecoTip.body}</Text>
        </Card>
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
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greetingText: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subGreeting: {
    color: '#475569',
    fontSize: 14,
    marginTop: 2,
  },
  profileBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  avatarText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  pointsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  pointsHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  levelBadgeIcon: {
    marginRight: 4,
  },
  levelBadgeText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '700',
  },
  pointsValue: {
    color: '#0F172A',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  pointsLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercentage: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressSubtext: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 12,
    marginTop: 8,
  },
  seeAllLink: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  actionDesc: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  recentList: {
    gap: 10,
    marginBottom: 24,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  recentDate: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  recentBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentBadgeText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyRecentCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    marginBottom: 24,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
    elevation: 0,
  },
  emptyRecentIcon: {
    marginBottom: 8,
  },
  emptyRecentText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  tipCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipIcon: {
    marginRight: 8,
  },
  tipTitle: {
    color: '#047857',
    fontSize: 15,
    fontWeight: '700',
  },
  tipBody: {
    color: '#065F46',
    fontSize: 13,
    lineHeight: 18,
  },
});

