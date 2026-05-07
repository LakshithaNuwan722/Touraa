import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Calendar,
    User,
    Car,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    MoreVertical,
    Trash2,
    ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from 'components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from 'components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from 'context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function AdminBookings() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const url = statusFilter === 'all'
                ? `${API}/api/admin/bookings`
                : `${API}/api/admin/bookings?status=${statusFilter}`;

            const response = await axios.get(url);
            setBookings(response.data);
        } catch (error) {
            toast.error('Failed to fetch bookings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchBookings();
        }
    }, [token, statusFilter]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await axios.put(`${API}/api/admin/bookings/${id}/status`, { status: newStatus });
            toast.success(`Booking ${newStatus} successfully`);
            fetchBookings();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setIsDetailsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return;

        try {
            await axios.delete(`${API}/api/admin/bookings/${id}`);
            toast.success('Booking deleted');
            fetchBookings();
        } catch (error) {
            toast.error('Failed to delete booking');
        }
    };

    const filteredBookings = bookings.filter(b =>
        b.passenger_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.passenger_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.car_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.id.includes(searchTerm)
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
            case 'cancelled':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
            case 'completed':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Completed</span>;
            default:
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold flex items-center gap-1 w-fit"><AlertCircle className="w-3 h-3" /> Pending</span>;
        }
    };

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-[#1A4D2E]">Manage Bookings</h2>
                    <p className="text-muted-foreground text-sm">View and manage all customer reservations</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search bookings..."
                            className="pl-10 w-full md:w-64 rounded-xl border-black/5"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-white rounded-xl border border-black/5 p-1">
                        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${statusFilter === s ? 'bg-[#1A4D2E] text-white' : 'text-muted-foreground hover:bg-gray-50'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 overflow-hidden shadow-sm">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-[#1A4D2E] border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="p-20 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-[#1A4D2E]">No bookings found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-black/5">
                                    <th className="px-6 py-4">Booking Info</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Vehicle & Cost</th>
                                    <th className="px-6 py-4">Itinerary</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {filteredBookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-mono text-muted-foreground mb-1 uppercase">ID: {booking.id.slice(0, 8)}</p>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                                                <span>Booked {new Date(booking.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-sm text-[#1A4D2E]">{booking.passenger_name}</span>
                                                <span className="text-xs text-muted-foreground">{booking.passenger_email}</span>
                                                <span className="text-xs text-muted-foreground">{booking.passenger_phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Car className="w-4 h-4 text-[#E67E22]" />
                                                <span className="font-medium text-sm">{booking.car_name}</span>
                                            </div>
                                            <p className="text-[#E67E22] font-bold text-sm">Rs {booking.estimated_cost.toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <MapPin className="w-3.5 h-3.5 text-[#1A4D2E]" />
                                                    <span className="truncate max-w-[150px]">{booking.pickup_location} → {booking.drop_location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5 text-[#1A4D2E]" />
                                                    <span>{booking.pickup_date} @ {booking.pickup_time}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(booking)} className="text-gray-700">
                                                        <ExternalLink className="w-4 h-4 mr-2" /> View Details
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-black/5 my-1" />
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'confirmed')} className="text-green-600">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Confirm
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'completed')} className="text-blue-600">
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Complete
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(booking.id, 'cancelled')} className="text-red-600">
                                                        <XCircle className="w-4 h-4 mr-2" /> Cancel
                                                    </DropdownMenuItem>
                                                    <div className="h-px bg-black/5 my-1" />
                                                    <DropdownMenuItem onClick={() => handleDelete(booking.id)} className="text-gray-500">
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#1A4D2E]">
                            Booking Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-6 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Customer Info</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-2">
                                            <p className="font-medium text-[#1A4D2E] flex items-center gap-2"><User className="w-4 h-4" /> {selectedBooking.passenger_name}</p>
                                            <p className="text-sm text-gray-600 truncate">{selectedBooking.passenger_email}</p>
                                            <p className="text-sm text-gray-600">{selectedBooking.passenger_phone}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Vehicle & Cost</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-2">
                                            <p className="font-medium flex items-center gap-2"><Car className="w-4 h-4 text-[#E67E22]" /> {selectedBooking.car_name}</p>
                                            <p className="text-sm text-gray-600">Distance: {selectedBooking.distance_km} km</p>
                                            <p className="text-[#E67E22] font-bold mt-1">Rs {selectedBooking.estimated_cost?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Trip Details</h4>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Pickup</p>
                                                <p className="text-sm font-medium flex items-start gap-2"><MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> {selectedBooking.pickup_location}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Drop-off</p>
                                                <p className="text-sm font-medium flex items-start gap-2"><MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /> {selectedBooking.drop_location}</p>
                                            </div>
                                            <div className="pt-2 border-t border-black/5">
                                                <p className="text-sm flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> {selectedBooking.pickup_date} @ {selectedBooking.pickup_time}</p>
                                                <p className="text-sm flex items-center gap-2 text-muted-foreground mt-1"><Calendar className="w-4 h-4" /> Return: {selectedBooking.drop_date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {selectedBooking.special_requests && (
                                <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Special Requests</h4>
                                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200 text-sm text-yellow-800">
                                        {selectedBooking.special_requests}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-black/5">
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>Booking ID: <span className="font-mono">{selectedBooking.id}</span></p>
                                    <p>Created: {new Date(selectedBooking.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    {getStatusBadge(selectedBooking.status)}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
