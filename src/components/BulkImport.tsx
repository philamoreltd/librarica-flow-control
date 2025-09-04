import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Users, BookOpen, Download, AlertCircle, FileUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";

export const BulkImport = () => {
  const [studentsData, setStudentsData] = useState("");
  const [booksData, setBooksData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const studentFileInputRef = useRef<HTMLInputElement>(null);
  const bookFileInputRef = useRef<HTMLInputElement>(null);

  const parseCSVData = (csvText: string, expectedHeaders: string[]) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return { error: "CSV must have header row and at least one data row" };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const missingHeaders = expectedHeaders.filter(header => 
      !headers.includes(header.toLowerCase())
    );

    if (missingHeaders.length > 0) {
      return { error: `Missing required headers: ${missingHeaders.join(', ')}` };
    }

    const data = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      row._lineNumber = index + 2;
      return row;
    });

    return { data };
  };

  const handleStudentImport = async () => {
    if (!studentsData.trim()) {
      toast({
        title: "Error",
        description: "Please enter student data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requiredHeaders = ['first_name', 'last_name', 'student_id', 'grade_level'];
      const parsed = parseCSVData(studentsData, requiredHeaders);
      
      if (parsed.error) {
        toast({
          title: "CSV Format Error",
          description: parsed.error,
          variant: "destructive",
        });
        return;
      }

      const studentsToInsert = parsed.data!.map((row: any) => ({
        first_name: row.first_name,
        middle_name: row.middle_name || '',
        last_name: row.last_name,
        email: row.email || '',
        phone_number: row.phone_number || '',
        student_id: row.student_id,
        grade_level: row.grade_level,
        role: row.role || 'student',
        points: parseInt(row.points) || 0,
        password: row.password || '',
        institution: row.institution || ''
      }));


      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('bulk-import', {
        body: { 
          type: 'students',
          data: studentsToInsert
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data;
      
      toast({
        title: "Import Complete",
        description: `Successfully imported ${result.successful} students. ${result.failed} failed.`,
        variant: result.failed > 0 ? "destructive" : "default",
      });

      if (result.failed > 0 && result.errors?.length > 0) {
        console.error('Import errors:', result.errors);
      }

      setStudentsData("");

    } catch (error: any) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookImport = async () => {
    if (!booksData.trim()) {
      toast({
        title: "Error",
        description: "Please enter book data",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const requiredHeaders = ['title', 'author', 'category'];
      const parsed = parseCSVData(booksData, requiredHeaders);
      
      if (parsed.error) {
        toast({
          title: "CSV Format Error",
          description: parsed.error,
          variant: "destructive",
        });
        return;
      }

      const booksToInsert = parsed.data!.map((row: any) => ({
        title: row.title,
        author: row.author,
        category: row.category,
        isbn: row.isbn || null,
        description: row.description || null,
        grade_level: row.grade_level || null,
        points: parseInt(row.points) || 1,
        total_copies: parseInt(row.total_copies) || 1,
        available_copies: parseInt(row.available_copies) || parseInt(row.total_copies) || 1,
        cover_image: row.cover_image || null,
      }));

      const { data, error } = await supabase
        .from('books')
        .insert(booksToInsert)
        .select();

      if (error) {
        toast({
          title: "Import Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${data.length} books.`,
      });

      setBooksData("");

    } catch (error: any) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadStudentTemplate = () => {
    const template = "first_name,middle_name,last_name,email,phone_number,student_id,grade_level,role,points,password,institution\nJohn,,Doe,john.doe@email.com,,STU001,Grade 10,student,0,,ABC High School\nJane,Mary,Smith,,+1234567890,STU002,Form 2,student,0,,XYZ Academy";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadBookTemplate = () => {
    const template = "title,author,category,isbn,description,grade_level,points,total_copies,available_copies\nSample Book,Sample Author,English,978-1234567890,A great book,9-12,15,3,3\nAnother Book,Another Author,Mathematics,978-0987654321,Educational content,6-9,10,2,2";
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleStudentFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setStudentsData(content);
    };
    reader.readAsText(file);
  };

  const handleBookFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setBooksData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Data Import</h1>
        <p className="text-gray-600">Import multiple students and books using CSV format</p>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Books
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Import Students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload CSV data with required headers: first_name, last_name, student_id, grade_level. Optional: middle_name, email, phone_number, role, points, password, institution.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadStudentTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => studentFileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Upload CSV File
                </Button>
                <Input
                  ref={studentFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleStudentFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="student-csv">Student Data (CSV format)</Label>
                <Textarea
                  id="student-csv"
                  placeholder="first_name,middle_name,last_name,email,phone_number,student_id,grade_level,role,points,password,institution
John,,Doe,john.doe@email.com,,STU001,Grade 10,student,0,,ABC High School
Jane,Mary,Smith,,+1234567890,STU002,Form 2,student,0,,XYZ Academy"
                  value={studentsData}
                  onChange={(e) => setStudentsData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleStudentImport} 
                disabled={isLoading || !studentsData.trim()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? "Importing..." : "Import Students"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Import Books
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload CSV data with headers: title, author, category, isbn (optional), description (optional), grade_level (optional), points (optional), total_copies (optional), available_copies (optional)
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadBookTemplate}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => bookFileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Upload CSV File
                </Button>
                <Input
                  ref={bookFileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleBookFileUpload}
                  className="hidden"
                />
              </div>

              <div>
                <Label htmlFor="book-csv">Book Data (CSV format)</Label>
                <Textarea
                  id="book-csv"
                  placeholder="title,author,category,isbn,description,grade_level,points,total_copies,available_copies
Sample Book,Sample Author,English,978-1234567890,A great book,9-12,15,3,3
Another Book,Another Author,Mathematics,978-0987654321,Educational content,6-9,10,2,2"
                  value={booksData}
                  onChange={(e) => setBooksData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button 
                onClick={handleBookImport} 
                disabled={isLoading || !booksData.trim()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? "Importing..." : "Import Books"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};