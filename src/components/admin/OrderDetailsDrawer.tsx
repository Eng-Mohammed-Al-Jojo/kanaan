; import { motion, AnimatePresence } from "framer-motion";
import {
    FiX, FiUser, FiPhone, FiMapPin, FiClock,
    FiDollarSign, FiMessageSquare,
    FiPackage, FiTruck, FiChevronRight, FiCheck, FiRotateCw, FiTrash2, FiAlertTriangle
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { OrderService } from "../../services/orderService";
import { toast } from "react-hot-toast";
import { useState } from "react";
import type { Order, OrderStatus, PaymentStatus } from "../../types/order";

interface Props {
    order: Order | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function OrderDetailsDrawer({ order, isOpen, onClose }: Props) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [showHardDeleteConfirm, setShowHardDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    if (!order) return null;

    const updatePayment = async () => {
        const newStatus: PaymentStatus = order.paymentStatus === "paid" ? "unpaid" : "paid";
        try {
            await OrderService.updatePaymentStatus(order.id, newStatus);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const updateStatus = async (status: OrderStatus) => {
        try {
            await OrderService.updateStatus(order.id, status);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };


    const handleHardDelete = async () => {
        if (deleting) return;
        setDeleting(true);
        try {
            await OrderService.deleteOrder(order.id);
            toast.success(t('common.success_message'));
            onClose();
        } catch {
            toast.error(t('common.error'));
        } finally {
            setDeleting(false);
            setShowHardDeleteConfirm(false);
        }
    };

    const handleConfirmNotify = async () => {
        try {
            await OrderService.updateStatus(order.id, "confirmed");
            OrderService.notifyCustomer(order, 'confirm');
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleReadyNotify = async () => {
        try {
            await OrderService.updateStatus(order.id, "ready");
            OrderService.notifyCustomer(order, 'ready');
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const steps: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "delivered"];
    const currentStepIndex = steps.indexOf(order.status as OrderStatus);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex justify-end overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-sm z-0"
                    />

                        <motion.div
                        initial={{ x: isRtl ? "-100%" : "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: isRtl ? "-100%" : "100%" }}
                        transition={{ type: "spring", damping: 35, stiffness: 400 }}
                        className={`relative w-full max-w-lg bg-white/90 backdrop-blur-2xl h-full shadow-premium z-10 flex flex-col ${isRtl ? 'border-r' : 'border-l'} border-white overflow-hidden`}
                    >
                        {/* Heritage Design Accents */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-(--color-primary)/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-(--color-secondary)/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-(--color-primary)/5 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-md">
                            <div>
                                <span className="text-[8px] font-black text-(--color-primary) uppercase tracking-[0.2em] bg-(--color-primary)/5 px-2.5 py-1 rounded-lg border border-(--color-primary)/10">
                                    {order.orderId}
                                </span>
                                <h2 className="text-xl font-black text-(--color-primary) mt-2.5 tracking-tight">{t('admin.order_details') || "تفاصيل الطلب"}</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-9 h-9 rounded-xl bg-white text-(--color-primary)/30 flex items-center justify-center hover:bg-(--color-secondary)/10 hover:text-(--color-secondary) transition-all border border-(--color-primary)/5 shadow-soft active:scale-90"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                            {/* Order Progress Control Center */}
                            <section className="space-y-6">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30">{t('admin.status_progress') || "تتبع وتحديث الحالة"}</h3>
                                    {order.archived && (
                                        <span className="bg-(--color-primary)/5 text-(--color-primary)/40 text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] border border-(--color-primary)/5">{t('admin.archived')}</span>
                                    )}
                                </div>

                                {/* Simplified Status Visualization */}
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between p-5 bg-(--color-primary)/5 rounded-[1.8rem] border border-transparent shadow-inner group transition-all hover:bg-(--color-primary)/10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-white text-(--color-primary) flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-500">
                                                <FiClock size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mb-1">{t('admin.order_status')}</p>
                                                <p className="text-base font-black text-(--color-primary) leading-none tracking-tight">{t(`admin.${order.status}`)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {steps.map((st, idx) => (
                                                <div
                                                    key={st}
                                                    className={`w-6 h-1.5 rounded-full transition-all duration-700 ${idx <= currentStepIndex ? "bg-(--color-primary) shadow-lg shadow-(--color-primary)/30" : "bg-(--color-primary)/10"}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Smart Actions Contextual */}
                                <div className="grid grid-cols-1 gap-3.5 mt-5">
                                    {order.status === "pending" && (
                                        <button
                                            onClick={handleConfirmNotify}
                                            className="w-full h-14 bg-(--color-primary) text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2.5 shadow-xl shadow-(--color-primary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            <FiCheck size={18} />
                                            {t('admin.mark_confirmed') || "تأكيد الطلب وإبلاغ العميل"}
                                            <FaWhatsapp size={16} className="opacity-70" />
                                        </button>
                                    )}
                                    {order.status === "confirmed" && (
                                        <button
                                            onClick={() => updateStatus("preparing")}
                                            className="w-full h-14 bg-indigo-600 text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2.5 shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            <FiPackage size={18} />
                                            {t('admin.mark_preparing') || "بدء تحضير الطلب"}
                                        </button>
                                    )}
                                    {order.status === "preparing" && (
                                        <button
                                            onClick={handleReadyNotify}
                                            className="w-full h-14 bg-purple-600 text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2.5 shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            <FiBell size={18} />
                                            {t('admin.mark_ready') || "إخطار العميل بجاهزية الطلب"}
                                            <FaWhatsapp size={16} className="opacity-70" />
                                        </button>
                                    )}
                                    {(order.status === "ready" || order.status === "confirmed" || order.status === "preparing") && (
                                        <button
                                            onClick={() => updateStatus("delivered")}
                                            className="w-full h-14 bg-emerald-600 text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            <FiTruck size={18} />
                                            {t('admin.mark_delivered') || "تم التسليم بنجاح (إغلاق الطلب)"}
                                        </button>
                                    )}

                                    {order.status === "archived" && (
                                        <button
                                            onClick={() => updateStatus("pending")}
                                            className="w-full h-14 bg-blue-600 text-white rounded-xl font-black text-[13px] flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                                        >
                                            <FiRotateCw size={18} />
                                            {t('admin.restore') || "استعادة الطلب ونقله للنشطة"}
                                        </button>
                                    )}
                                </div>
                            </section>

                            <div className="h-px bg-primary/5" />

                            {/* Customer Info */}
                            <section className="space-y-5">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.customer_details')}</h3>
                                <div className="grid gap-3.5 bg-(--color-primary)/5 p-5 rounded-[1.8rem] border border-transparent shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-white shadow-soft flex items-center justify-center text-(--color-primary) border border-(--color-primary)/5">
                                            <FiUser size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mb-1">{t('admin.customer')}</p>
                                            <p className="text-base font-black text-(--color-primary) leading-none tracking-tight">{order.customer?.name}</p>
                                        </div>
                                    </div>
                                    {order.customer?.phone && (
                                        <div className="flex items-center gap-4 transition-transform hover:scale-[1.01] cursor-pointer group" onClick={() => OrderService.notifyCustomer(order, 'confirm')}>
                                            <div className="w-11 h-11 rounded-xl bg-emerald-50 shadow-soft flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                                <FiPhone size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[8px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mb-1">{t('admin.phone')}</p>
                                                <p className="text-base font-black text-(--color-primary) leading-none flex items-center gap-2.5 truncate tracking-tight">
                                                    {order.customer.phone}
                                                    <FaWhatsapp size={14} className="text-emerald-500 group-hover:scale-125 transition-transform" />
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {order.customer?.address && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-white shadow-soft flex items-center justify-center text-orange-500 border border-(--color-primary)/5">
                                                <FiMapPin size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mb-1">{t('whatsapp.address')}</p>
                                                <p className="text-base font-black text-(--color-primary) leading-none tracking-tight">{order.customer.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Items List */}
                            <section className="space-y-5">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30">{t('admin.ordered_items')}</h3>
                                    <span className="px-3.5 py-1 rounded-lg bg-(--color-primary)/5 text-(--color-primary)/40 text-[8px] font-black uppercase tracking-[0.2em] border border-(--color-primary)/5">
                                        {order.items?.length} {t('common.items')}
                                    </span>
                                </div>
                                <div className="bg-(--color-primary)/5 rounded-[1.8rem] border border-transparent overflow-hidden divide-y divide-(--color-primary)/5 shadow-inner">
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} className="p-4 flex justify-between items-center group hover:bg-white transition-all duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-xl bg-(--color-primary)/5 text-(--color-primary) flex items-center justify-center font-black text-[11px] shadow-sm border border-(--color-primary)/10 group-hover:bg-(--color-primary)/10">
                                                    {item.qty}×
                                                </div>
                                                <span className="text-sm font-black text-(--color-primary) leading-tight tracking-tight">
                                                    {isRtl ? item.nameAr : item.nameEn || item.nameAr}
                                                </span>
                                            </div>
                                            <span className="text-base font-black text-(--color-primary) tracking-tighter">
                                                {item.total}<span className="text-[10px] ml-1 opacity-30 uppercase">₪</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Financial Summary */}
                            <section className="bg-(--color-primary)/5 rounded-[1.8rem] p-6 border border-(--color-primary)/10 space-y-5 shadow-inner relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-(--color-primary)/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                                <div className="flex justify-between items-baseline relative z-10">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--color-primary)/40">{t('common.total')}</span>
                                    <div className="text-right">
                                        <div className="text-5xl font-black text-(--color-primary) tracking-tighter leading-none group-hover:scale-105 transition-transform duration-700">{order.totalPrice}<span className="text-lg ml-1.5 opacity-30 uppercase">₪</span></div>
                                        <div className={`text-[9px] font-black uppercase mt-3 tracking-[0.2em] px-3 py-1 rounded-full border inline-block ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-(--color-secondary)/10 text-(--color-secondary) border-(--color-secondary)/20'}`}>
                                            {order.paymentStatus === 'paid' ? t('admin.paid') : t('admin.unpaid')}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={updatePayment}
                                    className={`w-full h-16 flex items-center justify-center gap-3 rounded-xl font-black text-sm transition-all border uppercase tracking-widest relative z-10 ${order.paymentStatus === "paid"
                                        ? "bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-600/30"
                                        : "bg-white text-(--color-secondary) border-(--color-secondary)/20 hover:bg-(--color-secondary)/5 shadow-soft"
                                        }`}
                                >
                                    <FiDollarSign size={20} />
                                    {order.paymentStatus === "paid" ? (t('admin.paid') || "دُفعت التكلفة ✅") : (t('admin.mark_as_paid') || "تحديد كمدفوع الآن")}
                                </button>
                            </section>

                            {order.customer?.notes && (
                                <section className="p-6 rounded-[2rem] bg-amber-50/50 border border-amber-100/50 space-y-4 shadow-inner">
                                    <div className="flex items-center gap-3 text-[9px] font-black text-amber-600 uppercase tracking-[0.2em]">
                                        <FiMessageSquare size={18} />
                                        <span>{t('whatsapp.notes')}</span>
                                    </div>
                                    <p className="text-base font-bold text-amber-900 italic leading-relaxed">
                                        {order.customer.notes}
                                    </p>
                                </section>
                            )}

                        </div>

                        {/* Sticky Bottom Actions */}
                        <div className="p-6 border-t border-(--color-primary)/5 bg-white/80 backdrop-blur-xl flex flex-col gap-3 shrink-0 relative z-20">
                            {/* Hard Delete for Cancelled/Archived orders */}
                            {(order.status === "cancelled" || order.status === "archived") && (
                                !showHardDeleteConfirm ? (
                                    <button
                                        onClick={() => setShowHardDeleteConfirm(true)}
                                        className="w-full h-12 bg-(--color-secondary)/5 text-(--color-secondary) border border-(--color-secondary)/10 rounded-xl font-black text-[13px] hover:bg-(--color-secondary) hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2.5 uppercase tracking-widest"
                                    >
                                        <FiTrash2 size={18} />
                                        {t('admin.hard_delete') || "حذف نهائي"}
                                    </button>
                                ) : (
                                    <div className="bg-(--color-secondary)/5 border border-(--color-secondary)/20 rounded-xl p-4 space-y-2.5">
                                        <div className="flex items-center gap-2.5 text-(--color-secondary)">
                                            <FiAlertTriangle size={18} />
                                            <p className="text-[9px] font-black uppercase tracking-widest">{t('admin.hard_delete_confirm') || "لا يمكن التراجع عنه!"}</p>
                                        </div>
                                        <div className="flex gap-2.5">
                                            <button
                                                onClick={handleHardDelete}
                                                disabled={deleting}
                                                className="flex-2 h-10 bg-(--color-secondary) text-white rounded-lg font-black text-[9px] hover:bg-(--color-secondary)/80 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 uppercase tracking-widest"
                                            >
                                                {deleting ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <FiTrash2 size={14} />}
                                                {t('common.delete') || "تأكيد"}
                                            </button>
                                            <button
                                                onClick={() => setShowHardDeleteConfirm(false)}
                                                className="flex-1 h-10 bg-(--color-primary)/5 text-(--color-primary)/40 rounded-lg font-black text-[9px] hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest"
                                            >
                                                {t('common.cancel') || "إلغاء"}
                                            </button>
                                        </div>
                                    </div>
                                )
                            )}
                            <button
                                onClick={onClose}
                                className="w-full h-14 bg-(--color-primary)/5 text-(--color-primary) border border-(--color-primary)/10 rounded-xl font-black text-[13px] hover:bg-(--color-primary)/10 transition-all active:scale-95 flex items-center justify-center gap-2.5 shadow-soft uppercase tracking-widest"
                            >
                                <FiChevronRight className={isRtl ? "rotate-180" : ""} size={18} />
                                {t('common.close')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Internal icons helper
function FiBell({ size }: { size: number }) {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}
