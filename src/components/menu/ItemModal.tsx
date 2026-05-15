import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiPlus, FiMinus, FiShoppingCart } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useCart } from "../../context/CartContext";
import type { Item } from "./Menu";
import { toast } from "react-hot-toast";

interface Props {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ItemModal({ item, isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  if (!item) return null;

  const prices = String(item.price).split(",").map(p => Number(p.trim()));
  const currentPrice = prices[selectedPriceIndex];
  const itemName = item.nameAr || item.name || "";

  const handleAdd = () => {
    const optionLabel = prices.length > 1 ? `${t("common.select")} ${selectedPriceIndex + 1}` : undefined;
    addItem(item, currentPrice, quantity, optionLabel);
    toast.success(t("common.added_to_cart") || "Added to cart!");
    onClose();
    setQuantity(1);
    setSelectedPriceIndex(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-(--bg-card) rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/40 transition-all border border-white/10"
            >
              <FiX size={20} />
            </button>

            {/* Image Hero */}
            <div className="relative h-64 sm:h-80 shrink-0">
              <img
                src={item.image ? `/images/${item.image}` : "/logo.png"}
                alt={itemName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/logo.png";
                }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-(--bg-card) via-transparent to-transparent" />
            </div>

            {/* Content Body */}
            <div className="p-8 sm:p-10 -mt-12 relative bg-(--bg-card) rounded-t-[3rem] flex-1">
              <div className="space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-bold text-(--text-main) tracking-tight">
                      {itemName}
                    </h2>

                  </div>
                  <div className="text-2xl font-bold text-primary flex items-baseline gap-1 shrink-0">
                    {currentPrice}
                    <small className="text-sm opacity-70">₪</small>
                  </div>
                </div>

                <div className="h-px w-full bg-(--border-color)/30" />

                {/* Variant Selector (if multiple prices) */}
                {prices.length > 1 && (
                  <div className="space-y-4">
                    <span className="text-xs font-bold text-(--text-muted) uppercase tracking-widest opacity-80">
                      {t("common.select") || "اختر..."}
                    </span>
                    <div className="flex flex-wrap gap-3">
                      {prices.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPriceIndex(idx)}
                          className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${selectedPriceIndex === idx
                            ? "bg-secondary text-black border-secondary shadow-lg shadow-secondary/20"
                            : "bg-(--bg-main) text-(--text-main) border-(--border-color) hover:border-secondary/40"
                            }`}
                        >
                          {p}₪
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-bold text-(--text-main) uppercase tracking-widest">
                    {t("common.quantity") || "الكمية"}
                  </span>
                  <div className="flex items-center gap-6 bg-(--bg-main) p-2 rounded-2xl border border-(--border-color)">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl bg-(--bg-card) text-(--text-main) flex items-center justify-center shadow-sm hover:text-red-500 transition-colors"
                    >
                      <FiMinus size={18} />
                    </motion.button>
                    <span className="text-xl font-bold w-8 text-center text-(--text-main)">
                      {quantity}
                    </span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-(--bg-card) text-(--text-main) flex items-center justify-center shadow-sm hover:text-secondary transition-colors"
                    >
                      <FiPlus size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAdd}
                  className="w-full py-5 rounded-full bg-primary text-white font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-3 text-lg hover:bg-primary/95 transition-all mt-4"
                >
                  <FiShoppingCart size={22} />
                  <span>{t("common.add_to_order") || "إضافة للطلب"}</span>
                  <span className="mx-2 opacity-30">|</span>
                  <span>{currentPrice * quantity}₪</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
