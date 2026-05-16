import { useRef, useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiShoppingCart, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import CartItem from "./CartItem";
import OrderTabs from "./OrderTabs";
import OrderTracking from "./OrderTracking";
import { db } from "../../firebase";
import { onValue, ref } from "firebase/database";
import { OrderService } from "../../services/orderService";
import { PaymentService } from "../../services/paymentService";
import { toast } from "react-hot-toast";
import type { PaymentMethod, PaymentRecord } from "../../types/payment";
import PaymentFlow from "./PaymentFlow";
import { FiDollarSign } from "react-icons/fi";

interface OrderSettings {
    inRestaurant: boolean;
    takeaway: boolean;
    inPhone: string;
    outPhone: string;
    orderMode?: "dashboard" | "whatsapp";
}

export default function CartModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { items, totalPrice, clearCart, orderId, updateOrderId, isFullTrackingOpen, setIsFullTrackingOpen, orderSession, saveOrderSession } = useCart();
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const [step, setStep] = useState<"items" | "order" | "payment">("items");
    const [orderSettings, setOrderSettings] = useState<OrderSettings | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
    const [createdOrderDisplayId, setCreatedOrderDisplayId] = useState<string | null>(null);
    const [customerName, setCustomerName] = useState<string>("");
    const [paymentRecord, setPaymentRecord] = useState<PaymentRecord | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sRef = ref(db, "settings");
        const unsubSettings = onValue(sRef, (snap) => {
            const data = snap.val() || {};
            setOrderSettings(
                data.orderMode
                    ? { ...data.orderSettings, orderMode: data.orderMode }
                    : data.orderSettings || null
            );
        });
        const unsubMethods = PaymentService.listenToPaymentMethods((methods) => {
            setPaymentMethods(methods.filter(m => m.isEnabled));
        });
        return () => { unsubSettings(); unsubMethods(); };
    }, []);

    useEffect(() => {
        if (!paymentRecord?.id) return;
        const pRef = ref(db, `payments/${paymentRecord.id}`);
        return onValue(pRef, (snap) => {
            const data = snap.val();
            if (data) {
                setPaymentRecord(data);
                if (data.status === "rejected") {
                    toast.error(t('common.payment_rejected'));
                    setPaymentRecord(null);
                    setSelectedMethod(null);
                    if (orderSession) saveOrderSession({ ...orderSession, status: "pending_payment", lastUpdated: Date.now() });
                }
            }
        });
    }, [paymentRecord?.id]);

    // ✅ Session Sync Effect
    useEffect(() => {
        if (!orderSession?.orderId) return;
        const cleanId = orderSession.orderId.replace(/#/g, '');
        const oRef = ref(db, `orders/${cleanId}`);
        return onValue(oRef, (snap) => {
            const data = snap.val();
            if (!data) {
                // If order deleted, clear session
                saveOrderSession(null);
                return;
            }

            // Sync terminal states
            if (data.status === "delivered" || data.status === "cancelled" || data.archived) {
                saveOrderSession(null);
            }

            // ✅ REAL-TIME REDIRECT ON PAID STATUS
            if (data.paymentStatus === "paid" && step === "payment") {
                toast.success(t('common.payment_approved'));
                if (orderSession) saveOrderSession({ ...orderSession, status: "paid", lastUpdated: Date.now() });
                
                setTimeout(() => {
                    saveOrderSession(null);
                    updateOrderId(orderSession.orderId);
                    setIsFullTrackingOpen(true);
                    clearCart();
                    setStep("items");
                    setPaymentRecord(null);
                    setSelectedMethod(null);
                }, 1500);
            }
        });
    }, [orderSession?.orderId, step]);

    // Restore "submitted" sessions: fetch the payment record from Firebase
    // so the Under Review screen can display
    useEffect(() => {
        if (!isOpen) return;

        if (orderSession) {
            if (orderSession.status === "pending_payment") {
                setCreatedOrderId(orderSession.orderId);
                setCreatedOrderDisplayId(orderSession.displayId);
                setCustomerName(orderSession.customerName);
                setStep("payment");
                toast(t('common.session_restored') || "تم استعادة طلبك السابق، يمكنك إكمال الدفع", { icon: '🔄' });
            } else if (orderSession.status === "submitted") {
                // ✅ Stay on payment step — show Under Review, NOT tracking
                setCreatedOrderId(orderSession.orderId);
                setCreatedOrderDisplayId(orderSession.displayId);
                setCustomerName(orderSession.customerName);
                setStep("payment");
                // Fetch the existing payment record so RESULT screen renders
                const paymentsRef = ref(db, "payments");
                onValue(paymentsRef, (snap) => {
                    const payments = snap.val();
                    if (payments) {
                        const match = Object.values(payments).find(
                            (p: any) => p.orderId === orderSession.orderId
                        ) as PaymentRecord | undefined;
                        if (match) {
                            setPaymentRecord(match);
                        }
                    }
                }, { onlyOnce: true });
                toast(t('common.session_restored') || "تم استعادة طلبك السابق", { icon: '🔄' });
            } else if (orderSession.status === "paid") {
                // Only redirect to tracking when admin has actually approved
                updateOrderId(orderSession.orderId);
                setIsFullTrackingOpen(true);
            }
        } else {
            setStep("items");
        }
    }, [isOpen, orderSession]);

    const handleConfirm = async (type: "in" | "out", customerData: any, message: string) => {
        if (submitting) return;

        // ✅ Required Field Validation
        if (!customerData?.name?.trim()) {
            toast.error(t('common.name_required') || "يرجى إدخال اسم الزبون");
            return;
        }

        setSubmitting(true);
        try {
            const isWaMode = orderSettings?.orderMode === "whatsapp";
            const orderIdStr = await OrderService.getNextOrderNumber();

            if (isWaMode) {
                await OrderService.createOrder({
                    orderId: orderIdStr, customer: customerData,
                    items: items.map(i => ({ id: i.id, nameAr: (i as any).nameAr || i.name, qty: i.qty, price: i.selectedPrice, total: i.selectedPrice * i.qty })),
                    totalPrice, orderType: type, paymentStatus: "unpaid",
                    status: "archived", source: "whatsapp", tracked: false, excludedFromReports: true
                }, orderIdStr);
                const phone = type === "in" ? orderSettings?.inPhone : orderSettings?.outPhone;
                if (phone) {
                    const cleanPhone = phone.replace(/[\s\+]/g, '');
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
                }
                toast.success(t('common.order_success_alert'));
                setTimeout(() => { clearCart(); setStep("items"); onClose(); }, 1200);
                return;
            }

            // Idempotency: Check if session already exists for this order
            if (orderSession && orderSession.status === "pending_payment") {
                setCreatedOrderId(orderSession.orderId);
                setCreatedOrderDisplayId(orderSession.displayId);
                setStep("payment");
                return;
            }

            const cleanId = await OrderService.createOrder({
                orderId: orderIdStr, customer: customerData,
                items: items.map(i => ({ id: i.id, nameAr: (i as any).nameAr || i.name, qty: i.qty, price: i.selectedPrice, total: i.selectedPrice * i.qty })),
                totalPrice, orderType: type, paymentStatus: "unpaid",
                status: "pending", source: "dashboard", tracked: true, excludedFromReports: false
            }, orderIdStr);

            setCustomerName(customerData.name);
            setCreatedOrderId(cleanId);
            setCreatedOrderDisplayId(orderIdStr);

            // Initialize Session
            saveOrderSession({
                orderId: cleanId,
                displayId: orderIdStr,
                customerName: customerData.name,
                status: "pending_payment",
                lastUpdated: Date.now()
            });

            if (paymentMethods.length > 0) {
                setStep("payment");
            } else {
                toast.success(t('common.order_saved_success'));
                updateOrderId(cleanId);
                setIsFullTrackingOpen(true);
                setTimeout(() => { clearCart(); setStep("items"); onClose(); }, 1000);
            }
        } catch (error) {
            console.error(error);
            toast.error(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSubmit = async (formData: any, methodOverride?: PaymentMethod) => {
        const method = methodOverride || selectedMethod;
        if (!method || !createdOrderId || !createdOrderDisplayId) return;

        if (!customerName) {
            toast.error(t('common.name_required'));
            return;
        }

        setSubmitting(true);
        try {
            // Map receiver details from method fields if they exist
            const receiverName = method.fields?.[0]?.value || null;
            const receiverNumber = method.fields?.[1]?.value || null;

            const record = await PaymentService.submitPayment({
                orderId: createdOrderId,
                methodId: method.id,
                methodName: method.name,
                customerName: customerName,
                senderAccountName: formData.senderAccountName || null,
                senderAccountNumber: formData.senderAccountNumber || null,
                receiverAccountName: receiverName,
                receiverAccountNumber: receiverNumber,
                senderBankOrWallet: formData.senderBankOrWallet || (formData as any).transactionReference || null,
                notes: formData.notes || "",
                amount: Number(totalPrice),
            });

            setPaymentRecord(record);

            // Update Session Status
            if (orderSession) {
                saveOrderSession({ ...orderSession, status: "submitted", paymentMethod: method.name, lastUpdated: Date.now() });
            }

            if (method.type === 'cash') {
                toast.success(t('common.order_saved_success'));
                // DO NOT REDIRECT TO TRACKING IMMEDIATELY
                // Let the session logic handle the "Under Review" state
            } else {
                toast.success(t('common.payment_submitted_success'));
            }
        } catch (error) {
            console.error("Payment submission error:", error);
            toast.error(t('common.error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const STEPS = ["items", "order", "payment"];
    const stepIdx = STEPS.indexOf(step);

    const stepIcon = step === "items" ? <FiShoppingCart /> : step === "order" ? <FiShoppingBag /> : <FiDollarSign />;
    const stepTitle = step === "items" ? t('common.cart') : step === "order" ? t('common.complete_order') : t('common.payment_method');

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center overflow-hidden">

                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md"
                />

                {/* Modal */}
                <motion.div
                    initial={{ y: "100%", opacity: 0.5 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0.5 }}
                    transition={{ type: "spring", damping: 28, stiffness: 220 }}
                    className="
                        relative w-full max-w-xl
                        h-[95vh] sm:h-auto sm:max-h-[90vh]
                        bg-cream/95 backdrop-blur-2xl
                        sm:rounded-[3rem] rounded-t-[3rem]
                        shadow-premium
                        overflow-hidden flex flex-col z-10
                        border border-white/50
                    "
                >
                    {/* Top color accent */}
                    <div className="h-1 bg-linear-to-r from-primary via-orange to-secondary shrink-0" />

                    {/* Header */}
                    <div className="px-6 sm:px-8 pt-8 pb-6 flex items-center justify-between border-b border-primary/5 bg-white/40 shrink-0">
                        {/* Mobile drag handle */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-primary/10 rounded-full sm:hidden" />

                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-orange text-white flex items-center justify-center text-3xl shadow-2xl shadow-primary/20 shrink-0">
                                {stepIcon}
                            </div>
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-primary leading-tight tracking-tight">
                                    {stepTitle}
                                </h2>
                                <p className="text-orange text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">
                                    {items.length} {t('common.items')} • {totalPrice}₪
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/50 text-primary/40 hover:text-primary hover:bg-white hover:rotate-90 transition-all border border-primary/10 shadow-sm"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 sm:px-8 py-4 flex items-center gap-3 bg-white/20 shrink-0 border-b border-primary/5">
                        {STEPS.map((s, idx) => {
                            const isDone = idx < stepIdx;
                            const isActive = idx === stepIdx;
                            return (
                                <div
                                    key={s}
                                    className={`h-2 rounded-full flex-1 transition-all duration-700 ${isDone ? 'bg-primary' : isActive ? 'bg-orange animate-pulse' : 'bg-primary/5'
                                        }`}
                                />
                            );
                        })}
                    </div>

                    {/* Scroll Content */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto custom-scrollbar px-5 sm:px-8 py-6 pb-32"
                    >
                        <AnimatePresence mode="wait">
                            {step === "items" ? (
                                <motion.div
                                    key="items-step"
                                    initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRtl ? -16 : 16 }}
                                    className="space-y-4"
                                >
                                    {items.length === 0 ? (
                                        <div className="py-24 text-center flex flex-col items-center gap-6">
                                            <div className="w-28 h-28 rounded-4xl bg-white shadow-soft border border-primary/5 flex items-center justify-center text-6xl">
                                                🛒
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-primary">{t('common.empty_cart')}</h3>
                                                <p className="text-primary/40 text-sm font-bold max-w-[240px] mx-auto">{t('common.add_items_desc')}</p>
                                            </div>
                                            <button
                                                onClick={onClose}
                                                className="mt-4 px-10 py-4 rounded-2xl bg-primary text-white font-black shadow-premium hover:scale-105 transition-all"
                                            >
                                                {t('common.back_to_menu')}
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                {items.map((item) => (
                                                    <CartItem key={item.priceKey} item={item} />
                                                ))}
                                            </div>
                                            {/* Summary Card */}
                                            <div className="mt-10 p-8 rounded-[2.5rem] bg-white border border-primary/5 shadow-premium relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-125 duration-1000" />
                                                <div className="relative z-10 flex justify-between items-end">
                                                    <div className="space-y-2">
                                                        <span className="text-primary/40 text-[10px] font-black uppercase tracking-[0.2em]">{t('common.total')}</span>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-5xl font-black text-primary tracking-tighter">{totalPrice}</span>
                                                            <span className="text-xl font-black text-primary/40">₪</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right pb-1">
                                                        <span className="block text-xs font-bold text-primary/40 mb-1">{t('common.items')}</span>
                                                        <span className="text-2xl font-black text-primary">{items.length}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ) : step === "order" ? (
                                <motion.div
                                    key="order-step"
                                    initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRtl ? -16 : 16 }}
                                >
                                    <button
                                        onClick={() => setStep("items")}
                                        className="flex items-center gap-2 text-[11px] font-black text-primary uppercase tracking-widest hover:gap-4 transition-all mb-8 opacity-50 hover:opacity-100"
                                    >
                                        <FiArrowRight className={isRtl ? "" : "rotate-180"} size={16} />
                                        {t('common.back_to_cart')}
                                    </button>
                                    <OrderTabs
                                        onConfirm={handleConfirm}
                                        orderSettings={orderSettings || undefined}
                                        submitting={submitting}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="payment-step"
                                    initial={{ opacity: 0, x: isRtl ? 16 : -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: isRtl ? -16 : 16 }}
                                >
                                    <PaymentFlow
                                        methods={paymentMethods}
                                        totalPrice={totalPrice}
                                        items={items}
                                        selectedMethod={selectedMethod}
                                        onSelectMethod={setSelectedMethod}
                                        paymentRecord={paymentRecord}
                                        submitting={submitting}
                                        onSubmit={handlePaymentSubmit}
                                        onResetRecord={() => { setPaymentRecord(null); setSelectedMethod(null); }}
                                        onTrackOrder={() => {
                                            const id = createdOrderId || paymentRecord?.orderId;
                                            if (id) { updateOrderId(id); setIsFullTrackingOpen(true); clearCart(); setStep("items"); }
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer CTA */}
                    {step === "items" && items.length > 0 && (
                        <div className="absolute bottom-0 inset-x-0 px-6 sm:px-8 pb-10 pt-20 bg-linear-to-t from-cream via-cream/95 to-transparent pointer-events-none z-30">
                            <button
                                onClick={() => setStep("order")}
                                className="pointer-events-auto w-full py-6 bg-primary text-white rounded-3xl font-black text-xl flex items-center justify-between px-10 shadow-premium hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20 group"
                            >
                                <span className="tracking-tight">{t('common.order_now')}</span>
                                <div className="flex items-center gap-6">
                                    <span className="text-3xl font-black">{totalPrice}₪</span>
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                                        <FiArrowRight className={isRtl ? "rotate-180" : ""} size={24} />
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Tracking Overlay */}
                    <AnimatePresence>
                        {orderId && isFullTrackingOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute inset-0 z-50 bg-white"
                            >
                                <OrderTracking
                                    orderId={orderId}
                                    paymentRecord={paymentRecord}
                                    onClose={() => { setIsFullTrackingOpen(false); onClose(); }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}