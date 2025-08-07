
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Library, Search, Bell, User, Menu, X, QrCode, GraduationCap, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Header = ({ activeView, setActiveView }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: "home", label: "Home", icon: Library },
    { id: "catalog", label: "Catalog", icon: Search },
    { id: "student", label: "My Books", icon: GraduationCap },
    { id: "scanner", label: "Scanner", icon: QrCode },
    { id: "elearning", label: "eLearning", icon: GraduationCap },
    { id: "dashboard", label: "Staff Portal", icon: User },
    { id: "admin", label: "Admin", icon: Bell },
  ];

  const handleSignOut = async () => {
    await signOut();
    setActiveView("home");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

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
              <span className="text-2xl font-bold text-gray-900">Neolibrary</span>
              <div className="text-xs text-blue-600 font-medium">High School Edition</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "elearning") {
                    if (user) {
                      window.open("https://philamoreltd.github.io/e-Learning/Video%20and%20Animations.html", "_blank");
                    } else {
                      navigate('/auth');
                    }
                  } else {
                    setActiveView(item.id);
                  }
                }}
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
            
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                      <p className="text-xs text-blue-600 capitalize">{profile.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
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
                    if (item.id === "elearning") {
                      if (user) {
                        window.open("https://philamoreltd.github.io/e-Learning/Video%20and%20Animations.html", "_blank");
                      } else {
                        navigate('/auth');
                      }
                    } else {
                      setActiveView(item.id);
                    }
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
              {user && profile ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(profile.first_name, profile.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{profile.first_name} {profile.last_name}</p>
                      <p className="text-xs text-blue-600 capitalize">{profile.role}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
