import { supabase } from './supabase';
import { CollectionPoint, NearbyQueryParams } from '../types/collectionPoint';

export const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const CONTAINER_MATERIALS: { key: string; altKey: string; code: string; name: string; color_code: string; aliases: string[] }[] = [
  { key: 'contenedor_papel', altKey: 'Contenedor_Papel', code: 'papel', name: 'Papel', color_code: '#F59E0B', aliases: ['papel', 'paper'] },
  { key: 'contenedor_carton', altKey: 'Contenedor_Carton', code: 'carton', name: 'Cartón', color_code: '#D97706', aliases: ['carton', 'cartón', 'cardboard'] },
  { key: 'contenedor_plastico', altKey: 'Contenedor_Plastico', code: 'plastico', name: 'Plástico', color_code: '#10B981', aliases: ['plastico', 'plástico', 'plastic', 'plastic_pet', 'pet'] },
  { key: 'contenedor_vidrio', altKey: 'Contenedor_Vidrio', code: 'vidrio', name: 'Vidrio', color_code: '#3B82F6', aliases: ['vidrio', 'glass'] },
  { key: 'contenedor_metales', altKey: 'Contenedor_Metales', code: 'metales', name: 'Metales', color_code: '#EC4899', aliases: ['metales', 'metal', 'aluminum', 'aluminio'] },
  { key: 'contenedor_aceite', altKey: 'Contenedor_Aceite', code: 'aceite', name: 'Aceite', color_code: '#8B5CF6', aliases: ['aceite', 'oil'] },
  { key: 'contenedor_pilas_y_accesorios', altKey: 'Contenedor_Pilas_y_Accesorios', code: 'pilas', name: 'Pilas', color_code: '#EF4444', aliases: ['pilas', 'batteries', 'battery'] },
  { key: 'contenedor_electrodomesticos_medianos', altKey: 'Contenedor_electrodomesticos_medianos', code: 'electrodomesticos', name: 'Electrodomésticos', color_code: '#6366F1', aliases: ['electrodomesticos', 'electronic', 'appliances'] },
  { key: 'contenedor_medicinas', altKey: 'Contenedor_medicinas', code: 'medicinas', name: 'Medicinas', color_code: '#14B8A6', aliases: ['medicinas', 'medical', 'medicine'] },
];

const isTrueValue = (val: any): boolean => {
  if (val === true || val === 1) return true;
  if (typeof val === 'string') {
    const lower = val.trim().toLowerCase();
    return lower === 'true' || lower === 't' || lower === '1';
  }
  return false;
};

const deriveMaterialsFromPoint = (cp: any): any[] => {
  const materialsFromJunction = (cp.point_materials || [])
    .map((pm: any) => pm.materials)
    .filter((m: any) => m && m.code);

  if (materialsFromJunction.length > 0) {
    return materialsFromJunction;
  }

  const derived: any[] = [];
  CONTAINER_MATERIALS.forEach((mat) => {
    if (isTrueValue(cp[mat.key]) || isTrueValue(cp[mat.altKey])) {
      derived.push({
        id: mat.code,
        code: mat.code,
        name: mat.name,
        color_code: mat.color_code,
        aliases: mat.aliases,
      });
    }
  });

  if (derived.length === 0) {
    derived.push({
      id: 'general',
      code: 'general',
      name: 'Punto de Acopio',
      color_code: '#10B981',
      aliases: ['general', 'todos'],
    });
  }

  return derived;
};

/**
 * Fetch database collection points synchronized with Supabase
 */
export const getNearbyCollectionPoints = async (
  params: NearbyQueryParams
): Promise<CollectionPoint[]> => {
  const { latitude, longitude, radiusMeters = 50000, materialFilter = null } = params;

  const { data: tableData, error: tableError } = await supabase
    .from('collection_points')
    .select('*');

  console.log('[Ecovision Supabase] Puntos de acopio obtenidos:', tableData?.length ?? 0, tableData, tableError);

  if (tableError) {
    console.error('Direct table query collection_points error:', tableError);
    throw new Error(`Failed to fetch collection points from database: ${tableError.message}`);
  }

  let formattedPoints: CollectionPoint[] = (tableData || [])
    .filter((cp: any) => {
      const lat = Number(cp.latitude);
      const lng = Number(cp.longitude);
      return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
    })
    .map((cp: any) => {
      const lat = Number(cp.latitude);
      const lng = Number(cp.longitude);
      const distance_meters =
        latitude && longitude
          ? getDistanceMeters(latitude, longitude, lat, lng)
          : undefined;

      const accepted_materials = deriveMaterialsFromPoint(cp);

      return {
        id: String(cp.id),
        name: cp.name || 'Punto de Acopio',
        address: cp.address || '',
        latitude: lat,
        longitude: lng,
        contact_phone: cp.contact_phone || null,
        opening_hours: cp.opening_hours || null,
        distance_meters,
        accepted_materials,
      };
    });

  // Filter by material if specified
  if (materialFilter) {
    const filterLower = materialFilter.toLowerCase().trim();
    formattedPoints = formattedPoints.filter((point) =>
      (point.accepted_materials || []).some((mat) => {
        const codeLower = mat.code?.toLowerCase();
        const nameLower = mat.name?.toLowerCase();
        const aliases = (mat as any).aliases || [];
        return (
          codeLower === filterLower ||
          nameLower === filterLower ||
          aliases.includes(filterLower) ||
          (nameLower && filterLower.includes(nameLower)) ||
          (codeLower && filterLower.includes(codeLower))
        );
      })
    );
  }

  // Sort by distance if available
  formattedPoints.sort((a, b) => (a.distance_meters || 0) - (b.distance_meters || 0));

  return formattedPoints;
};

/**
 * Admin action to create/update points via manage-collection-points Edge Function
 */
export const manageCollectionPointAdmin = async (
  action: 'create' | 'update' | 'delete',
  payload: { pointData?: Partial<CollectionPoint>; pointId?: string; materialIds?: string[] }
) => {
  const { data, error } = await supabase.functions.invoke('manage-collection-points', {
    body: {
      action,
      ...payload,
    },
  });

  if (error) {
    throw new Error(`Admin manage point failed: ${error.message}`);
  }

  return data;
};

