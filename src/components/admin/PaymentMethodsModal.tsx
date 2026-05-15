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
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl bg-white rounded-[3rem] border border-gray-100 shadow-premium overflow-hidden z-10 flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                                        <FiSettings size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t('admin.manage_payment_methods')}</h2>
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">تكوين خيارات الدفع المتاحة للعملاء</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-gray-400 hover:text-secondary hover:bg-secondary/10 transition-all border border-gray-100 shadow-soft">
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Methods List */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                                <FiList size={18} /> {t('admin.payment_methods_title')}
                                            </h3>
                                            <button
                                                onClick={() => setEditingMethod({ name: "", image: "", isEnabled: true, showPaymentDetails: true, fields: [], order: methods.length + 1 })}
                                                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                            >
                                                <FiPlus /> {t('admin.add_payment_method')}
                                            </button>
                                        </div>

                                        {loading ? (
                                            <div className="py-20 text-center flex flex-col items-center gap-4">
                                                <div className="w-10 h-10 border-4 border-gray-100 border-t-primary rounded-full animate-spin" />
                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{t('common.loading')}</p>
                                            </div>
                                        ) : methods.length === 0 ? (
                                            <div className="py-24 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                                                <FiSettings className="mx-auto text-gray-200 mb-6" size={48} />
                                                <p className="text-gray-400 font-black text-sm uppercase tracking-widest">{t('admin.no_payment_methods')}</p>
                                            </div>
                                        ) : (
                                            <div className="grid gap-4">
                                                {methods.map((method) => (
                                                    <div
                                                        key={method.id}
                                                        onClick={() => setEditingMethod(method)}
                                                        className={`p-6 rounded-4xl border transition-all flex items-center justify-between cursor-pointer group ${editingMethod?.id === method.id ? 'bg-white border-primary shadow-premium' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-primary/20'}`}
                                                    >
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-soft group-hover:scale-105 transition-transform">
                                                                {method.image ? (
                                                                    <img
                                                                        src={method.image.startsWith('/') ? method.image : `/images/payment/${method.image}`}
                                                                        alt={method.name}
                                                                        className="w-full h-full object-contain p-2"
                                                                    />
                                                                ) : (
                                                                    <FiImage className="text-gray-300" size={24} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 text-lg leading-none">{method.name}</p>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border ${method.isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-secondary/5 text-secondary border-secondary/10'}`}>
                                                                        {method.isEnabled ? t('admin.active_orders') : t('admin.archived')}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                                        {method.paymentFields?.length || 0} {t('common.details')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => toggleStatus(method)}
                                                                className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center shadow-sm border ${method.isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-secondary/5 text-secondary border-secondary/10'}`}
                                                            >
                                                                {method.isEnabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(method.id)}
                                                                className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-secondary/10 hover:text-secondary border border-gray-100 transition-all flex items-center justify-center shadow-sm"
                                                            >
                                                                <FiTrash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Editor Form */}
                                    <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 h-fit sticky top-0 shadow-inner">
                                        <AnimatePresence mode="wait">
                                            {editingMethod ? (
                                                <motion.div
                                                    key="editor"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="space-y-8"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-xl font-black text-gray-900 tracking-tight">
                                                            {editingMethod.id ? t('admin.edit_payment_method') : t('admin.add_payment_method')}
                                                        </h3>
                                                        <button onClick={() => setEditingMethod(null)} className="w-10 h-10 rounded-xl bg-white text-gray-400 hover:text-secondary hover:bg-secondary/10 border border-gray-100 transition-all flex items-center justify-center shadow-soft">
                                                            <FiX />
                                                        </button>
                                                    </div>

                                                    {/* Basic Info */}
                                                    <div className="space-y-6">
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-3 px-1">{t('admin.method_name')}</label>
                                                            <input
                                                                value={editingMethod.name || ""}
                                                                onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
                                                                className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-soft"
                                                                placeholder={t('admin.method_name')}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-3 px-1">نوع الدفع</label>
                                                            <div className="grid grid-cols-3 gap-3">
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'cash' })}
                                                                    className={`py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${editingMethod.type === 'cash' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'}`}
                                                                >
                                                                    نقدي (Cash)
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'bank' })}
                                                                    className={`py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${editingMethod.type === 'bank' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'}`}
                                                                >
                                                                    تحويل بنكي
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingMethod({ ...editingMethod, type: 'wallet' })}
                                                                    className={`py-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest ${editingMethod.type === 'wallet' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/30'}`}
                                                                >
                                                                    محفظة
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block mb-3 px-1">{t('admin.image_name')}</label>
                                                            <div className="flex gap-5 items-center">
                                                                <div className="w-20 h-20 rounded-3xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shrink-0 shadow-soft group/preview relative">
                                                                    {editingMethod.image ? (
                                                                        <>
                                                                            <img
                                                                                src={editingMethod.image.startsWith('/') ? editingMethod.image : `/images/payment/${editingMethod.image}`}
                                                                                className="w-full h-full object-contain p-3"
                                                                            />
                                                                            <div className="absolute inset-0 bg-gray-900/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <FiEdit className="text-white" size={20} />
                                                                            </div>
                                                                        </>
                                                                    ) : (
                                                                        <FiImage className="text-gray-300" size={32} />
                                                                    )}
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowGallery(true)}
                                                                    className="flex-1 h-20 bg-white border border-gray-100 rounded-3xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary shadow-soft"
                                                                >
                                                                    <FiImage size={24} />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">{editingMethod.image ? t('common.edit') : t('common.pick_image')}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <button
                                                                onClick={() => setEditingMethod({ ...editingMethod, isEnabled: !editingMethod.isEnabled })}
                                                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${editingMethod.isEnabled ? 'bg-emerald-500 text-white border border-emerald-600' : 'bg-white text-secondary border border-gray-100'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    {editingMethod.isEnabled ? <FiCheck /> : <FiX />}
                                                                    <span>تفعيل الوسيلة</span>
                                                                </div>
                                                                {editingMethod.isEnabled ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>

                                                            <button
                                                                onClick={() => setEditingMethod({ ...editingMethod, showPaymentDetails: !editingMethod.showPaymentDetails })}
                                                                className={`flex items-center justify-between px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${editingMethod.showPaymentDetails ? 'bg-primary text-white border border-primary-600' : 'bg-white text-gray-400 border border-gray-100'}`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <FiSettings />
                                                                    <span>طلب بيانات الدفع</span>
                                                                </div>
                                                                {editingMethod.showPaymentDetails ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Structured Fields Section */}
                                                    <div className="pt-8 border-t border-gray-200">
                                                        <div className="flex items-center justify-between mb-5">
                                                            <div>
                                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] px-1 block mb-1">بيانات التحويل / الدفع</label>
                                                                <p className="text-[9px] text-gray-400 font-bold opacity-60">أضف الحقول التي تريد للعميل نسخها (مثل رقم الحساب)</p>
                                                            </div>
                                                            <button
                                                                onClick={addField}
                                                                className="text-primary hover:bg-primary/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-transparent hover:border-primary/20"
                                                            >
                                                                <FiPlus /> {t('admin.add_field')}
                                                            </button>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {editingMethod.paymentFields?.map((field) => (
                                                                <div key={field.id} className="p-4 bg-white rounded-2xl border border-gray-100 flex items-center gap-3 group hover:border-primary/20 transition-all shadow-sm">
                                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                                        <input
                                                                            value={field.label}
                                                                            onChange={(e) => updateField(field.id, "label", e.target.value)}
                                                                            placeholder="العنوان (مثال: IBAN)"
                                                                            className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[11px] font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                                                        />
                                                                        <input
                                                                            value={field.value}
                                                                            onChange={(e) => updateField(field.id, "value", e.target.value)}
                                                                            placeholder="القيمة"
                                                                            className="bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-[11px] font-bold outline-none focus:bg-white focus:border-primary transition-all"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        onClick={() => removeField(field.id)}
                                                                        className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-secondary hover:bg-secondary/10 rounded-xl transition-all shrink-0"
                                                                    >
                                                                        <FiTrash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}

                                                            {(!editingMethod.paymentFields || editingMethod.paymentFields.length === 0) && (
                                                                <div className="text-center py-8 bg-white/50 border-2 border-dashed border-gray-200 rounded-2xl">
                                                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">لا توجد حقول مضافة</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleSave}
                                                        className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest"
                                                    >
                                                        <FiSave size={20} /> {t('common.save')}
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="empty"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="h-[500px] flex flex-col items-center justify-center text-center p-10 space-y-6"
                                                >
                                                    <div className="w-24 h-24 rounded-4xl bg-white shadow-soft flex items-center justify-center text-primary/10 border border-gray-50">
                                                        <FiSettings size={48} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900 text-lg mb-2">{t('admin.payment_editor_title') || "محرر طرق الدفع"}</h4>
                                                        <p className="text-xs text-gray-400 font-bold max-w-[240px] leading-relaxed uppercase tracking-widest">{t('admin.payment_editor_desc') || "اختر طريقة دفع من القائمة لتعديلها أو أضف واحدة جديدة لتظهر للعملاء في تطبيق الطلب"}</p>
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
