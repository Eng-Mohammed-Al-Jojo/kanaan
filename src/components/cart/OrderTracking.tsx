import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiClock, FiCheckCircle, FiPackage, FiCheck, FiDollarSign,
    FiChevronRight, FiX, FiMapPin
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { FirebaseService } from "../../services/firebaseService";
import type { PaymentRecord } from "../../types/payment";
import { useCart } from "../../context/CartContext";

interface OrderTrackingProps {
    orderId: string;
    onClose: () => void;
    paymentRecord?: PaymentRecord | null;
}

function FiBell({ size }: { size: number }) {
    return <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} xmlns="http://www.w3.org/2000/svg"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
}

const STATUS_STAGES = ["pending", "confirmed", "preparing", "ready"];

const STAGE_ICONS: Record<string, React.ReactNode> = {
    pending: <FiClock size={20} />,
    confirmed: <FiCheckCircle size={20} />,
    preparing: <FiPackage size={20} />,
    ready: <FiBell size={20} />,
};

// Colors aligned with admin dashboard status badges
// Colors aligned with heritage palette
const STAGE_COLORS: Record<string, { active: string; done: string; label: string }> = {
    pending: { active: "bg-orange text-white border-orange shadow-orange/30", done: "bg-orange/10 text-orange border-orange/20", label: "text-orange" },
    confirmed: { active: "bg-primary text-white border-primary shadow-primary/30", done: "bg-primary/10 text-primary border-primary/20", label: "text-primary" },
    preparing: { active: "bg-primary text-white border-primary shadow-primary/30", done: "bg-primary/10 text-primary border-primary/20", label: "text-primary" },
    ready: { active: "bg-orange text-white border-orange shadow-orange/30", done: "bg-orange/10 text-orange border-orange/20", label: "text-orange" },
};

