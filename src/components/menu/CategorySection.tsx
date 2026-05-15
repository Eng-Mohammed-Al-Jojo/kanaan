import { useMemo } from "react";
import ItemRow from "./ItemRow";
import type { Category, Item, Subcategory } from "./Menu";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

interface Props {
  category: Category;
  subcategories: Subcategory[];
  items: Item[];
  orderSystem: boolean;
  onItemClick?: (item: Item) => void;
  onDetailsClick?: (item: Item) => void;
}

export default function CategorySection({ category, subcategories, items, orderSystem, onItemClick, onDetailsClick }: Props) {

  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    const noSubItems: Item[] = [];

    items.forEach(item => {
      const sub = subcategories.find(s => s.id === item.subcategoryId);
      if (item.subcategoryId && sub && sub.visible !== false) {
        if (!groups[item.subcategoryId]) groups[item.subcategoryId] = [];
        groups[item.subcategoryId].push(item);
      } else {
        noSubItems.push(item);
      }
    });

    return { groups, noSubItems };
  }, [items, subcategories]);

  const activeSubcategories = useMemo(() => {
    return subcategories
      .filter(sub => sub.categoryId === category.id && sub.visible !== false && groupedItems.groups[sub.id])
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [category.id, subcategories, groupedItems.groups]);

  const catName = category.nameAr || category.name || "";

  return (
    <div className="w-full space-y-12">
      {/* Premium Heritage Category Header */}
      <div className="flex flex-col items-center gap-6 py-10 relative">
        {/* Decorative Arch Motif */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 border-t-2 border-x-2 border-primary/20 rounded-t-[100px] -z-10" />

        <div className="flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight text-center">
            {catName}
          </h2>
          {/* Decorative Divider */}
          <div className="mt-4 flex items-center gap-4">
            <div className="w-12 h-px bg-primary/20" />
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <div className="w-12 h-px bg-primary/20" />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Items Block */}
        {groupedItems.noSubItems.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            layout
            className="flex flex-col w-full overflow-hidden shadow-soft border border-primary/5 rounded-[2rem]"
          >
            {groupedItems.noSubItems.map((item, index) => (
              <div key={item.id} className={index % 2 === 0 ? "bg-row-odd" : "bg-row-even"}>
                <ItemRow
                  item={item}
                  orderSystem={orderSystem}
                  onClick={onItemClick}
                  onDetailsClick={onDetailsClick}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Subcategories Section */}
        {activeSubcategories.map((sub) => (
          <div key={sub.id} className="space-y-6 pt-10">
            {/* Elegant Subcategory Heading */}
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-secondary/20" />
              <span className="px-8 py-2.5 rounded-full bg-secondary/5 text-secondary text-base md:text-lg font-bold tracking-wide border border-secondary/10 whitespace-nowrap">
                {sub.nameAr}
              </span>
              <div className="h-px flex-1 bg-secondary/20" />
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              layout
              className="flex flex-col w-full overflow-hidden shadow-soft border border-primary/5 rounded-[2rem]"
            >
              {groupedItems.groups[sub.id].map((item, index) => (
                <div key={item.id} className={index % 2 === 0 ? "bg-row-odd" : "bg-row-even"}>
                  <ItemRow
                    item={item}
                    orderSystem={orderSystem}
                    onClick={onItemClick}
                    onDetailsClick={onDetailsClick}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );

}
