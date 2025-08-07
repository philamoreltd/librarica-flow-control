
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QrCode, Scan, BookOpen, User, Check, X, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQRCode } from "@/hooks/useQRCode";
import { toast } from "sonner";

interface ScanResult {
  type: 'book' | 'student';
  id: string;
  title?: string;
  author?: string;
  studentName?: string;
  grade?: string;
  available?: boolean;
  isbn?: string;
  email?: string;
  qrCode?: string;
}

const BarcodeScanner = () => {
  const [scanInput, setScanInput] = useState("");
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const { user } = useAuth();
  const { generateBookQRCode, generateStudentQRCode, loading: qrLoading } = useQRCode();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    }
  };

  const searchByCode = async (code: string): Promise<ScanResult | null> => {
    try {
      // Try to parse as JSON first (QR code data)
      try {
        const qrData = JSON.parse(code);
        if (qrData.type === 'book') {
          const { data: book } = await supabase
            .from('books')
            .select('*')
            .eq('id', qrData.id)
            .single();
          
          if (book) {
            return {
              type: 'book',
              id: book.id,
              title: book.title,
              author: book.author,
              isbn: book.isbn,
              available: book.available_copies > 0
            };
          }
        } else if (qrData.type === 'student') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', qrData.id)
            .single();
          
          if (profile) {
            return {
              type: 'student',
              id: profile.id,
              studentName: `${profile.first_name} ${profile.last_name}`,
              email: profile.email,
              grade: profile.grade_level
            };
          }
        }
      } catch {
        // Not JSON, continue with other searches
      }

      // Search by ISBN
      const { data: bookByISBN } = await supabase
        .from('books')
        .select('*')
        .eq('isbn', code)
        .single();
      
      if (bookByISBN) {
        return {
          type: 'book',
          id: bookByISBN.id,
          title: bookByISBN.title,
          author: bookByISBN.author,
          isbn: bookByISBN.isbn,
          available: bookByISBN.available_copies > 0
        };
      }

      // Search by student ID
      const { data: studentById } = await supabase
        .from('profiles')
        .select('*')
        .eq('student_id', code)
        .single();
      
      if (studentById) {
        return {
          type: 'student',
          id: studentById.id,
          studentName: `${studentById.first_name} ${studentById.last_name}`,
          email: studentById.email,
          grade: studentById.grade_level
        };
      }

      return null;
    } catch (error) {
      console.error('Error searching:', error);
      return null;
    }
  };

  const handleScan = async () => {
    if (!scanInput.trim()) return;
    
    setIsScanning(true);
    try {
      const result = await searchByCode(scanInput.trim());
      setScanResult(result);
      if (!result) {
        toast.error('No matching book or student found');
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Error during scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualInput = async (value: string) => {
    setScanInput(value);
    if (value.length > 5) {
      const result = await searchByCode(value);
      setScanResult(result);
    } else {
      setScanResult(null);
    }
  };

  const generateQRForResult = async () => {
    if (!scanResult) return;
    
    try {
      let qrCodeDataURL: string | null = null;
      
      if (scanResult.type === 'book') {
        qrCodeDataURL = await generateBookQRCode(scanResult.id, scanResult.title || '');
      } else if (scanResult.type === 'student') {
        qrCodeDataURL = await generateStudentQRCode(scanResult.id, scanResult.studentName || '');
      }
      
      if (qrCodeDataURL) {
        setScanResult({ ...scanResult, qrCode: qrCodeDataURL });
        toast.success('QR code generated successfully');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!scanResult?.qrCode) return;
    
    const link = document.createElement('a');
    link.download = `${scanResult.type}-${scanResult.id}-qr.png`;
    link.href = scanResult.qrCode;
    link.click();
  };

  const resetScan = () => {
    setScanInput("");
    setScanResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Barcode Scanner</h1>
        <p className="text-gray-600">Scan student IDs and book barcodes for quick checkout/return</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2 text-blue-600" />
              Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Scan or enter barcode/student ID..."
                value={scanInput}
                onChange={(e) => handleManualInput(e.target.value)}
                className="text-lg"
              />
              <Button 
                onClick={handleScan}
                disabled={!scanInput || isScanning}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                size="sm"
              >
                {isScanning ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Scan className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Position barcode in scanner view</p>
                <p className="text-sm text-gray-500 mt-2">
                  Or manually enter the code above
                </p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => handleManualInput("978-0-7432-7356-5")}
                size="sm"
              >
                Test ISBN Scan
              </Button>
              {books.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => handleManualInput(books[0].isbn || books[0].id)}
                  size="sm"
                >
                  Test Real Book
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={resetScan}
                size="sm"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scan Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scan className="h-5 w-5 mr-2 text-green-600" />
              Scan Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!scanResult ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scan className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600">No scan detected</p>
                <p className="text-sm text-gray-500">Scan a barcode or student ID to see results</p>
              </div>
            ) : scanResult.type === 'book' ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{scanResult.title}</h3>
                    <p className="text-gray-600">by {scanResult.author}</p>
                    <p className="text-sm text-gray-500">
                      {scanResult.isbn ? `ISBN: ${scanResult.isbn}` : `ID: ${scanResult.id}`}
                    </p>
                  </div>
                  <Badge className={scanResult.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {scanResult.available ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Available
                      </>
                    ) : (
                      <>
                        <X className="h-3 w-3 mr-1" />
                        Checked Out
                      </>
                    )}
                  </Badge>
                </div>
                
                {scanResult.qrCode && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">QR Code</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <img src={scanResult.qrCode} alt="QR Code" className="mx-auto" />
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button disabled={!scanResult.available}>
                    Check Out Book
                  </Button>
                  <Button variant="outline" disabled={scanResult.available}>
                    Process Return
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={generateQRForResult}
                    disabled={qrLoading}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Generate QR
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{scanResult.studentName}</h3>
                    <p className="text-gray-600">{scanResult.grade}</p>
                    <p className="text-sm text-gray-500">ID: {scanResult.id}</p>
                    {scanResult.email && (
                      <p className="text-sm text-gray-500">Email: {scanResult.email}</p>
                    )}
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Valid Student
                  </Badge>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Loans</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>The Hunger Games</span>
                      <span className="text-green-600">Due in 8 days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To Kill a Mockingbird</span>
                      <span className="text-green-600">Due in 13 days</span>
                    </div>
                  </div>
                </div>
                
                {scanResult.qrCode && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Student QR Code</h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <img src={scanResult.qrCode} alt="Student QR Code" className="mx-auto" />
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  <Button>View Full Profile</Button>
                  <Button variant="outline">Send Reminder</Button>
                  <Button 
                    variant="outline" 
                    onClick={generateQRForResult}
                    disabled={qrLoading}
                  >
                    <QrCode className="h-4 w-4 mr-1" />
                    Generate QR
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-6 h-auto flex-col">
              <BookOpen className="h-8 w-8 mb-2 text-blue-600" />
              <span className="font-medium">Bulk Check-out</span>
              <span className="text-sm text-gray-500">Process multiple books</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col">
              <User className="h-8 w-8 mb-2 text-green-600" />
              <span className="font-medium">Student Lookup</span>
              <span className="text-sm text-gray-500">Find student records</span>
            </Button>
            <Button variant="outline" className="p-6 h-auto flex-col">
              <QrCode className="h-8 w-8 mb-2 text-purple-600" />
              <span className="font-medium">Generate Labels</span>
              <span className="text-sm text-gray-500">Print barcode labels</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeScanner;
