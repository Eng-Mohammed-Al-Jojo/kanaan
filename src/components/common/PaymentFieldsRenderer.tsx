import { motion } from "framer-motion";
import { FiCopy, FiInfo } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { PaymentField } from "../../types/payment";

interface Props {
    fields: PaymentField[];
    methodName?: string;
    isCash?: boolean;
}

export default function PaymentFieldsRenderer({ fields, isCash }: Props) {
    const { t } = useTranslation();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast.success(t('common.copied_to_clipboard') || "تم النسخ بنجاح");
        });
    };

    if (isCash) {
        return (
            <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <FiInfo className="text-amber-500" size={24} />
                </div>
                <div>
                    <p className="text-sm font-black text-amber-900">الدفع عند الاستلام</p>
                    <p className="text-[11px] font-bold text-amber-700/70 mt-0.5">يرجى تجهيز المبلغ عند وصول الطلب</p>
                </div>
            </div>
        );
    }

    if (!fields || fields.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">لا توجد بيانات إضافية للتحويل</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-3">
            {fields.map((field, idx) => (
                <motion.div
                    key={field.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group p-5 bg-white border border-gray-100 rounded-3xl flex items-center justify-between hover:border-primary/20 hover:shadow-premium transition-all duration-300"
                >
                    <div className="flex flex-col flex-1 overflow-hidden pr-4">
                        <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest mb-1.5 block">
                            {field.label}
                        </span>
                        <span className="text-base font-black text-gray-800 select-all truncate">
                            {field.value}
                        </span>
                    </div>
                    <button
                        onClick={() => copyToClipboard(field.value)}
                        className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-primary hover:border-primary hover:bg-white hover:shadow-lg transition-all flex items-center justify-center active:scale-90 shrink-0 group-hover:scale-105"
                        title="نسخ"
                    >
                        <FiCopy size={20} />
                    </button>
                </motion.div>
            ))}
        </div>
    );
}
