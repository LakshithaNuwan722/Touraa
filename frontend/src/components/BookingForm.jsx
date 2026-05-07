import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Clock, User, Mail, Phone, MessageSquare, Car, Compass, Locate } from 'lucide-react';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Textarea } from 'components/ui/textarea';
import { Calendar } from 'components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { toast } from 'sonner';
import { useAuth } from 'context/AuthContext';
import axios from 'axios';
import { countryCodes } from 'constants/countryCodes';
import { useJsApiLoader, GoogleMap, Marker, DirectionsRenderer, Autocomplete } from '@react-google-maps/api';

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '1rem',
  marginTop: '1rem'
};

const center = {
  lat: 6.9271, // Colombo
  lng: 79.8612
};

export const BookingForm = ({ car, onSuccess }) => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookingType, setBookingType] = useState('transfer');
  const [countryCode, setCountryCode] = useState('+94');

  const [formData, setFormData] = useState({
    pickup_location: '',
    pickup_lat: null,
    pickup_lng: null,
    pickup_hotel: '',
    drop_location: '',
    drop_lat: null,
    drop_lng: null,
    drop_hotel: '',
    pickup_date: null,
    pickup_time: '09:00',
    num_days: '1',
    passenger_name: user?.name || '',
    passenger_email: user?.email || '',
    passenger_phone: user?.phone || '',
    special_requests: ''
  });

  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [activeInput, setActiveInput] = useState('pickup'); // 'pickup' or 'drop'

  // Initialize time to 3 hours from now for convenience
  const getDefaultTimeParts = () => {
    const d = new Date(new Date().getTime() + 3 * 60 * 60 * 1000);
    let h = d.getHours();
    const m = d.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // convert 0 to 12
    const roundedMin = Math.round(m / 15) * 15;
    const finalMin = roundedMin >= 60 ? '00' : roundedMin.toString().padStart(2, '0');
    return {
      hour: h.toString().padStart(2, '0'),
      minute: finalMin,
      period
    };
  };

  const [timeParts, setTimeParts] = useState(getDefaultTimeParts());

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropAutocomplete, setDropAutocomplete] = useState(null);


  useEffect(() => {
    if (user && user.phone) {
      // Try to split country code from phone
      const matchedCode = countryCodes.find(c => user.phone.startsWith(c.code));
      if (matchedCode) {
        setCountryCode(matchedCode.code);
        setFormData(prev => ({
          ...prev,
          passenger_name: user.name,
          passenger_email: user.email,
          passenger_phone: formatPhoneNumber(user.phone.slice(matchedCode.code.length))
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          passenger_name: user.name,
          passenger_email: user.email,
          passenger_phone: formatPhoneNumber(user.phone)
        }));
      }
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        passenger_name: user.name,
        passenger_email: user.email,
        passenger_phone: ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const { hour, minute, period } = timeParts;
    let h = parseInt(hour);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    const formattedTime = `${h.toString().padStart(2, '0')}:${minute}`;
    setFormData(prev => ({ ...prev, pickup_time: formattedTime }));
  }, [timeParts]);

  const onPickupLoad = (autocomplete) => setPickupAutocomplete(autocomplete);
  const onDropLoad = (autocomplete) => setDropAutocomplete(autocomplete);

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      if (place.geometry) {
        setFormData(prev => ({
          ...prev,
          pickup_location: place.formatted_address,
          pickup_lat: place.geometry.location.lat(),
          pickup_lng: place.geometry.location.lng()
        }));
      }
    }
  };

  const onDropPlaceChanged = () => {
    if (dropAutocomplete !== null) {
      const place = dropAutocomplete.getPlace();
      if (place.geometry) {
        setFormData(prev => ({
          ...prev,
          drop_location: place.formatted_address,
          drop_lat: place.geometry.location.lat(),
          drop_lng: place.geometry.location.lng()
        }));
      }
    }
  };

  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setLoading(false);
          if (status === "OK" && results[0]) {
            const address = results[0].formatted_address;
            setFormData(prev => ({
              ...prev,
              pickup_location: address,
              pickup_lat: lat,
              pickup_lng: lng
            }));
            if (map) {
              map.panTo({ lat, lng });
              map.setZoom(15);
            }
            toast.success('Live location detected!');
          } else {
            const errorMsg = status === "ZERO_RESULTS"
              ? "No address found for your current location. Try moving the map marker."
              : `Geocoding failed: ${status}. Please ensure "Geocoding API" is enabled in Google Cloud Console.`;
            toast.error(errorMsg);
          }
        });
      },
      (error) => {
        setLoading(false);
        toast.error('Failed to get your location: ' + error.message);
      }
    );
  };

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    // Reverse geocoding to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const address = results[0].formatted_address;
        if (activeInput === 'pickup') {
          setFormData(prev => ({
            ...prev,
            pickup_location: address,
            pickup_lat: lat,
            pickup_lng: lng
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            drop_location: address,
            drop_lat: lat,
            drop_lng: lng
          }));
        }
      }
    });
  };

  useEffect(() => {
    if (formData.pickup_lat && formData.drop_lat && isLoaded) {
      calculateRoute();
    }
  }, [formData.pickup_lat, formData.drop_lat, isLoaded]);

  const calculateRoute = async () => {
    const directionsService = new window.google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: { lat: formData.pickup_lat, lng: formData.pickup_lng },
      destination: { lat: formData.drop_lat, lng: formData.drop_lng },
      travelMode: window.google.maps.TravelMode.DRIVING,
    });
    setDirectionsResponse(results);
    setDistance(results.routes[0].legs[0].distance.text);
    setDuration(results.routes[0].legs[0].duration.text);
    // Store raw distance in meters for accuracy
    setFormData(prev => ({ ...prev, distance_meters: results.routes[0].legs[0].distance.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookingType === 'transfer') {
      if (!formData.pickup_location || !formData.drop_location) {
        toast.error('Please select pickup and drop locations');
        return;
      }
    } else {
      if (!formData.pickup_location) {
        toast.error('Please select pickup location');
        return;
      }
    }

    if (!formData.pickup_date) {
      toast.error('Please select pickup date');
      return;
    }

    // Validate 2-hour lead time for same-day bookings
    const now = new Date();
    if (formData.pickup_date.toDateString() === now.toDateString()) {
      const [h, m] = formData.pickup_time.split(':').map(Number);
      const selectedTime = new Date(formData.pickup_date.getTime());
      selectedTime.setHours(h, m, 0, 0);

      const minRequiredTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      if (selectedTime < minRequiredTime) {
        toast.error(`For same-day bookings, pickup must be at least 2 hours in advance. Please select a time after ${minRequiredTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}.`);
        setLoading(false);
        return;
      }
    }

    if (!formData.passenger_name || !formData.passenger_email || !formData.passenger_phone) {
      toast.error('Please fill in all contact details');
      return;
    }

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(formData.passenger_name)) {
      toast.error('Full name can only contain letters and spaces');
      return;
    }

    const cleanPhone = formData.passenger_phone.replace(/\s/g, '');
    const digits = cleanPhone.replace(/^0/, '');
    const fullPhone = `${countryCode}${digits}`;
    const totalDigits = fullPhone.replace('+', '').length;

    if (totalDigits < 8 || totalDigits > 15) {
      toast.error('Total phone digits (including country code) must be between 8 and 15');
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        car_id: car.id,
        booking_type: bookingType,
        num_days: parseInt(formData.num_days) || 1,
        pickup_location: formData.pickup_location,
        drop_location: bookingType === 'transfer' ? formData.drop_location : formData.pickup_location,
        pickup_date: format(formData.pickup_date, 'yyyy-MM-dd'),
        drop_date: format(formData.pickup_date, 'yyyy-MM-dd'),
        pickup_time: formData.pickup_time,
        passenger_name: formData.passenger_name,
        passenger_email: formData.passenger_email,
        passenger_phone: fullPhone,
        distance_km: formData.distance_meters ? formData.distance_meters / 1000 : 0,
        special_requests: bookingType === 'tour'
          ? `[TOUR RENTAL - ${formData.num_days} days, ${car.included_km || 150}km/day included, Rs ${(parseInt(formData.num_days) * (car.daily_rate || 22000)).toLocaleString()} total]${formData.pickup_hotel ? ` [Pickup Hotel: ${formData.pickup_hotel}]` : ''} ${formData.special_requests}`
          : `${formData.pickup_hotel ? `[Pickup Hotel: ${formData.pickup_hotel}]` : ''}${formData.drop_hotel ? ` [Drop Hotel: ${formData.drop_hotel}]` : ''} ${formData.special_requests}`.trim()
      };

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API}/bookings`, bookingData, { headers });

      toast.success('Booking inquiry submitted successfully!');
      if (onSuccess) onSuccess();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit booking');
    } finally {
      setLoading(false);
    }
  };

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const dayOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '14', '21', '30'];


  const totalTourCost = parseInt(formData.num_days) * (car.daily_rate || 22000);

  // Allow same-day booking
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buses, Vans, and VIP categories require 5 days advance booking
    const restrictedTypes = ['bus', 'van', 'vip'];
    if (car && car.type && restrictedTypes.includes(car.type.toLowerCase())) {
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 5);
      return minDate;
    }

    return today;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="booking-form">
      {/* Booking Type Tabs */}
      <Tabs value={bookingType} onValueChange={setBookingType} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-[#1A4D2E]/10">
          <TabsTrigger
            value="transfer"
            className="py-3 data-[state=active]:bg-white data-[state=active]:text-[#1A4D2E] rounded-lg"
            data-testid="tab-transfer"
          >
            <Car className="w-4 h-4 mr-2" />
            Transfer
          </TabsTrigger>
          <TabsTrigger
            value="tour"
            className="py-3 data-[state=active]:bg-white data-[state=active]:text-[#1A4D2E] rounded-lg"
            data-testid="tab-tour"
          >
            <Compass className="w-4 h-4 mr-2" />
            Tour Rental
          </TabsTrigger>
        </TabsList>

        {/* Transfer Tab Content */}
        <TabsContent value="transfer" className="space-y-4 mt-4">
          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#E67E22]" />
                Pickup Location
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={onPickupLoad}
                      onPlaceChanged={onPickupPlaceChanged}
                    >
                      <Input
                        value={formData.pickup_location}
                        onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                        onFocus={() => setActiveInput('pickup')}
                        placeholder="Search pickup location"
                        className={`h-10 text-sm ${activeInput === 'pickup' ? 'border-[#E67E22] ring-1 ring-[#E67E22]' : ''}`}
                        data-testid="pickup-location-input"
                      />
                    </Autocomplete>
                  ) : (
                    <Input disabled placeholder="Loading maps..." className="h-10 text-sm" />
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 border-[#E67E22]/20 hover:bg-[#E67E22]/5"
                  onClick={handleUseLiveLocation}
                  title="Use Live Location"
                >
                  <Locate className="w-4 h-4 text-[#E67E22]" />
                </Button>
              </div>
              <Input
                value={formData.pickup_hotel}
                onChange={(e) => setFormData({ ...formData, pickup_hotel: e.target.value })}
                placeholder="Hotel name (optional)"
                className="h-10 text-sm"
                data-testid="pickup-hotel-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1A4D2E]" />
                Drop Location
              </Label>
              {isLoaded ? (
                <Autocomplete
                  onLoad={onDropLoad}
                  onPlaceChanged={onDropPlaceChanged}
                >
                  <Input
                    value={formData.drop_location}
                    onChange={(e) => setFormData({ ...formData, drop_location: e.target.value })}
                    onFocus={() => setActiveInput('drop')}
                    placeholder="Search drop location"
                    className={`h-10 text-sm ${activeInput === 'drop' ? 'border-[#1A4D2E] ring-1 ring-[#1A4D2E]' : ''}`}
                    data-testid="drop-location-input"
                  />
                </Autocomplete>
              ) : (
                <Input disabled placeholder="Loading maps..." className="h-10 text-sm" />
              )}
              <Input
                value={formData.drop_hotel}
                onChange={(e) => setFormData({ ...formData, drop_hotel: e.target.value })}
                placeholder="Hotel name (optional)"
                className="h-10 text-sm"
                data-testid="drop-hotel-input"
              />
            </div>
          </div>

          {/* Map and Route Info */}
          {isLoaded && (
            <div className="space-y-4">
              <div className="relative">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={10}
                  onClick={handleMapClick}
                  onLoad={(map) => setMap(map)}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false
                  }}
                >
                  {formData.pickup_lat && <Marker position={{ lat: formData.pickup_lat, lng: formData.pickup_lng }} label="P" />}
                  {formData.drop_lat && <Marker position={{ lat: formData.drop_lat, lng: formData.drop_lng }} label="D" />}
                  {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
                </GoogleMap>
                <div className="absolute top-6 left-2 right-2 flex justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-md text-xs font-medium text-[#1A4D2E] border border-[#1A4D2E]/10">
                    Click on map to select {activeInput} location
                  </div>
                </div>
              </div>

              {distance && (
                <div className="space-y-4">
                  <div className="bg-[#1A4D2E]/5 rounded-xl p-4 border border-[#1A4D2E]/10 grid grid-cols-2 gap-4" data-testid="route-info-transfer">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Distance</p>
                      <p className="text-xl font-bold text-[#E67E22]">{distance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Est. Time</p>
                      <p className="text-xl font-bold text-[#1A4D2E]">{duration}</p>
                    </div>
                  </div>

                  {/* Transfer Price Calculation */}
                  <div className="bg-[#E67E22]/10 rounded-xl p-4 border border-[#E67E22]/20" data-testid="price-info-transfer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Rate per km</p>
                        <p className="text-lg font-bold text-[#E67E22]">Rs {car.price_per_km}/km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estimated Total</p>
                        <p className="text-2xl font-bold text-[#1A4D2E]">
                          Rs {Math.round((formData.distance_meters / 1000) * car.price_per_km).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Tour Rental Tab Content */}
        <TabsContent value="tour" className="space-y-4 mt-4">
          {/* Pickup Location */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E67E22]" />
              Pickup Location
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                {isLoaded ? (
                  <Autocomplete
                    onLoad={onPickupLoad}
                    onPlaceChanged={onPickupPlaceChanged}
                  >
                    <Input
                      value={formData.pickup_location}
                      onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                      placeholder="Search pickup location"
                      className="h-10 text-sm"
                      data-testid="tour-pickup-location-input"
                    />
                  </Autocomplete>
                ) : (
                  <Input disabled placeholder="Loading maps..." className="h-10 text-sm" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0 border-[#E67E22]/20 hover:bg-[#E67E22]/5"
                onClick={handleUseLiveLocation}
                title="Use Live Location"
              >
                <Locate className="w-4 h-4 text-[#E67E22]" />
              </Button>
            </div>
            <Input
              value={formData.pickup_hotel}
              onChange={(e) => setFormData({ ...formData, pickup_hotel: e.target.value })}
              placeholder="Hotel name (optional)"
              className="h-10 text-sm"
              data-testid="tour-pickup-hotel-input"
            />
          </div>

          {/* Number of Days */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#E67E22]" />
              Number of Days
            </Label>
            <Select
              value={formData.num_days}
              onValueChange={(value) => setFormData({ ...formData, num_days: value })}
            >
              <SelectTrigger className="h-12" data-testid="num-days-select">
                <SelectValue placeholder="Select days" />
              </SelectTrigger>
              <SelectContent>
                {dayOptions.map(day => (
                  <SelectItem key={day} value={day}>{day} {parseInt(day) === 1 ? 'Day' : 'Days'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rate Info - Tour */}
          <div className="bg-[#E67E22]/10 rounded-xl p-4 border border-[#E67E22]/20" data-testid="rate-info-tour">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Rate</p>
                  <p className="text-xl font-bold text-[#E67E22]">Rs {(car.daily_rate || 22000).toLocaleString()}/day</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Includes</p>
                  <p className="text-sm font-semibold text-[#1A4D2E]">{car.included_km || 150} km/day</p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#E67E22]/20">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Total for {formData.num_days} {parseInt(formData.num_days) === 1 ? 'day' : 'days'}</p>
                  <p className="text-2xl font-bold text-[#1A4D2E]">Rs {totalTourCost.toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseInt(formData.num_days) * (car.included_km || 150)} km included • Free driver • Extra km at Rs {car.extra_km_price || 120}/km
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Date Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#E67E22]" />
            {bookingType === 'tour' ? 'Start Date' : 'Pickup Date'}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-12"
                data-testid="pickup-date-btn"
              >
                {formData.pickup_date ? format(formData.pickup_date, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.pickup_date}
                onSelect={(date) => setFormData({ ...formData, pickup_date: date })}
                disabled={(date) => date < getMinDate()}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#E67E22]" />
            Pickup Time
          </Label>
          <div className="flex gap-2">
            <Select
              value={timeParts.hour}
              onValueChange={(val) => setTimeParts(prev => ({ ...prev, hour: val }))}
            >
              <SelectTrigger className="h-12 flex-1">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select
              value={timeParts.minute}
              onValueChange={(val) => setTimeParts(prev => ({ ...prev, minute: val }))}
            >
              <SelectTrigger className="h-12 flex-1">
                <SelectValue placeholder="Min" />
              </SelectTrigger>
              <SelectContent>
                {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select
              value={timeParts.period}
              onValueChange={(val) => setTimeParts(prev => ({ ...prev, period: val }))}
            >
              <SelectTrigger className="h-12 w-[80px]">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                {periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Contact Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </Label>
            <Input
              value={formData.passenger_name}
              onChange={(e) => setFormData({ ...formData, passenger_name: e.target.value })}
              placeholder="John Doe"
              className="h-12"
              data-testid="passenger-name-input"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              type="email"
              value={formData.passenger_email}
              onChange={(e) => setFormData({ ...formData, passenger_email: e.target.value })}
              placeholder="john@example.com"
              className="h-12"
              data-testid="passenger-email-input"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone (WhatsApp)
          </Label>
          <div className="flex gap-2">
            <Select value={countryCode} onValueChange={setCountryCode}>
              <SelectTrigger className="w-[110px] h-12">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={formData.passenger_phone}
              onChange={(e) => setFormData({ ...formData, passenger_phone: formatPhoneNumber(e.target.value) })}
              placeholder="77 123 4567"
              className="h-12 flex-1"
              data-testid="passenger-phone-input"
              maxLength={20}
            />
          </div>
        </div>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Special Requests (Optional)
        </Label>
        <Textarea
          value={formData.special_requests}
          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
          placeholder={bookingType === 'tour' ? "Tour destinations, child seats, specific stops, etc." : "Child seats, specific stops, etc."}
          rows={3}
          data-testid="special-requests-input"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-[#E67E22] hover:bg-[#E67E22]/90 text-white rounded-xl text-lg font-semibold"
        data-testid="submit-booking-btn"
      >
        {loading ? 'Submitting...' : 'Submit Booking Inquiry'}
      </Button>

      <p className="text-sm text-center text-muted-foreground">
        Free driver included with all rentals. We'll contact you within 2 hours to confirm your booking.
      </p>
    </form>
  );
};
