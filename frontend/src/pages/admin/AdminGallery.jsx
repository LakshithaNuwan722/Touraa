import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Image as ImageIcon,
    Calendar,
    Trash2,
    Edit2,
    X,
    UploadCloud,
    Link
} from 'lucide-react';
import axios from 'axios';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
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

export default function AdminGallery() {
    const { token } = useAuth();
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGallery, setEditingGallery] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        images: []
    });

    const fetchGalleries = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API}/api/galleries`);
            setGalleries(response.data);
        } catch (error) {
            toast.error('Failed to fetch galleries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGalleries();
    }, []);

    const handleOpenModal = (gallery = null) => {
        if (gallery) {
            setEditingGallery(gallery);
            setFormData({
                title: gallery.title,
                date: gallery.date,
                images: [...gallery.images]
            });
        } else {
            setEditingGallery(null);
            setFormData({
                title: '',
                date: new Date().toISOString().split('T')[0],
                images: []
            });
        }
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`File ${file.name} is not an image`);
                    continue;
                }
                const uploadData = new FormData();
                uploadData.append('file', file);

                const response = await axios.post(`${API}/api/upload`, uploadData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                uploadedUrls.push(`${API}${response.data.url}`);
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
            toast.success(`Successfully uploaded ${uploadedUrls.length} images`);
        } catch (error) {
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) return;
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, newImageUrl.trim()]
        }));
        setNewImageUrl('');
        toast.success('Image link added successfully');
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.images.length === 0) {
            toast.error('Please add at least one image link');
            return;
        }

        try {
            if (editingGallery) {
                await axios.put(`${API}/api/admin/galleries/${editingGallery.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Gallery updated successfully');
            } else {
                await axios.post(`${API}/api/admin/galleries`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Gallery created successfully');
            }
            setIsModalOpen(false);
            fetchGalleries();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gallery collection?')) return;
        try {
            await axios.delete(`${API}/api/admin/galleries/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Gallery deleted successfully');
            fetchGalleries();
        } catch (error) {
            toast.error('Failed to delete gallery');
        }
    };

    const filteredGalleries = galleries.filter(gallery =>
        gallery.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="font-serif text-2xl font-medium text-[#1A4D2E]">Gallery Management</h2>
                    <p className="text-muted-foreground text-sm">Organize and publish event images by date</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search galleries..."
                            className="pl-10 w-64 rounded-xl border-black/5 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-[#E67E22] hover:bg-[#D35400] text-white rounded-xl gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Collection
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-black/5" />
                    ))
                ) : filteredGalleries.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold">No galleries found</h3>
                        <p className="text-muted-foreground">Start by creating a new image collection.</p>
                    </div>
                ) : (
                    filteredGalleries.map((gallery) => (
                        <div key={gallery.id} className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                                {gallery.images.length > 0 ? (
                                    <img
                                        src={gallery.images[0]}
                                        alt={gallery.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800'; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#1A4D2E] rounded-full text-xs font-bold uppercase tracking-wider">
                                        {gallery.images.length} Images
                                    </span>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="font-serif text-xl font-medium text-[#1A4D2E] mb-1">{gallery.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(gallery.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(gallery)}
                                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-[#1A4D2E] transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(gallery.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[90vw]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl text-[#1A4D2E]">
                            {editingGallery ? 'Edit Collection' : 'Create Collection'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Collection Title</label>
                                <Input
                                    required
                                    placeholder="e.g. Summer Tour 2026"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Event Date</label>
                                <Input
                                    required
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-700">Images</label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="rounded-xl gap-2 border-black/10"
                                    >
                                        <UploadCloud className="w-4 h-4" />
                                        {isUploading ? 'Uploading...' : 'Upload Images'}
                                    </Button>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Or paste image URL here..."
                                            value={newImageUrl}
                                            onChange={(e) => setNewImageUrl(e.target.value)}
                                            className="pl-9 rounded-xl"
                                        />
                                    </div>
                                    <Button 
                                        type="button" 
                                        variant="secondary"
                                        onClick={handleAddImageUrl}
                                        disabled={!newImageUrl.trim()}
                                        className="rounded-xl whitespace-nowrap bg-gray-100 hover:bg-gray-200 text-gray-900"
                                    >
                                        Add Link
                                    </Button>
                                </div>
                            </div>

                            {formData.images.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-black/5">
                                    {formData.images.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img
                                                src={url}
                                                alt={`Upload ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No images added yet.</p>
                                </div>
                            )}
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
                                disabled={isUploading || formData.images.length === 0}
                                className="bg-[#1A4D2E] hover:bg-[#143D24] text-white rounded-xl px-8 disabled:opacity-50"
                            >
                                {editingGallery ? 'Update Collection' : 'Save Collection'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
