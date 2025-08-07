import { useState, useCallback } from 'react';
import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export const useQRCode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateQRCode = useCallback(async (
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: options.width || 200,
        margin: options.margin || 2,
        color: {
          dark: options.color?.dark || '#000000',
          light: options.color?.light || '#FFFFFF',
        },
      });
      return qrCodeDataURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBookQRCode = useCallback(async (bookId: string, title: string) => {
    const bookData = JSON.stringify({
      type: 'book',
      id: bookId,
      title: title,
      timestamp: Date.now()
    });
    return generateQRCode(bookData);
  }, [generateQRCode]);

  const generateStudentQRCode = useCallback(async (studentId: string, name: string) => {
    const studentData = JSON.stringify({
      type: 'student',
      id: studentId,
      name: name,
      timestamp: Date.now()
    });
    return generateQRCode(studentData);
  }, [generateQRCode]);

  return {
    generateQRCode,
    generateBookQRCode,
    generateStudentQRCode,
    loading,
    error
  };
};