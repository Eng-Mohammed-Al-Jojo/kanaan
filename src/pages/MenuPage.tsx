import { useState, useEffect, useCallback } from "react";
// import { useTranslation } from "react-i18next";
import CartButton from "../components/cart/CartButton";
import Footer from "../components/menu/footer";
import Menu, { type Item } from "../components/menu/Menu";
import ItemModal from "../components/menu/ItemModal";
import ItemDetailsDrawer from "../components/menu/ItemDetailsDrawer";
import { HiSparkles } from "react-icons/hi";
import FeaturedModal from "../components/menu/FeaturedModal";
import LoadingScreen from "../components/common/LoadingScreen";
import { motion } from "framer-motion";
import { FirebaseService } from "../services/firebaseService";
import OrderStatusButton from "../components/cart/OrderStatusButton";
import GlassButton from "../components/common/GlassButton";

export default function MenuPage() {
  // const { t } = useTranslation();

  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [hasFeatured, setHasFeatured] = useState(false);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<Item | null>(null);
  const [orderSystem, setOrderSystem] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.listen("settings/orderSystem", (value) => {
      setOrderSystem(value ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setIsLoading(loading);
    if (!loading) setIsDataReady(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col menu-wrapper overflow-x-hidden arch-bg relative">

      {/* Global Heritage Pattern Overlay */}
      <div className="fixed inset-0 pattern-heritage z-0 pointer-events-none" />

      {/* 🌟 Global Featured Button — Top Left */}
      <div className="fixed top-6 left-6 z-[60]">
        {isDataReady && hasFeatured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5 }}
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

      {/* Loading */}
      <LoadingScreen visible={isLoading} />

      <main className="flex flex-col flex-1 relative z-10">

        {/*Hero Section / Top Arch Background Area*/}
        <section className="relative flex flex-col items-center justify-center text-center pt-2 pb-1 px-6">

          {/* New Brand Logo Integration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-full h-auto bg-transparent">
              <img
                src="/logo.png"
                alt="Kanaan Logo"
                className="w-full h-full  drop-shadow-[0_10px_30px_rgba(0,0,0,0.2)]"
              />
            </div>
          </motion.div>

        </section>

        {/* Main Content Arch */}
        <div className="arch-content shadow-2xl shadow-black/20 flex-1 flex flex-col">
          {/* Inner pattern overlay */}
          <div className="absolute inset-0 pattern-gear pointer-events-none rounded-t-[200px]" />



          {/* ✅ Menu Container */}
          <div className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 pt-16 pb-24">
            <Menu
              onLoadingChange={handleLoadingChange}
              onFeaturedCheck={setHasFeatured}
              onFeaturedItemsChange={setFeaturedItems}
              onItemClick={setSelectedItem}
              onDetailsClick={setSelectedDetailsItem}
            />
          </div>
        </div>

      </main>

      {/* Cart */}
      {isDataReady && (
        <div className="fixed bottom-8 right-8 z-50">
          <CartButton />
        </div>
      )}

      {/* Modals */}
      <FeaturedModal
        isOpen={showFeaturedModal}
        onClose={() => setShowFeaturedModal(false)}
        orderSystem={orderSystem}
        items={featuredItems}
        onItemClick={setSelectedItem}
        onDetailsClick={setSelectedDetailsItem}
      />

      <ItemModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <ItemDetailsDrawer
        isOpen={!!selectedDetailsItem}
        onClose={() => setSelectedDetailsItem(null)}
        item={selectedDetailsItem}
      />

      <OrderStatusButton />
      <Footer />
    </div>
  );
}
