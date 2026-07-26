import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CollectionPoint } from '../../types/collectionPoint';
import { formatDistance } from '../../utils/distance';

interface PointCardProps {
  point: CollectionPoint;
  onPress?: () => void;
  onNavigate?: () => void;
}

export const PointCard: React.FC<PointCardProps> = ({ point, onPress, onNavigate }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={1}>
          📍 {point.name}
        </Text>
        {point.distance_meters !== undefined && (
          <Text style={styles.distanceText}>{formatDistance(point.distance_meters)}</Text>
        )}
      </View>

      <Text style={styles.addressText} numberOfLines={2}>
        {point.address}
      </Text>

      {point.opening_hours && (
        <Text style={styles.hoursText}>🕒 {point.opening_hours}</Text>
      )}

      {point.accepted_materials && point.accepted_materials.length > 0 && (
        <View style={styles.materialsRow}>
          {point.accepted_materials.map((mat, idx) => (
            <View
              key={mat.id || idx}
              style={[
                styles.materialBadge,
                { backgroundColor: mat.color_code || '#10B981' },
              ]}
            >
              <Text style={styles.materialBadgeText}>{mat.name || mat.code}</Text>
            </View>
          ))}
        </View>
      )}

      {onNavigate && (
        <TouchableOpacity style={styles.routeBtn} onPress={onNavigate}>
          <Text style={styles.routeBtnText}>🗺️ Ver Ruta en Mapa</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  distanceText: {
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  addressText: {
    color: '#94A3B8',
    fontSize: 13,
    marginBottom: 6,
  },
  hoursText: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: 10,
  },
  materialsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  materialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  materialBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  routeBtn: {
    marginTop: 4,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  routeBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
  },
});
