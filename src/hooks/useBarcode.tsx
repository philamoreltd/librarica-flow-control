import { useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';

export interface BarcodeOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  textMargin?: number;
  format?: string;
}

export const useBarcode = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBarcode = useCallback(async (
    text: string, 
    options: BarcodeOptions = {}
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      
      JsBarcode(canvas, text, {
        format: options.format || 'CODE128',
        width: options.width || 2,
        height: options.height || 100,
        fontSize: options.fontSize || 14,
        textMargin: options.textMargin || 5,
        displayValue: true,
        background: '#ffffff',
        lineColor: '#000000',
      });
      
      // Convert canvas to data URL
      const barcodeDataURL = canvas.toDataURL('image/png');
      return barcodeDataURL;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate barcode';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateBookCopyBarcode = useCallback(async (barcode: string, bookTitle: string) => {
    // Use the actual barcode text for the barcode
    return generateBarcode(barcode, {
      height: 60,
      fontSize: 12,
      textMargin: 3
    });
  }, [generateBarcode]);

  return {
    generateBarcode,
    generateBookCopyBarcode,
    loading,
    error
  };
};