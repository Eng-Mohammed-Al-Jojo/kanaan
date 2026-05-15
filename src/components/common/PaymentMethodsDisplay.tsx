import { useEffect, useState, useMemo } from "react";
import { PaymentService } from "../../services/paymentService";
import type { PaymentMethod } from "../../types/payment";
import { useTranslation } from "react-i18next";
import { FiImage, FiCopy, FiCreditCard } from "react-icons/fi";

export default function PaymentMethodsDisplay() {
    const { t } = useTranslation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = PaymentService.listenToPaymentMethods((data) => {
            setMethods(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const activeMethods = useMemo(() => {
        return methods
            .filter(m => m.isEnabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [methods]);

    const handleCopy = async (value: string, fieldId: string, label?: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(fieldId);
            setToast(`✅ ${label || "تم النسخ"}`);
            setTimeout(() => {
                setToast(null);
                setCopiedField(null);
            }, 2000);
        } catch {
            setToast("❌ فشل النسخ");
            setTimeout(() => setToast(null), 2000);
        }
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-(--bg-card) p-4 rounded-2xl border border-(--border-color) animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-(--bg-main) rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-(--bg-main) rounded-full w-1/3" />
                                <div className="h-3 bg-(--bg-main) rounded-full w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (activeMethods.length === 0) {
        return (
            <div className="py-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-(--bg-main) flex items-center justify-center mx-auto mb-3 text-(--text-muted)">
                    <FiCreditCard size={20} />
                </div>
                <p className="text-xs font-bold text-(--text-muted)">{t('admin.no_payment_methods')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activeMethods.map((method) => (
                <div
                    key={method.id}
                    className="bg-(--bg-card) rounded-2xl border border-(--border-color) overflow-hidden shadow-sm"
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-(--border-color) bg-(--bg-main)/40">
                        <div className="w-9 h-9 rounded-xl bg-white border border-(--border-color) flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            {method.image ? (
                                <img
                                    src={method.image.startsWith('/') ? method.image : `/images/payment/${method.image}`}
                                    alt={method.name}
                                    className="w-full h-full object-contain p-1"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://placehold.co/36x36?text=?';
                                    }}
                                />
                            ) : (
                                <FiImage size={14} className="text-(--text-muted)" />
                            )}
                        </div>
                        <span className="font-black text-(--text-main) text-sm">{method.name}</span>
                        <div className="mr-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] font-black text-green-600 dark:text-green-400">متاح</span>
                        </div>
                    </div>

                    {/* Fields */}
                    <div className="divide-y divide-(--border-color)">
                        {method.fields?.map((field) => {
                            const isCopied = copiedField === field.id;
                            return (
                                <div
                                    key={field.id}
                                    className="flex items-center justify-between px-4 py-3 gap-3 group hover:bg-(--bg-main)/30 transition-colors"
                                >
                                    <span className="text-xs font-bold text-(--text-muted) shrink-0">{field.label}</span>
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-xs font-black text-(--text-main) font-mono truncate">{field.value}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(field.value, field.id, field.label)}
                                            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isCopied
                                                ? "bg-green-500 text-white"
                                                : "bg-(--bg-main) text-(--text-muted) hover:bg-primary hover:text-white"
                                                }`}
                                        >
                                            {isCopied ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                <FiCopy size={11} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {toast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-(--bg-card) border border-(--border-color) text-(--text-main) text-xs font-black px-5 py-3 rounded-full shadow-2xl z-50 animate-fade-in whitespace-nowrap">
                    {toast}
                </div>
            )}
        </div>
    );
}