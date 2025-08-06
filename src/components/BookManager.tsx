import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, BookOpen, Search, Star } from "lucide-react";

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
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const BookManager = () => {
  const [books, setBooks] = useState<Book[]>([]);
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
    featured: false
  });

  const categories = ["Fiction", "Non-Fiction", "Science", "History", "Biography", "Poetry", "Drama", "Reference"];
  const gradeLevels = ["K-2", "3-5", "6-8", "9-12", "Adult"];

  useEffect(() => {
    fetchBooks();
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
      featured: false
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

  const openEditDialog = (book: Book) => {
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
      featured: book.featured || false
    });
    setIsEditDialogOpen(true);
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

  const BookForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Book title"
            required
          />
        </div>
        <div>
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            placeholder="Author name"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="isbn">ISBN</Label>
          <Input
            id="isbn"
            value={formData.isbn}
            onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
            placeholder="ISBN number"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="grade_level">Grade Level</Label>
          <Select value={formData.grade_level} onValueChange={(value) => setFormData({ ...formData, grade_level: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {gradeLevels.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="points">Points</Label>
          <Input
            id="points"
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            min="1"
          />
        </div>
        <div>
          <Label htmlFor="total_copies">Total Copies</Label>
          <Input
            id="total_copies"
            type="number"
            value={formData.total_copies}
            onChange={(e) => {
              const total = e.target.value;
              setFormData({ 
                ...formData, 
                total_copies: total,
                available_copies: formData.available_copies > total ? total : formData.available_copies
              });
            }}
            min="1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Book description"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="cover_image">Cover Image URL</Label>
        <Input
          id="cover_image"
          value={formData.cover_image}
          onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
          placeholder="https://example.com/cover.jpg"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="featured"
          checked={formData.featured}
          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
          className="rounded border-gray-300"
        />
        <Label htmlFor="featured">Mark as Featured Book</Label>
      </div>

      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );

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
            <BookForm onSubmit={handleAddBook} submitLabel="Add Book" />
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
            <SelectItem value="all">All Categories</SelectItem>
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
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <Badge className={book.available_copies > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {book.available_copies > 0 ? "Available" : "Out of Stock"}
                  </Badge>
                  {book.featured && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant={book.featured ? "default" : "outline"} 
                    onClick={() => toggleFeatured(book)}
                    title={book.featured ? "Remove from featured" : "Add to featured"}
                  >
                    <Star className={`h-3 w-3 ${book.featured ? 'fill-current' : ''}`} />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditDialog(book)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{book.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteBook(book.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  src={book.cover_image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300"}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-1">
                    {book.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                  <p className="text-xs text-gray-500">{book.category} • {book.grade_level}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {book.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {book.available_copies} of {book.total_copies} available
                </span>
                <span className="text-xs text-gray-500">
                  {book.points} pts
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or add new books.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
          </DialogHeader>
          <BookForm onSubmit={handleEditBook} submitLabel="Update Book" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookManager;