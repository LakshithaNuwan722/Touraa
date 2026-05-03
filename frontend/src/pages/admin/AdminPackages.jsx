import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Package,
    Clock,
    MapPin,
    Star,
    Trash2,
    Edit2,
    X,
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
import { toast } from 'sonner';
import { useAuth } from 'context/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function AdminPackages() {
    const { token } = useAuth();
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        duration: '',
        highlights: '',
        price_from: 0,
        destinations: ''
    });

    const fetchPackages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API}/api/packages`);
            setPackages(response.data);
        } catch (error) {
            toast.error('Failed to fetch packages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleOpenModal = (pkg = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({
                ...pkg,
                highlights: pkg.highlights.join(', '),
                destinations: pkg.destinations.join(', ')
            });
        } else {
            setEditingPackage(null);
            setFormData({
                name: '',
                description: '',
                image: '',
                duration: '',
                highlights: '',
                price_from: 0,
                destinations: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            highlights: formData.highlights.split(',').map(h => h.trim()).filter(h => h),
            destinations: formData.destinations.split(',').map(d => d.trim()).filter(d => d),
            price_from: parseFloat(formData.price_from)
        };

        try {
            if (editingPackage) {
                await axios.put(`${API}/api/admin/packages/${editingPackage.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Package updated successfully');
            } else {
                await axios.post(`${API}/api/admin/packages`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Package added successfully');
            }
            setIsModalOpen(false);
            fetchPackages();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this package?')) return;
        try {
            await axios.delete(`${API}/api/admin/packages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Package deleted successfully');
            fetchPackages();
        } catch (error) {
            toast.error('Failed to delete package');
        }
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.destinations.some(d => d.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-[#1A4D2E]">Tour Packages</h2>
                    <p className="text-muted-foreground text-sm">Create and manage your curated tour experiences</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search packages..."
                            className="pl-10 w-64 rounded-xl border-black/5 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Package
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-black/5" />
                    ))
                ) : filteredPackages.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No packages found</h3>
                        <p className="text-muted-foreground">Start by adding a new tour package.</p>
                    </div>
                ) : (
                    filteredPackages.map((pkg) => (
                        <div key={pkg.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                <img
                                    src={pkg.image}
                                    alt={pkg.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1559038300-07cb5d6c3d27?w=800'; }}
                                />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => handleOpenModal(pkg)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-[#1A4D2E] transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pkg.id)}
                                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1A4D2E] rounded-full text-xs font-bold">
                                        {pkg.duration}
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-serif text-xl font-medium text-[#1A4D2E] mb-2">{pkg.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{pkg.description}</p>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 text-[#E67E22]" />
                                        <span className="line-clamp-1">{pkg.destinations.join(' • ')}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-gray-600">
                                        <Star className="w-4 h-4 mt-0.5 text-[#E67E22]" />
                                        <span className="line-clamp-1">{pkg.highlights.slice(0, 2).join(', ')}...</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                                    <span className="text-sm font-medium text-muted-foreground">From</span>
                                    <span className="text-lg font-bold text-[#E67E22]">Rs {pkg.price_from.toLocaleString()}</span>
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
                            {editingPackage ? 'Edit Tour Package' : 'Add New Package'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Package Name</label>
                                <Input
                                    required
                                    placeholder="e.g. Cultural Triangle Explorer"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Duration</label>
                                <Input
                                    required
                                    placeholder="e.g. 5 Days / 4 Nights"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Image URL</label>
                                <Input
                                    required
                                    placeholder="https://"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Starting Price (Rs)</label>
                                <Input
                                    required
                                    type="number"
                                    value={formData.price_from}
                                    onChange={(e) => setFormData({ ...formData, price_from: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>
                            <Textarea
                                required
                                placeholder="A brief overview of the tour package..."
                                className="h-24"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Destinations (comma separated)</label>
                            <Input
                                required
                                placeholder="Kandy, Nuwara Eliya, Ella..."
                                value={formData.destinations}
                                onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Highlights (comma separated)</label>
                            <Input
                                required
                                placeholder="Tea Factory, Nine Arch Bridge, Temple of Tooth..."
                                value={formData.highlights}
                                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
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
                                {editingPackage ? 'Update Package' : 'Save Package'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
