
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BookOpen, Star, Calendar, User } from "lucide-react";
import { useBooks } from "@/hooks/useBooks";
import { useAuth } from "@/hooks/useAuth";

const BookCatalogReal = () => {
  const { books, loading, borrowBook, reserveBook } = useBooks();
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", ...Array.from(new Set(books.map(book => book.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusInfo = (book: any) => {
    if (book.available_copies > 0) {
      return { status: "Available", color: "bg-green-100 text-green-800" };
    } else {
      return { status: "Borrowed", color: "bg-red-100 text-red-800" };
    }
  };

  const handleBorrowBook = async (bookId: string) => {
    if (!user) return;
    await borrowBook(bookId, user.id);
  };

  const handleReserveBook = async (bookId: string) => {
    if (!user) return;
    await reserveBook(bookId, user.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Catalog</h1>
        <p className="text-gray-600">Discover and borrow from our extensive collection</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </p>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map((book) => {
          const statusInfo = getStatusInfo(book);
          return (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge className={statusInfo.color}>
                    {statusInfo.status}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-sm text-gray-600">4.5</span>
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
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">
                    {book.available_copies} of {book.total_copies} available
                  </span>
                  <span className="text-xs text-gray-500">
                    {book.points} pts
                  </span>
                </div>
                <div className="flex gap-2">
                  {book.available_copies > 0 ? (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBorrowBook(book.id)}
                      disabled={!user}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Borrow
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleReserveBook(book.id)}
                      disabled={!user}
                    >
                      Reserve
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {!user && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-center">
            <User className="h-4 w-4 inline mr-2" />
            Please sign in to borrow or reserve books
          </p>
        </div>
      )}
    </div>
  );
};

export default BookCatalogReal;