export default function OrderTracking({ orderId, onClose, paymentRecord: initialPaymentRecord }: OrderTrackingProps) {
    const { t, i18n } = useTranslation();
    const { saveOrderSession } = useCart();
    const isRtl = i18n.language === 'ar';
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(initialPaymentRecord || null);

    useEffect(() => {
        const cleanId = (id: string) => id.replace(/#/g, '');
        const unsubOrder = FirebaseService.listen(`orders/${cleanId(orderId)}`, (val) => {
            setOrder(val);
            setLoading(false);
            if (val && (val.status === "delivered" || val.archived)) {
                saveOrderSession(null); // Clear session when completed
            }
        });
        const unsubPayment = FirebaseService.listen(`payments`, (payments: Record<string, PaymentRecord>) => {
            if (payments) {
                const record = Object.values(payments).find(p => p.orderId === cleanId(orderId));
                if (record) setPaymentRecord(record);
            }
        });
        const timer = setTimeout(() => setLoading(false), 5000);
        return () => { unsubOrder(); unsubPayment(); clearTimeout(timer); };
    }, [orderId]);

    const maskValue = (val: string) => {
        if (!val || val.length < 5) return val;
        return val.slice(0, 3) + "****" + val.slice(-2);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
            <p className="text-primary/40 font-black mt-8 text-sm uppercase tracking-widest">{t('common.loading_order')}</p>
        </div>
    );

    if (!order) return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] px-10 text-center">
            <div className="w-28 h-28 rounded-4xl bg-white shadow-soft border border-primary/5 flex items-center justify-center text-6xl mb-8">🔍</div>
            <h3 className="text-2xl font-black text-primary tracking-tight">{t('common.order_not_found')}</h3>
            <p className="text-primary/40 text-sm mt-3 font-bold max-w-[240px] mx-auto leading-relaxed">{t('common.order_not_found_desc')}</p>
            <button onClick={onClose} className="mt-10 px-10 py-4 rounded-2xl bg-primary text-white font-black text-sm shadow-premium hover:scale-105 transition-all">
                {t('common.back_to_menu')}
            </button>
        </div>
    );

    const isUntracked = order.tracked === false;
    const isCompleted = order.status === "delivered" || order.archived === true;
    const currentStatus = order.status || "pending";
    const currentIndex = STATUS_STAGES.indexOf(currentStatus);

    return (
        <div className="flex flex-col h-full bg-cream/30">
            {/* Header */}
            <div className="px-6 sm:px-8 pt-8 pb-6 flex items-center justify-between border-b border-primary/5 shrink-0 bg-white/60 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/20">
                        <FiMapPin size={22} />
                    </div>
                    <div>
                        <p className="text-primary font-black text-base leading-tight">{t('common.order_status')}</p>
                        <p className="text-orange text-[10px] font-black uppercase tracking-[0.2em] mt-1">{order.orderId}</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-11 h-11 rounded-2xl bg-white/80 border border-primary/10 text-primary/30 hover:text-primary hover:rotate-90 flex items-center justify-center transition-all shadow-sm">
                    <FiX size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-8 py-8 space-y-6">
                <AnimatePresence mode="wait">

                    {/* COMPLETED */}
                    {isCompleted ? (
                        <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-12 space-y-8">
                            <div className="w-36 h-36 bg-secondary text-white rounded-[3.5rem] flex items-center justify-center text-6xl shadow-premium border-4 border-white/20">
                                <FiCheck size={64} strokeWidth={3} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-primary tracking-tight">{t('common.order_delivered') || "تم تسليم طلبك! 🎉"}</h3>
                                <p className="text-primary/40 font-bold max-w-[280px] mx-auto leading-relaxed text-sm">
                                    {t('common.enjoy_meal') || "نتمنى لك وجبة شهية وتجربة رائعة معنا. ننتظرك مجدداً!"}
                                </p>
                            </div>
                            <div className="px-8 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg">
                                {order.orderId}
                            </div>
                        </motion.div>

                    ) : !isUntracked ? (
                        <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">

                            {/* Live Badge */}
                            <div className="flex justify-center">
                                <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-orange/10 border border-orange/20 text-[10px] font-black text-orange uppercase tracking-[0.2em] shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                                    {t('common.live_tracking')}
                                </div>
                            </div>

                            {/* Status Timeline */}
                            <div className="bg-white/60 backdrop-blur-md border border-primary/5 rounded-[3rem] p-10 shadow-soft relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                                <div className="relative">
                                    {/* Track BG */}
                                    <div className="absolute top-10 left-8 right-8 h-1 bg-primary/5 rounded-full" />
                                    {/* Track Progress */}
                                    <div
                                        className="absolute top-10 h-1 bg-linear-to-r from-primary to-orange rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(198,139,89,0.3)]"
                                        style={{
                                            width: currentIndex < 0 ? '0%' : `${(currentIndex / (STATUS_STAGES.length - 1)) * 82}%`,
                                            [isRtl ? 'right' : 'left']: '2.5rem'
                                        }}
                                    />
                                    <div className="flex justify-between relative z-10">
                                        {STATUS_STAGES.map((status, idx) => {
                                            const isDone = idx < currentIndex;
                                            const isCurrent = idx === currentIndex;
                                            const colors = STAGE_COLORS[status];

                                            return (
                                                <div key={status} className="flex flex-col items-center gap-4">
                                                    <motion.div
                                                        animate={isCurrent ? { scale: [1, 1.15, 1], y: [0, -5, 0] } : {}}
                                                        transition={{ repeat: Infinity, duration: 3 }}
                                                        className={`
                                                            w-20 h-20 rounded-3xl flex items-center justify-center border-2 shadow-xl transition-all duration-700
                                                            ${isCurrent ? colors.active + " ring-8 ring-offset-2 ring-current/10 border-white/50" : isDone ? colors.done : "bg-white/40 text-primary/10 border-primary/5"}
                                                        `}
                                                    >
                                                        {STAGE_ICONS[status]}
                                                    </motion.div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isCurrent || isDone ? colors.label : 'text-primary/10'}`}>
                                                        {t(`admin.${status}`)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white border border-primary/5 rounded-[2.5rem] p-8 shadow-premium space-y-6">
                                <div className="flex justify-between text-[10px] font-black text-primary/30 uppercase tracking-[0.2em]">
                                    <span>{t('admin.ordered_items')}</span>
                                    <span>{order.items?.length} {t('admin.products')}</span>
                                </div>
                                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {order.items?.map((item: any, i: number) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <div className="flex gap-3 items-center">
                                                <span className="w-8 h-8 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-black text-[11px] border border-primary/10 shadow-sm">{item.qty}</span>
                                                <span className="font-black text-primary">{i18n.language === 'ar' ? item.nameAr : item.nameEn || item.nameAr}</span>
                                            </div>
                                            <span className="font-black text-primary/40 tracking-tighter">{item.total}₪</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-6 border-t border-primary/5 flex justify-between items-center">
                                    <span className="text-xs font-black text-primary/30 uppercase tracking-widest">{t('common.total')}</span>
                                    <span className="text-3xl font-black text-primary tracking-tighter">{order.totalPrice}₪</span>
                                </div>
                            </div>

                            {/* Payment Status */}
                            {(paymentRecord || order.paymentStatus) && (
                                <div className="bg-white border border-primary/5 rounded-[2.5rem] p-8 shadow-premium space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                            <FiDollarSign size={16} className="text-primary" />
                                            {t('admin.payment')}
                                        </div>
                                        <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${order.paymentStatus === 'paid'
                                            ? 'bg-secondary/10 text-secondary border-secondary/20'
                                            : paymentRecord?.status === 'pending'
                                                ? 'bg-orange/10 text-orange border-orange/20'
                                                : 'bg-primary/5 text-primary/30 border-primary/10'
                                            }`}>
                                            {order.paymentStatus === 'paid' ? t('admin.paid') :
                                                paymentRecord?.status === 'pending' ? t('common.under_review') : t('admin.unpaid')}
                                        </div>
                                    </div>
                                    {paymentRecord && (
                                        <div className="grid grid-cols-2 gap-6 pt-5 border-t border-primary/5">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{t('common.payment_method')}</p>
                                                <p className="text-xs font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/5 inline-block">{paymentRecord.methodName}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{t('common.account_name')}</p>
                                                <p className="text-xs font-black text-primary truncate bg-white border border-primary/5 px-4 py-2 rounded-xl shadow-sm">{maskValue(paymentRecord.senderAccountName || "")}</p>
                                            </div>
                                            {paymentRecord.senderBankOrWallet && (
                                                <div className="col-span-2 space-y-2 pt-1">
                                                    <p className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{t('common.sender_bank_wallet')}</p>
                                                    <p className="text-sm font-black text-orange bg-orange/5 px-5 py-3 rounded-2xl border border-orange/10 inline-block shadow-inner">{paymentRecord.senderBankOrWallet}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>

                    ) : null}

                    {/* WHATSAPP UNTRACKED */}
                    {isUntracked && !isCompleted && (
                        <motion.div key="wa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-10 space-y-8">
                            <div className="w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center text-6xl shadow-premium border-4 border-white/20">
                                <FaWhatsapp />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-primary tracking-tight">{t('admin.order_sent_wa')}</h3>
                                <p className="text-primary/40 text-sm font-bold max-w-[240px] mx-auto leading-relaxed">{t('admin.tracking_disabled')}</p>
                            </div>
                            <div className="w-full bg-white border border-primary/5 rounded-[2.5rem] p-8 shadow-premium space-y-4">
                                {[
                                    { label: t('common.order_id'), value: order.orderId },
                                    { label: t('admin.customer'), value: order.customer?.name },
                                    { label: t('admin.phone'), value: maskValue(order.customer?.phone || "") },
                                ].map((row, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-primary/5">
                                        <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{row.label}</span>
                                        <span className="text-sm font-black text-primary">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-10 pt-4 bg-white/60 backdrop-blur-md border-t border-primary/5 shrink-0">
                <button
                    onClick={onClose}
                    className="w-full py-5 rounded-2xl bg-primary text-white font-black text-sm shadow-premium hover:bg-primary-dark transition-all flex items-center justify-center gap-3 group"
                >
                    <FiChevronRight className={`transition-transform group-hover:translate-x-2 ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : ''}`} size={20} />
                    {t('common.back_to_menu')}
                </button>
            </div>
        </div>
    );
}
