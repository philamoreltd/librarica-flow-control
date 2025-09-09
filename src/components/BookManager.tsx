import { useState, useEffect, useCallback } from "react";
import { useBarcode } from "@/hooks/useBarcode";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookForm } from "@/components/BookForm";
import { CopyRow } from "@/components/CopyRow";
import { BarChart3, BookOpen, Search, Plus, Edit2, Trash2, Star, Download } from "lucide-react";

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
  const [showCopiesDialog, setShowCopiesDialog] = useState(false);
  const [selectedBookForCopies, setSelectedBookForCopies] = useState<Book | null>(null);
  const [copiesCount, setCopiesCount] = useState(1);
  const { user, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { toast } = useToast();

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

      toast({
        title: "Success",
        description: "Book added successfully",
      });

      setIsAddDialogOpen(false);
      resetForm();
      fetchBooks();
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
      featured: book.featured || false
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
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    fetchBooks();
    fetchDepartments();
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
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
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Copies
                </Button>
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