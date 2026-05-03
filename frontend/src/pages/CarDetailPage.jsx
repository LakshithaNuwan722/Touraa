import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, Briefcase, Wind, Settings, Check, Shield, Clock, Car } from 'lucide-react';
import { Button } from 'components/ui/button';
import { BookingForm } from 'components/BookingForm';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await axios.get(`${API}/cars/${id}`);
        setCar(response.data);
      } catch (error) {
        console.error('Failed to fetch car');
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#1A4D2E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Car className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold text-[#1A4D2E] mb-2">Vehicle Not Found</h2>
        <p className="text-muted-foreground mb-6">The vehicle you're looking for doesn't exist.</p>
        <Link to="/cars">
          <Button className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fleet
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="car-detail-page">
      {/* Back Button */}
      <div className="bg-[#F4F1EA] py-4 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Link
            to="/cars"
            className="inline-flex items-center text-[#1A4D2E] hover:text-[#E67E22] transition-colors"
            data-testid="back-to-fleet"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Fleet
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Car Details */}
          <div>
            {/* Car Image */}
            <div className="relative rounded-3xl overflow-hidden mb-8">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-80 md:h-96 object-cover"
                data-testid="car-image"
              />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold capitalize text-[#1A4D2E]">
                  {car.type}
                </span>
              </div>
            </div>

            {/* Car Info */}
            <div>
              <h1 className="font-serif text-4xl md:text-5xl font-medium text-[#1A4D2E] mb-4" data-testid="car-name">
                {car.name}
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                {car.description}
              </p>

              {/* Price */}
              <div className="bg-[#E67E22]/10 rounded-2xl p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Price per kilometer</p>
                <p className="text-4xl font-bold text-[#E67E22]" data-testid="car-price">
                  Rs {car.price_per_km}<span className="text-lg font-normal text-muted-foreground">/km</span>
                </p>
                <p className="text-sm text-[#1A4D2E] mt-2 font-medium">
                  Free driver included with all rentals
                </p>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Users className="w-6 h-6 text-[#E67E22] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#1A4D2E]">{car.passengers}</p>
                  <p className="text-xs text-muted-foreground">Passengers</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Briefcase className="w-6 h-6 text-[#E67E22] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-[#1A4D2E]">{car.luggage}</p>
                  <p className="text-xs text-muted-foreground">Luggage</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Wind className="w-6 h-6 text-[#E67E22] mx-auto mb-2" />
                  <p className="text-lg font-bold text-[#1A4D2E]">{car.ac ? 'Yes' : 'No'}</p>
                  <p className="text-xs text-muted-foreground">Air Conditioning</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Settings className="w-6 h-6 text-[#E67E22] mx-auto mb-2" />
                  <p className="text-lg font-bold text-[#1A4D2E]">{car.transmission}</p>
                  <p className="text-xs text-muted-foreground">Transmission</p>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl p-6 border border-black/5">
                <h3 className="font-semibold text-[#1A4D2E] mb-4">Features Included</h3>
                <div className="grid grid-cols-2 gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#1A4D2E]" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Form */}
          <div>
            <div className="sticky top-24">
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="font-serif text-2xl font-medium text-[#1A4D2E] mb-6">
                  Book This Vehicle
                </h2>
                <BookingForm car={car} />
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Shield className="w-6 h-6 text-[#1A4D2E] mx-auto mb-2" />
                  <p className="text-xs font-medium">Insured</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Clock className="w-6 h-6 text-[#1A4D2E] mx-auto mb-2" />
                  <p className="text-xs font-medium">24/7 Support</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/5 text-center">
                  <Users className="w-6 h-6 text-[#1A4D2E] mx-auto mb-2" />
                  <p className="text-xs font-medium">Free Driver</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
