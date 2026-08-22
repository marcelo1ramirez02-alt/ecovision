import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatFileSize } from './image';

const IMAGE_PREFIX = 'ecovision_img_';
const IMAGE_INDEX_KEY = 'ecovision_img_index';

export interface CacheInfo {
  count: number;
  totalSizeBytes: number;
  formattedSize: string;
}

/**
 * Saves a captured image URI/Base64 string to local AsyncStorage associated with a recognition record ID.
 */
export const saveCachedImage = async (recordId: string, imageUri: string): Promise<void> => {
  if (!recordId || !imageUri) return;
  try {
    const key = `${IMAGE_PREFIX}${recordId}`;
    await AsyncStorage.setItem(key, imageUri);

    // Update index list
    const existingIndexRaw = await AsyncStorage.getItem(IMAGE_INDEX_KEY);
    const indexList: string[] = existingIndexRaw ? JSON.parse(existingIndexRaw) : [];
    if (!indexList.includes(recordId)) {
      indexList.push(recordId);
      await AsyncStorage.setItem(IMAGE_INDEX_KEY, JSON.stringify(indexList));
    }
  } catch (error) {
    console.error(`[imageCache] Error saving image for record ${recordId}:`, error);
  }
};

/**
 * Retrieves a locally cached image URI/Base64 string for a given recognition record ID.
 */
export const getCachedImage = async (recordId: string): Promise<string | null> => {
  if (!recordId) return null;
  try {
    const key = `${IMAGE_PREFIX}${recordId}`;
    const uri = await AsyncStorage.getItem(key);
    return uri;
  } catch (error) {
    console.error(`[imageCache] Error getting image for record ${recordId}:`, error);
    return null;
  }
};

/**
 * Calculates current image cache stats: item count, total size in bytes and formatted string.
 */
export const getCacheInfo = async (): Promise<CacheInfo> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const imageKeys = allKeys.filter((k) => k.startsWith(IMAGE_PREFIX));

    if (imageKeys.length === 0) {
      return { count: 0, totalSizeBytes: 0, formattedSize: '0 B' };
    }

    const keyValues = await AsyncStorage.multiGet(imageKeys);
    let totalBytes = 0;

    keyValues.forEach(([_key, value]) => {
      if (value) {
        // String length in UTF-8 estimate (1 char ~ 1 byte for base64 / standard ASCII URIs)
        totalBytes += value.length;
      }
    });

    return {
      count: imageKeys.length,
      totalSizeBytes: totalBytes,
      formattedSize: formatFileSize(totalBytes),
    };
  } catch (error) {
    console.error('[imageCache] Error getting cache info:', error);
    return { count: 0, totalSizeBytes: 0, formattedSize: '0 B' };
  }
};

/**
 * Clears all cached images from local storage.
 * Returns the number of cleared images.
 */
export const clearImageCache = async (): Promise<number> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const imageKeys = allKeys.filter((k) => k.startsWith(IMAGE_PREFIX));

    if (imageKeys.length > 0) {
      await AsyncStorage.multiRemove(imageKeys);
    }
    await AsyncStorage.removeItem(IMAGE_INDEX_KEY);

    return imageKeys.length;
  } catch (error) {
    console.error('[imageCache] Error clearing image cache:', error);
    return 0;
  }
};
