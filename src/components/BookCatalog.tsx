
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, BookOpen, Star, Calendar, User } from "lucide-react";

const BookCatalog = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Sample book data
  const books = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      category: "Fiction",
      status: "Available",
      rating: 4.5,
      copies: 3,
      totalCopies: 5,
      description: "A classic American novel set in the Jazz Age.",
      publishYear: 1925,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      category: "Fiction",
      status: "Borrowed",
      rating: 4.8,
      copies: 0,
      totalCopies: 4,
      description: "A gripping tale of racial injustice and childhood innocence.",
      publishYear: 1960,
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300"
    },
    {
      id: 3,
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      category: "Science Fiction",
      status: "Available",
      rating: 4.7,
      copies: 2,
      totalCopies: 3,
      description: "A dystopian social science fiction novel.",
      publishYear: 1949,
      cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300"
    },
    {
      id: 4,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "978-0-316-76948-0",
      category: "Fiction",
      status: "Reserved",
      rating: 4.2,
      copies: 1,
      totalCopies: 2,
      description: "A controversial novel about teenage rebellion.",
      publishYear: 1951,
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
    },
    {
      id: 5,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0-14-143951-8",
      category: "Romance",
      status: "Available",
      rating: 4.6,
      copies: 4,
      totalCopies: 6,
      description: "A romantic novel of manners.",
      publishYear: 1813,
      cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300"
    },
    {
      id: 6,
      title: "Dune",
      author: "Frank Herbert",
      isbn: "978-0-441-17271-9",
      category: "Science Fiction",
      status: "Available",
      rating: 4.9,
      copies: 2,
      totalCopies: 4,
      description: "A science fiction masterpiece set on the desert planet Arrakis.",
      publishYear: 1965,
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300"
    }
  ];

  const categories = ["all", "Fiction", "Science Fiction", "Romance", "Non-Fiction", "Biography"];
  const statuses = ["all", "Available", "Borrowed", "Reserved"];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || book.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Borrowed":
        return "bg-red-100 text-red-800";
      case "Reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "All Status" : status}
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
        {filteredBooks.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <Badge className={getStatusColor(book.status)}>
                  {book.status}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span className="text-sm text-gray-600">{book.rating}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-1">
                    {book.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mb-1">by {book.author}</p>
                  <p className="text-xs text-gray-500">{book.category} • {book.publishYear}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {book.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">
                  {book.copies} of {book.totalCopies} available
                </span>
                <span className="text-xs text-gray-500">
                  ISBN: {book.isbn}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  disabled={book.status !== "Available"}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  {book.status === "Available" ? "Borrow" : book.status}
                </Button>
                <Button size="sm" variant="outline">
                  Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;
