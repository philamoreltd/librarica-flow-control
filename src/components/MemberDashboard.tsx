
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Calendar, Clock, AlertTriangle, Star, Bookmark, User, Mail, Phone } from "lucide-react";

const MemberDashboard = () => {
  const [memberData] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    memberId: "LIB2024001",
    memberSince: "March 2023",
    status: "Active",
    borrowingLimit: 5,
    currentBorrows: 2,
    totalBorrowed: 87,
    overdueFines: 0
  });

  const currentBorrows = [
    {
      id: 1,
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      borrowDate: "2024-01-15",
      dueDate: "2024-02-15",
      status: "Active",
      renewals: 0,
      maxRenewals: 2,
      cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=150"
    },
    {
      id: 2,
      title: "Dune",
      author: "Frank Herbert",
      borrowDate: "2024-01-20",
      dueDate: "2024-02-20",
      status: "Active",
      renewals: 1,
      maxRenewals: 2,
      cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=150"
    }
  ];

  const borrowHistory = [
    {
      id: 1,
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      borrowDate: "2023-12-01",
      returnDate: "2023-12-28",
      status: "Returned",
      rating: 5
    },
    {
      id: 2,
      title: "1984",
      author: "George Orwell",
      borrowDate: "2023-11-15",
      returnDate: "2023-12-10",
      status: "Returned",
      rating: 4
    },
    {
      id: 3,
      title: "Pride and Prejudice",
      author: "Jane Austen",
      borrowDate: "2023-10-20",
      returnDate: "2023-11-15",
      status: "Returned",
      rating: 5
    }
  ];

  const reservations = [
    {
      id: 1,
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      reservedDate: "2024-01-25",
      queuePosition: 2,
      estimatedAvailable: "2024-02-10",
      status: "Waiting"
    }
  ];

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return "bg-red-100 text-red-800";
    if (daysRemaining <= 3) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Dashboard</h1>
        <p className="text-gray-600">Welcome back, {memberData.name}!</p>
      </div>

      {/* Member Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Member Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Member ID</p>
              <p className="font-semibold">{memberData.memberId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold">{memberData.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-semibold">{memberData.memberSince}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <Badge className="bg-green-100 text-green-800">{memberData.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{memberData.currentBorrows}</p>
                <p className="text-sm text-gray-600">Current Borrows</p>
              </div>
            </div>
            <Progress 
              value={(memberData.currentBorrows / memberData.borrowingLimit) * 100} 
              className="mt-3"
            />
            <p className="text-xs text-gray-500 mt-1">
              {memberData.currentBorrows} of {memberData.borrowingLimit} limit used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{memberData.totalBorrowed}</p>
                <p className="text-sm text-gray-600">Total Borrowed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bookmark className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{reservations.length}</p>
                <p className="text-sm text-gray-600">Reservations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">${memberData.overdueFines}</p>
                <p className="text-sm text-gray-600">Overdue Fines</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Borrows</TabsTrigger>
          <TabsTrigger value="history">Borrowing History</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <div className="space-y-4">
            {currentBorrows.map((book) => {
              const daysRemaining = getDaysRemaining(book.dueDate);
              return (
                <Card key={book.id}>
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
                          </div>
                          <Badge className={getStatusColor(daysRemaining)}>
                            {daysRemaining < 0 
                              ? `${Math.abs(daysRemaining)} days overdue`
                              : daysRemaining === 0 
                              ? "Due today"
                              : `${daysRemaining} days left`
                            }
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <p className="font-medium">Borrowed</p>
                            <p>{new Date(book.borrowDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p>{new Date(book.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="font-medium">Renewals</p>
                            <p>{book.renewals} of {book.maxRenewals}</p>
                          </div>
                          <div>
                            <p className="font-medium">Status</p>
                            <p>{book.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            disabled={book.renewals >= book.maxRenewals}
                          >
                            Renew
                          </Button>
                          <Button size="sm" variant="outline">
                            Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {borrowHistory.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                      <p className="text-gray-600 mb-2">by {book.author}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Borrowed: {new Date(book.borrowDate).toLocaleDateString()}</span>
                        <span>Returned: {new Date(book.returnDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800 mb-2">{book.status}</Badge>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < book.rating 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reservations">
          <div className="space-y-4">
            {reservations.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                      <p className="text-gray-600 mb-2">by {book.author}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Reserved Date</p>
                          <p>{new Date(book.reservedDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="font-medium">Queue Position</p>
                          <p>#{book.queuePosition}</p>
                        </div>
                        <div>
                          <p className="font-medium">Estimated Available</p>
                          <p>{new Date(book.estimatedAvailable).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800 mb-2">{book.status}</Badge>
                      <div>
                        <Button size="sm" variant="outline">
                          Cancel Reservation
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberDashboard;
