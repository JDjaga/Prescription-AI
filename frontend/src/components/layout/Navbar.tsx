import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Menu, X, Beaker, UserCircle, Pill } from 'lucide-react';
import { supabase } from '../../supabaseClient';

// Define a type for the user object based on Supabase's user structure
type SupabaseUser = {
  id: string;
  email?: string;
  [key: string]: any;
} | null;

const Navbar = () => {
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<SupabaseUser>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const heroRef = React.useRef<HTMLElement | null>(null);

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll behavior and hero section observation
  useEffect(() => {
    const heroSection = document.querySelector('section[data-hero]') as HTMLElement | null;
    if (!heroSection) return;
    heroRef.current = heroSection;
    const observer = new IntersectionObserver(
      ([entry]) => setHideOnScroll(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, []);

  // Handle auth state
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      setIsAuthLoading(false);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthLoading(false);
    });

    // Cleanup for Supabase auth listener
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Handle scroll and route changes
  useEffect(() => {
    setIsMenuOpen(false); // Close menu on route change
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="w-full sticky top-0 z-50 transition-colors duration-300 p-0 m-0">
  {/* Subtle gray glow at bottom of navbar */}
  <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-full h-8 bg-gray-400 opacity-20 blur-2xl pointer-events-none z-0" />
      <div
        className={`rounded-2xl transition-all duration-300 ${
          hideOnScroll ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 pointer-events-auto translate-y-0'
        }`}
      >
        <div
          className={`transition-all duration-300 ease-in-out ${
            isScrolled
              ? 'bg-white/85 backdrop-blur-lg shadow-lg border border-white/80'
              : 'bg-transparent shadow-none rounded-2xl border-none'
          }`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 relative">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center h-full">
              <Link to="/" className="flex items-center group h-full">
                <div className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg transition-all duration-200 group-hover:shadow-[0_0_16px_4px_rgba(164,89,247,0.25)]">
  <Pill className="text-white w-7 h-7" />
</div>
                <span className="font-bold text-2xl text-gray-800">
                  MedASK <span className="text-purple-500">AI</span>
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link
                to="/"
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive('/')
                    ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-purple-100/60 hover:text-purple-700'
                }`}
              >
                Home
              </Link>
              <Link
                to={user ? "/upload" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive('/upload')
                    ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-purple-100/60 hover:text-purple-700'
                }`}
              >
                Upload
              </Link>
              <Link
                to={user ? "/journal" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive('/journal')
                    ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-purple-100/60 hover:text-purple-700'
                }`}
              >
                Journal
              </Link>
              <Link
                to={user ? "/chat" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive('/chat')
                    ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-purple-100/60 hover:text-purple-700'
                }`}
              >
                AI Chat
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  isActive('/about')
                    ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white font-medium shadow-sm'
                    : 'text-gray-700 hover:bg-purple-100/60 hover:text-purple-700'
                }`}
              >
                About
              </Link>
            </nav>

            {/* Mobile Hamburger and User Menu */}
            <div className="flex items-center ml-auto md:hidden">
              <button
                className={`flex items-center justify-center text-gray-700 hover:text-purple-600 transition-colors duration-200 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 text-2xl mr-2 ${
                  isMenuOpen ? 'bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 shadow-lg ring-2 ring-purple-400/50 text-white' : ''
                }`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-nav"
              >
                {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
              </button>
              {!isAuthLoading && user ? (
                <div className="relative">
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onClick={() => setShowUserMenu((s) => !s)}
                    aria-label="User menu"
                  >
                    <UserCircle className="w-7 h-7" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/60 py-2 z-[999] animate-fade-in transition-all duration-200">
                      <div className="px-4 py-2 text-gray-700 text-sm font-medium border-b border-gray-100">
                        {user.email ?? 'User'}
                      </div>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all rounded-xl"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all rounded-xl"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-600 hover:bg-purple-50/70 hover:text-purple-700 px-5 py-2 font-medium"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white hover:opacity-95 px-5 py-2 font-medium"
                    asChild
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center ml-auto">
              {!isAuthLoading && user ? (
                <div className="relative ml-4">
                  <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                    onClick={() => setShowUserMenu((s) => !s)}
                    aria-label="User menu"
                  >
                    <UserCircle className="w-7 h-7" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/60 py-2 z-[999] animate-fade-in transition-all duration-200">
                      <div className="px-4 py-2 text-gray-700 text-sm font-medium border-b border-gray-100">
                        {user.email ?? 'User'}
                      </div>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all rounded-xl"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-all rounded-xl"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    className="border-purple-400 text-purple-600 hover:bg-purple-50/70 hover:text-purple-700 px-5 py-2 font-medium"
                    asChild
                  >
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button
                    className="bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 text-white hover:opacity-95 px-5 py-2 font-medium"
                    asChild
                  >
                    <Link to="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[999] backdrop-blur-sm bg-black/40 flex justify-end animate-fade-in md:hidden">
          <div className="w-4/5 max-w-xs bg-white/90 backdrop-blur-2xl shadow-2xl h-full flex flex-col p-6 animate-slide-in-right rounded-l-2xl border-l-4 border-purple-500">
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={28} className="text-gray-700" />
            </button>
            <nav className="flex flex-col space-y-3 mt-12">
              <Link
                to="/"
                className={`py-2 px-4 rounded-md font-medium text-gray-800 hover:bg-purple-100/70 transition ${
                  isActive('/') ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to={user ? "/upload" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`py-2 px-4 rounded-md font-medium text-gray-800 hover:bg-purple-100/70 transition ${
                  isActive('/upload') ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                Upload
              </Link>
              <Link
                to={user ? "/journal" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`py-2 px-4 rounded-md font-medium text-gray-800 hover:bg-purple-100/70 transition ${
                  isActive('/journal') ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                Journal
              </Link>
              <Link
                to={user ? "/chat" : "/getstarted"}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault();
                    navigate('/getstarted');
                  }
                }}
                className={`py-2 px-4 rounded-md font-medium text-gray-800 hover:bg-purple-100/70 transition ${
                  isActive('/chat') ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                AI Chat
              </Link>
              <Link
                to="/about"
                className={`py-2 px-4 rounded-md font-medium text-gray-800 hover:bg-purple-100/70 transition ${
                  isActive('/about') ? 'bg-purple-100 text-purple-700' : ''
                }`}
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;