import { useState, useEffect } from 'react';
import {
    Users,
    Car,
    Calendar,
    TrendingUp,
    TrendingDown,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Button } from 'components/ui/button';
import { useAuth } from 'context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${API}/api/admin/stats`);
                setStats(response.data);
            } catch (error) {
                console.error('Failed to fetch admin stats');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading || !stats) {
        return (
            <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-white rounded-3xl animate-pulse border border-black/5" />
                    ))}
                </div>
                <div className="bg-white rounded-3xl h-64 animate-pulse border border-black/5" />
            </div>
        );
    }

    const kpis = [
        {
            label: 'Total Bookings',
            value: stats.kpis.totalBookings,
            icon: Calendar,
            color: 'bg-blue-50 text-blue-600',
            trend: '+12%',
            trendUp: true
        },
        {
            label: 'Total Revenue',
            value: `Rs ${stats.kpis.totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'bg-green-50 text-green-600',
            trend: '+8%',
            trendUp: true
        },
        {
            label: 'Total Users',
            value: stats.kpis.totalUsers,
            icon: Users,
            color: 'bg-purple-50 text-purple-600',
            trend: '+5%',
            trendUp: true
        },
        {
            label: 'Total Vehicles',
            value: stats.kpis.totalCars,
            icon: Car,
            color: 'bg-orange-50 text-orange-600',
            trend: '0',
            trendUp: true
        },
    ];

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white rounded-3xl p-6 border border-black/5 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${kpi.color} rounded-2xl flex items-center justify-center`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center gap-1 text-sm font-semibold ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                                {kpi.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {kpi.trend}
                            </div>
                        </div>
                        <div>
                            <p className="text-muted-foreground text-sm font-medium">{kpi.label}</p>
                            <h3 className="text-2xl font-bold text-[#1A4D2E] mt-1">{kpi.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl border border-black/5 overflow-hidden">
                        <div className="p-6 border-b border-black/5 flex items-center justify-between">
                            <h2 className="font-serif text-xl font-medium text-[#1A4D2E]">Recent Bookings</h2>
                            <Button variant="ghost" className="text-[#E67E22] hover:bg-[#E67E22]/5">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 text-xs uppercase tracking-wider text-muted-foreground">
                                        <th className="px-6 py-4 font-semibold">Customer</th>
                                        <th className="px-6 py-4 font-semibold">Vehicle</th>
                                        <th className="px-6 py-4 font-semibold">Date</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {stats.recentBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-sm">{booking.passenger_name}</p>
                                                <p className="text-xs text-muted-foreground">{booking.passenger_email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Car className="w-4 h-4 text-[#1A4D2E]" />
                                                    <span className="text-sm">{booking.car_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                {booking.pickup_date}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(booking.status)}
                                                    <span className="capitalize">{booking.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-sm">
                                                Rs {booking.estimated_cost.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {stats.recentBookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                                                No recent bookings found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Activity */}
                <div className="space-y-8">
                    <div className="bg-[#1A4D2E] text-white rounded-3xl p-8">
                        <h3 className="text-xl font-serif font-medium mb-4">Quick Insights</h3>
                        <p className="text-white/70 text-sm mb-6">
                            Your business is growing! Revenue is up 8% this week. Consider adding more SUV vehicles to meet the weekend demand.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm border-b border-white/10 pb-4">
                                <span>Active Bookings</span>
                                <span className="font-bold">24</span>
                            </div>
                            <div className="flex items-center justify-between text-sm border-b border-white/10 pb-4">
                                <span>Fleet Availability</span>
                                <span className="font-bold">85%</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Customer Satisfaction</span>
                                <span className="font-bold text-[#E67E22]">4.8/5</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-black/5">
                        <h3 className="font-serif text-lg font-medium text-[#1A4D2E] mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[
                                { label: 'New Booking', time: '2 mins ago', icon: Clock },
                                { label: 'Payment Received', time: '15 mins ago', icon: CheckCircle },
                                { label: 'Car Maintenance', time: '1 hour ago', icon: AlertCircle },
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <activity.icon className="w-4 h-4 text-[#1A4D2E]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{activity.label}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
