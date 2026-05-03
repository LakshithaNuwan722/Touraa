import { useState, useEffect } from 'react';
import { Car } from 'lucide-react';
import { Button } from 'components/ui/button';
import { CarCard } from 'components/CarCard';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const url = filter === 'all' ? `${API}/cars` : `${API}/cars?type=${filter}`;
        const response = await axios.get(url);
        setCars(response.data);
      } catch (error) {
        console.error('Failed to fetch cars');
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, [filter]);

  const filters = [
    { value: 'all', label: 'All Vehicles' },
    { value: 'mini', label: 'Mini' },
    { value: 'sedan', label: 'Sedans' },
    { value: 'suv', label: 'SUVs' },
    { value: 'van', label: 'Vans' },
    { value: 'bus', label: 'Buses' },
    { value: 'vip', label: 'VIP' }
  ];

  return (
    <div className="min-h-screen" data-testid="cars-page">
      {/* Header */}
      <section className="bg-[#1A4D2E] py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-6 h-6 text-[#E67E22]" />
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22]">
              Our Fleet
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-white mb-4">
            Choose Your Vehicle
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            From comfortable sedans to spacious vans, find the perfect vehicle for your Sri Lankan adventure. 
            All rentals include a free professional driver.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-20 z-40 bg-[#F4F1EA] border-b border-black/5 py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'outline'}
                className={`rounded-full ${
                  filter === f.value
                    ? 'bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white'
                    : 'border-[#1A4D2E]/20 text-[#1A4D2E] hover:bg-[#1A4D2E]/5'
                }`}
                onClick={() => setFilter(f.value)}
                data-testid={`filter-${f.value}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Car Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-96 skeleton" />
              ))}
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-20">
              <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1A4D2E] mb-2">
                No vehicles found
              </h3>
              <p className="text-muted-foreground">
                Try selecting a different filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cars.map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-12 bg-[#E67E22]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-medium text-[#1A4D2E] mb-2">
                All Rentals Include
              </h3>
              <p className="text-muted-foreground">
                Free professional driver, fuel, insurance, and 24/7 support.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {['Free Driver', 'AC Vehicle', 'Insurance', '24/7 Support'].map((feature) => (
                <span
                  key={feature}
                  className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#1A4D2E]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
