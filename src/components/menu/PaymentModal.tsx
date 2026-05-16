import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FiX, FiCreditCard } from "react-icons/fi";
import type { PaymentMethod } from "../../types/payment";
import PaymentFieldsRenderer from "../common/PaymentFieldsRenderer";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    methods: PaymentMethod[];
    isLoading?: boolean;
}

export default function PaymentModal({
    isOpen, onClose, methods, isLoading = false
}: Props) {
    useTranslation();

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const enabledMethods = useMemo(() => methods.filter(m => m.isEnabled), [methods]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 overflow-hidden">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-lg bg-cream/95 backdrop-blur-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-primary/10 z-10"
            >
                {/* Header */}
                <div className="p-8 border-b border-primary/10 flex items-center justify-between bg-primary/5 shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                            <FiCreditCard size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-primary leading-tight tracking-tight">طرق الدفع</h3>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 opacity-60">بيانات التحويل المعتمدة</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 rounded-2xl bg-white/50 text-primary hover:text-red-500 transition-all flex items-center justify-center border border-primary/10"
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-4">
                                    <div className="h-14 bg-primary/5 rounded-2xl animate-pulse w-1/2" />
                                    <div className="h-24 bg-primary/5 rounded-3xl animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : enabledMethods.length > 0 ? (
                        enabledMethods.map((method) => (
                            <div key={method.id} className="space-y-5">
                                <div className="flex items-center gap-5 px-1">
                                    <div className="w-14 h-14 rounded-2xl bg-white/50 border border-primary/10 flex items-center justify-center p-2.5 shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                                        {method.image ? (
                                            <img
                                                src={method.image.startsWith('/') ? method.image : `/images/payment/${method.image}`}
                                                alt={method.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : <FiCreditCard size={28} className="text-primary/20" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-primary text-xl leading-none">{method.name}</h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                                                {method.type === 'cash' ? "نقدي" : method.type === 'wallet' ? "محفظة" : "بنكي"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <PaymentFieldsRenderer
                                    fields={method.paymentFields || []}
                                    isCash={method.type === 'cash'}
                                />

                                <div className="h-px bg-primary/5 w-full" />
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                            <div className="w-24 h-24 rounded-4xl bg-primary/5 flex items-center justify-center text-5xl">📵</div>
                            <div>
                                <h4 className="text-xl font-black text-primary">لا توجد وسائل دفع متاحة</h4>
                                <p className="text-xs font-bold text-primary/40 mt-2 uppercase tracking-widest leading-relaxed">يرجى التواصل مع الإدارة مباشرة لإتمام طلبك</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Tip */}
                <div className="p-8 bg-primary/5 border-t border-primary/10 shrink-0">
                    <p className="text-[10px] font-bold text-primary text-center uppercase tracking-widest leading-relaxed opacity-60">
                        تأكد من إرسال إشعار التحويل بعد إتمام العملية لضمان معالجة طلبك بأسرع وقت
                    </p>
                </div>
            </motion.div>
        </div>
    );

    return createPortal(
        <AnimatePresence>
            {isOpen && modalContent}
        </AnimatePresence>,
        document.body
    );
}
