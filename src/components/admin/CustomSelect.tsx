import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiCheck } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface Props {
    options: { id: string; name: string }[];
    value: string;
    onChange: (val: string) => void;
    error?: boolean;
    placeholder?: string;
    disabled?: boolean;
}

const CustomSelect: React.FC<Props> = ({ options, value, onChange, error, placeholder, disabled }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative w-full" ref={ref} dir="rtl">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`
                    w-full h-12 flex items-center justify-between px-8 rounded-[1.2rem] border transition-all duration-700
                    bg-white outline-none shadow-soft
                    ${disabled ? "opacity-50 cursor-not-allowed border-transparent" : "hover:shadow-premium border-transparent"}
                    ${error ? "border-(--color-secondary) ring-8 ring-(--color-secondary)/5" : (!disabled ? "focus:ring-10 focus:ring-(--color-primary)/5" : "")} 
                `}
            >
                <span className={`text-sm md:text-md font-bold uppercase tracking-[0.2em] ${selectedOption ? "text-(--color-primary)" : "text-(--color-primary)/20"}`}>
                    {selectedOption ? selectedOption.name : placeholder || t('common.select')}
                </span>
                <FiChevronDown className={`transition-all duration-500 text-(--color-primary)/20 ${open ? "rotate-180 text-(--color-primary) scale-125" : ""}`} size={24} />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="absolute z-60 w-full right-0 mt-4 max-h-72 overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-2xl border border-white shadow-premium"
                    >
                        <div className="overflow-y-auto max-h-72 custom-scrollbar p-3">
                            {options.length === 0 ? (
                                <div className="p-10 text-center text-[10px] text-(--color-primary)/20 font-black uppercase tracking-[0.3em]">{t('common.no_options')}</div>
                            ) : (
                                <div className="space-y-2">
                                    {options.map(o => (
                                        <button
                                            key={o.id}
                                            type="button"
                                            onClick={() => { onChange(o.id); setOpen(false); }}
                                            className={`
                                                w-full text-right px-6 py-4 rounded-[1.2rem] transition-all flex items-center justify-between group/opt relative overflow-hidden
                                                ${value === o.id ? "bg-(--color-primary) text-white shadow-xl shadow-(--color-primary)/20" : "hover:bg-(--color-primary)/5 text-(--color-primary)/40 hover:text-(--color-primary)"}
                                            `}
                                        >
                                            <span className="text-sm md:text-md font-black uppercase tracking-widest relative z-10">{o.name}</span>
                                            {value === o.id && <FiCheck className="text-white relative z-10" size={20} strokeWidth={4} />}
                                            {value !== o.id && <div className="absolute inset-0 bg-white/40 opacity-0 group-hover/opt:opacity-100 transition-opacity" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomSelect;
