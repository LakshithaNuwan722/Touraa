import { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { PackageCard } from 'components/PackageCard';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API}/packages`);
        setPackages(response.data);
      } catch (error) {
        console.error('Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return (
    <div className="min-h-screen" data-testid="packages-page">
      {/* Header */}
      <section className="bg-[#1A4D2E] py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-6 h-6 text-[#E67E22]" />
            <p className="font-sans text-sm font-semibold tracking-widest uppercase text-[#E67E22]">
              Tour Packages
            </p>
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-medium tracking-tight text-white mb-4">
            Curated Experiences
          </h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Discover Sri Lanka through our carefully crafted tour packages. From ancient ruins to pristine beaches, 
            we've designed the perfect itineraries for every type of traveler.
          </p>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-3xl h-[500px] skeleton" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom Tours Banner */}
      <section className="py-12 bg-[#F4F1EA]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-black/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-serif text-3xl md:text-4xl font-medium text-[#1A4D2E] mb-4">
                  Custom Tour Packages
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Don't see what you're looking for? We specialize in creating personalized itineraries 
                  tailored to your interests, budget, and timeline. Let us design your dream Sri Lanka adventure.
                </p>
                <ul className="space-y-3">
                  {[
                    'Personalized itineraries',
                    'Flexible scheduling',
                    'Local expert guides',
                    'All-inclusive options'
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#E67E22] rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1589534345827-e619f9b2dd2b?w=800"
                  alt="Sri Lanka Beach"
                  className="rounded-2xl w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
