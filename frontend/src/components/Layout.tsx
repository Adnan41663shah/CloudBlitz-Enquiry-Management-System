import React, { type ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Users, 
  LogOut, 
  Menu,
  X,
  Sparkles,
  Bell,
  Settings,
  Search
} from 'lucide-react';
import { getInitials } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Enquiries', href: '/enquiries', icon: FileText },
    { name: 'New Enquiry', href: '/enquiries/new', icon: Plus },
  ];

  if (user?.role === 'admin') {
    navigation.push({ name: 'Users', href: '/users', icon: Users });
  }

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;
    
    return (
      <Link
        to={item.href}
        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isActive
            ? 'bg-gradient-to-br from-primary via-purple-900 to-blue-600 text-white shadow-xl shadow-primary/30'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:scale-105 active:scale-95'
        }`}
        onClick={() => setSidebarOpen(false)}
      >
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-blue-600/20 animate-pulse" />
        )}
        <Icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
        <span className="relative">{item.name}</span>
        {isActive && (
          <div className="absolute right-3 h-2 w-2 bg-white rounded-full animate-ping" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 transition-all duration-500 flex flex-col lg:flex-row">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-in-out" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out lg:translate-x-0 lg:relative lg:shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200/60">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
                <Sparkles className="h-6 w-6 text-white transition-all duration-300 group-hover:rotate-12" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  CloudBlitz
                </h1>
                <p className="text-xs text-muted-foreground">Enquiry System</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden h-9 w-9 rounded-full hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="px-4 py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-100/80 border-0 focus:ring-2 focus:ring-primary/30 transition-all duration-300 placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            {navigation.map((item, index) => (
              <div 
                key={item.name} 
                className="transition-all duration-500 ease-in-out" 
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(20px)'
                }}
              >
                <NavLink item={item} />
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-slate-200/60 p-4">
            <div className="flex items-center space-x-3 mb-4 p-2 rounded-xl hover:bg-slate-100/80 transition-all duration-300">
              <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary font-bold">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <Badge 
              variant={user?.role === 'admin' ? 'default' : user?.role === 'staff' ? 'info' : 'secondary'}
              className="w-full justify-center mb-4 py-1.5 text-xs font-medium uppercase tracking-wider"
            >
              {user?.role?.toUpperCase()}
            </Badge>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full justify-start hover:border-red-500/30 hover:text-red-600 transition-all duration-300"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 transition-all duration-500">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-9 w-9 rounded-full hover:bg-slate-100"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.name?.split(' ')[0]}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-slate-100">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold">3</span>
              </Button>
              <div className="h-8 w-px bg-slate-200/60"></div>
              <Avatar className="h-9 w-9 border-2 border-primary/20 cursor-pointer hover:scale-105 transition-transform duration-300">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary font-bold text-xs">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl">
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
