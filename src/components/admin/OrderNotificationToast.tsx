import { motion, AnimatePresence } from "framer-motion";
import { FiShoppingBag, FiInfo, FiX } from "react-icons/fi";
import type { Order } from "../../types/order";

interface Props {
    notifications: Order[];
    onClose: (id: string) => void;
    onView: (order: Order) => void;
}

/**
 * OrderNotificationToast
 * Premium stacked notification system for new orders
 */
export default function OrderNotificationToast({ notifications, onClose, onView }: Props) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-8 right-8 z-200 flex flex-col gap-6 w-full max-w-sm pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((order) => (
                    <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, x: 100, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.3 } }}
                        className="w-full bg-white/95 backdrop-blur-2xl border border-white shadow-premium rounded-[3rem] overflow-hidden pointer-events-auto flex flex-col group relative"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-(--color-primary)/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                        <div className="p-8 flex items-start gap-6 relative z-10">
                            <div className="w-20 h-20 rounded-[1.5rem] bg-(--color-primary) text-white flex items-center justify-center shrink-0 shadow-2xl shadow-(--color-primary)/30 group-hover:scale-110 transition-transform duration-700">
                                <FiShoppingBag size={36} className="animate-bounce" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="text-[11px] font-black text-(--color-primary)/30 uppercase tracking-[0.3em]">طلب جديد! 🔔</h3>
                                    <button
                                        onClick={() => onClose(order.id)}
                                        className="text-(--color-primary)/20 hover:text-(--color-secondary) p-2 -m-2 transition-all active:scale-90"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                <p className="text-4xl font-black text-(--color-primary) tracking-tighter mt-2">
                                    #{order.orderId}
                                </p>

                                <div className="flex items-center gap-3 mt-4">
                                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.orderType === 'in' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/10'}`}>
                                        {order.orderType === 'in' ? 'داخل المطعم 🍽️' : 'تيك أواي 🥡'}
                                    </span>
                                    <span className="text-[11px] font-black text-(--color-primary)/40 truncate max-w-[120px] uppercase tracking-widest">
                                        {order.customer?.name}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 pb-8 relative z-10">
                            <button
                                onClick={() => {
                                    onView(order);
                                    onClose(order.id);
                                }}
                                className="w-full h-16 bg-(--color-primary)/5 hover:bg-(--color-primary) text-(--color-primary) hover:text-white rounded-[1.2rem] text-[10px] font-black transition-all flex items-center justify-center gap-3 border border-transparent shadow-soft hover:shadow-2xl hover:shadow-(--color-primary)/30 uppercase tracking-[0.2em] active:scale-95"
                            >
                                <FiInfo size={20} />
                                عرض تفاصيل الطلب
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
