import React, { useState, useEffect } from "react";
import { ref, push, update } from "firebase/database";
import { db } from "../../firebase";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiStar, FiImage, FiMinus, FiArrowUp, FiArrowDown, FiMove } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { normalizeIngredients } from "../../utils/stringUtils";
import type { PopupState, Category, Item, Subcategory } from "./types";
import FeaturedGallery from "./FeaturedGallery";
import CustomSelect from "./CustomSelect";


interface Props {
  categories: Record<string, Category>;
  subcategories: Record<string, Subcategory>;
  items: Record<string, Item>;
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
}

const SortableItem: React.FC<{
  item: Item & { id: string };
  idx: number;
  totalItems: number;
  subcategories: Record<string, Subcategory>;
  toggleItem: (id: string, visible: boolean) => void;
  openGallery: (itemId: string, currentImage?: string) => void;
  removeImage: (id: string) => void;
  setPopup: (popup: PopupState) => void;
  moveItem: (categoryId: string, itemId: string, direction: 'up' | 'down') => void;
}> = ({ item, idx, totalItems, subcategories, toggleItem, openGallery, removeImage, setPopup, moveItem }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: "none",
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      className={`flex flex-col sm:flex-row gap-5 sm:gap-8 py-5 sm:py-6 transition-all bg-white mb-3 px-4 sm:px-6 rounded-[2rem] border ${isDragging ? "z-50 shadow-premium border-(--color-primary) scale-[1.02]" : "border-(--color-primary)/5 hover:border-(--color-primary)/20 shadow-soft hover:shadow-premium"} ${!item.visible ? "opacity-60 grayscale-[0.5]" : ""
        }`}
    >
      {/* ===== Top Row (image + info) ===== */}
      <div className="flex gap-4 w-full items-center">
        {/* Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing p-2.5 text-(--color-primary)/20 hover:text-(--color-primary) transition-colors bg-(--color-primary)/5 rounded-lg"
        >
          <FiMove size={18} />
        </div>

        {/* Image */}
        <div className="relative group/img shrink-0">
          {item.image ? (
            <div className="relative w-18 h-18 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-(--color-primary)/5 shadow-inner">
              <img
                src={item.image.startsWith('/') ? item.image : `/images/${item.image}`}
                alt={item.nameAr}
                className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                onError={(e) => { e.currentTarget.src = "/logo.png" }}
              />

              <button
                onClick={() => removeImage(item.id)}
                className="absolute -top-2 -right-2 w-8 h-8 bg-(--color-secondary) text-white rounded-full flex items-center justify-center shadow-xl scale-0 group-hover/img:scale-100 transition-transform hover:bg-(--color-secondary)-600 z-10"
              >
                <FiMinus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openGallery(item.id)}
              className="w-18 h-18 sm:w-24 sm:h-24 bg-(--color-cream)/30 border-2 border-dashed border-(--color-primary)/10 rounded-2xl flex items-center justify-center text-(--color-primary)/20 hover:text-(--color-primary) hover:border-(--color-primary)/40 transition-all"
            >
              <FiImage size={28} />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col">

          <div className="flex items-center gap-2.5">
            <h4 className="font-black text-base sm:text-xl text-(--color-primary) truncate tracking-tight">
              {item.nameAr}
            </h4>

            {item.star && (
              <FiStar
                className="text-amber-400 fill-amber-400 shrink-0 drop-shadow-sm"
                size={16}
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
            {item.subcategoryId && (
              <span className="text-[10px] px-3 py-1 bg-(--color-primary)/5 border border-(--color-primary)/10 rounded-lg font-black text-(--color-primary) uppercase tracking-widest">
                {subcategories[item.subcategoryId]?.nameAr}
              </span>
            )}
            {item.ingredientsAr && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.ingredientsAr.split(',').map((ing, i) => (
                  <span key={i} className="bg-(--color-cream) text-(--color-primary)/50 text-[10px] font-black px-2.5 py-1 rounded-md border border-(--color-primary)/5 shadow-sm">
                    {ing.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-xl font-black text-(--color-primary) tracking-tight">{item.price}</span>
            <span className="text-[10px] font-black text-(--color-primary)/30 uppercase tracking-[0.2em]">₪</span>
          </div>

        </div>
      </div>

      {/* ===== Actions ===== */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto bg-(--color-primary)/5 p-2.5 rounded-[1.8rem] border border-(--color-primary)/5 shadow-inner">

        {/* Animated Toggle */}
        <button
          onClick={() => toggleItem(item.id, item.visible)}
          className={`relative shrink-0 w-12 h-7 rounded-full flex items-center p-1 transition-all duration-500 ${item.visible
            ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            : "bg-(--color-primary)/10"
            }`}
          style={{
            justifyContent: item.visible ? "flex-end" : "flex-start"
          }}
        >
          <motion.div
            layout
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-5 h-5 rounded-full bg-white shadow-lg z-10"
          />
        </button>

        <div className="flex items-center gap-1.5">

          <button
            onClick={async () => {
              const newStar = !item.star;
              await update(ref(db, `items/${item.id}`), { star: newStar });
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${item.star
              ? "bg-amber-100 text-amber-600 shadow-inner"
              : "hover:bg-white text-(--color-primary)/20 hover:text-amber-500 hover:shadow-soft"
              }`}
          >
            <FiStar size={18} fill={item.star ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setPopup({ type: "editItem", id: item.id })}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-(--color-primary) hover:shadow-soft text-(--color-primary)/20 transition-all"
          >
            <FiEdit size={18} />
          </button>

          <button
            onClick={() => setPopup({ type: "deleteItem", id: item.id })}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-(--color-secondary) hover:shadow-soft text-(--color-primary)/20 transition-all"
          >
            <FiTrash2 size={18} />
          </button>

        </div>
        <div className="w-px h-8 bg-(--color-primary)/10 mx-0.5 hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => moveItem(item.categoryId, item.id, 'up')}
            disabled={idx === 0}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-(--color-primary) hover:shadow-soft text-(--color-primary)/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <FiArrowUp size={18} />
          </button>
          <button
            onClick={() => moveItem(item.categoryId, item.id, 'down')}
            disabled={idx === totalItems - 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white hover:text-(--color-primary) hover:shadow-soft text-(--color-primary)/20 transition-all disabled:opacity-20 disabled:pointer-events-none"
          >
            <FiArrowDown size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ItemSection: React.FC<Props> = ({ categories, subcategories, items, setPopup }) => {
  const { t, i18n } = useTranslation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [itemNameAr, setItemNameAr] = useState("");
  const [itemIngredientsAr, setItemIngredientsAr] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [quickSearch, setQuickSearch] = useState("");

  const [selectedCategoryError, setSelectedCategoryError] = useState(false);
  const [itemNameError, setItemNameError] = useState(false);
  const [itemPriceError, setItemPriceError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [showGallery, setShowGallery] = useState(false);
  const [galleryForItemId, setGalleryForItemId] = useState<string | null>(null);
  const [itemImage, setItemImage] = useState("");
  const [localItems, setLocalItems] = useState<Record<string, Item>>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const addItem = async () => {
    let hasError = false;
    if (!selectedCategory) { setSelectedCategoryError(true); hasError = true; }
    if (!itemNameAr.trim()) { setItemNameError(true); hasError = true; }

    const priceArray = itemPrice.split(",").map(p => p.trim());
    if (!itemPrice.trim() || priceArray.some(p => isNaN(Number(p)) || Number(p) <= 0)) {
      setItemPriceError(true);
      hasError = true;
    }

    if (hasError) return;

    await push(ref(db, "items"), {
      nameAr: itemNameAr,
      ingredientsAr: normalizeIngredients(itemIngredientsAr),
      price: itemPrice,
      categoryId: selectedCategory,
      subcategoryId: selectedSubcategory || null,
      visible: true,
      createdAt: Date.now(),
      image: itemImage || "",
      star: false,
    });

    setItemNameAr("");
    setItemIngredientsAr("");
    setItemPrice("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setItemImage("");

    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500);
  };

  const toggleItem = async (id: string, visible: boolean) => {
    await update(ref(db, `items/${id}`), { visible: !visible });
  };

  const updateImage = async (id: string, image: string) => {
    await update(ref(db, `items/${id}`), { image });
  };

  const removeImage = async (id: string) => {
    await update(ref(db, `items/${id}`), { image: "" });
  };

  const openGallery = (itemId: string, currentImage?: string) => {
    setGalleryForItemId(itemId);
    setItemImage(currentImage || "");
    setShowGallery(true);
  };

  const handleSelectImage = async (img: string) => {
    if (!galleryForItemId) return;
    await updateImage(galleryForItemId, img);
    setShowGallery(false);
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const moveItem = async (categoryId: string, itemId: string, direction: 'up' | 'down') => {
    const catItems = Object.entries(localItems)
      .map(([id, item]) => ({ ...item, id }))
      .filter(item => item.categoryId === categoryId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const index = catItems.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= catItems.length) return;

    const newItems = [...catItems];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);

    // Update orders in Firebase
    const updates: Record<string, any> = {};
    newItems.forEach((item, idx) => {
      updates[`items/${item.id}/order`] = idx;
    });

    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error("Failed to reorder items:", err);
    }
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEndItems = async (event: DragEndEvent, currentItems: (Item & { id: string })[]) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = currentItems.findIndex((i) => i.id === active.id);
    const newIndex = currentItems.findIndex((i) => i.id === over.id);

    const newArray = arrayMove(currentItems, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((item, index) => {
      updates[`items/${item.id}/order`] = index;
    });

    try {
      await update(ref(db), updates);
    } catch (err) {
      console.error("Failed to drag reorder items:", err);
    }
  };

  const currentCatSubcategories = Object.entries(subcategories)
    .filter(([, sub]) => sub.categoryId === selectedCategory)
    .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-12 rounded-4xl">


      {/* Adding Form */}
      <div className="bg-white/95 backdrop-blur-xl p-8 sm:p-10 border border-white shadow-premium relative overflow-hidden group rounded-[3rem]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-primary)/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-(--color-primary)/10 transition-colors pointer-events-none duration-1000" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <div className="w-18 h-18 rounded-2xl bg-(--color-primary)/5 text-(--color-primary) flex items-center justify-center text-3xl shadow-inner transition-transform group-hover:scale-110 duration-500">
              <FiPlus />
            </div>
            <div>
              <h2 className="text-lg font-black text-(--color-primary) tracking-tight">{t('admin.add_new_item')}</h2>
              <p className="text-(--color-primary)/30 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">{t('admin.item_form_desc') || "إضافة منتج جديد للمنيو"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col gap-4">
            <label className="text-sm  md:text-md font-bold  text-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.categories')}</label>
            <CustomSelect
              options={Object.keys(categories).map(id => ({ id, name: categories[id].nameAr || "" }))}
              value={selectedCategory}
              onChange={(val) => { setSelectedCategory(val); setSelectedSubcategory(""); setSelectedCategoryError(false); }}
              error={selectedCategoryError}
              placeholder={t('admin.select_category')}
            />
          </div>

          <div className={`flex flex-col gap-4 transition-all duration-700 ${currentCatSubcategories.length > 0 ? "opacity-100 translate-y-0" : "opacity-20 pointer-events-none translate-y-4"}`}>
            <label className="text-sm  md:text-md font-bold  text-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.subcategories')}</label>
            <CustomSelect
              options={currentCatSubcategories.map(([id, sub]) => ({ id, name: sub.nameAr || "" }))}
              value={selectedSubcategory}
              onChange={(val) => setSelectedSubcategory(val)}
              placeholder={t('admin.select_subcategory')}
              disabled={currentCatSubcategories.length === 0}
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm  md:text-md font-bold text-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">
              {t('common.name')}
            </label>
            <input
              className={`w-full h-12 bg-(--color-primary)/5 border px-8 rounded-2xl text-sm md:text-md  outline-none focus:bg-white focus:border-(--color-primary)/30 focus:ring-8 focus:ring-(--color-primary)/5 transition-all
                ${itemNameError ? "border-(--color-secondary)" : "border-transparent"} text-right text-(--color-primary) placeholder:text-(--color-primary)/20`}
              placeholder={t('admin.item_name_ar_placeholder')}
              value={itemNameAr}
              onChange={(e) => {
                setItemNameAr(e.target.value);
                setItemNameError(false);
              }}
            />
          </div>

          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-1">
            <label className="text-sm  md:text-md font-bold text-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">
              {t('admin.ingredients_label')}
            </label>
            <input
              className="w-full h-12 bg-(--color-primary)/5 border border-transparent px-8 rounded-2xl text-sm md:text-md  outline-none focus:bg-white focus:border-(--color-primary)/30 focus:ring-8 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) placeholder:text-(--color-primary)/20"
              placeholder={t('admin.ingredients_placeholder')}
              value={itemIngredientsAr}
              onChange={(e) => setItemIngredientsAr(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-sm  md:text-md font-bold text-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.price')}</label>
            <input
              className={`w-full h-12 bg-(--color-primary)/5 border px-8 rounded-2xl text-sm md:text-md outline-none focus:bg-white focus:border-(--color-primary)/30 focus:ring-8 focus:ring-(--color-primary)/5 transition-all
                ${itemPriceError ? "border-(--color-secondary)" : "border-transparent"} text-(--color-primary) placeholder:text-(--color-primary)/20`}
              placeholder={t('admin.item_price_placeholder')}
              value={itemPrice}
              onChange={(e) => { setItemPrice(e.target.value); setItemPriceError(false); }}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addItem}
              className="w-full h-14 bg-(--color-primary) text-white font-black rounded-xl shadow-xl shadow-(--color-primary)/30 hover:shadow-(--color-primary)/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3.5"
            >
              <FiPlus className="text-xl" />
              <span className="text-base uppercase tracking-widest">{t('admin.add_item_btn')}</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-(--color-primary)/95 backdrop-blur-md flex items-center justify-center z-50 rounded-[3.5rem]"
            >
              <div className="text-center text-white px-8">
                <div className="w-28 h-28 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-5xl shadow-2xl backdrop-blur-xl border border-white/20">✨</div>
                <h3 className="text-4xl font-black mb-3 tracking-tight">{t('admin.item_added_success_title')}</h3>
                <p className="opacity-80 font-black uppercase tracking-[0.3em] text-[10px]">{t('admin.item_added_success_desc')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-xl mx-auto w-full">
        <FiSearch className={`absolute ${i18n.language === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 group-focus-within:text-(--color-primary) transition-colors text-xl`} />
        <input
          className={`w-full bg-white border border-transparent rounded-2xl h-15 ${i18n.language === 'ar' ? 'pr-15 pl-6 text-right' : 'pl-15 pr-6'} text-base font-black outline-none focus:border-(--color-primary)/30 focus:ring-10 focus:ring-(--color-primary)/5 transition-all shadow-premium text-(--color-primary) placeholder:text-(--color-primary)/20`}
          placeholder={t('admin.search_placeholder')}
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
        />
      </div>

      {/* Items by Category */}
      <div className="space-y-2">
        {Object.entries(categories)
          .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
          .map(([catId, cat]) => {
            const catItems = Object.keys(localItems)
              .map(id => ({ ...localItems[id], id }))
              .filter(item => item.categoryId === catId)
              .filter(item => {
                const search = quickSearch.toLowerCase();
                const itemName = item.nameAr;
                const itemIngredients = item.ingredientsAr;
                return (
                  (itemName && itemName.toLowerCase().includes(search)) ||
                  (itemIngredients && itemIngredients.toLowerCase().includes(search)) ||
                  String(item.price).includes(search)
                );
              })
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

            if (quickSearch && catItems.length === 0) return null;

            const isExpanded = expandedSections[catId] ?? false;

            return (
              <div key={catId} className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500">
                <button
                  onClick={() => toggleSection(catId)}
                  className="w-full p-5 flex items-center justify-between group bg-(--color-cream)/10 hover:bg-(--color-cream)/30 transition-colors"
                >

                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-xl bg-(--color-secondary) text-(--color-primary) flex items-center justify-center shadow-soft transition-transform group-hover:scale-110 duration-500">
                      <FiChevronDown size={20} className={`transition-transform duration-700 text-(--color-cream) ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                    <div className="text-right">
                      <h3 className="text-xl font-black text-(--color-primary) tracking-tight">{cat.nameAr}</h3>
                      <p className="text-(--color-primary)/30 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">{catItems.length} {t('admin.items_count', { count: catItems.length })}</p>
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-2 pt-4">
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEndItems(event, catItems)}
                        >
                          <SortableContext
                            items={catItems.map((i) => i.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="flex flex-col gap-1">
                              {catItems.map((item, idx) => (
                                <SortableItem
                                  key={item.id}
                                  item={item}
                                  idx={idx}
                                  totalItems={catItems.length}
                                  subcategories={subcategories}
                                  toggleItem={toggleItem}
                                  openGallery={openGallery}
                                  removeImage={removeImage}
                                  setPopup={setPopup}
                                  moveItem={moveItem}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>

                        {catItems.length === 0 && (
                          <div className="py-20 text-center">
                            <div className="w-24 h-24 bg-(--color-primary)/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                              <FiSearch size={36} className="text-(--color-primary)/10" />
                            </div>
                            <p className="text-(--color-primary)/30 font-black uppercase tracking-[0.2em] text-sm">{t('admin.no_items_placeholder')}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </div>

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={handleSelectImage}
        manifestPath="/images/manifest.json"
        selectedImage={itemImage}
      />
    </div>
  );
};

export default ItemSection;
