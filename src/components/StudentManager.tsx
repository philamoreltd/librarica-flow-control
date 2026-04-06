import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, UserX, Users, Search, Eye, CheckCircle, XCircle, BookPlus, Building2, Download, Printer, UserCheck, GraduationCap } from "lucide-react";
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import StudentForm from "@/components/StudentForm";
import { useDepartments } from "@/hooks/useDepartments";

interface Student {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  student_id?: string;
  grade_level?: string;
  points: number;
  role: string;
  institution?: string;
  created_at: string;
  updated_at: string;
  department_id?: string;
}

interface StudentActivity {
  borrowing_history: Array<{
    id: string;
    borrowed_at: string;
    due_date: string;
    returned_at?: string;
    status: string;
    fine_amount: number;
    copy_id?: string;
    books: {
      id: string;
      title: string;
      author: string;
    };
  }>;
  reservation_history: Array<{
    id: string;
    reserved_at: string;
    expires_at: string;
    status: string;
    books: {
      id: string;
      title: string;
      author: string;
    };
  }>;
}

const StudentManager = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentActivity, setStudentActivity] = useState<StudentActivity | null>(null);
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  
  const { departments } = useDepartments();
  
  // Quick checkout states
  const [showQuickCheckout, setShowQuickCheckout] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [bookCopies, setBookCopies] = useState<any[]>([]);
  const [selectedCopyId, setSelectedCopyId] = useState("");
  const [checkoutDueDate, setCheckoutDueDate] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    student_id: "",
    grade_level: "",
    points: "0",
    password: "",
    institution: "",
    department_id: ""
  });

  const gradeLevels = ["Grade 10", "Form 2", "Form 3", "Form 4"];

  const fetchTotalUsers = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (!error) setTotalUsers(count || 0);
    } catch (e) {
      console.error('Fetch total users error:', e);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchTotalUsers();

    // Subscribe to real-time updates
    const studentsChannel = supabase
      .channel('students-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchStudents();
          fetchTotalUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentsChannel);
    };
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-students', {
        body: { action: 'get_students' },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      setStudents(response.data?.students || []);
    } catch (error: any) {
      console.error('Fetch students error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentActivity = async (studentId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-students', {
        body: { 
          action: 'get_student_activity',
          studentId: studentId 
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      setStudentActivity(response.data);
      setViewingStudentId(studentId);
      setIsActivityDialogOpen(true);
    } catch (error: any) {
      console.error('Fetch student activity error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student activity",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      middle_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      student_id: "",
      grade_level: "",
      points: "0",
      password: "",
      institution: "",
      department_id: ""
    });
  };

  const handleAddStudent = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const studentData = {
        ...formData
      };

      const response = await supabase.functions.invoke('manage-students', {
        body: { 
          action: 'add_student',
          studentData: studentData
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Student added successfully. Temporary password: ${response.data.temporary_password}`,
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Add student error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-students', {
        body: { 
          action: 'update_student',
          studentId: editingStudent.id,
          studentData: formData
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Student updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      console.error('Update student error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    }
  };

  const handleDeactivateStudent = async (studentId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-students', {
        body: { 
          action: 'deactivate_student',
          studentId: studentId
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Student deactivated successfully",
      });

      fetchStudents();
    } catch (error: any) {
      console.error('Deactivate student error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate student",
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (copyId: string, studentId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('return-book-copy', {
        body: { 
          copyId: copyId
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Book checked in successfully",
      });

      // Refresh student activity
      fetchStudentActivity(studentId);
    } catch (error: any) {
      console.error('Check in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check in book",
        variant: "destructive",
      });
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error: any) {
      console.error('Fetch books error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch books",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const csvData = filteredStudents.map(student => ({
      'First Name': student.first_name || '',
      'Middle Name': student.middle_name || '',
      'Last Name': student.last_name || '',
      'Admission Number': student.student_id || '',
      'Phone Number': student.phone_number || '',
      'Email': student.email || '',
      'Grade Level': student.grade_level || '',
      'Department': departments.find(d => d.id === student.department_id)?.name || '',
      'Points': student.points || 0,
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => {
        const value = row[header as keyof typeof row];
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Success",
      description: "Student list exported to CSV",
    });
  };

  const exportToExcel = () => {
    const excelData = filteredStudents.map(student => ({
      'First Name': student.first_name || '',
      'Middle Name': student.middle_name || '',
      'Last Name': student.last_name || '',
      'Admission Number': student.student_id || '',
      'Phone Number': student.phone_number || '',
      'Email': student.email || '',
      'Grade Level': student.grade_level || '',
      'Department': departments.find(d => d.id === student.department_id)?.name || '',
      'Points': student.points || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    
    XLSX.writeFile(workbook, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Success",
      description: "Student list exported to Excel",
    });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to print",
        variant: "destructive",
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student List - ${new Date().toLocaleDateString()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            h1 {
              text-align: center;
              margin-bottom: 10px;
              font-size: 24px;
            }
            .print-date {
              text-align: center;
              margin-bottom: 20px;
              color: #666;
              font-size: 14px;
            }
            .grade-section {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .grade-header {
              background-color: #f3f4f6;
              padding: 10px;
              font-weight: bold;
              font-size: 16px;
              margin-bottom: 10px;
              border-left: 4px solid #3b82f6;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f9fafb;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .total-count {
              text-align: center;
              margin-top: 20px;
              font-weight: bold;
              font-size: 14px;
            }
            @media print {
              body {
                margin: 10px;
              }
              .grade-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <h1>Student List</h1>
          <div class="print-date">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
          
          ${sortedGrades.map(grade => `
            <div class="grade-section">
              <div class="grade-header">${grade} (${groupedStudents[grade].length} student${groupedStudents[grade].length !== 1 ? 's' : ''})</div>
              <table>
                <thead>
                  <tr>
                    <th style="width: 20%">Name</th>
                    <th style="width: 12%">Adm No</th>
                    <th style="width: 15%">Phone Number</th>
                    <th style="width: 20%">Email</th>
                    <th style="width: 10%">Grade</th>
                    <th style="width: 15%">Department</th>
                    <th style="width: 8%">Points</th>
                  </tr>
                </thead>
                <tbody>
                  ${groupedStudents[grade].map(student => `
                    <tr>
                      <td>${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}</td>
                      <td>${student.student_id || 'N/A'}</td>
                      <td>${student.phone_number || '-'}</td>
                      <td>${student.email || 'No email'}</td>
                      <td>${student.grade_level || 'N/A'}</td>
                      <td>${departments.find(d => d.id === student.department_id)?.name || '-'}</td>
                      <td>${student.points}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `).join('')}
          
          <div class="total-count">Total Students: ${filteredStudents.length}</div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const fetchBookCopies = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('book_copies')
        .select('*')
        .eq('book_id', bookId)
        .eq('status', 'available')
        .order('copy_number');

      if (error) throw error;
      setBookCopies(data || []);
    } catch (error: any) {
      console.error('Fetch book copies error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book copies",
        variant: "destructive",
      });
    }
  };

  const handleQuickCheckout = async () => {
    if (!selectedCopyId || !checkoutDueDate || !viewingStudentId) {
      toast({
        title: "Error",
        description: "Please select a book copy and set a due date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('issue-book-copy', {
        body: {
          copyId: selectedCopyId,
          studentId: viewingStudentId,
          dueDate: checkoutDueDate
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Book checked out successfully",
      });

      // Reset checkout form
      setShowQuickCheckout(false);
      setSelectedBook(null);
      setSelectedCopyId("");
      setCheckoutDueDate("");
      setBookSearchQuery("");
      setBookCopies([]);

      // Refresh student activity
      fetchStudentActivity(viewingStudentId);
    } catch (error: any) {
      console.error('Quick checkout error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to checkout book",
        variant: "destructive",
      });
    }
  };

  const handleBookSelect = (book: any) => {
    setSelectedBook(book);
    setBookSearchQuery(book.title);
    fetchBookCopies(book.id);
  };

  const openQuickCheckout = () => {
    setShowQuickCheckout(true);
    fetchBooks();
    
    // Set default due date to 14 days from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setCheckoutDueDate(defaultDueDate.toISOString().split('T')[0]);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearchQuery.toLowerCase())
  );

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      first_name: student.first_name,
      middle_name: student.middle_name || "",
      last_name: student.last_name,
      email: student.email || "",
      phone_number: student.phone_number || "",
      student_id: student.student_id || "",
      grade_level: student.grade_level || "",
      points: student.points.toString(),
      password: "",
      institution: student.institution || "",
      department_id: student.department_id || ""
    });
    setIsEditDialogOpen(true);
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.middle_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.student_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === "all" || student.grade_level === selectedGrade;
    
    return matchesSearch && matchesGrade;
  });

  // Group students by grade level
  const groupedStudents = filteredStudents.reduce((groups: { [key: string]: Student[] }, student) => {
    const grade = student.grade_level || "Unassigned";
    if (!groups[grade]) {
      groups[grade] = [];
    }
    groups[grade].push(student);
    return groups;
  }, {});

  // Sort grade levels
  const sortedGrades = Object.keys(groupedStudents).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management</h2>
          <p className="text-gray-600">Add, edit, and manage student accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={filteredStudents.length === 0}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={exportToCSV} disabled={filteredStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={filteredStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <StudentForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleAddStudent} 
              submitLabel="Add Student" 
            />
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-full p-2 bg-accent/50">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </CardContent>
        </Card>
        {sortedGrades.map((grade) => (
          <Card key={`stat-${grade}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-full p-2 bg-secondary">
                <UserCheck className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{grade}</p>
                <p className="text-2xl font-bold">{groupedStudents[grade].length}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, phone, or student Adm No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {gradeLevels.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Students Grouped by Grade Level */}
      <div className="space-y-6">
        {sortedGrades.map((grade) => (
          <Card key={grade}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle className="text-lg">{grade}</CardTitle>
                <Badge variant="secondary">
                  {groupedStudents[grade].length} student{groupedStudents[grade].length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Adm No</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedStudents[grade].map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.first_name} {student.middle_name && `${student.middle_name} `}{student.last_name}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.student_id || "N/A"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.phone_number || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.email || "No email"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {student.grade_level || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.department_id ? (
                          <Badge variant="secondary" className="text-xs">
                            <Building2 className="h-3 w-3 mr-1" />
                            {departments.find(d => d.id === student.department_id)?.code || "Dept"}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{student.points}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => fetchStudentActivity(student.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(student)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to deactivate {student.first_name} {student.last_name}? 
                                  This will prevent them from borrowing books and cancel active reservations.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeactivateStudent(student.id)}>
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add new students.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
            <StudentForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleEditStudent} 
              submitLabel="Update Student"
              editingStudent={editingStudent}
            />
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog 
        open={isActivityDialogOpen} 
        onOpenChange={(open) => {
          setIsActivityDialogOpen(open);
          if (!open) {
            // Reset quick checkout state when dialog closes
            setShowQuickCheckout(false);
            setSelectedBook(null);
            setSelectedCopyId("");
            setCheckoutDueDate("");
            setBookSearchQuery("");
            setBookCopies([]);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Activity</DialogTitle>
          </DialogHeader>
          {studentActivity && (
            <div className="space-y-6">
              {/* Quick Checkout Section */}
              {!showQuickCheckout ? (
                <div className="flex justify-end">
                  <Button onClick={openQuickCheckout} variant="outline" size="sm">
                    <BookPlus className="h-4 w-4 mr-2" />
                    Quick Checkout
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Checkout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Search Book</Label>
                      <Input
                        placeholder="Search by title or author..."
                        value={bookSearchQuery}
                        onChange={(e) => setBookSearchQuery(e.target.value)}
                      />
                      {bookSearchQuery && !selectedBook && (
                        <div className="mt-2 max-h-40 overflow-y-auto border rounded-md">
                          {filteredBooks.length > 0 ? (
                            filteredBooks.slice(0, 5).map((book) => (
                              <button
                                key={book.id}
                                onClick={() => handleBookSelect(book)}
                                className="w-full text-left p-2 hover:bg-muted transition-colors"
                              >
                                <p className="font-medium">{book.title}</p>
                                <p className="text-sm text-gray-600">by {book.author}</p>
                                <p className="text-xs text-gray-500">{book.available_copies} available</p>
                              </button>
                            ))
                          ) : (
                            <p className="p-2 text-sm text-gray-500">No books found</p>
                          )}
                        </div>
                      )}
                      {selectedBook && (
                        <div className="mt-2 p-2 bg-muted rounded-md flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedBook.title}</p>
                            <p className="text-sm text-gray-600">by {selectedBook.author}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBook(null);
                              setBookCopies([]);
                              setSelectedCopyId("");
                            }}
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>

                    {selectedBook && bookCopies.length > 0 && (
                      <div>
                        <Label>Select Copy</Label>
                        <Select value={selectedCopyId} onValueChange={setSelectedCopyId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a copy" />
                          </SelectTrigger>
                          <SelectContent>
                            {bookCopies.map((copy) => (
                              <SelectItem key={copy.id} value={copy.id}>
                                Copy #{copy.copy_number} - {copy.barcode}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {selectedBook && bookCopies.length === 0 && (
                      <p className="text-sm text-yellow-600">No available copies for this book</p>
                    )}

                    <div>
                      <Label>Due Date</Label>
                      <Input
                        type="date"
                        value={checkoutDueDate}
                        onChange={(e) => setCheckoutDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleQuickCheckout} disabled={!selectedCopyId || !checkoutDueDate}>
                        Checkout Book
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowQuickCheckout(false);
                          setSelectedBook(null);
                          setSelectedCopyId("");
                          setBookSearchQuery("");
                          setBookCopies([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div>
                <h3 className="text-lg font-semibold mb-3">Borrowing History</h3>
                {studentActivity.borrowing_history.length > 0 ? (
                  <div className="space-y-2">
                    {studentActivity.borrowing_history.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium">{record.books.title}</p>
                            <p className="text-sm text-gray-600">by {record.books.author}</p>
                            <p className="text-xs text-gray-500">
                              Borrowed: {new Date(record.borrowed_at).toLocaleDateString()}
                            </p>
                            {record.status === 'active' && (
                              <p className="text-xs text-gray-500 mt-1">
                                Due: {new Date(record.due_date).toLocaleDateString()}
                              </p>
                            )}
                            {record.returned_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                Returned: {new Date(record.returned_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-start gap-2">
                            <Badge className={record.status === 'active' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                              {record.status}
                            </Badge>
                            {record.fine_amount > 0 && (
                              <p className="text-sm text-red-600 mt-1">Fine: ${record.fine_amount}</p>
                            )}
                            {record.status === 'active' && record.copy_id && viewingStudentId && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCheckIn(record.copy_id!, viewingStudentId)}
                                className="h-8"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Check In
                              </Button>
                            )}
                            {record.status === 'returned' && record.books?.id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const book = books.find(b => b.id === record.books.id);
                                  if (book) {
                                    handleBookSelect(book);
                                    setShowQuickCheckout(true);
                                  } else {
                                    // If books not loaded yet, fetch them first
                                    fetchBooks().then(() => {
                                      const foundBook = books.find(b => b.id === record.books.id);
                                      if (foundBook) {
                                        handleBookSelect(foundBook);
                                        setShowQuickCheckout(true);
                                      }
                                    });
                                  }
                                }}
                                className="h-8"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Check Out
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No borrowing history</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Reservation History</h3>
                {studentActivity.reservation_history.length > 0 ? (
                  <div className="space-y-2">
                    {studentActivity.reservation_history.map((record) => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{record.books.title}</p>
                            <p className="text-sm text-gray-600">by {record.books.author}</p>
                            <p className="text-xs text-gray-500">
                              Reserved: {new Date(record.reserved_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={record.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reservation history</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManager;