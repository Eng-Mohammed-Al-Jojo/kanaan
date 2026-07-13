import { useCallback, useEffect, useState, startTransition } from "react";
import { HiSparkles } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu, { type Category, type Item, type Subcategory } from "../components/menu/Menu";
import ItemModal from "../components/menu/ItemModal";
import ItemDetailsDrawer from "../components/menu/ItemDetailsDrawer";
import FeaturedModal from "../components/menu/FeaturedModal";
import LoadingScreen from "../components/common/LoadingScreen";
import OrderStatusButton from "../components/cart/OrderStatusButton";
import GlassButton from "../components/common/GlassButton";
import { MenuService } from "../services/menuService";

export default function MenuPage() {
  const { i18n } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orderSystem, setOrderSystem] = useState(true);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<Item | null>(null);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);

  useEffect(() => {
    let isActive = true;
    let unsubscribe: (() => void) | null = null;

    const loadMenu = async () => {
      try {
        const { data } = await MenuService.getMenuWithFallback();
        if (!isActive) return;

        startTransition(() => {
          setCategories(data.categories);
          setSubcategories(data.subcategories);
          setItems(data.items);
          setOrderSystem(data.orderSystem);
        });

        unsubscribe = MenuService.subscribeToMenuUpdates((freshData) => {
          if (!isActive) return;
          startTransition(() => {
            setCategories(freshData.categories);
            setSubcategories(freshData.subcategories);
            setItems(freshData.items);
            setOrderSystem(freshData.orderSystem);
          });
        });
      } catch (error) {
        console.error("Menu load failed:", error);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadMenu();

    return () => {
      isActive = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isLoading) {
      root.style.overflow = "hidden";
    } else {
      root.style.overflow = "";
    }

    return () => {
      root.style.overflow = "";
    };
  }, [isLoading]);

  const handleFeaturedCheck = useCallback((featured: boolean) => {
    setHasFeatured(featured);
  }, []);

  const isRtl = i18n.language === "ar";

  return (
    <div className="min-h-screen flex flex-col menu-wrapper overflow-x-hidden arch-bg relative">
      <div className="fixed inset-0 pattern-heritage z-0 pointer-events-none" />

      <LoadingScreen visible={isLoading} />

      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.main
            key="menu-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col flex-1 relative z-10"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="absolute top-6 left-6 z-30">
              {hasFeatured && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <GlassButton
                    variant="featured"
                    icon={<HiSparkles size={18} />}
                    onClick={() => setShowFeaturedModal(true)}
                    className="!bg-primary !text-white border-none shadow-2xl hover:scale-110 transition-transform"
                  />
                </motion.div>
              )}
            </div>

            <section className="relative flex flex-col items-center justify-center text-center pt-8 pb-1 px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative flex flex-col items-center"
              >
                <div className="w-[22.5rem] h-[22.5rem] bg-transparent flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Kanaan Logo"
                    width="192"
                    height="192"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
                  />
                </div>
              </motion.div>
            </section>

            <div className="arch-content shadow-2xl shadow-black/20 flex-1 flex flex-col">
              <div className="absolute inset-0 pattern-gear pointer-events-none rounded-t-[200px]" />

              <div className="absolute top-0 left-0 w-full h-48 pointer-events-none z-[8] overflow-hidden rounded-t-[200px]">
                <div className="absolute top-0 left-0 right-0 h-full border-t-[3px] border-orange blur-[6px]" />
                <div className="absolute top-0 left-0 right-0 h-full border-t-[3px] border-green-dark" />
                <div className="absolute top-0 left-0 right-0 h-full border-t-[3px] border-orange rounded-t-[200px]" />
                <div className="absolute top-4 left-6 right-6 h-full border-t-4 border-primary rounded-t-[180px]" />
                <div className="absolute top-8 left-12 right-12 h-full border-t-4 border-orange rounded-t-[160px]" />
              </div>

              <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-1 md:px-8 pt-32 pb-4">
                <Menu
                  categories={categories}
                  subcategories={subcategories}
                  items={items}
                  orderSystem={orderSystem}
                  onFeaturedCheck={handleFeaturedCheck}
                  onFeaturedItemsChange={setFeaturedItems}
                  onItemClick={setSelectedItem}
                  onDetailsClick={setSelectedDetailsItem}
                />
              </div>
            </div>

            <div className="relative z-20">
              <CartButton />
              <OrderStatusButton />
              <Footer />
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <FeaturedModal
        isOpen={showFeaturedModal && !isLoading}
        onClose={() => setShowFeaturedModal(false)}
        orderSystem={orderSystem}
        items={featuredItems}
        onItemClick={setSelectedItem}
        onDetailsClick={setSelectedDetailsItem}
      />

      <ItemModal
        isOpen={!isLoading && !!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <ItemDetailsDrawer
        isOpen={!isLoading && !!selectedDetailsItem}
        onClose={() => setSelectedDetailsItem(null)}
        item={selectedDetailsItem}
      />
    </div>
  );
}
