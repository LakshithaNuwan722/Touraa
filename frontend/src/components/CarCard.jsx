import { Link } from 'react-router-dom';
import { Users, Briefcase, Wind, Settings } from 'lucide-react';
import { Button } from 'components/ui/button';

export const CarCard = ({ car }) => {
  return (
    <div
      className="car-card group bg-white rounded-3xl overflow-hidden border border-black/5"
      data-testid={`car-card-${car.id}`}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={car.image}
          alt={car.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold capitalize text-[#1A4D2E]">
            {car.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-serif text-2xl font-semibold text-[#1A4D2E] mb-2">
          {car.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {car.description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4 text-[#E67E22]" />
            <span>{car.passengers} Passengers</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Briefcase className="w-4 h-4 text-[#E67E22]" />
            <span>{car.luggage} Luggage</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Wind className="w-4 h-4 text-[#E67E22]" />
            <span>{car.ac ? 'AC' : 'Non-AC'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="w-4 h-4 text-[#E67E22]" />
            <span>{car.transmission}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-xl font-bold text-[#E67E22]">
              Rs {car.price_per_km}<span className="text-sm font-normal">/km</span>
            </p>
          </div>
          <Link to={`/cars/${car.id}`}>
            <Button
              className="bg-[#1A4D2E] hover:bg-[#1A4D2E]/90 text-white rounded-full px-6"
              data-testid={`book-car-${car.id}`}
            >
              Book Now
            </Button>
          </Link>
        </div>

        {/* Free Driver Badge */}
        <div className="mt-4 text-center">
          <span className="text-xs font-semibold text-[#1A4D2E] bg-[#1A4D2E]/10 px-3 py-1 rounded-full">
            Free Driver Included
          </span>
        </div>
      </div>
    </div>
  );
};
