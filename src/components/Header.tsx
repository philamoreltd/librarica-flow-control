
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Library, Search, Bell, User, Menu, X, QrCode, GraduationCap } from "lucide-react";

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Header = ({ activeView, setActiveView }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Library },
    { id: "catalog", label: "Catalog", icon: Search },
    { id: "student", label: "My Books", icon: GraduationCap },
    { id: "scanner", label: "Scanner", icon: QrCode },
    { id: "dashboard", label: "Staff Portal", icon: User },
    { id: "admin", label: "Admin", icon: Bell },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setActiveView("home")}
          >
            <Library className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <span className="text-2xl font-bold text-gray-900">Librarica</span>
              <div className="text-xs text-blue-600 font-medium">High School Edition</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search books, authors..."
                className="pl-10 pr-4 w-64"
              />
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 flex items-center justify-center rounded-full p-0">
                2
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t">
              <Input
                placeholder="Search books, authors..."
                className="mb-3"
              />
              <Button variant="outline" size="sm" className="w-full">
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
