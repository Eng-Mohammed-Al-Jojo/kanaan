import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiXCircle, FiClock, FiDollarSign, FiUser, FiInfo } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { PaymentRecord } from "../../types/payment";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    payments: PaymentRecord[];
    onApprove: (payment: PaymentRecord) => void;
    onReject: (payment: PaymentRecord) => void;
}

export default function PaymentApprovalsModal({ isOpen, onClose, payments, onApprove, onReject }: Props) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const pendingPayments = payments.filter(p => p.status === "pending");
    const historyPayments = payments.filter(p => p.status !== "pending").slice(0, 20);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl max-h-full bg-cream rounded-[3rem] shadow-premium overflow-hidden border border-primary/5 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-primary/5 flex items-center justify-between bg-white/50">
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                                    <FiDollarSign size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-primary tracking-tight">{t('admin.payment_approvals')}</h2>
                                    <p className="text-primary/40 text-xs font-bold uppercase tracking-widest mt-1">{t('admin.payment_editor_desc')}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-primary/30 hover:text-secondary hover:bg-secondary/10 transition-all border border-primary/5 shadow-soft">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">

                            {/* Pending Section */}
                            <section className="space-y-6">
                                <h3 className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <FiClock size={18} /> {t('admin.pending_approvals')}
                                </h3>

                                {pendingPayments.length === 0 ? (
                                    <div className="bg-primary/5 rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-primary/10">
                                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary/10 mb-6 shadow-soft">
                                            <FiCheck size={40} />
                                        </div>
                                        <p className="text-lg font-black text-primary/20 uppercase tracking-widest">{t('admin.no_pending_payments')}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingPayments.map((payment) => (
                                            <div key={payment.id} className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-soft hover:shadow-premium transition-all flex flex-col md:flex-row items-center justify-between gap-8 group">
                                                <div className="flex items-center gap-6 w-full md:w-auto">
                                                    <div className="w-16 h-16 rounded-3xl bg-primary/5 text-primary flex items-center justify-center text-2xl shrink-0">
                                                        <FiDollarSign />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black text-primary">{t('admin.order')} {payment.orderId}</span>
                                                            <span className="text-[10px] font-black bg-primary/10 text-primary/60 px-2 py-1 rounded-lg uppercase">{payment.methodName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-primary/40">
                                                            <FiUser size={14} />
                                                            <p className="text-sm font-bold">{payment.senderAccountName || payment.customerName}</p>
                                                        </div>
                                                        <p className="text-xs text-primary/20 font-medium">{payment.senderAccountNumber || "-"}</p>
                                                        {payment.senderBankOrWallet && (
                                                            <p className="text-[10px] text-primary font-bold">{payment.senderBankOrWallet}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                                    <div className="text-right">
                                                        <p className="text-2xl font-black text-primary">{payment.amount}₪</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                            {new Date(payment.createdAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => onReject(payment)}
                                                            className="w-12 h-12 rounded-2xl bg-secondary/5 text-secondary hover:bg-secondary hover:text-white transition-all flex items-center justify-center border border-secondary/10"
                                                            title={t('common.cancel')}
                                                        >
                                                            <FiXCircle size={22} />
                                                        </button>
                                                        <button
                                                            onClick={() => onApprove(payment)}
                                                            className="h-12 px-4 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 font-black text-sm"
                                                            title={t('admin.confirm_payment')}
                                                        >
                                                            <FiCheck size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* History Section */}
                            {historyPayments.length > 0 && (
                                <section className="space-y-6">
                                    <h3 className="text-xs font-black text-primary/40 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <FiInfo size={18} /> {t('admin.payment_history')}
                                    </h3>
                                    <div className="bg-primary/5 rounded-[2.5rem] overflow-hidden border border-primary/5">
                                        <table className="w-full text-right border-collapse">
                                            <thead>
                                                <tr className="bg-primary/10">
                                                    <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{t('admin.order_id')}</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{t('admin.customer')}</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{t('admin.method')}</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{t('common.total')}</th>
                                                    <th className="px-6 py-4 text-[10px] font-black text-primary/40 uppercase tracking-widest">{t('admin.status')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary/5">
                                                {historyPayments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-white/50 transition-colors">
                                                        <td className="px-6 py-4 text-xs font-black text-primary">{p.orderId}</td>
                                                        <td className="px-6 py-4 text-xs font-bold text-primary/60">{p.senderAccountName || p.customerName}</td>
                                                        <td className="px-6 py-4 text-[10px] font-black text-primary/30 uppercase">{p.methodName}</td>
                                                        <td className="px-6 py-4 text-xs font-black text-primary">{p.amount}₪</td>
                                                        <td className="px-6 py-4">
                                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-secondary/5 text-secondary border-secondary/10'}`}>
                                                                {p.status === 'approved' ? t('admin.approved') : t('admin.rejected')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
