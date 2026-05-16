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
        <div className="fixed inset-0 z-10001 flex items-center justify-center p-1 md:p-3">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md z-10000"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 30 }}
                className="relative bg-white/95 backdrop-blur-2xl w-full max-w-5xl rounded-[3.5rem] border border-white shadow-premium flex flex-col max-h-[90vh] overflow-hidden z-10001 pointer-events-auto"
            >
                <div className="p-4 md:p-6 border-b border-(--color-primary)/5 bg-white/50 backdrop-blur-md space-y-8 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-(--color-primary) text-white flex items-center justify-center text-4xl shadow-2xl shadow-(--color-primary)/30">
                                <FiImage />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-(--color-primary) tracking-tight">{title || t('admin.gallery_title')}</h2>
                                <p className="text-(--color-primary)/30 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{t('admin.select_image_desc')}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 transition-all border border-(--color-primary)/5 shadow-soft active:scale-90">
                            <FiX size={28} />
                        </button>
                    </div>

                    <div className="relative group/search">
                        <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/search:text-(--color-primary) group-focus-within/search:scale-125 transition-all duration-500" size={24} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder={t('common.search') || "Search images..."}
                            className="w-full bg-white border border-transparent rounded-[1.5rem] py-5 pl-18 pr-8 text-sm font-black text-(--color-primary) outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all shadow-premium placeholder:text-(--color-primary)/10 uppercase tracking-[0.2em]"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-white/30 backdrop-blur-md">
                    <motion.div layout className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 md:gap-8">
                        <AnimatePresence mode="popLayout">
                            {isLoading ? (
                                // Loading Skeleton
                                [...Array(15)].map((_, i) => (
                                    <div key={`skeleton-${i}`} className="aspect-square bg-(--color-primary)/5 rounded-[2rem] animate-pulse" />
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
                                        className={`group relative rounded-[2.2rem] overflow-hidden border-2 transition-all duration-700 aspect-square shadow-soft
                                            ${isSelected ? "border-(--color-primary) ring-10 ring-(--color-primary)/5" : "border-transparent hover:border-(--color-primary)/20 hover:shadow-premium"}`}
                                    >
                                        <img
                                            src={fullUrl}
                                            alt={img}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                            onError={(e) => e.currentTarget.src = '/logo.png'}
                                        />

                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="absolute inset-0 bg-(--color-primary)/10 backdrop-blur-[3px] flex items-center justify-center"
                                                >
                                                    <motion.div
                                                        initial={{ scale: 0.5, rotate: -45 }}
                                                        animate={{ scale: 1, rotate: 0 }}
                                                        className="w-14 h-14 rounded-full bg-white text-(--color-primary) flex items-center justify-center shadow-premium"
                                                    >
                                                        <FiCheck strokeWidth={4} size={28} />
                                                    </motion.div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="absolute inset-0 bg-linear-to-t from-(--color-primary)/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 pointer-events-none">
                                            <span className="text-[10px] text-white font-black truncate w-full uppercase tracking-[0.2em]">{img.split('/').pop()}</span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>

                    {filteredImages.length === 0 && (
                        <div className="py-32 text-center space-y-10 relative z-10">
                            <div className="w-24 h-24 bg-white text-(--color-primary)/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-4xl shadow-premium border border-(--color-primary)/5">
                                <FiSearch size={40} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-(--color-primary) font-black text-2xl tracking-tight">{t('common.no_results') || "No images found"}</p>
                                <p className="text-[10px] text-(--color-primary)/30 font-black uppercase tracking-[0.3em]">{t('admin.no_search_results_desc') || "حاول البحث بكلمات مختلفة"}</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 md:p-6 border-t border-(--color-primary)/5 bg-white/50 backdrop-blur-md relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full h-18 rounded-[1.5rem] bg-white text-(--color-primary)/30 font-black border border-transparent hover:text-(--color-secondary) hover:bg-(--color-secondary)/5 transition-all shadow-soft active:scale-95 uppercase tracking-[0.3em] text-[10px]"
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
