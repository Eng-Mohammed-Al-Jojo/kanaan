import React, {
  useCallback,
} from "react";
import { type Item } from "./Menu";
import { motion } from "framer-motion";

interface Props {
  item: Item;
  orderSystem: boolean;
  onClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

const ItemRow = React.memo(
  ({ item, orderSystem, onClick }: Props) => {
    const prices = String(item.price).split(",");
    const unavailable = item.visible === false;
    const itemName = item.nameAr || item.name || "";
    const description = item.ingredientsAr || item.ingredients || "";
    const canOrder = !unavailable && orderSystem;

    const handleOrderClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (canOrder) onClick?.(item);
      },
      [canOrder, item, onClick]
    );

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`
      relative flex items-center justify-between w-full px-5 py-4
      transition-all duration-300 group cursor-pointer
      border-b border-secondary/5 last:border-none
      ${unavailable ? "" : "hover:bg-primary/5"}
    `}
      >
        {/* RIGHT SIDE: NAME + DESCRIPTION */}
        <div className="flex-1 text-right pr-1">
          <h3
            className={`text-lg md:text-xl font-bold text-primary leading-tight ${unavailable ? "line-through opacity-70" : ""
              }`}
          >
            {itemName}
          </h3>

          {description && (
            <p className="text-[12px] md:text-[14px] text-gray-500 font-medium leading-snug line-clamp-2 mt-1">
              {description}
            </p>
          )}

          {unavailable && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block">
              لقد نفذت الكمية
            </span>
          )}
        </div>

        {/* LEFT SIDE: PRICE + ORDER BUTTON */}
        <div className="flex flex-col items-end shrink-0 min-w-[110px] gap-2 text-left">
          {/* PRICE */}
          <div className=" flex items-center gap-1">
            {prices.map((p, index) => (
              <React.Fragment key={index}>
                <span className="text-primary font-black text-lg md:text-xl">
                  {p.trim()}
                </span>

                <span className="text-primary/60 text-xs font-bold">
                  ₪
                </span>

                {index !== prices.length - 1 && (
                  <span className="text-primary/40 mx-1 font-bold">|</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ORDER BUTTON */}
          {orderSystem && !unavailable && (
            <button
              onClick={handleOrderClick}
              className="text-xs font-black text-white bg-primary px-4 py-1.5 rounded-full
                     hover:scale-105 transition-transform active:scale-95 shadow-md shadow-primary/20 uppercase tracking-wider"
            >
              اطلب الآن
            </button>
          )}

        </div>
      </motion.div>
    );
  }
);


export default ItemRow;
