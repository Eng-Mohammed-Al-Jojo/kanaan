import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck, FiDownload, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}

export default function CloseDayModal({ isOpen, onClose, onConfirm }: Props) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Failed to close day:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-1000 flex items-center justify-center p-6">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={!loading ? onClose : undefined}
                        className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-premium overflow-hidden z-10 p-8 md:p-10 text-center"
                    >
                        {/* Header Icon */}
                        <div className="w-20 h-20 bg-(--color-secondary)/5 text-(--color-secondary) rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-(--color-secondary)/10">
                            <FiAlertTriangle />
                        </div>

                        {/* Title & Message */}
                        <h3 className="text-2xl font-black text-(--color-primary) mb-3 tracking-tight">
                            تأكيد الإغلاق اليومي
                        </h3>
                        <p className="text-(--color-primary)/40 font-black text-[10px] uppercase tracking-[0.15em] mb-8 leading-loose px-4">
                            سيتم إغلاق اليوم الحالي، ترحيل جميع الطلبات إلى ملف Excel، وحذفها من لوحة التحكم. لا يمكن التراجع عن هذه العملية.
                        </p>

                        {/* Checklist Section */}
                        <div className="bg-(--color-primary)/5 rounded-[2rem] p-8 mb-8 text-right space-y-4 shadow-inner relative group overflow-hidden">
                            <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl" />
                            <div className="flex items-center gap-4 text-emerald-600 relative z-10">
                                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <FiCheck size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">سيتم إنشاء ملف Excel يحتوي على جميع طلبات اليوم</span>
                            </div>
                            <div className="flex items-center gap-4 text-emerald-600 relative z-10">
                                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <FiCheck size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">سيتم حذف الطلبات من النظام بعد التصدير</span>
                            </div>
                            <div className="flex items-center gap-4 text-(--color-secondary) relative z-10">
                                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <FiAlertTriangle size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-tight">تأكد من مراجعة الطلبات قبل المتابعة</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 h-14 bg-white text-(--color-primary)/30 border border-transparent rounded-xl font-black text-[9px] hover:text-(--color-secondary) hover:bg-(--color-secondary)/5 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] disabled:opacity-50 shadow-soft"
                            >
                                <FiX size={18} />
                                {t('common.cancel') || "إلغاء"}
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="flex-[1.5] h-14 bg-(--color-secondary) text-white rounded-xl font-black text-[9px] hover:brightness-110 shadow-xl shadow-(--color-secondary)/30 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-[0.2em] disabled:opacity-50"
                            >
                                {loading ? (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    >
                                        <FiTrash2 size={20} />
                                    </motion.div>
                                ) : (
                                    <FiDownload size={20} />
                                )}
                                {loading ? "جاري الإغلاق..." : "تأكيد الإغلاق"}
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
