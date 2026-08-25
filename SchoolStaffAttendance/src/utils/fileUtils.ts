/**
 * Utility to convert a local file URI (e.g. file:///... or content://...)
 * to a clean Base64 data string in React Native environment.
 */
export async function convertFileToBase64(uri: string): Promise<string> {
  if (!uri) return '';

  try {
    const formattedUri = uri.startsWith('file://') || uri.startsWith('content://') ? uri : `file://${uri}`;
    const response = await fetch(formattedUri);
    const blob = await response.blob();

    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (!base64data) {
          resolve('');
          return;
        }
        // Strip data:image/...;base64, header if present
        const cleanBase64 = base64data.includes(',')
          ? base64data.split(',')[1]
          : base64data;
        resolve(cleanBase64 || '');
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    return '';
  }
}
