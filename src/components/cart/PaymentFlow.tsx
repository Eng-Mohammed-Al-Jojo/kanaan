import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    FiCheck, FiDollarSign, FiInfo, FiArrowRight, FiArrowLeft,
    FiUser, FiHash, FiMessageSquare, FiAlertTriangle,
    FiShoppingCart, FiClock, FiAlertCircle, FiChevronRight
} from "react-icons/fi";
import type { PaymentMethod, PaymentRecord } from "../../types/payment";
import PaymentFieldsRenderer from "../common/PaymentFieldsRenderer";

type Step = "SELECT" | "FORM" | "CONFIRM" | "RESULT";

interface PaymentFlowProps {
    methods: PaymentMethod[];
    totalPrice: number;
    items: any[];
    selectedMethod: PaymentMethod | null;
    onSelectMethod: (method: PaymentMethod | null) => void;
    paymentRecord: PaymentRecord | null;
    submitting: boolean;
    onSubmit: (formData: any, methodOverride?: PaymentMethod) => void;
    onResetRecord: () => void;
    onTrackOrder: () => void;
}

export default function PaymentFlow({
    methods, totalPrice, items, selectedMethod, onSelectMethod,
    paymentRecord, submitting, onSubmit, onResetRecord, onTrackOrder
}: PaymentFlowProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === "ar";

    const [step, setStep] = useState<Step>(paymentRecord ? "RESULT" : "SELECT");
    const [formData, setFormData] = useState({
        senderAccountName: "",
        senderAccountNumber: "",
        senderBankOrWallet: "",
        notes: ""
    });

    const handleSelectMethod = (method: PaymentMethod) => {
        onSelectMethod(method);
        
        if (!method.showPaymentDetails) {
            onSubmit({
                methodName: method.name,
                senderAccountName: null,
                senderAccountNumber: null,
                receiverAccountName: null,
                receiverAccountNumber: null,
                senderBankOrWallet: null,
                notes: `Direct Payment - ${method.name}`
            }, method);
            return;
        } else {
            setStep("FORM");
        }
    };

    const handleBack = () => { 
        if (step === "FORM") setStep("SELECT"); 
        if (step === "CONFIRM") setStep("FORM"); 
    };

    const handleNext = () => {
        if (step === "FORM" && formData.senderAccountName && formData.senderAccountNumber && formData.senderBankOrWallet) {
            setStep("CONFIRM");
        }
    };

    const currentStep = paymentRecord ? "RESULT" : step;
    const STEPS = ["SELECT", "FORM", "CONFIRM"];
    const stepIdx = STEPS.indexOf(currentStep);

    const inputCls = `w-full bg-white border border-gray-200 rounded-2xl py-3.5 px-5 text-sm font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:border-primary focus:ring-4 focus:ring-primary/8 transition-all shadow-sm`;
    const inputWithIcon = (rtl: boolean) => inputCls + (rtl ? ' pr-11 pl-5' : ' pl-11 pr-5');

    return (
        <div className="flex flex-col gap-5">

            {/* Step Indicators */}
            {currentStep !== "RESULT" && (
                <div className="flex items-center justify-center gap-2 py-1">
                    {STEPS.map((s, idx) => {
                        const isDone = idx < stepIdx;
                        const isActive = idx === stepIdx;
                        return (
                            <div key={s} className="flex items-center gap-3">
                                <div className={`
                                    w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500
                                    ${isDone ? 'bg-primary text-white shadow-lg' : isActive ? 'bg-orange text-white ring-8 ring-orange/10 scale-110 shadow-premium' : 'bg-primary/5 text-primary/30 border border-primary/5'}
                                `}>
                                    {isDone ? <FiCheck size={16} /> : idx + 1}
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className={`w-8 h-1 rounded-full transition-all duration-700 ${idx < stepIdx ? 'bg-primary' : 'bg-primary/5'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence mode="wait">

                {/* ── SELECT ── */}
                {currentStep === "SELECT" && (
                    <motion.div key="select" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="text-center mb-6">
                            <h3 className="text-3xl font-black text-primary tracking-tight">{t('common.payment_method')}</h3>
                            <p className="text-sm font-bold text-primary/40 mt-2">{t('common.payment_desc')}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {methods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => handleSelectMethod(method)}
                                    className="relative p-8 rounded-[2.5rem] border border-primary/5 bg-white/60 backdrop-blur-md hover:border-primary/40 hover:bg-white transition-all flex flex-col items-center gap-5 group shadow-soft hover:shadow-premium active:scale-[0.98]"
                                >
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-white shadow-soft flex items-center justify-center border border-primary/5 shrink-0 group-hover:scale-110 transition-transform duration-700">
                                        {(method.image || method.imageUrl) ? (
                                            <img
                                                src={(method.image || method.imageUrl)?.startsWith('/') ? (method.image || method.imageUrl) : `/images/payment/${method.image || method.imageUrl}`}
                                                alt={method.name}
                                                className="w-full h-full object-contain p-4"
                                            />
                                        ) : (
                                            <FiDollarSign size={32} className="text-primary/10" />
                                        )}
                                    </div>
                                    <span className="font-black text-lg text-primary transition-colors">{method.name}</span>
                                    <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-primary/10 group-hover:border-primary group-hover:bg-primary transition-all flex items-center justify-center">
                                        <FiChevronRight size={14} className="text-primary/20 group-hover:text-white" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── FORM ── */}
                {currentStep === "FORM" && selectedMethod && (
                    <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBack} className="w-11 h-11 rounded-2xl bg-white/60 border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all shadow-sm">
                                {isRtl ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
                            </button>
                            <div>
                                <h3 className="text-lg font-black text-primary leading-tight">{selectedMethod.name}</h3>
                                <p className="text-[10px] font-black text-orange uppercase tracking-[0.2em] mt-1">{t('common.payment_step_form')}</p>
                            </div>
                        </div>

                        {/* Account Info Cards */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2.5 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-1 opacity-40">
                                <FiInfo size={14} />
                                <span>{t('admin.account_details')}</span>
                            </div>
                            <div className="bg-white/40 p-1 rounded-3xl border border-primary/5">
                                <PaymentFieldsRenderer 
                                    fields={selectedMethod.paymentFields || []} 
                                    isCash={selectedMethod.type === 'cash'} 
                                />
                            </div>
                        </div>

                        {/* Warning */}
                        <div className="bg-orange/5 border border-orange/10 rounded-2xl p-5 flex gap-4 shadow-sm">
                            <FiAlertTriangle size={20} className="text-orange shrink-0 mt-0.5" />
                            <p className="text-[11px] font-bold text-primary/70 leading-relaxed">{t('common.payment_external_warning')}</p>
                        </div>

                        <div className="space-y-4">
                            <div className="relative">
                                <FiUser className={`absolute top-1/2 -translate-y-1/2 text-primary/30 ${isRtl ? 'right-6' : 'left-6'}`} size={20} />
                                <input placeholder={t('common.account_name')} className={inputWithIcon(isRtl)} value={formData.senderAccountName} onChange={e => setFormData({ ...formData, senderAccountName: e.target.value })} />
                            </div>
                            <div className="relative">
                                <FiHash className={`absolute top-1/2 -translate-y-1/2 text-primary/30 ${isRtl ? 'right-6' : 'left-6'}`} size={20} />
                                <input placeholder={t('common.account_number')} className={inputWithIcon(isRtl)} value={formData.senderAccountNumber} onChange={e => setFormData({ ...formData, senderAccountNumber: e.target.value })} />
                            </div>
                            <div className="relative">
                                <FiCheck className={`absolute top-1/2 -translate-y-1/2 text-primary/30 ${isRtl ? 'right-6' : 'left-6'}`} size={20} />
                                <input placeholder={t('common.sender_bank_wallet') || "مصدر التحويل (بنك/محفظة)"} className={inputWithIcon(isRtl)} value={formData.senderBankOrWallet} onChange={e => setFormData({ ...formData, senderBankOrWallet: e.target.value })} />
                            </div>
                            <div className="relative">
                                <FiMessageSquare className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-6 text-primary/30`} size={20} />
                                <textarea placeholder={t('common.notes_optional')} rows={4} className={inputWithIcon(isRtl) + " resize-none pt-5"} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={!formData.senderAccountName || !formData.senderAccountNumber || !formData.senderBankOrWallet}
                            className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-lg shadow-premium hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40"
                        >
                            {t('common.complete_order')}
                        </button>
                    </motion.div>
                )}

                {/* ── CONFIRM ── */}
                {currentStep === "CONFIRM" && selectedMethod && (
                    <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBack} className="w-11 h-11 rounded-2xl bg-white/60 border border-primary/10 text-primary/40 hover:text-primary hover:border-primary/40 flex items-center justify-center transition-all shadow-sm">
                                {isRtl ? <FiArrowRight size={18} /> : <FiArrowLeft size={18} />}
                            </button>
                            <div>
                                <h3 className="text-lg font-black text-primary leading-tight">{t('common.confirm_payment_details')}</h3>
                                <p className="text-[10px] font-black text-orange uppercase tracking-[0.2em] mt-1">{t('common.payment_step_confirm')}</p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white/60 backdrop-blur-md border border-primary/5 rounded-[2.5rem] p-7 space-y-4 shadow-soft">
                            <div className="flex items-center gap-2.5 text-primary text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                <FiShoppingCart size={14} className="text-primary" />
                                {t('common.order_summary')}
                            </div>
                            <div className="space-y-3">
                                {items.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm font-bold text-primary/60">
                                        <span>{item.qty}× {item.nameAr || item.name}</span>
                                        <span className="text-primary">{item.selectedPrice * item.qty}₪</span>
                                    </div>
                                ))}
                                {items.length > 3 && <p className="text-[10px] text-primary/30 italic">+{items.length - 3} {t('common.more')}...</p>}
                            </div>
                            <div className="pt-4 border-t border-primary/5 flex justify-between items-center">
                                <span className="text-xs font-black text-primary/40 uppercase tracking-widest">{t('common.total')}</span>
                                <span className="text-3xl font-black text-primary tracking-tighter">{totalPrice}₪</span>
                            </div>
                        </div>

                        {/* Method + Details */}
                        <div className="bg-white border border-primary/5 rounded-[2.5rem] p-7 space-y-5 shadow-premium">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-primary/5 shadow-soft flex items-center justify-center p-2.5">
                                    {(selectedMethod.image || selectedMethod.imageUrl) ? (
                                        <img 
                                            src={(selectedMethod.image || selectedMethod.imageUrl)?.startsWith('/') ? (selectedMethod.image || selectedMethod.imageUrl) : `/images/payment/${selectedMethod.image || selectedMethod.imageUrl}`} 
                                            alt="" 
                                            className="w-full h-full object-contain" 
                                        />
                                    ) : <FiDollarSign size={24} className="text-primary/10" />}
                                </div>
                                <span className="text-base font-black text-primary">{selectedMethod.name}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-5 pt-5 border-t border-primary/5">
                                {[
                                    { label: t('common.account_name'), value: formData.senderAccountName },
                                    { label: t('common.account_number'), value: formData.senderAccountNumber },
                                    { label: t('common.sender_bank_wallet'), value: formData.senderBankOrWallet },
                                    ...(formData.notes ? [{ label: t('common.notes'), value: formData.notes }] : []),
                                ].map((row, idx) => (
                                    <div key={idx} className="flex flex-col gap-1.5">
                                        <span className="text-[9px] font-black text-primary/30 uppercase tracking-widest">{row.label}</span>
                                        <span className="text-sm font-black text-primary">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => onSubmit(formData)}
                            disabled={submitting}
                            className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-lg shadow-premium hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-70 flex items-center justify-center gap-4"
                        >
                            {submitting ? (
                                <div className="w-6 h-6 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                            ) : (
                                <><FiCheck size={24} strokeWidth={3} />{t('common.confirm_and_submit')}</>
                            )}
                        </button>
                    </motion.div>
                )}

                {/* ── RESULT ── */}
                {currentStep === "RESULT" && paymentRecord && (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center text-center py-8 space-y-8">

                        {/* Status icon */}
                        <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center text-6xl shadow-premium border-4 ${paymentRecord.status === "pending"
                            ? "bg-orange/5 text-orange border-orange/20 animate-pulseScale"
                            : paymentRecord.status === "approved"
                                ? "bg-secondary/10 text-secondary border-secondary/20"
                                : "bg-primary/5 text-primary/40 border-primary/10"
                            }`}>
                            {paymentRecord.status === "pending" ? <FiClock size={56} /> :
                                paymentRecord.status === "approved" ? <FiCheck size={56} strokeWidth={3} /> :
                                    <FiAlertCircle size={56} />}
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-3xl font-black text-primary tracking-tight">
                                {paymentRecord.status === "pending" ? t('common.under_review') :
                                    paymentRecord.status === "approved" ? t('common.payment_approved') : t('common.payment_rejected')}
                            </h4>
                            <p className="text-base font-bold text-primary/40 max-w-xs mx-auto leading-relaxed">
                                {paymentRecord.status === "pending" ? t('common.payment_pending') :
                                    paymentRecord.status === "approved" ? t('common.order_saved_success') : t('common.error')}
                            </p>
                        </div>

                        {paymentRecord.status === "rejected" && (
                            <button
                                onClick={onResetRecord}
                                className="px-12 py-4 rounded-[1.5rem] bg-primary text-white font-black text-sm shadow-premium hover:scale-105 transition-all"
                            >
                                {t('common.edit')}
                            </button>
                        )}

                        <div className="w-full space-y-4">
                            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-5 flex justify-between items-center shadow-inner">
                                <span className="text-[10px] font-black text-primary/30 uppercase tracking-widest">{t('common.order_id')}</span>
                                <span className="text-lg font-black text-primary tracking-tighter">#{paymentRecord.orderId}</span>
                            </div>

                            {paymentRecord.status !== "pending" && (
                                <button
                                    onClick={onTrackOrder}
                                    className="w-full py-6 rounded-[2rem] bg-primary text-white font-black text-lg shadow-premium hover:bg-primary-dark hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 group"
                                >
                                    <FiShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                                    {t('common.track_order')}
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
