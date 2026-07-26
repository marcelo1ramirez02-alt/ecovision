export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const getBase64Header = (uri: string): string => {
  if (uri.endsWith('.png')) return 'data:image/png;base64,';
  if (uri.endsWith('.webp')) return 'data:image/webp;base64,';
  return 'data:image/jpeg;base64,';
};
