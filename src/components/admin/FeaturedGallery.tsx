import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiImage, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

interface Props {
    visible: boolean;
    onClose: () => void;
    onSelect: (img: string) => void;
    galleryImages?: string[]; // Optional now
    manifestPath?: string;    // New: Path to JSON manifest
    selectedImage?: string;
    title?: string;
    basePath?: string;
    returnFullPath?: boolean;
}

const FeaturedGallery: React.FC<Props> = ({
    visible,
    onClose,
    onSelect,
    galleryImages = [],
    manifestPath,
    selectedImage,
    title,
    basePath = "/images/",
    returnFullPath = false
}) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [localImages, setLocalImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch images from manifest if provided
    useEffect(() => {
        if (visible && manifestPath) {
            setIsLoading(true);
            fetch(manifestPath)
                .then(res => res.json())
                .then(data => {
                    setLocalImages(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Gallery failed to load manifest:", err);
                    setIsLoading(false);
                });
        }
    }, [visible, manifestPath]);

    // Use either provided images or fetched images
    const activeImages = galleryImages.length > 0 ? galleryImages : localImages;

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const getFullSrc = (img: string) => {
        if (!img) return "/logo.png";

        if (img.startsWith("http")) return img;

        if (img.startsWith("/")) {
            return img.replace(/^\/?public\//, "/").replace(/\/+/g, "/");
        }

        const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
        return `${normalizedBase}${img}`.replace(/\/+/g, "/");
    };

    const filteredImages = activeImages.filter((img) => {
        const fullPath = getFullSrc(img).toLowerCase();
        const search = debouncedSearch.toLowerCase();
        return fullPath.includes(search) || img.toLowerCase().includes(search);
    });

    const handleSelect = (img: string) => {
        if (returnFullPath) {
            onSelect(getFullSrc(img));
        } else {
            onSelect(img);
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-10001 flex items-center justify-center p-4 md:p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md z-10000"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-4xl rounded-[2.5rem] border border-gray-100 shadow-premium flex flex-col max-h-[90vh] overflow-hidden z-10001 pointer-events-auto"
            >
                <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl shadow-xl shadow-primary/20">
                                <FiImage />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{title || t('admin.gallery_title')}</h2>
                                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">{t('admin.select_image_desc')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl bg-white text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all border border-gray-100 shadow-soft">
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="relative group">
                        <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('common.search') || "Search images..."}
                            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-soft"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-gray-50/30">
                    <motion.div layout className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                // Loading Skeleton
                                [...Array(10)].map((_, i) => (
                                    <div key={`skeleton-${i}`} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
                                ))
                            ) : filteredImages.map((img) => {
                                const fullUrl = getFullSrc(img);
                                const isSelected = selectedImage === img || selectedImage === fullUrl;
                                return (
                                    <motion.button
                                        layout
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        key={img}
                                        type="button"
                                        onClick={() => handleSelect(img)}
                                        className={`group relative rounded-3xl overflow-hidden border-2 transition-all duration-300 aspect-square shadow-soft
                                            ${isSelected ? "border-primary ring-4 ring-primary/10" : "border-white hover:border-primary/50 hover:shadow-premium"}`}
                                    >
                                        <img
                                            src={fullUrl}
                                            alt={img}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            onError={(e) => e.currentTarget.src = '/logo.png'}
                                        />

                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] flex items-center justify-center"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shadow-premium">
                                                        <FiCheck strokeWidth={4} size={20} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute inset-0 bg-linear-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 pointer-events-none">
                                            <span className="text-[9px] text-white font-black truncate w-full uppercase tracking-widest">{img.split('/').pop()}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {filteredImages.length === 0 && (
                        <div className="py-20 text-center space-y-6">
                            <div className="w-20 h-20 bg-white text-gray-200 rounded-3xl flex items-center justify-center mx-auto text-3xl shadow-soft border border-gray-100">
                                <FiSearch size={32} />
                            </div>
                            <p className="text-gray-900 font-black text-lg">{t('common.no_results') || "No images found"}</p>
                        </div>
                    )}
                </div>

                <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-4 rounded-xl bg-white text-gray-400 font-black border border-gray-100 hover:text-secondary hover:bg-secondary/5 transition-all shadow-soft uppercase tracking-widest text-xs"
                    >
                        {t('admin.close_gallery')}
                    </button>
                </div>
            </motion.div>
        </div>
    );

    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {visible && modalContent}
        </AnimatePresence>,
        document.body
    );
};

export default FeaturedGallery;
