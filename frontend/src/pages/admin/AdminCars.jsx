import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Car,
    Users,
    Briefcase,
    Wind,
    Settings2,
    Trash2,
    Edit2,
    X,
    Check,
    Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from 'components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from 'components/ui/select';
import { toast } from 'sonner';
import { useAuth } from 'context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function AdminCars() {
    const { token } = useAuth();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'sedan',
        image: '',
        passengers: 4,
        luggage: 2,
        ac: true,
        transmission: 'Auto',
        price_per_km: 120,
        daily_rate: 0,
        included_km: 0,
        extra_km_price: 0,
        features: '',
        description: ''
    });

    const fetchCars = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API}/api/cars`);
            setCars(response.data);
        } catch (error) {
            toast.error('Failed to fetch cars');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const handleOpenModal = (car = null) => {
        if (car) {
            setEditingCar(car);
            setFormData({
                ...car,
                daily_rate: car.daily_rate || 0,
                included_km: car.included_km || 0,
                extra_km_price: car.extra_km_price || 0,
                features: car.features.join(', ')
            });
        } else {
            setEditingCar(null);
            setFormData({
                name: '',
                type: 'sedan',
                image: '',
                passengers: 4,
                luggage: 2,
                ac: true,
                transmission: 'Auto',
                price_per_km: 120,
                daily_rate: 0,
                included_km: 0,
                extra_km_price: 0,
                features: '',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            features: formData.features.split(',').map(f => f.trim()).filter(f => f),
            passengers: parseInt(formData.passengers) || 0,
            luggage: parseInt(formData.luggage) || 0,
            price_per_km: parseFloat(formData.price_per_km) || 0,
            daily_rate: parseFloat(formData.daily_rate) || 0,
            included_km: parseFloat(formData.included_km) || 0,
            extra_km_price: parseFloat(formData.extra_km_price) || 0
        };

        try {
            if (editingCar) {
                await axios.put(`${API}/api/admin/cars/${editingCar.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Car updated successfully');
            } else {
                await axios.post(`${API}/api/admin/cars`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Car added successfully');
            }
            setIsModalOpen(false);
            fetchCars();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this car?')) return;
        try {
            await axios.delete(`${API}/api/admin/cars/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Car deleted successfully');
            fetchCars();
        } catch (error) {
            toast.error('Failed to delete car');
        }
    };

    const filteredCars = cars.filter(car =>
        car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-[#1A4D2E]">Fleet Management</h2>
                    <p className="text-muted-foreground text-sm">Add, remove, or update vehicles in your fleet</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search cars..."
                            className="pl-10 w-64 rounded-xl border-black/5 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Vehicle
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-black/5" />
                    ))
                ) : filteredCars.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No vehicles found</h3>
                        <p className="text-muted-foreground">Start by adding a new vehicle to your fleet.</p>
                    </div>
                ) : (
                    filteredCars.map((car) => (
                        <div key={car.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                <img
                                    src={car.image}
                                    alt={car.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'; }}
                                />
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1A4D2E] rounded-full text-xs font-bold uppercase tracking-wider">
                                        {car.type}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-serif text-xl font-medium text-[#1A4D2E] mb-1">{car.name}</h3>
                                        <p className="text-xs text-muted-foreground font-mono">{car.id}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(car)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#1A4D2E] transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(car.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>{car.passengers} Seats</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Briefcase className="w-4 h-4" />
                                        <span>{car.luggage} Bags</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Wind className="w-4 h-4" />
                                        <span>{car.ac ? 'AC' : 'Non-AC'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Settings2 className="w-4 h-4" />
                                        <span>{car.transmission}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 pt-4 border-t border-black/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Transfer (Per KM)</span>
                                        <span className="text-sm font-bold text-[#E67E22]">Rs {car.price_per_km}</span>
                                    </div>
                                    {(car.daily_rate > 0) && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-muted-foreground">Tour (Per Day)</span>
                                            <span className="text-sm font-bold text-[#E67E22]">Rs {car.daily_rate}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#1A4D2E]">
                            {editingCar ? 'Edit Vehicle' : 'Add New Vehicle'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vehicle Name</label>
                                <Input
                                    required
                                    placeholder="e.g. Toyota Prius"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sedan">Sedan</SelectItem>
                                        <SelectItem value="suv">SUV</SelectItem>
                                        <SelectItem value="van">Van</SelectItem>
                                        <SelectItem value="mini">Mini</SelectItem>
                                        <SelectItem value="bus">Bus</SelectItem>
                                        <SelectItem value="vip">VIP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <Input
                                    required
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Transfer: Price per KM (Rs)</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.price_per_km}
                                    onChange={(e) => setFormData({ ...formData, price_per_km: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tour: Daily Rate (Rs)</label>
                                <Input
                                    type="number"
                                    value={formData.daily_rate}
                                    onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tour: Included KM/Day</label>
                                <Input
                                    type="number"
                                    value={formData.included_km}
                                    onChange={(e) => setFormData({ ...formData, included_km: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Tour: Extra KM Price (Rs)</label>
                                <Input
                                    type="number"
                                    value={formData.extra_km_price}
                                    onChange={(e) => setFormData({ ...formData, extra_km_price: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Passengers</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.passengers}
                                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Luggage Capacity</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.luggage}
                                    onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Transmission</label>
                                <Select
                                    value={formData.transmission}
                                    onValueChange={(value) => setFormData({ ...formData, transmission: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Auto">Automatic</SelectItem>
                                        <SelectItem value="Manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-4 h-full pt-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.ac}
                                        onChange={(e) => setFormData({ ...formData, ac: e.target.checked })}
                                        className="w-4 h-4 accent-[#1A4D2E]"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Air Conditioning</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Features (comma separated)</label>
                            <Input
                                placeholder="AC, GPS, Free Driver, Hybrid..."
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <Textarea
                                required
                                placeholder="Tell us about this vehicle..."
                                className="h-24"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#1A4D2E] hover:bg-[#143D24] text-white rounded-xl px-8"
                            >
                                {editingCar ? 'Update Vehicle' : 'Save Vehicle'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
