import { useState, useEffect } from 'react';
import { Camera, Calendar } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

export default function GalleryPage() {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                const response = await axios.get(`${API}/api/galleries`);
                setGalleries(response.data);
            } catch (error) {
                toast.error('Failed to load gallery images');
            } finally {
                setLoading(false);
            }
        };

        fetchGalleries();
    }, []);

    // Flatten all images into a single array for masonry display,
    // but keep a reference to their parent gallery for details
    const allImages = galleries.flatMap(gallery =>
        gallery.images.map(imgUrl => ({
            url: imgUrl,
            title: gallery.title,
            date: gallery.date,
            galleryId: gallery.id
        }))
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 mt-16">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-white rounded-3xl animate-pulse border border-black/5" />
                        ))}
                    </div>
                ) : galleries.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-[#1A4D2E] mb-2">No Collections Yet</h2>
                        <p className="text-muted-foreground">Check back later for beautiful moments.</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {galleries.map((gallery) => (
                            <div key={gallery.id} className="space-y-6">
                                <div className="border-b border-black/10 pb-4">
                                    <h2 className="text-3xl font-serif font-bold text-[#1A4D2E] mb-2">
                                        {gallery.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Calendar className="w-4 h-4" />
                                        <span>{new Date(gallery.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                </div>

                                {gallery.images.length === 0 ? (
                                    <p className="text-gray-500 italic">No images in this collection.</p>
                                ) : (
                                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                        {gallery.images.map((imgUrl, idx) => (
                                            <div
                                                key={`${gallery.id}-${idx}`}
                                                className="break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer bg-white"
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt={`${gallery.title} image ${idx + 1}`}
                                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    loading="lazy"
                                                />

                                                {/* Overlay gradient for pleasant animation effect without text */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
