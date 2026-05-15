import React, { useState } from "react";
import { ref, update, remove } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaUtensils, FaShoppingBag, FaClock, FaTrash, FaHistory } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface Props {
    orders: Record<string, any>;
}

const OrderSection: React.FC<Props> = ({ orders }) => {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [openOrder, setOpenOrder] = useState<string | null>(null);

    const orderArray = Object.entries(orders || {})
        .map(([id, order]) => ({ id, ...order }))
        .sort((a, b) => b.createdAt - a.createdAt);

    const toggleOrder = (id: string) => {
        setOpenOrder(openOrder === id ? null : id);
    };

    const updateStatus = (id: string, status: string) => {
        update(ref(db, `orders/${id}`), { status });
    };

    const deleteOrder = (id: string) => {
        if (confirm(t('admin.confirm_delete_order'))) {
            remove(ref(db, `orders/${id}`));
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "pending": return "bg-(--color-secondary)/10 text-(--color-secondary) border-(--color-secondary)/20";
            case "preparing": return "bg-blue-50 text-blue-600 border-blue-100";
            case "ready": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case "done":
            case "delivered": return "bg-(--color-primary)/5 text-(--color-primary)/40 border-(--color-primary)/10";
            case "cancelled": return "bg-(--color-secondary)/10 text-(--color-secondary) border-(--color-secondary)/20";
            default: return "bg-(--color-primary)/5 text-(--color-primary)/40 border-(--color-primary)/10";
        }
    };

    const getStatusName = (status: string) => {
        switch (status) {
            case "pending": return t('admin.pending');
            case "preparing": return t('admin.preparing');
            case "ready": return t('admin.ready');
            case "done":
            case "delivered": return t('admin.delivered');
            case "cancelled": return t('admin.cancelled');
            default: return status;
        }
    };

    return (
        <div className="space-y-12">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 mb-16 px-4">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2rem] bg-(--color-primary)/5 text-(--color-primary) flex items-center justify-center shadow-inner border border-(--color-primary)/5">
                        <FaHistory className="text-3xl" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-(--color-primary) tracking-tight">
                            {t('admin.orders_board')}
                        </h2>
                        <p className="text-(--color-primary)/30 text-[11px] font-black uppercase tracking-[0.3em] mt-3">
                            {t('admin.manage_orders')}
                        </p>
                    </div>
                </div>
                <div className="bg-white/80 backdrop-blur-xl px-12 py-6 rounded-[2.5rem] border border-white flex items-center gap-6 self-end sm:self-auto shadow-premium group">
                    <div className="flex flex-col items-center">
                        <span className="text-(--color-primary) font-black text-4xl leading-none tracking-tighter group-hover:scale-110 transition-transform">{orderArray.length}</span>
                        <span className="text-(--color-primary)/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{t('admin.total_orders')}</span>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                <AnimatePresence mode="popLayout">
                    {orderArray.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/50 backdrop-blur-sm rounded-[4rem] p-32 text-center border-2 border-dashed border-(--color-primary)/10 shadow-inner"
                        >
                            <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-6xl shadow-soft border border-(--color-primary)/5">
                                📋
                            </div>
                            <p className="text-(--color-primary)/20 font-black text-2xl uppercase tracking-[0.3em]">{t('admin.no_orders')}</p>
                        </motion.div>
                    ) : (
                        orderArray.map((order, index) => {
                            const isOpen = openOrder === order.id;
                            const statusStyles = getStatusStyles(order.status || "pending");

                            return (
                                <motion.div
                                    layout
                                    key={order.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className={`bg-white rounded-[3.5rem] border transition-all duration-700 shadow-soft overflow-hidden ${isOpen ? "border-(--color-primary) shadow-premium scale-[1.01]" : "border-(--color-primary)/5 hover:border-(--color-primary)/20 hover:shadow-premium"
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleOrder(order.id)}
                                        className={`w-full ${isRtl ? 'text-right' : 'text-left'} flex flex-col md:flex-row md:items-center gap-6 p-8`}
                                    >
                                        <div className="flex items-center gap-8 flex-1">
                                            <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-inner shrink-0 ${order.orderType === "in" ? "bg-(--color-secondary)/10 text-(--color-secondary) border border-(--color-secondary)/10" : "bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/10"
                                                }`}>
                                                {order.orderType === "in" ? <FaUtensils /> : <FaShoppingBag />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-black text-2xl text-(--color-primary) flex flex-wrap items-center gap-6 tracking-tight">
                                                    <span className="truncate">{order.customer?.name || t('admin.customer')}</span>
                                                    {order.customer?.table && (
                                                        <span className="bg-(--color-primary) text-white text-[10px] px-5 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl shadow-(--color-primary)/30">
                                                            {t('common.table')} {order.customer.table}
                                                        </span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center gap-6 text-[10px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mt-3">
                                                    <span className="flex items-center gap-2.5">
                                                        <FaClock size={16} className="text-(--color-primary)/20" />
                                                        {new Date(order.createdAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="opacity-30">•</span>
                                                    <span>{order.items?.length} {t('admin.products')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-8 md:pt-0">
                                            <div className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shrink-0 shadow-sm transition-all duration-700 ${statusStyles}`}>
                                                {getStatusName(order.status || "pending")}
                                            </div>
                                            <div className="text-4xl font-black text-(--color-primary) tracking-tighter whitespace-nowrap">
                                                {order.totalPrice}<span className="text-sm font-black opacity-30 ml-1.5 uppercase">₪</span>
                                            </div>
                                            <div className={`text-(--color-primary)/20 transition-all duration-700 ${isOpen ? "rotate-180 text-(--color-primary)" : ""}`}>
                                                <FaChevronDown size={24} />
                                            </div>
                                        </div>
                                    </button>

                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden border-t border-(--color-primary)/5 bg-(--color-cream)/5"
                                            >
                                                <div className="px-10 pb-12 pt-8">
                                                    <div className="grid md:grid-cols-2 gap-12 py-8">
                                                        <div className="space-y-8">
                                                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 flex items-center gap-4 px-2">
                                                                <div className="w-3 h-6 bg-(--color-primary) rounded-full shadow-lg shadow-(--color-primary)/20" />
                                                                {t('admin.customer_details')}
                                                            </h4>
                                                            <div className="bg-white p-8 rounded-[2rem] border border-(--color-primary)/5 shadow-soft space-y-5">
                                                                {order.customer?.phone && (
                                                                    <p className="text-sm font-black text-(--color-primary) flex items-center gap-5">
                                                                        <span className="w-12 h-12 rounded-2xl bg-(--color-primary)/5 flex items-center justify-center text-2xl shadow-inner border border-(--color-primary)/5">📱</span>
                                                                        {order.customer.phone}
                                                                    </p>
                                                                )}
                                                                {order.customer?.address && (
                                                                    <p className="text-sm font-black text-(--color-primary) flex items-center gap-5">
                                                                        <span className="w-12 h-12 rounded-2xl bg-(--color-primary)/5 flex items-center justify-center text-2xl shadow-inner border border-(--color-primary)/5">📍</span>
                                                                        {order.customer.address}
                                                                    </p>
                                                                )}
                                                                {order.customer?.notes && (
                                                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mt-6 flex gap-5 italic shadow-inner">
                                                                        <span className="text-3xl opacity-40">📝</span>
                                                                        <p className="text-sm font-bold text-amber-900 leading-relaxed">{order.customer.notes}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 flex items-center gap-4 px-2">
                                                                <div className="w-3 h-6 bg-(--color-secondary) rounded-full shadow-lg shadow-(--color-secondary)/20" />
                                                                {t('admin.ordered_items')}
                                                            </h4>
                                                            <div className="bg-white p-8 rounded-[2rem] border border-(--color-primary)/5 shadow-soft divide-y divide-(--color-primary)/5">
                                                                {order.items.map((item: any, i: number) => {
                                                                    const itemName = isRtl
                                                                        ? (item.nameAr || item.nameEn || item.name)
                                                                        : (item.nameEn || item.nameAr || item.name);
                                                                    return (
                                                                        <div key={i} className="flex justify-between py-5 text-sm group hover:bg-(--color-primary)/5 transition-all px-2 rounded-xl">
                                                                            <span className="font-black text-(--color-primary)">
                                                                                <span className="text-(--color-primary) font-black mr-4 bg-(--color-primary)/5 px-4 py-1.5 rounded-xl border border-(--color-primary)/10 shadow-sm">{item.qty}×</span> {itemName}
                                                                            </span>
                                                                            <span className="font-black text-(--color-primary) text-lg tracking-tighter">{item.total}<span className="text-xs opacity-30 ml-1 uppercase">₪</span></span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-10 mt-12 pt-12 border-t border-(--color-primary)/5">
                                                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4 sm:pb-0">
                                                            {[
                                                                { id: 'pending', label: t('admin.pending'), icon: '⏳', color: 'secondary' },
                                                                { id: 'preparing', label: t('admin.preparing'), icon: '👨‍🍳', color: 'blue' },
                                                                { id: 'ready', label: t('admin.ready'), icon: '🔔', color: 'emerald' },
                                                                { id: 'delivered', label: t('admin.delivered'), icon: '✅', color: 'primary' }
                                                            ].map((st) => (
                                                                <button
                                                                    key={st.id}
                                                                    onClick={() => updateStatus(order.id, st.id)}
                                                                    className={`
                                                                        px-8 h-14 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all flex items-center gap-4 shadow-soft border border-transparent
                                                                        ${order.status === st.id || (st.id === 'pending' && !order.status)
                                                                            ? `bg-${st.id === 'delivered' ? '(--color-primary)' : st.id === 'pending' ? '(--color-secondary)' : st.id === 'preparing' ? 'blue-600' : 'emerald-600'} text-white shadow-xl scale-[1.05] z-10`
                                                                            : 'bg-white text-(--color-primary)/30 border-(--color-primary)/5 hover:bg-white hover:border-(--color-primary)/30 hover:text-(--color-primary) hover:shadow-premium'
                                                                        }
                                                                    `}
                                                                >
                                                                    <span className="text-2xl">{st.icon}</span>
                                                                    <span>{st.label}</span>
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <button
                                                            onClick={() => deleteOrder(order.id)}
                                                            className="flex items-center justify-center gap-4 px-10 h-14 rounded-[1.2rem] text-[11px] font-black uppercase tracking-[0.2em] bg-white text-(--color-secondary) hover:bg-(--color-secondary) hover:text-white transition-all border border-(--color-secondary)/10 shadow-soft active:scale-95"
                                                        >
                                                            <FaTrash size={18} />
                                                            {t('admin.delete_order')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderSection;
