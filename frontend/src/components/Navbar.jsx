import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, MessageCircle } from 'lucide-react';
import { Button } from 'components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';
import { useAuth } from 'context/AuthContext';
import logo from 'assets/logo.png';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/cars', label: 'Our Fleet' },
    { path: '/packages', label: 'Tour Packages' },
    { path: '/gallery', label: 'Our Gallery' },
    { path: '/contact', label: 'Contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/20" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="navbar-logo">
            <div className="w-12 h-12 overflow-hidden rounded-xl flex items-center justify-center bg-white shadow-sm border border-primary/10">
              <img src={logo} alt="Touraa Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <span className="font-serif text-2xl font-semibold text-primary tracking-tight">
              Touraa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {!isAdminPath && navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link font-medium ${isActive(link.path)
                  ? 'text-[#E67E22]'
                  : 'text-[#2C3E50] hover:text-[#1A4D2E]'
                  }`}
                data-testid={`nav-link-${link.label.toLowerCase().replace(' ', '-')}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {!isAdminPath && (
              <a
                href="https://wa.me/94755521921"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full px-4 py-2 border-[#1A4D2E]/20 hover:bg-[#1A4D2E]/5"
                    data-testid="user-menu-trigger"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isAdmin && !isAdminPath && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center text-[#E67E22] font-semibold">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center" data-testid="dashboard-link">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="logout-btn">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button
                  className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full px-6"
                  data-testid="login-btn"
                >
                  Login / Sign Up
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="mobile-menu-btn"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-[#1A4D2E]" />
            ) : (
              <Menu className="w-6 h-6 text-[#1A4D2E]" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-[#1A4D2E]/10" data-testid="mobile-menu">
            <div className="flex flex-col gap-4">
              {!isAdminPath && navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium py-2 ${isActive(link.path)
                    ? 'text-[#E67E22]'
                    : 'text-[#2C3E50]'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {isAdmin && !isAdminPath && (
                    <Link
                      to="/admin"
                      className="font-bold py-2 text-[#E67E22]"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="font-medium py-2 text-[#2C3E50]"
                    onClick={() => setIsOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="font-medium py-2 text-red-600 text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full">
                    Login / Sign Up
                  </Button>
                </Link>
              )}
              
              {!isAdminPath && (
                <a
                  href="https://wa.me/94755521921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white py-3 rounded-xl font-medium mt-2 shadow-sm"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
