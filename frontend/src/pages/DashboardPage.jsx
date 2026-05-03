import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Car, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from 'components/ui/button';
import { useAuth } from 'context/AuthContext';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { from: '/dashboard' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      
      try {
        const response = await axios.get(`${API}/bookings/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(response.data);
      } catch (error) {
        console.error('Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchBookings();
    }
  }, [token]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A4D2E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen" data-testid="dashboard-page">
      {/* Header */}
      <section className="bg-[#1A4D2E] py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22] mb-2">
            Dashboard
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-white mb-2">
            Welcome, {user.name}
          </h1>
          <p className="text-white/70">{user.email}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-medium text-[#1A4D2E]">
              My Bookings
            </h2>
            <Link to="/cars">
              <Button className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full" data-testid="new-booking-btn">
                New Booking
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-32 skeleton" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1A4D2E] mb-2">
                No bookings yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Start exploring Sri Lanka by booking your first vehicle.
              </p>
              <Link to="/cars">
                <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-full px-8" data-testid="browse-cars-btn">
                  Browse Vehicles
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl p-6 border border-black/5 hover-lift"
                  data-testid={`booking-${booking.id}`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Car className="w-5 h-5 text-[#1A4D2E]" />
                        <h3 className="font-semibold text-lg text-[#1A4D2E]">
                          {booking.car_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-[#E67E22]" />
                          <span>{booking.pickup_location} → {booking.drop_location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4 text-[#E67E22]" />
                          <span>{booking.pickup_date} to {booking.drop_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-[#E67E22]" />
                          <span>Pickup at {booking.pickup_time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{booking.distance_km} km</p>
                      <p className="text-2xl font-bold text-[#E67E22]">
                        Rs {booking.estimated_cost.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {booking.special_requests && (
                    <div className="mt-4 pt-4 border-t border-black/5">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Special Requests:</span> {booking.special_requests}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
