
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Users, BarChart3, Clock, Search, BookOpen, Library, User, GraduationCap, QrCode } from "lucide-react";
import Header from "@/components/Header";
import BookCatalog from "@/components/BookCatalog";
import MemberDashboard from "@/components/MemberDashboard";
import StudentDashboard from "@/components/StudentDashboard";
import BarcodeScanner from "@/components/BarcodeScanner";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeView, setActiveView] = useState("home");

  const renderContent = () => {
    switch (activeView) {
      case "catalog":
        return <BookCatalog />;
      case "student":
        return <StudentDashboard />;
      case "scanner":
        return <BarcodeScanner />;
      case "dashboard":
        return <MemberDashboard />;
      case "admin":
        return <AdminPanel />;
      default:
        return <HomePage setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header activeView={activeView} setActiveView={setActiveView} />
      {renderContent()}
      <Footer />
    </div>
  );
};

const HomePage = ({ setActiveView }: { setActiveView: (view: string) => void }) => {
  const stats = [
    { label: "Total Books", value: "8,247", icon: Book, color: "bg-blue-500", description: "Physical & Digital" },
    { label: "Active Students", value: "1,847", icon: GraduationCap, color: "bg-green-500", description: "Grades 9-12" },
    { label: "Books Out Today", value: "156", icon: BookOpen, color: "bg-purple-500", description: "Currently borrowed" },
    { label: "Overdue Items", value: "12", icon: Clock, color: "bg-orange-500", description: "Need attention" },
  ];

  const features = [
    {
      title: "Browse Books",
      description: "Search our digital catalog with filters for grade level and subject",
      icon: Search,
      action: () => setActiveView("catalog"),
      highlight: "🔍 Advanced Search"
    },
    {
      title: "My Books",
      description: "Track your reading, renewals, and discover personalized recommendations",
      icon: GraduationCap,
      action: () => setActiveView("student"),
      highlight: "📚 Student Portal"
    },
    {
      title: "Quick Scanner",
      description: "Fast barcode scanning for student IDs and book checkout/returns",
      icon: QrCode,
      action: () => setActiveView("scanner"),
      highlight: "⚡ Fast Checkout"
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-16 mb-12">
        <div className="flex items-center justify-center mb-6">
          <Library className="h-16 w-16 text-blue-600 mr-4" />
          <div>
            <h1 className="text-5xl font-bold text-gray-900">Neolibrary</h1>
            <p className="text-lg text-blue-600 font-medium">High School Library System</p>
          </div>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Your gateway to knowledge! Discover books, track your reading journey, and earn points 
          while exploring our extensive collection designed for students aged 12-18.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setActiveView("catalog")}
          >
            🔍 Browse Books
          </Button>
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setActiveView("student")}
          >
            📚 My Books
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setActiveView("scanner")}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Quick Scan
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white mr-4`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50" onClick={feature.action}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <Badge className="mx-auto bg-blue-600 text-white">{feature.highlight}</Badge>
              <CardDescription className="text-gray-600">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Student Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
              📈 Reading Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
                  <div>
                    <p className="font-medium">Emma Davis - 11th Grade</p>
                    <p className="text-sm text-gray-600">24 books this semester</p>
                  </div>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">🏆 Champion</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
                  <div>
                    <p className="font-medium">Alex Johnson - 11th Grade</p>
                    <p className="text-sm text-gray-600">22 books this semester</p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">🥈 Runner-up</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">3</div>
                  <div>
                    <p className="font-medium">Marcus Chen - 10th Grade</p>
                    <p className="text-sm text-gray-600">19 books this semester</p>
                  </div>
                </div>
                <Badge className="bg-orange-100 text-orange-800">🥉 Bronze</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-green-600" />
              📚 Popular This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">The Hunger Games</p>
                  <p className="text-sm text-gray-600">Suzanne Collins • Dystopian Fiction</p>
                </div>
                <Badge className="bg-red-100 text-red-800">🔥 Hot</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Wonder</p>
                  <p className="text-sm text-gray-600">R.J. Palacio • Contemporary Fiction</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">📈 Trending</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">The Hate U Give</p>
                  <p className="text-sm text-gray-600">Angie Thomas • Contemporary YA</p>
                </div>
                <Badge className="bg-green-100 text-green-800">⭐ Top Rated</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access for Staff */}
      <Card className="bg-gradient-to-r from-slate-100 to-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-slate-600" />
            Staff Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col bg-white hover:bg-slate-50"
              onClick={() => setActiveView("scanner")}
            >
              <QrCode className="h-6 w-6 mb-2 text-blue-600" />
              <span className="font-medium">Barcode Scanner</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col bg-white hover:bg-slate-50"
              onClick={() => setActiveView("dashboard")}
            >
              <User className="h-6 w-6 mb-2 text-green-600" />
              <span className="font-medium">Staff Portal</span>
            </Button>
            <Button 
              variant="outline" 
              className="p-4 h-auto flex-col bg-white hover:bg-slate-50"
              onClick={() => setActiveView("admin")}
            >
              <BarChart3 className="h-6 w-6 mb-2 text-purple-600" />
              <span className="font-medium">Admin Panel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Index;
