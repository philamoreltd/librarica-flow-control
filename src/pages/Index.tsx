
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Book, Users, BarChart3, Clock, Search, BookOpen, Library, User } from "lucide-react";
import Header from "@/components/Header";
import BookCatalog from "@/components/BookCatalog";
import MemberDashboard from "@/components/MemberDashboard";
import AdminPanel from "@/components/AdminPanel";
import Footer from "@/components/Footer";

const Index = () => {
  const [activeView, setActiveView] = useState("home");

  const renderContent = () => {
    switch (activeView) {
      case "catalog":
        return <BookCatalog />;
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
    { label: "Total Books", value: "15,247", icon: Book, color: "bg-blue-500" },
    { label: "Active Members", value: "2,847", icon: Users, color: "bg-green-500" },
    { label: "Books Borrowed Today", value: "156", icon: BookOpen, color: "bg-purple-500" },
    { label: "Overdue Items", value: "23", icon: Clock, color: "bg-red-500" },
  ];

  const features = [
    {
      title: "Digital Catalog",
      description: "Browse our extensive collection with advanced search and filters",
      icon: Search,
      action: () => setActiveView("catalog")
    },
    {
      title: "Member Portal",
      description: "Track your borrowing history, renewals, and reservations",
      icon: User,
      action: () => setActiveView("dashboard")
    },
    {
      title: "Admin Dashboard",
      description: "Comprehensive tools for library staff and administrators",
      icon: BarChart3,
      action: () => setActiveView("admin")
    }
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center py-16 mb-12">
        <div className="flex items-center justify-center mb-6">
          <Library className="h-16 w-16 text-blue-600 mr-4" />
          <h1 className="text-5xl font-bold text-gray-900">Librarica</h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          A comprehensive library management system that streamlines book cataloging, 
          member registration, and borrowing processes for institutions of all sizes.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setActiveView("catalog")}
          >
            Browse Catalog
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setActiveView("dashboard")}
          >
            Member Login
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((feature, index) => (
          <Card key={index} className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={feature.action}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
              <CardDescription className="text-gray-600">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Recent Library Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">The Great Gatsby borrowed by John Smith</p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
              <Badge variant="secondary">Borrowed</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">To Kill a Mockingbird returned by Sarah Johnson</p>
                <p className="text-sm text-gray-600">4 hours ago</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Returned</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">New member registration: Mike Wilson</p>
                <p className="text-sm text-gray-600">6 hours ago</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">New Member</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Index;
