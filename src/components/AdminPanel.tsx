
import { useState, useEffect } from "react";
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
  Clock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  GraduationCap,
  Building2,
  UserCheck
} from "lucide-react";
import { BulkImport } from "./BulkImport";
import BookManager from "./BookManager";
import StudentManager from "./StudentManager";
import CheckInOutManager from "./CheckInOutManager";
import BookCopyIssueManager from "./BookCopyIssueManager";
import { DepartmentManager } from "./DepartmentManager";
import { StaffManagement } from "./StaffManagement";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const getRoleBadgeConfig = (role: string | null | undefined) => {
  switch (role) {
    case 'super_admin':
      return {
        label: 'Super Admin',
        icon: ShieldCheck,
        className: 'bg-purple-100 text-purple-800 border-purple-300',
        description: 'Full system access'
      };
    case 'admin':
      return {
        label: 'Admin',
        icon: Shield,
        className: 'bg-blue-100 text-blue-800 border-blue-300',
        description: 'Administrative access'
      };
    case 'department_admin':
      return {
        label: 'Department Admin',
        icon: ShieldAlert,
        className: 'bg-amber-100 text-amber-800 border-amber-300',
        description: 'Department-level access'
      };
    case 'librarian':
      return {
        label: 'Librarian',
        icon: BookOpen,
        className: 'bg-green-100 text-green-800 border-green-300',
        description: 'Operational access'
      };
    default:
      return {
        label: 'User',
        icon: User,
        className: 'bg-gray-100 text-gray-800 border-gray-300',
        description: 'Limited access'
      };
  }
};

interface RealTimeStats {
  totalUsers: number;
  totalStudents: number;
  totalBooks: number;
  totalDepartments: number;
  booksBorrowed: number;
  overdueItems: number;
  studentsByGrade: Record<string, number>;
}

const AdminPanel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const permissions = usePermissions();
  const { profile } = useAuth();
  const roleBadge = getRoleBadgeConfig(profile?.role);
  const [realStats, setRealStats] = useState<RealTimeStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalBooks: 0,
    totalDepartments: 0,
    booksBorrowed: 0,
    overdueItems: 0,
    studentsByGrade: {},
  });

  const fetchRealStats = async () => {
    try {
      const [usersRes, studentsRes, booksRes, deptsRes, borrowedRes, overdueRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('grade_level').eq('role', 'student'),
        supabase.from('books').select('*', { count: 'exact', head: true }),
        supabase.from('departments').select('*', { count: 'exact', head: true }),
        supabase.from('borrowing_records').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('borrowing_records').select('*', { count: 'exact', head: true }).eq('status', 'active').lt('due_date', new Date().toISOString()),
      ]);

      const studentsByGrade: Record<string, number> = {};
      (studentsRes.data || []).forEach((s: any) => {
        const grade = s.grade_level || 'Unassigned';
        studentsByGrade[grade] = (studentsByGrade[grade] || 0) + 1;
      });

      setRealStats({
        totalUsers: usersRes.count || 0,
        totalStudents: studentsRes.data?.length || 0,
        totalBooks: booksRes.count || 0,
        totalDepartments: deptsRes.count || 0,
        booksBorrowed: borrowedRes.count || 0,
        overdueItems: overdueRes.count || 0,
        studentsByGrade,
      });
    } catch (error) {
      console.error('Error fetching real stats:', error);
    }
  };

  useEffect(() => {
    fetchRealStats();

    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchRealStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'books' }, () => fetchRealStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'borrowing_records' }, () => fetchRealStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => fetchRealStats())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Comprehensive library management and analytics</p>
        </div>
        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border shadow-sm">
          <div className={`p-2 rounded-full ${roleBadge.className}`}>
            <roleBadge.icon className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <Badge variant="outline" className={`${roleBadge.className} border font-semibold`}>
              {roleBadge.label}
            </Badge>
            <span className="text-xs text-muted-foreground mt-1">{roleBadge.description}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/50">
              <GraduationCap className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary">
              <BookOpen className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.totalBooks}</p>
              <p className="text-xs text-muted-foreground">Total Books</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.totalDepartments}</p>
              <p className="text-xs text-muted-foreground">Schools</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-accent/50">
              <Calendar className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.booksBorrowed}</p>
              <p className="text-xs text-muted-foreground">Books Out</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{realStats.overdueItems}</p>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Per-Class Breakdown */}
      {Object.keys(realStats.studentsByGrade).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {Object.entries(realStats.studentsByGrade)
            .sort(([a], [b]) => a === 'Unassigned' ? 1 : b === 'Unassigned' ? -1 : a.localeCompare(b))
            .map(([grade, count]) => (
              <Card key={grade}>
                <CardContent className="p-3 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-lg font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">{grade}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${
          [
            permissions.canViewOverview,
            permissions.canManageBooks,
            permissions.canManageStudents,
            permissions.canManageDepartments,
            permissions.canManageCheckInOut,
            permissions.canManageIssueCopies,
            permissions.canManageStaff,
            permissions.canViewOverdue,
            permissions.canViewAnalytics,
            permissions.canBulkImport
          ].filter(Boolean).length
        }, minmax(0, 1fr))` }}>
          {permissions.canViewOverview && <TabsTrigger value="overview">Overview</TabsTrigger>}
          {permissions.canManageBooks && <TabsTrigger value="books">Books</TabsTrigger>}
          {permissions.canManageStudents && <TabsTrigger value="students">Students</TabsTrigger>}
          {permissions.canManageDepartments && <TabsTrigger value="departments">Departments</TabsTrigger>}
          {permissions.canManageCheckInOut && <TabsTrigger value="check-in-out">Check In/Out</TabsTrigger>}
          {permissions.canManageIssueCopies && <TabsTrigger value="issue-copies">Issue Copies</TabsTrigger>}
          {permissions.canManageStaff && <TabsTrigger value="staff">Staff Management</TabsTrigger>}
          {permissions.canViewOverdue && <TabsTrigger value="overdue">Overdue Items</TabsTrigger>}
          {permissions.canViewAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          {permissions.canBulkImport && <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>}
        </TabsList>

        {permissions.canViewOverview && (
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
        )}

        {permissions.canManageBooks && (
          <TabsContent value="books">
            <BookManager />
          </TabsContent>
        )}

        {permissions.canManageStudents && (
          <TabsContent value="students">
            <StudentManager />
          </TabsContent>
        )}

        {permissions.canManageDepartments && (
          <TabsContent value="departments">
            <DepartmentManager />
          </TabsContent>
        )}

        {permissions.canManageCheckInOut && (
          <TabsContent value="check-in-out">
            <CheckInOutManager />
          </TabsContent>
        )}

        {permissions.canManageIssueCopies && (
          <TabsContent value="issue-copies">
            <BookCopyIssueManager />
          </TabsContent>
        )}

        {permissions.canManageStaff && (
          <TabsContent value="staff">
            <StaffManagement />
          </TabsContent>
        )}

        {permissions.canViewOverdue && (
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
        )}

        {permissions.canViewAnalytics && (
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
        )}

        {permissions.canBulkImport && (
          <TabsContent value="bulk-import">
            <BulkImport />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AdminPanel;
