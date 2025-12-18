
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BarcodeScanner from "@/components/BarcodeScanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookCatalogReal from "@/components/BookCatalogReal";
import StudentDashboard from "@/components/StudentDashboard";
import MemberDashboard from "@/components/MemberDashboard";
import AdminPanel from "@/components/AdminPanel";
import HomePage from "@/components/HomePage";
import BookManager from "@/components/BookManager";
import StudentManager from "@/components/StudentManager";
import LearningPage from "@/components/LearningPage";

const Index = () => {
  const [activeView, setActiveView] = useState("home");
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not authenticated and trying to access protected routes
  useEffect(() => {
    const protectedRoutes = ["student", "dashboard", "admin", "books", "students"];
    if (!loading && !user && protectedRoutes.includes(activeView)) {
      navigate('/auth');
    }
  }, [user, loading, activeView, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case "home":
        return <HomePage />;
      case "books":
        if (!user || !profile || !['librarian', 'admin'].includes(profile.role)) {
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You need librarian or admin privileges to access this area.</p>
            </div>
          );
        }
        return <BookManager />;
      case "students":
        if (!user || !profile || !['librarian', 'admin'].includes(profile.role)) {
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You need librarian or admin privileges to access this area.</p>
            </div>
          );
        }
        return <StudentManager />;
      case "catalog":
        return <BookCatalogReal />;
      case "student":
        if (!user) {
          navigate('/auth');
          return null;
        }
        return <StudentDashboard />;
      case "dashboard":
        if (!user || !profile || !['librarian', 'admin'].includes(profile.role)) {
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You need librarian or admin privileges to access this area.</p>
            </div>
          );
        }
        return <MemberDashboard />;
      case "admin":
        if (!user || !profile || profile.role !== 'admin') {
          return (
            <div className="container mx-auto px-4 py-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You need admin privileges to access this area.</p>
            </div>
          );
        }
        return <AdminPanel />;
      case "scanner":
        return <BarcodeScanner />;
      case "learning":
        return <LearningPage />;
      default:
        return <HomePage />;
    }
  };
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
