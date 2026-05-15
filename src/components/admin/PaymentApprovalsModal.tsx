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
                        className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 20 }}
                        className="relative w-full max-w-4xl max-h-full bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-premium overflow-hidden border border-white flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-(--color-primary)/5 flex items-center justify-between bg-white/50 backdrop-blur-md relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-(--color-primary) text-white rounded-xl flex items-center justify-center text-2xl shadow-xl shadow-(--color-primary)/30">
                                    <FiDollarSign />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-(--color-primary) tracking-tight">{t('admin.payment_approvals')}</h2>
                                    <p className="text-(--color-primary)/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">{t('admin.payment_editor_desc')}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 transition-all border border-(--color-primary)/5 shadow-soft active:scale-90">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10 bg-white/30 backdrop-blur-md">

                            {/* Pending Section */}
                            <section className="space-y-6">
                                <h3 className="text-[10px] font-black text-(--color-secondary) uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                                    <FiClock size={18} /> {t('admin.pending_approvals')}
                                </h3>

                                {pendingPayments.length === 0 ? (
                                    <div className="bg-(--color-primary)/5 rounded-[2.5rem] p-16 flex flex-col items-center justify-center text-center border-2 border-dashed border-(--color-primary)/10 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center text-(--color-primary)/10 mb-6 shadow-soft relative z-10 group-hover:scale-110 transition-transform duration-700">
                                            <FiCheck size={40} />
                                        </div>
                                        <p className="text-lg font-black text-(--color-primary)/20 uppercase tracking-[0.3em] relative z-10">{t('admin.no_pending_payments')}</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {pendingPayments.map((payment) => (
                                            <div key={payment.id} className="bg-white p-6 rounded-[2rem] border border-transparent shadow-soft hover:shadow-premium transition-all flex flex-col lg:flex-row items-center justify-between gap-8 group relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-(--color-primary)/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl" />
                                                <div className="flex items-center gap-6 w-full lg:w-auto relative z-10">
                                                    <div className="w-16 h-16 rounded-xl bg-(--color-primary)/5 text-(--color-primary) flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform duration-700 shadow-inner">
                                                        <FiDollarSign />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-base font-black text-(--color-primary) tracking-tight">{t('admin.order')} {payment.orderId}</span>
                                                            <span className="text-[9px] font-black bg-(--color-primary)/5 text-(--color-primary)/40 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-(--color-primary)/5">{payment.methodName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-(--color-primary)/30">
                                                            <FiUser size={14} />
                                                            <p className="text-[10px] font-black uppercase tracking-widest">{payment.senderAccountName || payment.customerName}</p>
                                                        </div>
                                                        <p className="text-[9px] text-(--color-primary)/20 font-black tracking-widest uppercase">{payment.senderAccountNumber || "-"}</p>
                                                        {payment.senderBankOrWallet && (
                                                            <p className="text-[10px] text-(--color-primary) font-black uppercase tracking-widest mt-1 bg-(--color-primary)/5 px-2 py-1 rounded-lg w-fit">{payment.senderBankOrWallet}</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end relative z-10">
                                                    <div className="text-right">
                                                        <p className="text-3xl font-black text-(--color-primary) tracking-tight">{payment.amount}₪</p>
                                                        <p className="text-[9px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mt-1.5">
                                                            {new Date(payment.createdAt).toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => onReject(payment)}
                                                            className="w-12 h-12 rounded-xl bg-(--color-secondary)/5 text-(--color-secondary) hover:bg-(--color-secondary) hover:text-white transition-all flex items-center justify-center border border-transparent shadow-soft active:scale-90"
                                                            title={t('common.cancel')}
                                                        >
                                                            <FiXCircle size={24} />
                                                        </button>
                                                        <button
                                                            onClick={() => onApprove(payment)}
                                                            className="h-12 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-600/30 transition-all flex items-center gap-3 font-black text-[9px] uppercase tracking-[0.2em] active:scale-95"
                                                            title={t('admin.confirm_payment')}
                                                        >
                                                            <FiCheck size={20} />
                                                            <span className="hidden sm:inline">{t('common.approve') || "Approve"}</span>
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
                                    <h3 className="text-[10px] font-black text-(--color-primary)/30 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                                        <FiInfo size={18} /> {t('admin.payment_history')}
                                    </h3>
                                    <div className="bg-(--color-primary)/5 rounded-[2.5rem] overflow-hidden border border-transparent shadow-inner relative group">
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
                                        <table className="w-full text-right border-collapse relative z-10">
                                            <thead>
                                                <tr className="bg-(--color-primary)/5 backdrop-blur-md">
                                                    <th className="px-6 py-5 text-[9px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">{t('admin.order_id')}</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">{t('admin.customer')}</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">{t('admin.method')}</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">{t('common.total')}</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">{t('admin.status')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-(--color-primary)/5">
                                                {historyPayments.map((p) => (
                                                    <tr key={p.id} className="hover:bg-white/40 transition-colors">
                                                        <td className="px-6 py-5 text-xs font-black text-(--color-primary)">{p.orderId}</td>
                                                        <td className="px-6 py-5 text-[10px] font-black text-(--color-primary)/40 uppercase tracking-widest">{p.senderAccountName || p.customerName}</td>
                                                        <td className="px-6 py-5 text-[9px] font-black text-(--color-primary)/20 uppercase tracking-[0.2em]">{p.methodName}</td>
                                                        <td className="px-6 py-5 text-sm font-black text-(--color-primary)">{p.amount}₪</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg border ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/10'}`}>
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
