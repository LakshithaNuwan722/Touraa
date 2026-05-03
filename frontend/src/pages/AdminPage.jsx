import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Car,
    MapPin,
    Calendar,
    Users,
    Package,
    Settings,
    LogOut,
    Menu,
    X,
    User,
    Image as ImageIcon
} from 'lucide-react';
import { useAuth } from 'context/AuthContext';
import { Button } from 'components/ui/button';
import AdminDashboard from './admin/AdminDashboard';
import AdminBookings from './admin/AdminBookings';
import AdminCars from './admin/AdminCars';
import AdminPackages from './admin/AdminPackages';
import AdminGallery from './admin/AdminGallery';

// Placeholder components for other sections
const ComingSoon = ({ title }) => (
    <div className="p-8">
        <h2 className="text-2xl font-serif font-medium text-primary mb-4">{title}</h2>
        <div className="bg-white rounded-3xl p-12 border border-black/5 text-center">
            <p className="text-muted-foreground">Admin {title} management is coming soon.</p>
        </div>
    </div>
);

export default function AdminPage() {
    const { user, isAdmin, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            navigate('/auth', { state: { from: location.pathname } });
        }
    }, [user, isAdmin, loading, navigate, location]);

    if (loading || !user || !isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
        { icon: Car, label: 'Fleet / Cars', path: '/admin/cars' },
        { icon: ImageIcon, label: 'Gallery', path: '/admin/gallery' },
        { icon: Package, label: 'Tour Packages', path: '/admin/packages' },
        { icon: Users, label: 'Users', path: '/admin/users' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col p-6">
                    <div className="flex items-center justify-between mb-10">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-lg">
                                <span className="font-bold text-white text-lg">T</span>
                            </div>
                            <span className="font-serif text-xl font-medium tracking-tight">Touraa</span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                    ${isActive ? 'bg-accent text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'}
                  `}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <div className="flex items-center gap-3 px-4 py-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-white/70" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-medium truncate">{user.name}</p>
                                <p className="text-xs text-white/50 truncate">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-primary">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="font-serif text-xl font-medium text-primary">
                            {menuItems.find(m => m.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" className="text-primary hover:bg-primary/5 rounded-full">
                                View Site
                            </Button>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-auto">
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/bookings" element={<AdminBookings />} />
                        <Route path="/cars" element={<AdminCars />} />
                        <Route path="/gallery" element={<AdminGallery />} />
                        <Route path="/packages" element={<AdminPackages />} />
                        <Route path="/users" element={<ComingSoon title="Users" />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
