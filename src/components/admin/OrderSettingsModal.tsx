import { useState, useEffect } from "react";
import { ref, update } from "firebase/database";
import { db } from "../../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiSettings, FiInfo, FiSmartphone, FiLayout, FiTruck, FiCoffee } from "react-icons/fi";
import { FaWhatsapp, FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/* ================= Toast ================= */
function Toast({ type, message }: { type: "success" | "error"; message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 20, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className={`fixed top-0 left-1/2 z-200 px-6 py-3 rounded-2xl shadow-premium text-white font-black flex items-center gap-3.5 backdrop-blur-2xl border border-white/20 transition-all ${type === "success" ? "bg-emerald-600/95" : "bg-(--color-secondary)/95"}`}
        >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-base">
                {type === "success" ? <FiCheck /> : "×"}
            </div>
            <span className="text-[11px] tracking-widest uppercase">{message}</span>
        </motion.div>
    );
}

/* ================= Simple Components ================= */
const inputClass = "w-full bg-(--color-primary)/5 border border-transparent rounded-xl px-5 py-3.5 text-xs font-black text-(--color-primary) outline-none focus:bg-white focus:border-(--color-primary)/10 focus:ring-4 focus:ring-(--color-primary)/5 transition-all placeholder:text-(--color-primary)/10 uppercase tracking-widest shadow-inner";

function ServiceCheckbox({ title, enabled, onToggle, value, setValue, disabled, icon: Icon, required, isWaMode }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const showPhoneInput = isWaMode && enabled;

    return (
        <motion.div
            whileHover={!disabled ? { y: -2, boxShadow: "0 20px 40px -12px rgba(0, 0, 0, 0.1)" } : {}}
            className={`relative p-5 rounded-[1.8rem] border transition-all duration-700 group overflow-hidden ${enabled
                ? "bg-white border-(--color-primary)/10 shadow-premium"
                : "bg-(--color-primary)/5 border-transparent opacity-60 hover:opacity-100"
                } ${disabled ? "opacity-30 grayscale pointer-events-none" : ""}`}
        >
            <div className="flex items-center justify-between mb-3.5 relative z-10">
                <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-700 shadow-soft ${enabled
                        ? "bg-(--color-primary) text-white shadow-xl shadow-(--color-primary)/30"
                        : "bg-white text-(--color-primary)/20 border border-(--color-primary)/5"
                        }`}>
                        <Icon size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-base text-(--color-primary) tracking-tight">{title}</span>
                        {required && enabled && !value.trim() && (
                            <motion.span
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="text-[10px] font-black text-(--color-secondary) uppercase tracking-[0.2em] mt-2 bg-(--color-secondary)/5 px-3 py-1 rounded-lg w-fit border border-(--color-secondary)/10"
                            >
                                {t('admin.required') || "مطلوب"}
                            </motion.span>
                        )}
                        {!isWaMode && enabled && (
                            <span className="text-[10px] text-(--color-primary)/30 font-black uppercase tracking-[0.2em] mt-2">
                                {t('admin.dashboard_managed') || "تدار عبر اللوحة"}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={onToggle}
                    disabled={disabled}
                    className={`relative w-16 h-8 rounded-full transition-all duration-700 border border-transparent shadow-inner ${enabled ? "bg-emerald-500" : "bg-(--color-primary)/10"
                        }`}
                >
                    <motion.span
                        animate={{ x: enabled ? (isRtl ? 6 : 38) : (isRtl ? 38 : 6) }}
                        className="absolute top-1 left-0 w-6 h-6 rounded-full bg-white shadow-lg z-10"
                    />
                </button>
            </div>

            <AnimatePresence>
                {showPhoneInput && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        className="overflow-hidden relative z-10"
                    >
                        <div className="relative group/input">
                            <div className={`absolute ${isRtl ? 'right-5' : 'left-5'} top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white text-emerald-500 flex items-center justify-center border border-emerald-100 shadow-sm group-hover/input:scale-110 transition-transform duration-500`}>
                                <FaWhatsapp size={18} />
                            </div>
                            <input
                                type="tel"
                                value={value}
                                onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                                placeholder={t('admin.whatsapp_placeholder')}
                                className={`${inputClass} ${isRtl ? 'pr-16 pl-6' : 'pl-16 pr-6'} ${required && !value.trim() ? 'bg-(--color-secondary)/5' : ''}`}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ================= Modal ================= */
export default function OrderSettingsModal({ onClose, settings: initialSettings, onSave }: any) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.language === 'ar';
    const [orderSystem, setOrderSystem] = useState(true);
    const [inRestaurant, setInRestaurant] = useState(false);
    const [takeaway, setTakeaway] = useState(false);
    const [orderMode, setOrderMode] = useState<"dashboard" | "whatsapp">("dashboard");
    const [inPhone, setInPhone] = useState("");
    const [outPhone, setOutPhone] = useState("");
    const [complaintsWhatsapp, setComplaintsWhatsapp] = useState("");
    const [footer, setFooter] = useState({ address: "", phone: "", whatsapp: "", facebook: "", instagram: "", tiktok: "" });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<any>(null);

    useEffect(() => {
        if (!initialSettings) return;
        setOrderSystem(initialSettings.orderSystem ?? true);
        const s = initialSettings.orderSettings ?? {};
        setInRestaurant(!!s.inRestaurant);
        setTakeaway(!!s.takeaway);
        setOrderMode(initialSettings.orderMode || "dashboard");
        setInPhone(s.inPhone || "");
        setOutPhone(s.outPhone || "");
        setComplaintsWhatsapp(initialSettings.complaintsWhatsapp || "");
        setFooter(initialSettings.footerInfo || {});
        setLoading(false);
    }, [initialSettings]);

    if (loading) return null;

    const handleSave = async () => {
        if (orderMode === "whatsapp") {
            const enabledAnyService = inRestaurant || takeaway;
            if (!enabledAnyService) {
                setToast({ type: "error", message: t('admin.no_service_enabled') || "يجب تفعيل خدمة واحدة على الأقل" });
                setTimeout(() => setToast(null), 3000);
                return;
            }

            if ((inRestaurant && inPhone.trim() === "") || (takeaway && outPhone.trim() === "")) {
                setToast({ type: "error", message: t('admin.whatsapp_required') });
                setTimeout(() => setToast(null), 3000);
                return;
            }
        }

        const newSettings = {
            orderSystem,
            orderMode,
            orderSettings: {
                inRestaurant,
                takeaway,
                inPhone,
                outPhone
            },
            complaintsWhatsapp,
            footerInfo: footer,
        };

        try {
            setSaving(true);
            await update(ref(db, "settings"), newSettings);
            onSave?.(newSettings);
            setToast({ type: "success", message: t('admin.settings_saved_success') });
            setTimeout(() => onClose(), 1500);
        } catch (error) {
            setToast({ type: "error", message: t('admin.settings_save_error') });
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onClose()} className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md" />

            <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 20 }}
                className="relative bg-white/95 backdrop-blur-2xl w-full max-w-lg rounded-[2rem] border border-white shadow-premium flex flex-col max-h-[90vh] overflow-hidden z-10"
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-(--color-primary)/5 flex items-center justify-between bg-white/50 backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-(--color-primary) text-white flex items-center justify-center text-lg shadow-xl shadow-(--color-primary)/30">
                            <FiSettings />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-(--color-primary) tracking-tight">{t('admin.system_settings')}</h2>
                            <p className="text-(--color-primary)/30 text-[7px] font-black uppercase tracking-[0.15em] mt-0.5">{t('admin.system_config_desc')}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 transition-all border border-(--color-primary)/5 shadow-soft active:scale-90"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                    {/* Order Module Toggle */}
                    <div className="p-4.5 rounded-[1.2rem] bg-(--color-primary)/5 border border-transparent flex items-center justify-between shadow-inner relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 blur-xl" />
                        <div className="flex items-center gap-3.5 relative z-10">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-inner transition-all duration-700 ${orderSystem ? "bg-(--color-primary) text-white" : "bg-white text-(--color-primary)/20 border border-(--color-primary)/5"}`}>
                                <FiSmartphone />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm text-(--color-primary) leading-none tracking-tight">{t('admin.enable_web_ordering')}</span>
                                <span className="text-[7px] text-(--color-primary)/30 font-black uppercase tracking-[0.15em] mt-1.5">{orderSystem ? "النظام مفعل حالياً" : "النظام معطل"}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setOrderSystem((p) => !p)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-700 border border-transparent shadow-inner relative z-10 ${orderSystem ? "bg-emerald-500 shadow-emerald-500/30" : "bg-(--color-primary)/10"}`}
                        >
                            <motion.span animate={{ x: orderSystem ? (isRtl ? 3 : 26) : (isRtl ? 26 : 3) }} className="absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white shadow-lg" />
                        </button>
                    </div>

                    {/* Order Mode Switch */}
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.order_source_mode') || "وضع استقبال الطلبات"}</h3>
                        <div className="relative grid grid-cols-2 p-1.5 bg-(--color-primary)/5 rounded-[1.2rem] overflow-hidden border border-transparent shadow-inner">
                            <motion.div
                                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-lg shadow-premium"
                                animate={{
                                    left: orderMode === "dashboard"
                                        ? (isRtl ? "calc(50% + 3px)" : "3px")
                                        : (isRtl ? "3px" : "calc(50% + 3px)")
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                            />
                            <button
                                onClick={() => setOrderMode("dashboard")}
                                className={`relative z-10 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-700
                                ${orderMode === "dashboard" ? "text-(--color-primary)" : "text-(--color-primary)/30 hover:text-(--color-primary)/60"}`}
                            >
                                {t('admin.mode_dashboard')}
                            </button>
                            <button
                                onClick={() => setOrderMode("whatsapp")}
                                className={`relative z-10 py-2.5 text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-700
                                ${orderMode === "whatsapp" ? "text-(--color-primary)" : "text-(--color-primary)/30 hover:text-(--color-primary)/60"}`}
                            >
                                {t('admin.mode_whatsapp')}
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={orderMode}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="flex flex-col gap-4"
                        >
                            <ServiceCheckbox
                                title={t('admin.local_ordering')}
                                icon={FiCoffee}
                                enabled={inRestaurant}
                                onToggle={() => setInRestaurant((p) => !p)}
                                value={inPhone}
                                setValue={setInPhone}
                                disabled={!orderSystem}
                                required={orderMode === "whatsapp"}
                                isWaMode={orderMode === "whatsapp"}
                            />
                            <ServiceCheckbox
                                title={t('admin.takeaway_delivery')}
                                icon={FiTruck}
                                enabled={takeaway}
                                onToggle={() => setTakeaway((p) => !p)}
                                value={outPhone}
                                setValue={setOutPhone}
                                disabled={!orderSystem}
                                required={orderMode === "whatsapp"}
                                isWaMode={orderMode === "whatsapp"}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Complaints */}
                    <div className="p-5 rounded-[1.5rem] bg-(--color-secondary)/5 border border-transparent space-y-3.5 relative group overflow-hidden shadow-inner">
                        <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-xl" />
                        <div className="flex items-center gap-3.5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-(--color-secondary) text-white flex items-center justify-center shadow-xl shadow-(--color-secondary)/30 group-hover:scale-110 transition-transform duration-700">
                                <FiInfo size={18} />
                            </div>
                            <div>
                                <h3 className="font-black text-sm text-(--color-primary) tracking-tight">{t('admin.complaints_whatsapp')}</h3>
                                <p className="text-[7px] text-(--color-primary)/30 font-black mt-1 uppercase tracking-[0.15em]">{t('admin.feedback_channel') || "قناة التواصل للشكاوى والملاحظات"}</p>
                            </div>
                        </div>
                        <div className="space-y-2 relative z-10">
                            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.whatsapp_number') || "رقم الواتساب"}</label>
                            <div className="relative group/input">
                                <div className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-white text-(--color-secondary) flex items-center justify-center border border-(--color-secondary)/10 shadow-sm group-hover/input:scale-110 transition-transform duration-500`}>
                                    <FaWhatsapp size={14} />
                                </div>
                                <input
                                    value={complaintsWhatsapp}
                                    onChange={(e) => setComplaintsWhatsapp(e.target.value.replace(/\D/g, ""))}
                                    placeholder={t('admin.whatsapp_placeholder')}
                                    className={`${inputClass} ${isRtl ? 'pr-12 pl-5' : 'pl-12 pr-5'} bg-white! shadow-soft h-11 py-0`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-5 rounded-[1.8rem] bg-(--color-primary)/5 border border-transparent space-y-5 shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-20 h-20 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
                        <div className="flex items-center gap-3.5 relative z-10">
                            <div className="w-9 h-9 rounded-xl bg-white text-(--color-primary) flex items-center justify-center border border-(--color-primary)/5 shadow-soft group-hover:scale-110 transition-transform duration-700">
                                <FiLayout size={18} />
                            </div>
                            <h3 className="font-black text-sm text-(--color-primary) tracking-tight">{t('admin.footer_info')}</h3>
                        </div>

                        <div className="space-y-3.5 relative z-10">
                            {/* Address */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.address') || "العنوان"}</label>
                                <div className="relative group/input">
                                    <FiLayout className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-(--color-primary) group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                    <input placeholder={t('admin.address_detail')} value={footer.address} onChange={(e) => setFooter({ ...footer, address: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.phone') || "رقم الهاتف"}</label>
                                <div className="relative group/input">
                                    <FiSmartphone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-(--color-primary) group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                    <input placeholder={t('admin.primary_phone')} value={footer.phone} onChange={(e) => setFooter({ ...footer, phone: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                </div>
                            </div>

                            {/* Whatsapp */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.whatsapp_contact') || "واتساب التواصل"}</label>
                                <div className="relative group/input">
                                    <FaWhatsapp className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-emerald-500 group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                    <input placeholder={t('admin.contact_whatsapp')} value={footer.whatsapp} onChange={(e) => setFooter({ ...footer, whatsapp: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                </div>
                            </div>

                            {/* Social Media Stack */}
                            <div className="space-y-2.5 pt-0.5">
                                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30 px-2">{t('admin.social_links') || "روابط التواصل الاجتماعي"}</label>
                                <div className="space-y-2.5">
                                    <div className="relative group/input">
                                        <FaFacebook className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-blue-600 group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                        <input placeholder="Facebook Username" value={footer.facebook} onChange={(e) => setFooter({ ...footer, facebook: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                    </div>
                                    <div className="relative group/input">
                                        <FaInstagram className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-pink-500 group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                        <input placeholder="Instagram Username" value={footer.instagram} onChange={(e) => setFooter({ ...footer, instagram: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                    </div>
                                    <div className="relative group/input">
                                        <FaTiktok className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within/input:text-black group-focus-within/input:scale-110 transition-all duration-500`} size={14} />
                                        <input placeholder="Tiktok Username" value={footer.tiktok} onChange={(e) => setFooter({ ...footer, tiktok: e.target.value })} className={`${inputClass} ${isRtl ? 'pr-10 pl-5' : 'pl-10 pr-5'} bg-white! shadow-soft h-11 py-0`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Save */}
                <div className="px-5 py-3.5 border-t border-(--color-primary)/5 bg-white/50 backdrop-blur-md relative z-10">
                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full h-12 rounded-xl font-black text-white shadow-2xl flex items-center justify-center gap-2.5 transition-all relative overflow-hidden group uppercase tracking-[0.15em] ${saving
                            ? "bg-emerald-500/50 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/40"
                            }`}
                    >
                        {saving ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                        ) : (
                            <FiCheck size={18} />
                        )}
                        <span className="text-xs">{t('admin.save_changes')}</span>
                    </motion.button>
                </div>

                <AnimatePresence>
                    {toast && (
                        <Toast type={toast.type} message={toast.message} />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
