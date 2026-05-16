import { FaTrash, FaMinus, FaPlus } from "react-icons/fa";
import { TbCurrencyShekel } from "react-icons/tb";
import { type CartItem as CartItemType, useCart } from "../../context/CartContext";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export default function CartItem({ item }: { item: CartItemType }) {
    const { increase, decrease, removeItem } = useCart();
    const { i18n, t } = useTranslation();
    const isRtl = i18n.language === 'ar';

    const itemName = isRtl
        ? (item.nameAr || item.nameEn || item.name)
        : (item.nameEn || item.nameAr || item.name);

    const lineTotal = item.selectedPrice * item.qty;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md p-4 sm:p-6 rounded-[2rem] border border-primary/5 hover:border-primary/20 hover:shadow-soft transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700" />

                {/* Qty Badge */}
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-primary/10 border border-primary/5 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-black text-primary">{item.qty}×</span>
                </div>

                {/* Name & Price */}
                <div className="flex-1 min-w-0">
                    <p className="font-black text-primary truncate text-base leading-tight">
                        {itemName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-primary/40">{item.selectedPrice}</span>
                        <TbCurrencyShekel size={12} className="text-primary/30" />
                        {item.qty > 1 && (
                            <>
                                <span className="text-primary/10 text-xs">•</span>
                                <span className="text-xs font-black text-orange">{lineTotal}₪</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Qty Controls */}
                <div className="flex items-center gap-1.5 bg-primary/5 p-1.5 rounded-2xl border border-primary/5 shrink-0 shadow-inner">
                    <button
                        onClick={() => decrease(item.priceKey)}
                        className="w-8 h-8 rounded-xl text-primary/40 flex items-center justify-center hover:bg-secondary hover:text-white transition-all active:scale-90 shadow-sm bg-white/50"
                    >
                        <FaMinus size={10} />
                    </button>

                    <span className="min-w-[28px] text-center font-black text-base text-primary">
                        {item.qty}
                    </span>

                    <button
                        onClick={() => increase(item.priceKey)}
                        className="w-8 h-8 rounded-xl text-primary/40 flex items-center justify-center hover:bg-primary hover:text-white transition-all active:scale-90 shadow-sm bg-white/50"
                    >
                        <FaPlus size={10} />
                    </button>
                </div>

                {/* Remove */}
                <button
                    onClick={() => removeItem(item.priceKey)}
                    className="shrink-0 w-10 h-10 rounded-2xl text-primary/20 hover:text-secondary hover:bg-secondary/10 transition-all active:scale-90 flex items-center justify-center"
                    title={t('common.remove')}
                >
                    <FaTrash size={12} />
                </button>
            </div>
        </motion.div>
    );
}
