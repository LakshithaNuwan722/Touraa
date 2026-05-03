import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Users, Car, MapPin } from 'lucide-react';
import { Button } from 'components/ui/button';
import { CarCard } from 'components/CarCard';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function HomePage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const heroImages = [
    '/hero-images/image1.jpg',
    '/hero-images/image2.jpg',
    '/hero-images/image3.jpg', // Place your image in frontend/public/hero-images/image3.jpg
    '/hero-images/image4.jpg', // Place your image in frontend/public/hero-images/image4.jpg
    '/hero-images/image5.jpg'  // Place your image in frontend/public/hero-images/image5.jpg
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axios.get(`${API}/cars`);
        setCars(response.data.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const destinations = [
    {
      name: 'Sigiriya',
      image: 'https://images.unsplash.com/photo-1685345421631-f6ed23658e09?w=800',
      description: 'Ancient Rock Fortress'
    },
    {
      name: 'Ella',
      image: 'https://images.unsplash.com/photo-1559372122-1a97b2d22c22?w=800',
      description: 'Scenic Hill Country'
    },
    {
      name: 'Yala',
      image: 'https://images.unsplash.com/photo-1674556275189-e78fd6223e6d?w=800',
      description: 'Wildlife Safari'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Safe & Reliable',
      description: 'All our vehicles are regularly maintained and our drivers are experienced professionals.'
    },
    {
      icon: Clock,
      title: '24/7 Service',
      description: 'Round-the-clock availability for airport pickups and emergency assistance.'
    },
    {
      icon: Users,
      title: 'Free Driver',
      description: 'Every rental includes a professional English-speaking driver at no extra cost.'
    }
  ];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all ease-in-out ${
              index === currentImageIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url('${img}')`,
              transitionDuration: '2000ms' // Creates slow zoom and fade
            }}
          />
        ))}
        <div className="absolute inset-0 hero-gradient z-0" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="max-w-2xl">
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-white/60 mb-4 animate-fade-in-up">
              Welcome to Sri Lanka
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-white mb-6 animate-fade-in-up animation-delay-100">
              Discover Ceylon<br />in Comfort
            </h1>
            <p className="font-sans text-lg md:text-xl leading-relaxed text-white/80 mb-8 animate-fade-in-up animation-delay-200">
              Explore the pearl of the Indian Ocean with our premium taxi rental service. 
              Handpicked vehicles, experienced drivers, unforgettable journeys.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-300">
              <Link to="/cars">
                <Button
                  className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl"
                  data-testid="explore-fleet-btn"
                >
                  Explore Our Fleet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/packages">
                <Button
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 rounded-full px-8 py-6 text-lg font-medium backdrop-blur-sm"
                  data-testid="view-packages-btn"
                >
                  View Tour Packages
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in-up animation-delay-400">
            {[
              { value: '500+', label: 'Happy Tourists' },
              { value: '6+', label: 'Premium Vehicles' },
              { value: '15+', label: 'Destinations' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-white/60 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-[#F4F1EA]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22] mb-4">
              Why Choose Us
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#1A4D2E]">
              Travel with Confidence
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 border border-black/5 hover:border-[#1A4D2E]/20 transition-colors hover-lift"
                data-testid={`feature-${index}`}
              >
                <div className="w-14 h-14 bg-[#1A4D2E]/10 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-[#1A4D2E]" />
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#1A4D2E] mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Preview */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22] mb-4">
                Our Fleet
              </p>
              <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#1A4D2E]">
                Choose Your Ride
              </h2>
            </div>
            <Link to="/cars" className="mt-4 md:mt-0">
              <Button variant="link" className="text-[#1A4D2E] font-semibold" data-testid="view-all-cars-btn">
                View All Vehicles
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-96 skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Destinations */}
      <section className="py-20 md:py-32 bg-[#1A4D2E]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22] mb-4">
              Popular Destinations
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-white">
              Explore Sri Lanka
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((dest, index) => (
              <Link
                key={index}
                to="/packages"
                className="destination-card group h-80"
                data-testid={`destination-${index}`}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-6 left-6 z-10">
                  <p className="text-white/70 text-sm mb-1">{dest.description}</p>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    {dest.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/packages">
              <Button
                className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full px-8 py-6 text-lg font-semibold"
                data-testid="view-all-packages-btn"
              >
                View All Tour Packages
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-16 border border-black/5 shadow-[0_20px_50px_rgb(0,0,0,0.1)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22] mb-4">
                  Ready to Explore?
                </p>
                <h2 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#1A4D2E] mb-6">
                  Start Your Journey Today
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Book your vehicle now and let us take care of the rest. 
                  Our team is ready to help you create unforgettable memories in Sri Lanka.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/cars">
                    <Button
                      className="bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-full px-8 py-6 text-lg font-semibold"
                      data-testid="cta-book-now-btn"
                    >
                      Book Now
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button
                      variant="outline"
                      className="border-[#1A4D2E]/20 text-[#1A4D2E] hover:bg-[#1A4D2E]/5 rounded-full px-8 py-6 text-lg font-medium"
                      data-testid="cta-contact-btn"
                    >
                      Contact Us
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-[#F4F1EA] rounded-2xl p-6">
                    <Car className="w-8 h-8 text-[#1A4D2E] mb-3" />
                    <p className="font-semibold text-[#1A4D2E]">Premium Fleet</p>
                    <p className="text-sm text-muted-foreground">6+ vehicles</p>
                  </div>
                  <div className="bg-[#1A4D2E] rounded-2xl p-6">
                    <MapPin className="w-8 h-8 text-white mb-3" />
                    <p className="font-semibold text-white">Destinations</p>
                    <p className="text-sm text-white/70">15+ locations</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-[#E67E22] rounded-2xl p-6">
                    <Users className="w-8 h-8 text-white mb-3" />
                    <p className="font-semibold text-white">Happy Tourists</p>
                    <p className="text-sm text-white/70">500+ served</p>
                  </div>
                  <div className="bg-[#F4F1EA] rounded-2xl p-6">
                    <Shield className="w-8 h-8 text-[#1A4D2E] mb-3" />
                    <p className="font-semibold text-[#1A4D2E]">Trusted</p>
                    <p className="text-sm text-muted-foreground">Since 2020</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
