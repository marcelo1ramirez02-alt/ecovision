import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <View style={styles.titleContainer}>
          <Ionicons name="location-outline" size={18} color="#059669" style={styles.locationIcon} />
          <Text style={styles.title} numberOfLines={1}>
            {point.name}
          </Text>
        </View>
        {point.distance_meters !== undefined && (
          <Text style={styles.distanceText}>{formatDistance(point.distance_meters)}</Text>
        )}
      </View>

      <Text style={styles.addressText} numberOfLines={2}>
        {point.address}
      </Text>

      {point.opening_hours && (
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={14} color="#6B7B8D" style={styles.infoIcon} />
          <Text style={styles.hoursText}>{point.opening_hours}</Text>
        </View>
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
        <TouchableOpacity style={styles.routeBtn} onPress={onNavigate} activeOpacity={0.8}>
          <Ionicons name="navigate-outline" size={15} color="#059669" style={styles.routeIcon} />
          <Text style={styles.routeBtnText}>Ver Ruta en Mapa</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  locationIcon: {
    marginRight: 6,
  },
  title: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  distanceText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 12,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  addressText: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 8,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 4,
  },
  hoursText: {
    color: '#6B7B8D',
    fontSize: 12,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  routeIcon: {
    marginRight: 6,
  },
  routeBtnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '600',
  },
});

