import { Link } from 'react-router-dom';
import { Clock, MapPin, Check } from 'lucide-react';
import { Button } from 'components/ui/button';

export const PackageCard = ({ pkg }) => {
  return (
    <div
      className="package-card bg-white rounded-3xl overflow-hidden border border-black/5"
      data-testid={`package-card-${pkg.id}`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={pkg.image}
          alt={pkg.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
            <Clock className="w-4 h-4" />
            <span>{pkg.duration}</span>
          </div>
          <h3 className="font-serif text-2xl font-semibold text-white">
            {pkg.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-muted-foreground text-sm mb-4">
          {pkg.description}
        </p>

        {/* Highlights */}
        <div className="space-y-2 mb-4">
          {pkg.highlights.slice(0, 4).map((highlight, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-4 h-4 text-[#1A4D2E]" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>

        {/* Destinations */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <MapPin className="w-4 h-4 text-[#E67E22]" />
          {pkg.destinations.slice(0, 3).map((dest, index) => (
            <span
              key={index}
              className="text-xs bg-[#1A4D2E]/10 text-[#1A4D2E] px-2 py-1 rounded-full"
            >
              {dest}
            </span>
          ))}
          {pkg.destinations.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{pkg.destinations.length - 3} more
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-[#E67E22]">
              Rs {pkg.price_from.toLocaleString()}
            </p>
          </div>
          <Link to="/contact">
            <Button
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-full px-6"
              data-testid={`enquire-package-${pkg.id}`}
            >
              Enquire
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
