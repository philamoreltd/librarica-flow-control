import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, BookOpen, UserCheck, Calendar, Clock } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Book = Tables<'books'>;
type BorrowingRecord = Tables<'borrowing_records'>;
type Profile = Tables<'profiles'>;

interface BookWithBorrower extends BorrowingRecord {
  book: Book;
  profile: Profile;
}

const CheckInOutManager = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BookWithBorrower[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch available books
      const { data: booksData } = await supabase
        .from('books')
        .select('*')
        .gt('available_copies', 0)
        .order('title');

      // Fetch students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('first_name');

      // Fetch borrowed books
      const { data: borrowedData } = await supabase
        .from('borrowing_records')
        .select(`
          *,
          book:books(*),
          profile:profiles(*)
        `)
        .eq('status', 'active')
        .order('borrowed_at', { ascending: false });

      setBooks(booksData || []);
      setStudents(studentsData || []);
      setBorrowedBooks(borrowedData as BookWithBorrower[] || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkOutBook = async () => {
    if (!selectedBook || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select both a book and a student.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('borrow-book', {
        body: { bookId: selectedBook, userId: selectedStudent },
      });

      if (error) throw error;

      toast({
        title: "Book checked out successfully",
        description: "The book has been assigned to the student.",
      });

      setSelectedBook("");
      setSelectedStudent("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error checking out book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkInBook = async (borrowingRecordId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('return-book', {
        body: { borrowingRecordId },
      });

      if (error) throw error;

      toast({
        title: "Book checked in successfully",
        description: "The book has been returned and is now available.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error checking in book",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = studentSearchQuery.toLowerCase();
    return (
      student.first_name?.toLowerCase().includes(searchLower) ||
      student.last_name?.toLowerCase().includes(searchLower) ||
      student.student_id?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const filteredBooks = books.filter(book => {
    const searchLower = bookSearchQuery.toLowerCase();
    return (
      book.title?.toLowerCase().includes(searchLower) ||
      book.author?.toLowerCase().includes(searchLower) ||
      book.isbn?.toLowerCase().includes(searchLower) ||
      book.category?.toLowerCase().includes(searchLower)
    );
  });

  const filteredBorrowedBooks = borrowedBooks.filter(record => {
    const searchLower = searchQuery.toLowerCase();
    return (
      record.book?.title?.toLowerCase().includes(searchLower) ||
      record.profile?.first_name?.toLowerCase().includes(searchLower) ||
      record.profile?.last_name?.toLowerCase().includes(searchLower) ||
      record.profile?.student_id?.toLowerCase().includes(searchLower)
    );
  });

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Check Out Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Check Out Book to Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Student</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No students found</div>
                      ) : (
                        filteredStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.first_name} {student.last_name} ({student.student_id})
                            {student.email && <span className="text-gray-500 text-xs block">{student.email}</span>}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Book</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search books..."
                      value={bookSearchQuery}
                      onChange={(e) => setBookSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedBook} onValueChange={setSelectedBook}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose book..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBooks.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500">No books found</div>
                      ) : (
                        filteredBooks.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            <div>
                              <div className="font-medium">{book.title}</div>
                              <div className="text-sm text-gray-500">
                                by {book.author} • {book.available_copies} available
                                {book.category && ` • ${book.category}`}
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={checkOutBook} 
                disabled={loading || !selectedBook || !selectedStudent}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Check Out Book
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check In Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Currently Checked Out Books ({borrowedBooks.length})
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search borrowed books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBorrowedBooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No borrowed books found</p>
              </div>
            ) : (
              filteredBorrowedBooks.map((record) => (
                <div 
                  key={record.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    isOverdue(record.due_date) ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium">{record.book?.title}</h3>
                      {isOverdue(record.due_date) && (
                        <Badge className="bg-red-100 text-red-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      by {record.book?.author}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        Student: {record.profile?.first_name} {record.profile?.last_name} 
                        ({record.profile?.student_id})
                      </span>
                      <span>
                        Borrowed: {new Date(record.borrowed_at || '').toLocaleDateString()}
                      </span>
                      <span className={isOverdue(record.due_date) ? 'text-red-600 font-medium' : ''}>
                        Due: {new Date(record.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => checkInBook(record.id)} 
                    disabled={loading}
                    variant="outline"
                    size="sm"
                  >
                    Check In
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckInOutManager;