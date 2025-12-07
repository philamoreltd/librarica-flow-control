import { useState, useEffect, useCallback } from "react";
import { useBarcode } from "@/hooks/useBarcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookForm } from "@/components/BookForm";
import { CopyRow } from "@/components/CopyRow";
import { BarChart3, BookOpen, Search, Plus, Edit2, Trash2, Star, Download, Check, ChevronsUpDown, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string;
  description?: string;
  grade_level?: string;
  points: number;
  total_copies: number;
  available_copies: number;
  cover_image?: string;
  qrCode?: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  department_id?: string;
}

interface Department {
  id: string;
  name: string;
}

const BookManager = () => {
  const { generateBookCopyBarcode, loading: barcodeLoading } = useBarcode();
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [bookCopies, setBookCopies] = useState<any[]>([]);
  const [allBookCopies, setAllBookCopies] = useState<any[]>([]);
  const [showCopiesDialog, setShowCopiesDialog] = useState(false);
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<Book | null>(null);
  const [copiesCount, setCopiesCount] = useState(1);
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedGradeLevel, setSelectedGradeLevel] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { toast } = useToast();

  const [copiesSelectedCategory, setCopiesSelectedCategory] = useState("all");
  const [copiesSearchQuery, setCopiesSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [copiesSelectedGradeLevel, setCopiesSelectedGradeLevel] = useState("all");
  const [hasSyncedCopies, setHasSyncedCopies] = useState(false);
  
  // Check in/out states
  const [students, setStudents] = useState<any[]>([]);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [selectedCopyForCheckout, setSelectedCopyForCheckout] = useState<any>(null);
  const [selectedCopyForCheckin, setSelectedCopyForCheckin] = useState<any>(null);
  const [borrowingDetails, setBorrowingDetails] = useState<any>(null);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [checkoutDueDate, setCheckoutDueDate] = useState("");
  const [studentPickerOpen, setStudentPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    description: "",
    grade_level: "",
    points: "1",
    total_copies: "1",
    available_copies: "1",
    cover_image: "",
    qrCode: "",
    featured: false,
    department_id: "",
  });

  const [categories, setCategories] = useState([
    "English", "Kiswahili", "Mathematics", "Biology", "Physics", "Chemistry", 
    "History and Government", "CRE", "Home Science", "Computer Studies", "Music", 
    "Business Studies", "Art & Design", "Agriculture", "General Science"
  ]);
  const [customCategory, setCustomCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const gradeLevels = ["Grade 10", "Form 2", "Form 3", "Form 4"];

  useEffect(() => {
    fetchBooks();
    fetchDepartments();
  }, []);

  const handleFormDataChange = useCallback((newFormData: typeof formData) => {
    setFormData(newFormData);
  }, []);

  const handleAddCategory = useCallback((category: string) => {
    setCategories(prev => [...prev, category]);
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-books', {
        body: { action: 'get_books' },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      setBooks(response.data?.books || []);
    } catch (error: any) {
      console.error('Fetch books error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      isbn: "",
      description: "",
      grade_level: "",
      points: "1",
      total_copies: "1",
      available_copies: "1",
      cover_image: "",
      qrCode: "",
      featured: false,
      department_id: "",
    });
  };

  const handleAddBook = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-books', {
        body: { 
          action: 'add_book',
          bookData: formData
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      const newBook = response.data?.book;
      
      // Automatically generate book copies based on total_copies
      if (newBook && parseInt(formData.total_copies) > 0) {
        try {
          const copiesResponse = await supabase.functions.invoke('manage-book-copies', {
            body: { 
              action: 'generate_copies', 
              bookId: newBook.id, 
              copiesCount: parseInt(formData.total_copies)
            }
          });

          if (copiesResponse.error) {
            console.error('Error auto-generating copies:', copiesResponse.error);
            toast({
              title: "Warning",
              description: `Book added successfully, but failed to generate ${formData.total_copies} copies. You can generate them manually.`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Success",
              description: `Book added successfully with ${formData.total_copies} copies generated automatically`,
            });
          }
        } catch (copyError) {
          console.error('Copy generation error:', copyError);
          toast({
            title: "Warning", 
            description: "Book added successfully, but copy generation failed. You can generate copies manually.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Book added successfully",
        });
      }

      setIsAddDialogOpen(false);
      resetForm();
      fetchBooks();
      fetchAllBookCopies(); // Refresh book copies after adding a new book
    } catch (error: any) {
      console.error('Add book error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add book",
        variant: "destructive",
      });
    }
  };

  const handleEditBook = async () => {
    if (!editingBook) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-books', {
        body: { 
          action: 'update_book',
          bookId: editingBook.id,
          bookData: formData
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Book updated successfully",
      });

      setIsEditDialogOpen(false);
      setEditingBook(null);
      resetForm();
      fetchBooks();
      fetchAllBookCopies(); // Refresh book copies after editing a book
    } catch (error: any) {
      console.error('Update book error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update book",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-books', {
        body: { 
          action: 'delete_book',
          bookId: bookId
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "Book deleted successfully",
      });

      fetchBooks();
      fetchAllBookCopies(); // Refresh book copies after deleting a book
    } catch (error: any) {
      console.error('Delete book error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      });
    }
  };

  const editBook = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn || "",
      description: book.description || "",
      grade_level: book.grade_level || "",
      points: book.points.toString(),
      total_copies: book.total_copies.toString(),
      available_copies: book.available_copies.toString(),
      cover_image: book.cover_image || "",
      qrCode: book.qrCode || "",
      featured: book.featured || false,
      department_id: book.department_id || "",
    });
    setIsEditDialogOpen(true);
  };

  const deleteBook = (bookId: string) => {
    handleDeleteBook(bookId);
  };

  const generateCopies = async (book: Book) => {
    setSelectedBookForCopies(book);
    setShowCopiesDialog(true);
    await fetchBookCopies(book.id);
  };

  const fetchBookCopies = async (bookId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-book-copies', {
        body: { action: 'get_book_copies', bookId }
      });

      if (error) throw error;
      setBookCopies(data.copies || []);
    } catch (error) {
      console.error('Error fetching book copies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book copies",
        variant: "destructive",
      });
    }
  };

  const fetchAllBookCopies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-book-copies', {
        body: { action: 'get_all_copies' }
      });

      if (error) throw error;
      setAllBookCopies((data as any)?.copies || []);
    } catch (error) {
      console.error('Error fetching all book copies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch book copies",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      console.log('Fetching students...');
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const { data, error } = await supabase.functions.invoke('manage-students', {
        body: { action: 'get_students' },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      console.log('Students response:', { data, error });

      if (error) throw error;

      const studentsList = data?.students || [];
      console.log('Students loaded:', studentsList.length);
      setStudents(studentsList);
    } catch (error: any) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error loading students",
        description: error.message || "Failed to load students. You may need admin or librarian permissions.",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (copy: any) => {
    setSelectedCopyForCheckout(copy);
    setShowCheckOutDialog(true);
    setSelectedStudentId("");
    await fetchStudents();
    setStudentPickerOpen(true);
    // Set default due date to 2 weeks from now
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 14);
    setCheckoutDueDate(defaultDueDate.toISOString().split('T')[0]);
  };

  const handleCheckOutSubmit = async () => {
    if (!selectedCopyForCheckout || !selectedStudentId || !checkoutDueDate) {
      toast({
        title: "Missing Information",
        description: "Please select a student and due date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('issue-book-copy', {
        body: {
          copyId: selectedCopyForCheckout.id,
          studentId: selectedStudentId,
          dueDate: checkoutDueDate
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book checked out successfully",
      });

      setShowCheckOutDialog(false);
      setSelectedCopyForCheckout(null);
      setSelectedStudentId("");
      await fetchAllBookCopies();
    } catch (error: any) {
      console.error('Check out error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check out book",
        variant: "destructive",
      });
    }
  };

  const handleCheckIn = async (copy: any) => {
    try {
      console.log('Fetching borrowing details for copy:', copy);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      // Call edge function to get borrowing details (uses service role for full access)
      const { data, error } = await supabase.functions.invoke('get-borrowing-details', {
        body: { copyId: copy.id }
      });

      console.log('Borrowing details response:', { data, error });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }

      if (!data?.borrowingRecord) {
        toast({
          title: "Error",
          description: "No active borrowing record found for this book copy. The book may not have been properly checked out.",
          variant: "destructive",
        });
        return;
      }

      // Show confirmation dialog with student details
      setSelectedCopyForCheckin(copy);
      setBorrowingDetails(data.borrowingRecord);
      setShowCheckInDialog(true);

    } catch (error: any) {
      console.error('Error fetching borrowing details:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch borrowing details",
        variant: "destructive",
      });
    }
  };

  const confirmCheckIn = async () => {
    if (!selectedCopyForCheckin || !borrowingDetails) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const { data, error } = await supabase.functions.invoke('return-book-copy', {
        body: {
          copyId: selectedCopyForCheckin.id
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book checked in successfully",
      });

      setShowCheckInDialog(false);
      setSelectedCopyForCheckin(null);
      setBorrowingDetails(null);
      
      // Refresh the book copies list
      await fetchAllBookCopies();
      await fetchBooks(); // Also refresh books to update available counts
    } catch (error: any) {
      console.error('Check in error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to check in book",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCopies = async () => {
    if (!selectedBookForCopies || copiesCount < 1) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('manage-book-copies', {
        body: { 
          action: 'generate_copies', 
          bookId: selectedBookForCopies.id, 
          copiesCount 
        }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Generated ${copiesCount} copies successfully`,
      });
      setCopiesCount(1);
      await fetchBookCopies(selectedBookForCopies.id);
      await fetchAllBookCopies();
    } catch (error) {
      console.error('Error generating copies:', error);
      toast({
        title: "Error",
        description: "Failed to generate copies",
        variant: "destructive",
      });
    }
  };

  const generateBarcode = async (copy: any) => {
    try {
      const barcode = await generateBookCopyBarcode(copy.barcode, selectedBookForCopies?.title || '');
      if (barcode) {
        setBarcodeDataUrl(barcode);
        setShowBarcodeDialog(true);
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
      toast({
        title: "Error",
        description: "Failed to generate barcode",
        variant: "destructive",
      });
    }
  };

  const downloadBarcode = () => {
    if (barcodeDataUrl) {
      const link = document.createElement('a');
      link.href = barcodeDataUrl;
      link.download = 'book-barcode.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleUpdateCopy = async (copyId: string, updates: { isbn?: string; status?: string; notes?: string }) => {
    try {
      const { error } = await supabase.functions.invoke('manage-book-copies', {
        body: { 
          action: 'update_copy_status', 
          copyId, 
          status: updates.status || 'available',
          notes: updates.notes,
          isbn: updates.isbn
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update copy",
        });
        return;
      }

      // Refresh the copies list
      if (selectedBookForCopies) {
        await fetchBookCopies(selectedBookForCopies.id);
      }
      
      // Refresh all book copies
      await fetchAllBookCopies();

      toast({
        title: "Success",
        description: "Copy updated successfully",
      });
    } catch (error) {
      console.error('Error updating copy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update copy",
      });
    }
  };

  const toggleFeatured = async (book: Book) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await supabase.functions.invoke('manage-books', {
        body: { 
          action: 'update_book',
          bookId: book.id,
          bookData: { ...book, featured: !book.featured }
        },
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: `Book ${book.featured ? 'removed from' : 'added to'} featured list`,
      });

      fetchBooks();
    } catch (error: any) {
      console.error('Toggle featured error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    const matchesGradeLevel = selectedGradeLevel === "all" || book.grade_level === selectedGradeLevel;
    
    return matchesSearch && matchesCategory && matchesGradeLevel;
  });

  useEffect(() => {
    fetchBooks();
    fetchDepartments();
    fetchAllBookCopies();

    // Subscribe to real-time updates for books and book_copies
    const channel = supabase
      .channel('book-manager-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'books'
        },
        () => {
          fetchBooks();
          fetchAllBookCopies();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_copies'
        },
        () => {
          fetchAllBookCopies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
          <h2 className="text-2xl font-bold text-gray-900">Book Management</h2>
          <p className="text-gray-600">Add, edit, and manage library books</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              // Prepare export data
              const exportData = books.map(book => {
                const bookCopiesList = allBookCopies.filter(copy => copy.book_id === book.id);
                const availableCount = bookCopiesList.filter(c => c.status === 'available').length;
                const borrowedCount = bookCopiesList.filter(c => c.status === 'borrowed').length;
                const reservedCount = bookCopiesList.filter(c => c.status === 'reserved').length;
                const damagedCount = bookCopiesList.filter(c => c.status === 'damaged' || c.status === 'lost').length;
                
                return {
                  'Title': book.title,
                  'Author': book.author,
                  'Category': book.category,
                  'Class/Grade': book.grade_level || 'N/A',
                  'ISBN': book.isbn || 'N/A',
                  'Total Copies': bookCopiesList.length,
                  'Available': availableCount,
                  'Borrowed': borrowedCount,
                  'Reserved': reservedCount,
                  'Lost/Damaged': damagedCount,
                  'Featured': book.featured ? 'Yes' : 'No',
                  'Points': book.points,
                };
              });

              // Create workbook and worksheet
              const ws = XLSX.utils.json_to_sheet(exportData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, 'Books');

              // Auto-size columns
              const colWidths = Object.keys(exportData[0] || {}).map(key => ({
                wch: Math.max(key.length, ...exportData.map(row => String(row[key as keyof typeof row] || '').length)) + 2
              }));
              ws['!cols'] = colWidths;

              // Download file
              XLSX.writeFile(wb, `books_export_${new Date().toISOString().split('T')[0]}.xlsx`);
              
              toast({
                title: "Export Complete",
                description: `Exported ${books.length} books to Excel file`,
              });
            }}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Books
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} aria-label="Add Book">
                <Plus className="h-4 w-4 mr-2" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
              </DialogHeader>
              <BookForm 
                formData={formData}
                onFormDataChange={handleFormDataChange}
                onSubmit={handleAddBook}
                submitLabel="Add Book"
                categories={categories}
                onAddCategory={handleAddCategory}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedGradeLevel} onValueChange={setSelectedGradeLevel}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Class/Grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {gradeLevels.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => (
          <Card key={book.id} className="relative">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">by {book.author}</p>
                </div>
                {book.featured && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {book.cover_image && (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded-md"
                />
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <Badge variant="outline">{book.category}</Badge>
                </div>
                
                {book.isbn && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">ISBN:</span>
                    <span className="font-mono text-xs">{book.isbn}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available:</span>
                  <span className={`font-medium ${book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {book.available_copies}/{book.total_copies}
                  </span>
                </div>
                
                {book.grade_level && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Grade:</span>
                    <Badge variant="outline">{book.grade_level}</Badge>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-medium">{book.points}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateCopies(book)}
                  disabled={barcodeLoading}
                  className="flex-1"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Manage Copies
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleFeatured(book)}
                  className={book.featured ? "bg-yellow-100 text-yellow-800" : ""}
                >
                  <Star className={`h-4 w-4 mr-1 ${book.featured ? "fill-current" : ""}`} />
                  {book.featured ? "Featured" : "Feature"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editBook(book)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteBook(book.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Book Copies by Category Dashboard */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Book Copies by Category Dashboard
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={async () => {
                  // Sync all books - generate missing copies
                  try {
                    const booksWithoutCopies = books.filter(book => {
                      const bookCopies = allBookCopies.filter(copy => copy.book_id === book.id);
                      return bookCopies.length < book.total_copies;
                    });

                    if (booksWithoutCopies.length === 0) {
                      toast({
                        title: "Already Synced",
                        description: "All books already have the correct number of copies",
                      });
                      return;
                    }

                    for (const book of booksWithoutCopies) {
                      const existingCopiesCount = allBookCopies.filter(copy => copy.book_id === book.id).length;
                      const copiesToGenerate = book.total_copies - existingCopiesCount;

                      if (copiesToGenerate > 0) {
                        await supabase.functions.invoke('manage-book-copies', {
                          body: { 
                            action: 'generate_copies', 
                            bookId: book.id, 
                            copiesCount: copiesToGenerate
                          }
                        });
                      }
                    }

                    toast({
                      title: "Success",
                      description: `Generated missing copies for ${booksWithoutCopies.length} book(s)`,
                    });

                    await fetchAllBookCopies();
                  } catch (error) {
                    console.error('Sync error:', error);
                    toast({
                      title: "Error",
                      description: "Failed to sync copies",
                      variant: "destructive",
                    });
                  }
                }}
                size="sm"
              >
                Sync All Copies
              </Button>
              <Button variant="outline" onClick={fetchAllBookCopies} size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <Select value={copiesSelectedCategory} onValueChange={setCopiesSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={copiesSelectedGradeLevel} onValueChange={setCopiesSelectedGradeLevel}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Class/Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {gradeLevels.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title, author, barcode, or ISBN..."
                value={copiesSearchQuery}
                onChange={(e) => setCopiesSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Summary Statistics */}
          {(() => {
            const filteredCopies = allBookCopies.filter(copy => {
              const matchesCategory = copiesSelectedCategory === "all" || copy.books?.category === copiesSelectedCategory;
              const matchesGradeLevel = copiesSelectedGradeLevel === "all" || copy.books?.grade_level === copiesSelectedGradeLevel;
              const searchLower = copiesSearchQuery.toLowerCase();
              const matchesSearch = !copiesSearchQuery || (
                copy.books?.title?.toLowerCase().includes(searchLower) ||
                copy.books?.author?.toLowerCase().includes(searchLower) ||
                copy.barcode?.toLowerCase().includes(searchLower) ||
                copy.isbn?.toLowerCase().includes(searchLower)
              );
              const matchesStatus = !selectedStatusFilter || 
                (selectedStatusFilter === 'damaged' ? (copy.status === 'damaged' || copy.status === 'lost') : copy.status === selectedStatusFilter);
              return matchesCategory && matchesGradeLevel && matchesSearch && matchesStatus;
            });

            const stats = {
              total: filteredCopies.length,
              available: filteredCopies.filter(c => c.status === 'available').length,
              borrowed: filteredCopies.filter(c => c.status === 'borrowed').length,
              reserved: filteredCopies.filter(c => c.status === 'reserved').length,
              damaged: filteredCopies.filter(c => c.status === 'damaged' || c.status === 'lost').length,
            };

            return (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStatusFilter === null ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                    onClick={() => setSelectedStatusFilter(null)}
                  >
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <p className="text-xs text-muted-foreground">Total Copies</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStatusFilter === 'available' ? 'ring-2 ring-green-600' : 'hover:ring-1 hover:ring-green-600/50'}`}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'available' ? null : 'available')}
                  >
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStatusFilter === 'borrowed' ? 'ring-2 ring-blue-600' : 'hover:ring-1 hover:ring-blue-600/50'}`}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'borrowed' ? null : 'borrowed')}
                  >
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">{stats.borrowed}</div>
                      <p className="text-xs text-muted-foreground">Borrowed</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStatusFilter === 'reserved' ? 'ring-2 ring-yellow-600' : 'hover:ring-1 hover:ring-yellow-600/50'}`}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'reserved' ? null : 'reserved')}
                  >
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                      <p className="text-xs text-muted-foreground">Reserved</p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStatusFilter === 'damaged' ? 'ring-2 ring-red-600' : 'hover:ring-1 hover:ring-red-600/50'}`}
                    onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'damaged' ? null : 'damaged')}
                  >
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-red-600">{stats.damaged}</div>
                      <p className="text-xs text-muted-foreground">Lost/Damaged</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Book Copies List */}
                <div className="space-y-3">
                  {filteredCopies.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                      <div>
                        <p className="text-lg font-medium text-foreground mb-2">
                          {allBookCopies.length === 0 
                            ? "No Physical Book Copies Yet"
                            : "No copies match your search"}
                        </p>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                          {allBookCopies.length === 0 
                            ? "Physical copies are required for check-out tracking. Click 'Manage Copies' on any book card above to generate barcoded copies."
                            : "Try adjusting your category or search filters."}
                        </p>
                      </div>
                      {allBookCopies.length === 0 && books.length > 0 && (
                        <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                          Go to Books Above
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredCopies.map((copy) => (
                      <div key={copy.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium">{copy.books?.title}</div>
                          <div className="text-sm text-muted-foreground">
                            by {copy.books?.author}
                          </div>
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="font-mono">Copy #{copy.copy_number}</span>
                            <span className="font-mono">Barcode: {copy.barcode}</span>
                            <span className="font-mono">ISBN: {copy.isbn || 'Not assigned'}</span>
                            {copy.books?.category && (
                              <Badge variant="outline" className="text-xs">
                                {copy.books.category}
                              </Badge>
                            )}
                            {copy.books?.grade_level && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                {copy.books.grade_level}
                              </Badge>
                            )}
                          </div>
                          {copy.notes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Note: {copy.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge 
                            variant={copy.status === 'available' ? 'default' : 'secondary'}
                            className={copy.status === 'available' ? 'bg-green-100 text-green-800' : 
                                      copy.status === 'borrowed' ? 'bg-blue-100 text-blue-800' :
                                      copy.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                                      copy.status === 'lost' || copy.status === 'damaged' ? 'bg-red-100 text-red-800' :
                                      ''}
                          >
                            {copy.status}
                          </Badge>
                          {copy.status === 'available' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleCheckOut(copy)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <BookOpen className="w-4 h-4 mr-1" />
                              Check Out
                            </Button>
                          )}
                          {copy.status === 'borrowed' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleCheckIn(copy)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <BookOpen className="w-4 h-4 mr-1" />
                              Check In
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateBarcode(copy)}
                          >
                            <BarChart3 className="w-4 h-4 mr-1" />
                            Barcode
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            );
          })()}
        </CardContent>
      </Card>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== "all" 
              ? "Try adjusting your search criteria" 
              : "Get started by adding your first book"}
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
            <BookForm 
              formData={formData}
              onFormDataChange={handleFormDataChange}
              onSubmit={handleEditBook}
              submitLabel="Update Book"
              categories={categories}
              onAddCategory={handleAddCategory}
            />
        </DialogContent>
      </Dialog>

      {/* Book Copies Dialog */}
      <Dialog open={showCopiesDialog} onOpenChange={setShowCopiesDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Book Copies - {selectedBookForCopies?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Generate new copies */}
            <div className="flex items-center space-x-2 border rounded-lg p-4">
              <Label htmlFor="copiesCount">Generate new copies:</Label>
              <Input
                id="copiesCount"
                type="number"
                min="1"
                max="100"
                value={copiesCount}
                onChange={(e) => setCopiesCount(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <Button onClick={handleGenerateCopies} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Generate
              </Button>
            </div>

            {/* Existing copies */}
            <div className="space-y-2">
              <h4 className="font-medium">Existing Copies ({bookCopies.length})</h4>
              {bookCopies.length === 0 ? (
                <p className="text-muted-foreground">No copies generated yet.</p>
              ) : (
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {bookCopies.map((copy) => (
                    <CopyRow 
                      key={copy.id} 
                      copy={copy} 
                      onGenerateBarcode={generateBarcode}
                      onUpdateCopy={handleUpdateCopy}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check Out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Check Out Book</DialogTitle>
            <DialogDescription>
              Select a student and due date to issue this copy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Book</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCopyForCheckout?.books?.title} (Copy #{selectedCopyForCheckout?.copy_number})
              </p>
            </div>
            <div className="space-y-2">
              <Label>Search and Select Student</Label>
              <Popover open={studentPickerOpen} onOpenChange={setStudentPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={studentPickerOpen}
                    className="w-full justify-between"
                  >
                    {selectedStudentId
                      ? `${students.find((s) => s.id === selectedStudentId)?.first_name || ''} ${students.find((s) => s.id === selectedStudentId)?.last_name || ''} - ${students.find((s) => s.id === selectedStudentId)?.student_id || ''}`
                      : "Choose a student..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[360px] p-0 z-50 bg-background pointer-events-auto" align="start">
                  <Command>
                    <CommandInput placeholder="Search name or student ID..." autoFocus />
                    <CommandList>
                      <CommandEmpty>No student found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {students.map((student) => (
                          <CommandItem
                            key={student.id}
                            value={`${student.first_name} ${student.last_name} ${student.student_id || ''}`}
                            onSelect={() => {
                              setSelectedStudentId(student.id);
                              setStudentPickerOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedStudentId === student.id ? "opacity-100" : "opacity-0")} />
                            {student.first_name} {student.last_name} - {student.student_id}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={checkoutDueDate}
                onChange={(e) => setCheckoutDueDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCheckOutDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckOutSubmit}>
                Check Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Check In Confirmation Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Check In</DialogTitle>
            <DialogDescription>
              Please verify the student details before checking in this book.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Book</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCopyForCheckin?.books?.title} (Copy #{selectedCopyForCheckin?.copy_number})
              </p>
            </div>
            
            {borrowingDetails && (
              <>
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Student Name</Label>
                    <p className="text-sm mt-1">
                      {borrowingDetails.profiles?.first_name} {borrowingDetails.profiles?.last_name}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Student ID</Label>
                    <p className="text-sm mt-1">
                      {borrowingDetails.profiles?.student_id || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm mt-1">
                      {borrowingDetails.profiles?.email || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Borrowed Date</Label>
                    <p className="text-sm mt-1">
                      {new Date(borrowingDetails.borrowed_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Due Date</Label>
                    <p className="text-sm mt-1">
                      {new Date(borrowingDetails.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {new Date(borrowingDetails.due_date) < new Date() && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ This book is overdue
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCheckInDialog(false);
                  setSelectedCopyForCheckin(null);
                  setBorrowingDetails(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmCheckIn}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirm Check In
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Copy Barcode</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            {barcodeDataUrl && (
              <img 
                src={barcodeDataUrl} 
                alt="Book Copy Barcode" 
                className="border rounded-lg bg-white p-4"
              />
            )}
            <Button onClick={downloadBarcode} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download Barcode
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookManager;