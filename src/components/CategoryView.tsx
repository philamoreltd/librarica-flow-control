import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Package, Copy, Eye } from "lucide-react";
import { useBookCopies } from "@/hooks/useBookCopies";
import { useState } from "react";
import { useBarcode } from "@/hooks/useBarcode";

const CategoryView = () => {
  const { category: categorySlug } = useParams<{ category: string }>();
  const navigate = useNavigate();
  
  // Convert URL slug back to category name
  const category = categorySlug?.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const { books, loading } = useBookCopies(category);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const { generateBookCopyBarcode } = useBarcode();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'borrowed':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewBarcode = async (copy: any) => {
    try {
      const barcodeDataURL = await generateBookCopyBarcode(copy.barcode, '');
      if (barcodeDataURL) {
        // Open barcode in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Barcode - ${copy.barcode}</title></head>
              <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
                <h2>Copy #${copy.copy_number}</h2>
                <img src="${barcodeDataURL}" alt="Barcode ${copy.barcode}" style="margin: 20px 0;" />
                <p><strong>Barcode:</strong> ${copy.barcode}</p>
                <p><strong>Status:</strong> ${copy.status}</p>
                ${copy.notes ? `<p><strong>Notes:</strong> ${copy.notes}</p>` : ''}
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    } catch (error) {
      console.error('Error generating barcode:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Catalog
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {category || 'All Books'}
        </h1>
        <p className="text-muted-foreground">
          Browse individual copies and their details
        </p>
      </div>

      <div className="space-y-6">
        {books.map((book) => (
          <Card key={book.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex gap-4">
                <img
                  src={book.cover_image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300"}
                  alt={book.title}
                  className="w-20 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{book.title}</CardTitle>
                  <p className="text-muted-foreground mb-1">by {book.author}</p>
                  <p className="text-sm text-muted-foreground mb-2">
                    {book.category} • {book.grade_level}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {book.description}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="mb-2">
                    {book.book_copies?.length || 0} copies
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {book.points} points
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedBook(selectedBook === book.id ? null : book.id)}
                className="w-fit"
              >
                <Package className="h-4 w-4 mr-2" />
                {selectedBook === book.id ? 'Hide Copies' : 'View Copies'}
              </Button>
            </CardHeader>
            
            {selectedBook === book.id && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Copy className="h-4 w-4 mr-2" />
                    Book Copies ({book.book_copies?.length || 0})
                  </h4>
                  
                  {book.book_copies && book.book_copies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {book.book_copies.map((copy) => (
                        <Card key={copy.id} className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium">Copy #{copy.copy_number}</span>
                            <Badge className={getStatusColor(copy.status)}>
                              {copy.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Barcode:</strong> {copy.barcode}
                          </p>
                          {copy.notes && (
                            <p className="text-sm text-muted-foreground mb-2">
                              <strong>Notes:</strong> {copy.notes}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewBarcode(copy)}
                              className="flex-1"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View Barcode
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      No copies available for this book.
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            No books found in this category
          </h3>
          <p className="text-muted-foreground">
            This category doesn't contain any books yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;