
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, TrendingUp, Star, Clock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFeaturedBooks } from "@/hooks/useFeaturedBooks";
import { useLibraryStats } from "@/hooks/useLibraryStats";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const { user, profile } = useAuth();
  const { featuredBooks, loading: booksLoading } = useFeaturedBooks();
  const { stats, loading: statsLoading } = useLibraryStats();
  const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Neolibrary</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your gateway to knowledge, discovery, and academic excellence. 
            Explore our comprehensive digital library designed specifically for high school students.
          </p>
          
          {user && profile ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Catalog
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Users className="mr-2 h-5 w-5" />
                My Dashboard
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 py-3" onClick={() => navigate('/auth')}>
                <BookOpen className="mr-2 h-5 w-5" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                <Users className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-100" />
              <h3 className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : stats.availableBooks.toLocaleString()}
              </h3>
              <p className="text-blue-100">Books Available</p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-100" />
              <h3 className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : stats.activeStudents.toLocaleString()}
              </h3>
              <p className="text-green-100">Active Students</p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <Award className="h-12 w-12 mx-auto mb-4 text-purple-100" />
              <h3 className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : stats.totalBooks.toLocaleString()}
              </h3>
              <p className="text-purple-100">Books in Catalogue</p>
            </CardContent>
          </Card>
          
          <Card className="text-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-orange-100" />
              <h3 className="text-3xl font-bold mb-2">
                {statsLoading ? '...' : stats.booksBorrowed.toLocaleString()}
              </h3>
              <p className="text-orange-100">Books Borrowed</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Books */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Books</h2>
          <p className="text-xl text-gray-600">Discover the most popular books in our collection</p>
        </div>
        
        {booksLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : featuredBooks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {featuredBooks.slice(0, 3).map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <img
                      src={book.cover_image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200"}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
                    <p className="text-gray-600 mb-3">by {book.author}</p>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{book.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm text-gray-600">{book.points} pts</span>
                      </div>
                      <Badge className={book.available_copies > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {book.available_copies > 0 ? `${book.available_copies} Available` : "Out of Stock"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button size="lg" variant="outline" onClick={() => navigate('/catalog')}>
                View All Books
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No featured books yet</h3>
            <p className="text-gray-600">Featured books will appear here once they are selected by librarians.</p>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Neolibrary?</h2>
          <p className="text-xl text-gray-600">Built specifically for the modern high school experience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>24/7 Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Access your digital library anytime, anywhere. Perfect for late-night study sessions and weekend research.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 mx-auto text-green-600 mb-4" />
              <CardTitle>Reading Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Earn points for every book you read and unlock achievements. Make reading fun and competitive!
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Connect with fellow readers, share reviews, and discover new books through our vibrant community.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12 text-center">
              <h2 className="text-4xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
              <p className="text-xl mb-8 text-blue-100">
                Join thousands of students who have already discovered the joy of reading with Neolibrary.
              </p>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={() => navigate('/auth')}>
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};

export default HomePage;
