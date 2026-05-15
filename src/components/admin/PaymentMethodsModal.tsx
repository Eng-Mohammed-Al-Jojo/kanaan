import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiTrash2, FiSave, FiCheck, FiSettings, FiImage, FiList, FiToggleLeft, FiToggleRight, FiEdit } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { PaymentService } from "../../services/paymentService";
import type { PaymentMethod, PaymentField } from "../../types/payment";
import { toast } from "react-hot-toast";
import FeaturedGallery from "./FeaturedGallery";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PaymentMethodsModal({ isOpen, onClose }: Props) {
    const { t } = useTranslation();
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [editingMethod, setEditingMethod] = useState<Partial<PaymentMethod> | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGallery, setShowGallery] = useState(false);
    const [paymentImages, setPaymentImages] = useState<string[]>([]);

    useEffect(() => {
        // Fetch the manifest instead of using glob (per strict frontend requirements)
        fetch('/images/payment/manifest.json')
            .then(res => res.json())
            .then(data => setPaymentImages(data))
            .catch(err => console.error("Could not load payment manifest", err));
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const unsubscribe = PaymentService.listenToPaymentMethods((data) => {
            setMethods(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [isOpen]);

    const handleSave = async () => {
        if (!editingMethod || !editingMethod.name) {
            toast.error(t('common.name_required'));
            return;
        }

        try {
            await PaymentService.savePaymentMethod(editingMethod);
            toast.success(t('common.success_message'));
            setEditingMethod(null);
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('common.confirm_delete_extra'))) return;
        try {
            await PaymentService.deletePaymentMethod(id);
            toast.success(t('common.success_message'));
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const addField = () => {
        if (!editingMethod) return;
        const newField: PaymentField = {
            id: `f_${Date.now()}`,
            label: "",
            value: ""
        };
        setEditingMethod({
            ...editingMethod,
            paymentFields: [...(editingMethod.paymentFields || []), newField]
        });
    };

    const updateField = (fieldId: string, key: keyof PaymentField, value: string) => {
        if (!editingMethod || !editingMethod.paymentFields) return;
        setEditingMethod({
            ...editingMethod,
            paymentFields: editingMethod.paymentFields.map(f => f.id === fieldId ? { ...f, [key]: value } : f)
        });
    };

    const removeField = (fieldId: string) => {
        if (!editingMethod || !editingMethod.paymentFields) return;
        setEditingMethod({
            ...editingMethod,
            paymentFields: editingMethod.paymentFields.filter(f => f.id !== fieldId)
        });
    };

    const toggleStatus = async (method: PaymentMethod) => {
        try {
            await PaymentService.savePaymentMethod({ ...method, isEnabled: !method.isEnabled });
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    return (
        <>
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
                            className="relative w-full max-w-5xl bg-white/95 backdrop-blur-2xl rounded-[2.5rem] border border-white shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-8 py-6 border-b border-(--color-primary)/5 flex items-center justify-between bg-white/50 backdrop-blur-md relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-(--color-primary) text-white rounded-xl flex items-center justify-center text-2xl shadow-xl shadow-(--color-primary)/30">
                                        <FiSettings />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-(--color-primary) tracking-tight">{t('admin.manage_payment_methods')}</h2>
                                        <p className="text-(--color-primary)/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1">تكوين خيارات الدفع المتاحة للعملاء</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 transition-all border border-(--color-primary)/5 shadow-soft active:scale-90">
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Methods List */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-[10px] font-black text-(--color-primary)/30 uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                                                <FiList size={16} /> {t('admin.payment_methods_title')}
                                            </h3>
                                            <button
                                                onClick={() => setEditingMethod({ name: "", image: "", isEnabled: true, showPaymentDetails: true, fields: [], order: methods.length + 1 })}
                                                className="px-6 py-3 bg-(--color-primary) text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl shadow-(--color-primary)/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <FiPlus size={16} /> {t('admin.add_payment_method')}
                                            </button>
                                        </div>

                                        {loading ? (
                                            <div className="py-24 text-center flex flex-col items-center gap-6">
                                                <div className="w-12 h-12 border-4 border-(--color-primary)/10 border-t-(--color-primary) rounded-full animate-spin shadow-inner" />
                                                <p className="text-(--color-primary)/30 font-black text-[10px] uppercase tracking-[0.3em]">{t('common.loading')}</p>
                                            </div>
                                        ) : methods.length === 0 ? (
                                            <div className="py-32 text-center bg-(--color-primary)/5 rounded-[3rem] border-2 border-dashed border-(--color-primary)/10">
                                                <FiSettings className="mx-auto text-(--color-primary)/10 mb-8" size={64} />
                                                <p className="text-(--color-primary)/30 font-black text-xs uppercase tracking-[0.3em]">{t('admin.no_payment_methods')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {methods.map((method) => (
                                                    <div
                                                        key={method.id}
                                                        onClick={() => setEditingMethod(method)}
                                                        className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between cursor-pointer group relative overflow-hidden ${editingMethod?.id === method.id ? 'bg-white border-(--color-primary)/20 shadow-premium' : 'bg-(--color-primary)/5 border-transparent hover:bg-white hover:border-(--color-primary)/10 hover:shadow-premium'}`}
                                                    >
                                                        <div className="flex items-center gap-5 relative z-10">
                                                            <div className="w-14 h-14 rounded-xl bg-white border border-(--color-primary)/5 flex items-center justify-center overflow-hidden shrink-0 shadow-soft group-hover:scale-105 transition-transform duration-700">
                                                                {method.image ? (
                                                                    <img
                                                                        src={method.image.startsWith('/') ? method.image : `/images/payment/${method.image}`}
                                                                        alt={method.name}
                                                                        className="w-full h-full object-contain p-3"
                                                                    />
                                                                ) : (
                                                                    <FiImage className="text-(--color-primary)/10" size={32} />
                                                                )}
                                                                                                 <div>
                                                                <p className="font-black text-(--color-primary) text-lg tracking-tight leading-none">{method.name}</p>
                                                                <div className="flex items-center gap-3 mt-2.5">
                                                                    <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2.5 py-1.5 rounded-lg border ${method.isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/20'}`}>
                                                                        {method.isEnabled ? t('admin.active_orders') : t('admin.archived')}
                                                                    </span>
                                                                    <span className="text-[9px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em]">
                                                                        {method.paymentFields?.length || 0} {t('common.details')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                         <div className="flex items-center gap-3 relative z-10" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => toggleStatus(method)}
                                                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-soft border active:scale-90 ${method.isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/20'}`}
                                                            >
                                                                {method.isEnabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(method.id)}
                                                                className="w-10 h-10 rounded-xl bg-white text-(--color-primary)/20 hover:bg-(--color-secondary)/10 hover:text-(--color-secondary) border border-(--color-primary)/5 transition-all flex items-center justify-center shadow-soft active:scale-90"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </div>
                       </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Editor Form */}
                                    <div className="bg-(--color-primary)/5 p-8 rounded-[2.5rem] border border-transparent h-fit sticky top-0 shadow-inner group overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl" />
                                        <AnimatePresence mode="wait">
                                            {editingMethod ? (
                                                <motion.div
                                                    key="editor"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                                        <h3 className="text-xl font-black text-(--color-primary) tracking-tight">
                                                            {editingMethod.id ? t('admin.edit_payment_method') : t('admin.add_payment_method')}
                                                        </h3>
                                                        <button onClick={() => setEditingMethod(null)} className="w-10 h-10 rounded-xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 border border-(--color-primary)/5 transition-all flex items-center justify-center shadow-soft active:scale-90">
                                                            <FiX size={18} />
                                                        </button>
                                                    </div>

                                                    {/* Basic Info */}
                                                    <div className="space-y-6 relative z-10">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-(--color-primary)/30 tracking-[0.2em] block mb-3 px-2">{t('admin.method_name')}</label>
                                                            <input
                                                                value={editingMethod.name || ""}
                                                                onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                                                                className="w-full bg-white border border-transparent rounded-2xl py-4 px-6 text-sm font-black text-(--color-primary) outline-none focus:bg-white focus:ring-4 focus:ring-(--color-primary)/5 transition-all shadow-premium placeholder:text-(--color-primary)/10 uppercase tracking-widest"
                                                                placeholder={t('admin.method_name')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-(--color-primary)/30 tracking-[0.2em] block mb-3 px-2">نوع الدفع</label>
                                                            <div className="grid grid-cols-3 gap-3 p-1.5 bg-(--color-primary)/5 rounded-2xl shadow-inner">
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'cash' })}
                                                                    className={`py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.2em] ${editingMethod.type === 'cash' ? 'bg-white text-(--color-primary) shadow-premium' : 'text-(--color-primary)/30 hover:text-(--color-primary)/60'}`}
                                                                >
                                                                    نقدي
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'bank' })}
                                                                    className={`py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.2em] ${editingMethod.type === 'bank' ? 'bg-white text-(--color-primary) shadow-premium' : 'text-(--color-primary)/30 hover:text-(--color-primary)/60'}`}
                                                                >
                                                                    بنكي
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'wallet' })}
                                                                    className={`py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-[0.2em] ${editingMethod.type === 'wallet' ? 'bg-white text-(--color-primary) shadow-premium' : 'text-(--color-primary)/30 hover:text-(--color-primary)/60'}`}
                                                                >
                                                                    محفظة
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-(--color-primary)/30 tracking-[0.2em] block mb-3 px-2">{t('admin.image_name')}</label>
                                                            <div className="flex gap-4 items-center">
                                                                <div className="w-16 h-16 rounded-[1.2rem] bg-white border border-(--color-primary)/5 flex items-center justify-center overflow-hidden shrink-0 shadow-premium group/preview relative">
                                                                    {editingMethod.image ? (
                                                                        <>
                                                                            <img
                                                                                src={editingMethod.image.startsWith('/') ? editingMethod.image : `/images/payment/${editingMethod.image}`}
                                                                                className="w-full h-full object-contain p-3"
                                                                            />
                                                                            <div className="absolute inset-0 bg-(--color-primary)/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                                                <FiEdit className="text-white" size={18} />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <FiImage className="text-(--color-primary)/10" size={24} />
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowGallery(true)}
                                                                    className="flex-1 h-16 bg-white border border-transparent rounded-[1.2rem] flex flex-col items-center justify-center gap-1 hover:shadow-premium transition-all text-(--color-primary)/30 hover:text-(--color-primary) shadow-soft active:scale-95 group/btn"
                                                                >
                                                                    <FiImage size={20} className="group-hover/btn:scale-110 transition-transform" />
                                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">{editingMethod.image ? t('common.edit') : t('common.pick_image')}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-4">
                                                            <button
                                                                onClick={() => setEditingMethod({ ...editingMethod, isEnabled: !editingMethod.isEnabled })}
                                                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-soft active:scale-95 ${editingMethod.isEnabled ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-white text-(--color-secondary) border border-transparent'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {editingMethod.isEnabled ? <FiCheck size={16} /> : <FiX size={16} />}
                                                                    <span>تفعيل الوسيلة</span>
                                                                </div>
                                                                {editingMethod.isEnabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>

                                                            <button
                                                                onClick={() => setEditingMethod({ ...editingMethod, showPaymentDetails: !editingMethod.showPaymentDetails })}
                                                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-soft active:scale-95 ${editingMethod.showPaymentDetails ? 'bg-(--color-primary) text-white shadow-xl shadow-(--color-primary)/30' : 'bg-white text-(--color-primary)/30 border border-transparent'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <FiSettings size={16} />
                                                                    <span>طلب بيانات الدفع</span>
                                                                </div>
                                                                {editingMethod.showPaymentDetails ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Structured Fields Section */}
                                                    <div className="pt-8 border-t border-(--color-primary)/5 relative z-10">
                                                        <div className="flex items-center justify-between mb-6">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-(--color-primary)/30 tracking-[0.2em] px-2 block mb-1">بيانات التحويل / الدفع</label>
                                                                <p className="text-[8px] text-(--color-primary)/30 font-black uppercase tracking-[0.15em] px-2">أضف الحقول التي تريد للعميل نسخها</p>
                                                            </div>
                                                            <button
                                                                onClick={addField}
                                                                className="text-(--color-primary) bg-white px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-soft hover:shadow-premium active:scale-95 border border-transparent"
                                                            >
                                                                <FiPlus size={14} /> {t('admin.add_field')}
                                                            </button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {editingMethod.paymentFields?.map((field) => (
                                                                <div key={field.id} className="p-4 bg-white rounded-2xl border border-transparent flex items-center gap-4 group/field hover:shadow-premium transition-all shadow-soft">
                                                                    <div className="flex-1 flex flex-col gap-3">
                                                                        <input
                                                                            value={field.label}
                                                                            onChange={(e) => updateField(field.id, "label", e.target.value)}
                                                                            placeholder="IBAN"
                                                                            className="bg-(--color-primary)/5 border border-transparent rounded-xl py-3 px-5 text-[10px] font-black text-(--color-primary) outline-none focus:bg-white focus:shadow-inner transition-all uppercase tracking-widest placeholder:text-(--color-primary)/10"
                                                                        />
                                                                        <input
                                                                            value={field.value}
                                                                            onChange={(e) => updateField(field.id, "value", e.target.value)}
                                                                            placeholder="Value"
                                                                            className="bg-(--color-primary)/5 border border-transparent rounded-xl py-3 px-5 text-[10px] font-black text-(--color-primary) outline-none focus:bg-white focus:shadow-inner transition-all uppercase tracking-widest placeholder:text-(--color-primary)/10"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeField(field.id)}
                                                                        className="w-10 h-10 flex items-center justify-center text-(--color-primary)/10 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 rounded-xl transition-all shrink-0 active:scale-90"
                                                                    >
                                                                        <FiTrash2 size={18} />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            {(!editingMethod.paymentFields || editingMethod.paymentFields.length === 0) && (
                                                                <div className="text-center py-12 bg-white/50 border-2 border-dashed border-(--color-primary)/10 rounded-[2rem]">
                                                                    <p className="text-[10px] text-(--color-primary)/20 font-black uppercase tracking-[0.3em]">لا توجد حقول مضافة</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleSave}
                                                        className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-99 transition-all text-sm uppercase tracking-[0.2em] relative z-10"
                                                    >
                                                        <FiSave size={20} /> {t('common.save')}
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="h-[600px] flex flex-col items-center justify-center text-center p-12 space-y-10 relative z-10"
                                                >
                                                    <div className="w-32 h-32 rounded-[2.5rem] bg-white shadow-premium flex items-center justify-center text-(--color-primary)/5 border border-transparent transition-transform duration-700 hover:rotate-12">
                                                        <FiSettings size={64} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-(--color-primary) text-2xl tracking-tight mb-4">{t('admin.payment_editor_title') || "محرر طرق الدفع"}</h4>
                                                        <p className="text-[10px] text-(--color-primary)/30 font-black max-w-[280px] leading-loose uppercase tracking-[0.3em] mx-auto">{t('admin.payment_editor_desc') || "اختر طريقة دفع من القائمة لتعديلها أو أضف واحدة جديدة لتظهر للعملاء في تطبيق الطلب"}</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <FeaturedGallery
                visible={showGallery}
                onClose={() => setShowGallery(false)}
                onSelect={(img) => {
                    setEditingMethod({ ...editingMethod, image: img });
                    setShowGallery(false);
                }}
                galleryImages={paymentImages}
                selectedImage={editingMethod?.image}
                title={t('admin.manage_payment_methods')}
                basePath="/images/payment/"
            />
        </>
    );
}
