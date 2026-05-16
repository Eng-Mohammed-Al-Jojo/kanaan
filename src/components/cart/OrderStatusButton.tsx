import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCheckCircle, FaUtensils, FaMotorcycle, FaTimes, FaBell } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FirebaseService } from "../../services/firebaseService";
import { useCart } from "../../context/CartContext";

export default function OrderStatusButton() {
    const { t, i18n } = useTranslation();
    const { orderId, updateOrderId, isFullTrackingOpen, setIsFullTrackingOpen } = useCart();
    const [order, setOrder] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const isRtl = i18n.language === 'ar';


    useEffect(() => {
        if (!orderId) {
            setOrder(null);
            setIsVisible(false);
            return;
        }

        const cleanId = orderId.replace(/#/g, '');
        const unsubscribe = FirebaseService.listen(`orders/${cleanId}`, (data) => {
            if (data) {
                setOrder(data);
                setIsVisible(true);
            } else {
                setOrder(null);
                setIsVisible(false);
            }
        });

        return () => unsubscribe();
    }, [orderId]);

    useEffect(() => {
        if (order && (order.status === 'delivered' || order.status === 'done' || order.archived)) {
            const timer = setTimeout(() => {
                updateOrderId(null);
            }, 20000);
            return () => clearTimeout(timer);
        }
    }, [order?.status, order?.archived, updateOrderId]);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return {
                    label: t('admin.pending'),
                    icon: <FaClock />,
                    color: "bg-orange",
                    progress: 20
                };
            case "confirmed":
                return {
                    label: t('admin.confirmed'),
                    icon: <FaCheckCircle />,
                    color: "bg-primary",
                    progress: 40
                };
            case "preparing":
                return {
                    label: t('admin.preparing'),
                    icon: <FaUtensils />,
                    color: "bg-primary",
                    progress: 60
                };
            case "ready":
                return {
                    label: t('admin.ready'),
                    icon: <FaBell />,
                    color: "bg-orange",
                    progress: 80
                };
            case "delivered":
            case "done":
                return {
                    label: t('admin.delivered'),
                    icon: <FaMotorcycle />,
                    color: "bg-secondary",
                    progress: 100
                };
            case "cancelled":
                return {
                    label: t('admin.cancelled'),
                    icon: <FaTimes />,
                    color: "bg-secondary",
                    progress: 100
                };
            default:
                return {
                    label: status,
                    icon: <FaClock />,
                    color: "bg-primary/20",
                    progress: 0
                };
        }
    };

    const dismiss = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateOrderId(null);
        setOrder(null);
        setIsVisible(false);
    };

    const handleOpenFull = () => {
        setIsFullTrackingOpen(true);
    };

    if (!isVisible || !order || order.tracked === false || isFullTrackingOpen) return null;

    const statusInfo = getStatusInfo(order.status || "pending");

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 20, opacity: 0, scale: 0.95 }}
                style={{ willChange: 'transform, opacity' }}
                onClick={handleOpenFull}
                className={`fixed bottom-24 ${isRtl ? 'left-6 sm:left-10' : 'right-6 sm:right-10'} z-50 w-[280px] sm:w-[320px] cursor-pointer`}
            >
                <div className="bg-cream/80 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] p-5 shadow-premium overflow-hidden relative group">
                    {/* Progress Bar Background */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary/5" />
                    <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: statusInfo.progress / 100 }}
                        style={{ originX: isRtl ? 1 : 0, willChange: 'transform' }}
                        className={`absolute top-0 left-0 right-0 h-1 ${statusInfo.color} transition-all duration-1000 shadow-[0_0_10px_rgba(198,139,89,0.3)]`}
                    />

                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl ${statusInfo.color} text-white flex items-center justify-center text-2xl shadow-lg border border-white/20`}>
                            {statusInfo.icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/30 mb-1">
                                {t('common.order_type')}: {order.orderType === 'in' ? t('common.dine_in') : t('common.takeaway')}
                            </p>
                            <h4 className="font-black text-primary truncate text-base tracking-tight">
                                {statusInfo.label}
                            </h4>
                        </div>

                        <button
                            onClick={dismiss}
                            className="w-10 h-10 rounded-xl bg-white/60 border border-primary/10 flex items-center justify-center text-primary/30 hover:text-secondary transition-all shadow-sm"
                        >
                            <FaTimes size={12} />
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="mt-5 flex justify-between gap-1.5 px-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div
                                key={step}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${statusInfo.progress >= step * 20 ? statusInfo.color : 'bg-primary/5'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Add simple tada animation style if not globally defined
// In a real project we'd add this to index.css
