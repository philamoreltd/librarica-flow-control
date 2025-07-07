
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Clock, Star, Bookmark, User, Bell, QrCode } from "lucide-react";

const StudentDashboard = () => {
  const [studentData] = useState({
    name: "Alex Johnson",
    studentId: "HS2024-1847",
    grade: "11th Grade",
    email: "alex.johnson@highschool.edu",
    status: "Active",
    borrowingLimit: 3,
    currentBorrows: 2,
    totalBorrowed: 24,
    readingPoints: 145,
    level: "Bookworm"
  });

  const currentBorrows = [
    {
      id: 1,
      title: "The Hunger Games",
      author: "Suzanne Collins",
      borrowDate: "2024-01-15",
      dueDate: "2024-02-15",
      daysLeft: 8,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150",
      genre: "Dystopian Fiction"
    },
    {
      id: 2,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      borrowDate: "2024-01-20",
      dueDate: "2024-02-20",
      daysLeft: 13,
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=150",
      genre: "Classic Literature"
    }
  ];

  const recommendations = [
    {
      title: "The Maze Runner",
      author: "James Dashner",
      reason: "Similar to The Hunger Games",
      rating: 4.5,
      available: true
    },
    {
      title: "Divergent",
      author: "Veronica Roth",
      reason: "Popular dystopian series",
      rating: 4.3,
      available: false
    },
    {
      title: "Wonder",
      author: "R.J. Palacio",
      reason: "Trending in your grade",
      rating: 4.8,
      available: true
    }
  ];

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft <= 3) return "bg-red-100 text-red-800";
    if (daysLeft <= 7) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hey {studentData.name.split(' ')[0]}! 👋</h1>
        <p className="text-gray-600">Ready to discover your next great read?</p>
      </div>

      {/* Student Info Card */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Student Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Student ID</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{studentData.studentId}</p>
                <QrCode className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Grade</p>
              <p className="font-semibold">{studentData.grade}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Reading Level</p>
              <Badge className="bg-purple-100 text-purple-800">{studentData.level}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Reading Points</p>
              <p className="font-semibold text-purple-600">{studentData.readingPoints} pts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{studentData.currentBorrows}</p>
                <p className="text-blue-100">Books Checked Out</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-200" />
            </div>
            <Progress 
              value={(studentData.currentBorrows / studentData.borrowingLimit) * 100} 
              className="mt-3 bg-blue-400"
            />
            <p className="text-xs text-blue-100 mt-1">
              {studentData.borrowingLimit - studentData.currentBorrows} more books available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{studentData.totalBorrowed}</p>
                <p className="text-green-100">Books Read This Year</p>
              </div>
              <Star className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{studentData.readingPoints}</p>
                <p className="text-purple-100">Reading Points</p>
              </div>
              <Bookmark className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">My Books</TabsTrigger>
          <TabsTrigger value="recommendations">For You</TabsTrigger>
          <TabsTrigger value="history">Reading History</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="space-y-4">
            {currentBorrows.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No books checked out</h3>
                  <p className="text-gray-600 mb-4">Browse our catalog to find your next great read!</p>
                  <Button>Browse Books</Button>
                </CardContent>
              </Card>
            ) : (
              currentBorrows.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{book.title}</h3>
                            <p className="text-gray-600">by {book.author}</p>
                            <Badge variant="outline" className="mt-1">{book.genre}</Badge>
                          </div>
                          <Badge className={getStatusColor(book.daysLeft)}>
                            {book.daysLeft > 0 ? `${book.daysLeft} days left` : "Overdue"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p className="font-medium">Checked Out</p>
                            <p>{new Date(book.borrowDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p>{new Date(book.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Renew</Button>
                          <Button size="sm" variant="outline">Return</Button>
                          <Button size="sm" variant="outline">
                            <Bell className="h-4 w-4 mr-1" />
                            Remind Me
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="recommendations">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">📚 Books We Think You'll Love</h3>
            {recommendations.map((book, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                      <p className="text-gray-600 mb-2">by {book.author}</p>
                      <p className="text-sm text-blue-600 mb-2">💡 {book.reason}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${
                                i < Math.floor(book.rating) 
                                  ? "text-yellow-400 fill-current" 
                                  : "text-gray-300"
                              }`} 
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">{book.rating}</span>
                        </div>
                        <Badge className={book.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {book.available ? "Available" : "Reserved"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button size="sm" disabled={!book.available}>
                        {book.available ? "Check Out" : "Reserve"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Your Reading Journey 📖</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reading history coming soon!</h3>
                <p className="text-gray-600">Track your reading progress and earn points for completed books.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
