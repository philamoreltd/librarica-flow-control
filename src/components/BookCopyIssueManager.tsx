import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Search, BookCopy, UserCheck, Calendar, ArrowLeft } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type BookCopy = Tables<'book_copies'>;
type Profile = Tables<'profiles'>;

interface BookCopyWithBook extends BookCopy {
  books: {
    title: string;
    author: string;
    category: string;
  };
}

interface BorrowingRecordWithDetails {
  id: string;
  user_id: string;
  book_id: string;
  borrowed_at: string;
  due_date: string;
  status: string;
  book_copy_id?: string;
  profile: Profile;
  books: {
    title: string;
    author: string;
  };
  book_copy?: BookCopy;
}

const BookCopyIssueManager = () => {
  const [bookCopies, setBookCopies] = useState<BookCopyWithBook[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [issuedCopies, setIssuedCopies] = useState<any[]>([]);
  const [copySearchQuery, setCopySearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCopy, setSelectedCopy] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      // Fetch available book copies
      const { data: copiesData, error: copiesError } = await supabase
        .from('book_copies')
        .select(`
          *,
          books(title, author, category)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (copiesError) throw copiesError;

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('first_name');

      if (studentsError) throw studentsError;

      // Fetch issued copies with borrowing records
      const { data: borrowedData, error: borrowedError } = await supabase
        .from('book_copies')
        .select(`
          *,
          books(title, author, category)
        `)
        .eq('status', 'borrowed')
        .order('updated_at', { ascending: false });

      if (borrowedError) throw borrowedError;

      // For each borrowed copy, get the active borrowing record
      const copiesWithRecords = await Promise.all(
        (borrowedData || []).map(async (copy) => {
          const { data: record } = await supabase
            .from('borrowing_records')
            .select(`
              *,
              profile:profiles(*)
            `)
            .eq('book_id', copy.book_id)
            .eq('status', 'active')
            .order('borrowed_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...copy,
            borrowing_record: record
          };
        })
      );

      setBookCopies(copiesData as BookCopyWithBook[] || []);
      setStudents(studentsData || []);
      setIssuedCopies(copiesWithRecords || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const issueCopy = async () => {
    if (!selectedCopy || !selectedStudent || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('issue-book-copy', {
        body: { 
          copyId: selectedCopy, 
          studentId: selectedStudent,
          dueDate: dueDate
        },
      });

      if (error) throw error;

      toast({
        title: "Book copy issued successfully",
        description: "The book copy has been assigned to the student.",
      });

      setSelectedCopy("");
      setSelectedStudent("");
      setDueDate("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error issuing book copy",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const returnCopy = async (copyId: string, borrowingRecordId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('return-book-copy', {
        body: { copyId, borrowingRecordId },
      });

      if (error) throw error;

      toast({
        title: "Book copy returned successfully",
        description: "The book copy is now available again.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error returning book copy",
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
      student.student_id?.toLowerCase().includes(searchLower)
    );
  });

  const filteredCopies = bookCopies.filter(copy => {
    const searchLower = copySearchQuery.toLowerCase();
    return (
      copy.books?.title?.toLowerCase().includes(searchLower) ||
      copy.books?.author?.toLowerCase().includes(searchLower) ||
      copy.barcode?.toLowerCase().includes(searchLower) ||
      copy.isbn?.toLowerCase().includes(searchLower)
    );
  });

  // Set default due date (14 days from now)
  useEffect(() => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 14);
    setDueDate(defaultDue.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to real-time updates for book_copies
    const channel = supabase
      .channel('book-copies-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'book_copies'
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Issue Book Copy Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookCopy className="h-5 w-5 mr-2" />
            Issue Book Copy to Student
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Book Copy</label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by title, barcode, ISBN..."
                  value={copySearchQuery}
                  onChange={(e) => setCopySearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCopy} onValueChange={setSelectedCopy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose book copy..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredCopies.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">No copies available</div>
                  ) : (
                    filteredCopies.map((copy) => (
                      <SelectItem key={copy.id} value={copy.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{copy.books?.title}</span>
                          <span className="text-xs text-gray-500">
                            Copy #{copy.copy_number} • {copy.barcode}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Student</label>
              <div className="relative mb-2">
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
                        {student.first_name} {student.last_name}
                        {student.student_id && ` (${student.student_id})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mb-2"
              />
              <Button 
                onClick={issueCopy} 
                disabled={loading || !selectedCopy || !selectedStudent || !dueDate}
                className="w-full"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Issue Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issued Copies Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Currently Issued Copies ({issuedCopies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issuedCopies.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BookCopy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No book copies currently issued</p>
              </div>
            ) : (
              issuedCopies.map((copy) => (
                <div 
                  key={copy.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{copy.books?.title}</h3>
                      <Badge variant="outline">Copy #{copy.copy_number}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Barcode: {copy.barcode} • ISBN: {copy.isbn}
                    </p>
                    {copy.borrowing_record && (
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Student: {copy.borrowing_record.profile?.first_name} {copy.borrowing_record.profile?.last_name}
                        </span>
                        <span>
                          Due: {new Date(copy.borrowing_record.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => returnCopy(copy.id, copy.borrowing_record?.id)} 
                    disabled={loading || !copy.borrowing_record}
                    variant="outline"
                    size="sm"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return
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

export default BookCopyIssueManager;
