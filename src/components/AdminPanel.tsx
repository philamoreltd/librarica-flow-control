
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  Plus,
  Search,
  Calendar,
  DollarSign,
  Clock
} from "lucide-react";
import { BulkImport } from "./BulkImport";
import BookManager from "./BookManager";
import StudentManager from "./StudentManager";
import CheckInOutManager from "./CheckInOutManager";

const AdminPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data for admin dashboard
  const stats = [
    { label: "Total Books", value: "15,247", change: "+2.5%", icon: BookOpen, color: "bg-blue-500" },
    { label: "Active Members", value: "2,847", change: "+5.2%", icon: Users, color: "bg-green-500" },
    { label: "Books Checked Out", value: "1,456", change: "-1.2%", icon: Calendar, color: "bg-purple-500" },
    { label: "Overdue Items", value: "23", change: "-15.3%", icon: AlertTriangle, color: "bg-red-500" },
    { label: "Monthly Revenue", value: "$4,250", change: "+8.7%", icon: DollarSign, color: "bg-yellow-500" },
    { label: "Avg. Checkout Time", value: "14 days", change: "+0.5%", icon: Clock, color: "bg-indigo-500" },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: "Checkout",
      member: "John Smith",
      book: "The Great Gatsby",
      date: "2024-01-25 14:30",
      status: "Completed"
    },
    {
      id: 2,
      type: "Return",
      member: "Sarah Johnson",
      book: "To Kill a Mockingbird",
      date: "2024-01-25 13:15",
      status: "Completed"
    },
    {
      id: 3,
      type: "Reservation",
      member: "Mike Wilson",
      book: "1984",
      date: "2024-01-25 12:45",
      status: "Active"
    },
    {
      id: 4,
      type: "Fine Payment",
      member: "Emily Davis",
      book: "Pride and Prejudice",
      date: "2024-01-25 11:20",
      status: "Paid"
    }
  ];

  const overdueItems = [
    {
      id: 1,
      member: "Robert Brown",
      book: "Dune",
      dueDate: "2024-01-15",
      daysOverdue: 10,
      fine: 5.00,
      contact: "robert.brown@email.com"
    },
    {
      id: 2,
      member: "Lisa Garcia",
      book: "The Catcher in the Rye",
      dueDate: "2024-01-18",
      daysOverdue: 7,
      fine: 3.50,
      contact: "lisa.garcia@email.com"
    },
    {
      id: 3,
      member: "David Martinez",
      book: "Brave New World",
      dueDate: "2024-01-20",
      daysOverdue: 5,
      fine: 2.50,
      contact: "david.martinez@email.com"
    }
  ];

  const popularBooks = [
    { title: "The Great Gatsby", checkouts: 45, waitlist: 3 },
    { title: "To Kill a Mockingbird", checkouts: 38, waitlist: 5 },
    { title: "1984", checkouts: 35, waitlist: 8 },
    { title: "Pride and Prejudice", checkouts: 32, waitlist: 2 },
    { title: "Dune", checkouts: 28, waitlist: 6 }
  ];

  const getTransactionBadgeColor = (type: string) => {
    switch (type) {
      case "Checkout":
        return "bg-blue-100 text-blue-800";
      case "Return":
        return "bg-green-100 text-green-800";
      case "Reservation":
        return "bg-yellow-100 text-yellow-800";
      case "Fine Payment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Comprehensive library management and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="check-in-out">Check In/Out</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="overdue">Overdue Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button size="sm" variant="outline">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getTransactionBadgeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm">{transaction.member}</p>
                        <p className="text-xs text-gray-600">{transaction.book}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                        <p className="text-xs font-medium">{transaction.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Books */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Books This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularBooks.map((book, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{book.title}</p>
                        <p className="text-xs text-gray-600">
                          {book.checkouts} checkouts • {book.waitlist} on waitlist
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">#{index + 1}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="books">
          <BookManager />
        </TabsContent>

        <TabsContent value="students">
          <StudentManager />
        </TabsContent>

        <TabsContent value="check-in-out">
          <CheckInOutManager />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Transactions</CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Badge className={getTransactionBadgeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{transaction.member}</p>
                        <p className="text-sm text-gray-600">{transaction.book}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                      <p className="text-sm font-medium">{transaction.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Overdue Items ({overdueItems.length})
              </CardTitle>
              <Button size="sm">
                Send Reminders
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium">{item.member}</p>
                        <Badge className="bg-red-100 text-red-800">
                          {item.daysOverdue} days overdue
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{item.book}</p>
                      <p className="text-xs text-gray-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()} • Contact: {item.contact}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">${item.fine.toFixed(2)}</p>
                      <div className="flex gap-1 mt-2">
                        <Button size="sm" variant="outline">
                          Contact
                        </Button>
                        <Button size="sm">
                          Collect Fine
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                  Monthly Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span className="text-sm font-medium">Total Checkouts</span>
                    <span className="text-lg font-bold text-blue-600">1,456</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span className="text-sm font-medium">New Members</span>
                    <span className="text-lg font-bold text-green-600">89</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span className="text-sm font-medium">Revenue Generated</span>
                    <span className="text-lg font-bold text-purple-600">$4,250</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded">
                    <span className="text-sm font-medium">Books Added</span>
                    <span className="text-lg font-bold text-orange-600">127</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database Performance</span>
                    <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Storage Usage</span>
                    <Badge className="bg-yellow-100 text-yellow-800">75% Used</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Sessions</span>
                    <Badge className="bg-blue-100 text-blue-800">342 Users</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <Badge className="bg-green-100 text-green-800">2 hours ago</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk-import">
          <BulkImport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
