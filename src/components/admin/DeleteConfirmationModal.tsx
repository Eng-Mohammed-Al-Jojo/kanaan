import { motion, AnimatePresence } from "framer-motion";
import { FiAlertTriangle, FiX, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    details?: string;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, details }: Props) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-[3.5rem] border border-white shadow-premium overflow-hidden z-10 p-12 text-center"
                    >
                        {/* Warning Icon */}
                        <div className="w-28 h-28 bg-(--color-secondary)/5 text-(--color-secondary) rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-5xl shadow-inner border border-(--color-secondary)/10">
                            <FiAlertTriangle />
                        </div>

                        {/* Text */}
                        <h3 className="text-3xl font-black text-(--color-primary) mb-5 tracking-tight">
                            {title}
                        </h3>

                        {details && (
                            <div className="bg-(--color-primary)/5 p-5 rounded-[1.5rem] border border-transparent mb-10 shadow-inner">
                                <span className="text-[11px] font-black text-(--color-primary)/40 tracking-[0.3em] uppercase">{details}</span>
                            </div>
                        )}

                        <div className="bg-(--color-secondary)/5 p-8 rounded-[2rem] border border-transparent mb-12 shadow-inner relative overflow-hidden group">
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="text-[11px] font-black text-(--color-secondary) uppercase tracking-[0.2em] leading-loose relative z-10">
                                ⚠️ {t('common.confirm_delete_extra') || "هذا الإجراء لا يمكن التراجع عنه وسيتم حذفه من القاعدة نهائياً"}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-5 relative z-10">
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="w-full h-18 bg-(--color-secondary) text-white rounded-[1.5rem] font-black text-[11px] hover:brightness-110 shadow-2xl shadow-(--color-secondary)/30 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.3em]"
                            >
                                <FiCheck size={24} />
                                {t('common.delete') || "تأكيد الحذف"}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full h-18 bg-white text-(--color-primary)/30 border border-transparent rounded-[1.5rem] font-black text-[11px] hover:text-(--color-secondary) hover:bg-(--color-secondary)/5 transition-all active:scale-95 flex items-center justify-center gap-4 uppercase tracking-[0.3em] shadow-soft"
                            >
                                <FiX size={24} />
                                {t('common.cancel') || "إلغاء"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
