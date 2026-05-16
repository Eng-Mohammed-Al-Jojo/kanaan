import React, { useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiChevronDown, FiMove, FiEye, FiEyeOff } from "react-icons/fi";
import { db } from "../../firebase";
import { ref, update } from "firebase/database";
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
import type { PopupState, Category, Subcategory } from "./types";

interface Props {
  categories: Record<string, Category>;
  subcategories: Record<string, Subcategory>;
  setPopup: (popup: PopupState) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  toggleSubcategoryVisibility: (id: string, current: boolean) => void;
  updateCategoryImage: (id: string, image: string) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  newCategoryNameAr: string;
  setNewCategoryNameAr: (val: string) => void;
}

const CategoryCard: React.FC<{
  cat: Category & { id: string };
  subcategories: Record<string, Subcategory>;
  editingId: string | null;
  editNameAr: string;
  setEditNameAr: React.Dispatch<React.SetStateAction<string>>;
  saveEdit: (id: string) => void;
  startEditing: (id: string, nameAr: string) => void;
  toggleCategoryVisibility: (id: string, current: boolean) => void;
  toggleSubcategoryVisibility: (id: string, current: boolean) => void;
  updateCategoryImage: (id: string, image: string) => void;
  setPopup: (popup: PopupState) => void;
}> = ({
  cat,
  subcategories,
  editingId,
  editNameAr,
  setEditNameAr,
  saveEdit,
  startEditing,
  toggleCategoryVisibility,
  toggleSubcategoryVisibility,
  updateCategoryImage,
  setPopup,
}) => {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: cat.id });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "none",
    };

    const catSubcategories = Object.entries(subcategories)
      .filter(([, sub]) => sub.categoryId === cat.id)
      .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));

    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        layout
        className={`
          relative group flex flex-col bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden h-full
          ${isDragging ? "z-50 border-(--color-primary) shadow-premium scale-[1.02]" : "border-(--color-primary)/5 hover:border-(--color-primary)/20 shadow-soft hover:shadow-premium"}
          ${!cat.visible ? "opacity-60 grayscale-[0.5]" : ""}
        `}
      >
        {/* Category Image Header */}
        <div className="relative h-48 bg-(--color-cream)/30 overflow-hidden group/img">
          {cat.image ? (
            <img
              src={`/images/${cat.image}`}
              alt=""
              className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-(--color-primary)/20 gap-3">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner">
                <FiPlus size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('admin.add_image')}</span>
            </div>
          )}

          {/* Image Controls Overlay */}
          <div className="absolute inset-0 bg-(--color-primary)/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
            <button
              onClick={() => setPopup({ type: "categoryImage", id: cat.id })}
              className="w-12 h-12 bg-white text-(--color-primary) rounded-2xl hover:scale-110 transition-transform flex items-center justify-center shadow-2xl"
            >
              <FiEdit size={18} />
            </button>
            {cat.image && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateCategoryImage(cat.id, "");
                }}
                className="w-12 h-12 bg-(--color-secondary) text-white rounded-2xl hover:scale-110 transition-transform flex items-center justify-center shadow-2xl"
              >
                <FiTrash2 size={18} />
              </button>
            )}
          </div>

          {/* Drag Handle Overlay */}
          <div
            {...listeners}
            className="absolute top-5 right-5 p-3 bg-white/90 backdrop-blur-md text-(--color-primary)/40 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-(--color-primary) hover:text-white transition-all shadow-soft"
          >
            <FiMove size={16} />
          </div>

          {/* Visibility Badge */}
          <div className="absolute top-5 left-5">
            <button
              onClick={() => toggleCategoryVisibility(cat.id, cat.visible ?? true)}
              className={`p-3 rounded-2xl backdrop-blur-md transition-all shadow-soft ${cat.visible
                ? "bg-emerald-500/90 text-white"
                : "bg-(--color-secondary)/90 text-white"}`}
            >
              {cat.visible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
            </button>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex-1 min-w-0 mb-6">
            {editingId === cat.id ? (
              <div className="flex items-center gap-3">
                <input
                  autoFocus
                  className="flex-1 p-4 bg-(--color-primary)/5 border border-(--color-primary)/20 rounded-2xl text-sm font-black outline-none text-right focus:bg-white focus:ring-8 focus:ring-(--color-primary)/5 transition-all text-(--color-primary) placeholder:text-(--color-primary)/20"
                  value={editNameAr}
                  onChange={(e) => setEditNameAr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(cat.id)}
                />
                <button
                  onClick={() => saveEdit(cat.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-500 text-white shrink-0 shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
                >
                  <FiCheck size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-black text-(--color-primary) truncate tracking-tight" title={cat.nameAr}>
                  {cat.nameAr}
                </h3>
                <button
                  onClick={() => startEditing(cat.id, cat.nameAr)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-(--color-primary)/5 text-(--color-primary)/30 hover:text-(--color-primary) hover:bg-(--color-primary)/10 transition-all"
                >
                  <FiEdit size={16} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-3">
              <span className="w-2 h-2 rounded-full bg-(--color-primary)/20" />
              <p className="text-[11px] font-black text-(--color-primary)/40 uppercase tracking-[0.2em]">
                {catSubcategories.length} {t('admin.subcategories')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-(--color-primary)/5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex-1 h-14 flex items-center justify-center gap-4 rounded-2xl transition-all font-black border ${isExpanded
                ? "bg-(--color-primary) text-white border-(--color-primary) shadow-xl shadow-(--color-primary)/20"
                : "bg-(--color-primary)/5 text-(--color-primary)/60 border-(--color-primary)/10 hover:bg-white hover:border-(--color-primary)/30 hover:text-(--color-primary) hover:shadow-soft"
                }`}
            >
              <span className="text-xs uppercase tracking-[0.2em]">{t('admin.subcategories')}</span>
              <FiChevronDown className={`transition-transform duration-500 ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={() => setPopup({ type: "deleteCategory", id: cat.id })}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-(--color-secondary)/5 text-(--color-secondary) hover:bg-(--color-secondary) hover:text-white transition-all border border-(--color-secondary)/10 shadow-soft active:scale-95"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>

        {/* Subcategories Accordion */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-(--color-cream)/30 border-t border-(--color-primary)/5"
            >
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-(--color-primary)/30">{t('admin.manage_sub')}</span>
                  <button
                    onClick={() => setPopup({ type: "addSubcategory", parentId: cat.id })}
                    className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-(--color-primary) text-white text-[10px] font-black hover:shadow-xl hover:shadow-(--color-primary)/20 transition-all active:scale-95 uppercase tracking-widest"
                  >
                    <FiPlus size={14} /> {t('admin.add_new')}
                  </button>
                </div>

                {catSubcategories.length > 0 ? (
                  <div className="flex flex-col gap-2.5">
                    {catSubcategories.map(([id, sub]) => (
                      <div
                        key={id}
                        className={`flex items-center justify-between p-4 bg-white border border-(--color-primary)/5 rounded-[1.5rem] shadow-soft transition-all hover:border-(--color-primary)/20 group/subrow ${!sub.visible ? "opacity-60 grayscale-[0.5]" : ""}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <button
                            onClick={() => setPopup({ type: "subcategoryImage", id })}
                            className="w-12 h-12 rounded-xl bg-(--color-cream)/50 border border-(--color-primary)/5 flex items-center justify-center overflow-hidden shrink-0 group/subimg relative"
                          >
                            {sub.image ? (
                              <img src={`/images/${sub.image}`} alt="" className="w-full h-full object-cover transition-transform group-hover/subimg:scale-110" />
                            ) : (
                              <FiPlus size={16} className="text-(--color-primary)/20" />
                            )}
                            <div className="absolute inset-0 bg-(--color-primary)/20 opacity-0 group-hover/subimg:opacity-100 transition-opacity flex items-center justify-center">
                              <FiEdit size={12} className="text-white" />
                            </div>
                          </button>
                          <div className="min-w-0">
                            <span className="text-sm font-black text-(--color-primary) block truncate">{sub.nameAr}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleSubcategoryVisibility(id, sub.visible ?? true)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${sub.visible ? "text-emerald-500 bg-emerald-50 hover:bg-emerald-100 shadow-sm" : "text-(--color-secondary) bg-(--color-secondary)/5 hover:bg-(--color-secondary)/10"}`}
                          >
                            {sub.visible ? <FiEye size={16} /> : <FiEyeOff size={16} />}
                          </button>
                          <button
                            onClick={() => setPopup({ type: "editSubcategory", id })}
                            className="w-9 h-9 flex items-center justify-center text-(--color-primary)/30 hover:text-(--color-primary) hover:bg-white hover:shadow-soft rounded-xl transition-all"
                          >
                            <FiEdit size={16} />
                          </button>
                          <button
                            onClick={() => setPopup({ type: "deleteSubcategory", id })}
                            className="w-9 h-9 flex items-center justify-center text-(--color-primary)/30 hover:text-(--color-secondary) hover:bg-white hover:shadow-soft rounded-xl transition-all"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-white/50 rounded-3xl border border-dashed border-(--color-primary)/10">
                    <p className="text-[11px] font-black text-(--color-primary)/30 uppercase tracking-[0.3em]">{t('admin.no_subcategories')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

const CategorySection: React.FC<Props> = ({
  categories,
  subcategories,
  setPopup,
  toggleCategoryVisibility,
  toggleSubcategoryVisibility,
  updateCategoryImage,
  showNotification,
  newCategoryNameAr,
  setNewCategoryNameAr,
}) => {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAr, setEditNameAr] = useState("");
  const [openCategories, setOpenCategories] = useState(false);

  const startEditing = (id: string, nameAr: string) => {
    setEditingId(id);
    setEditNameAr(nameAr);
  };

  const saveEdit = async (id: string) => {
    if (!editNameAr.trim()) {
      showNotification(t('admin.category_name_required'), 'error');
      return;
    }
    try {
      await update(ref(db, `categories/${id}`), {
        nameAr: editNameAr.trim(),
      });
      setEditingId(null);
      setEditNameAr("");
      showNotification(t('common.success') + " ✅");
    } catch {
      showNotification(t('common.error'), 'error');
    }
  };

  const categoriesArray = Object.entries(categories)
    .map(([id, cat]) => ({ ...cat, id }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categoriesArray.findIndex((c) => c.id === active.id);
    const newIndex = categoriesArray.findIndex((c) => c.id === over.id);

    const newArray = arrayMove(categoriesArray, oldIndex, newIndex);

    const updates: Record<string, any> = {};
    newArray.forEach((cat, index) => {
      updates[`categories/${cat.id}/order`] = index;
    });

    await update(ref(db), updates);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-12 rounded-[3.5rem] mb-12 border border-white shadow-soft relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-(--color-primary)/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 mb-12 relative z-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-(--color-primary) tracking-tight">{t('admin.categories')}</h2>
          <p className="text-(--color-primary)/40 text-sm font-black uppercase tracking-[0.2em] mt-3">{t('admin.category_desc')}</p>
        </div>
        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-80">
            <input
              type="text"
              value={newCategoryNameAr}
              onChange={(e) => setNewCategoryNameAr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setPopup({ type: "addCategory" })}
              placeholder={t('admin.add_category_placeholder')}
              className="w-full h-16 px-8 rounded-2xl bg-(--color-primary)/5 border border-transparent text-sm font-black outline-none text-right focus:bg-white focus:border-(--color-primary)/30 focus:ring-8 focus:ring-(--color-primary)/5 transition-all text-(--color-primary) placeholder:text-(--color-primary)/20"
            />
          </div>
          <button
            onClick={() => setPopup({ type: "addCategory" })}
            className="w-16 h-16 flex items-center justify-center rounded-2xl bg-(--color-primary) text-white shadow-xl shadow-(--color-primary)/30 hover:shadow-(--color-primary)/50 hover:-translate-y-1 active:translate-y-0 transition-all shrink-0"
          >
            <FiPlus size={32} />
          </button>
        </div>
      </div>

      {/* View Categories Button */}
      <button
        onClick={() => setOpenCategories((p) => !p)}
        className="
          w-full mb-2
          flex items-center justify-between
          px-8 py-6
          bg-(--color-primary)/5
          rounded-[2.5rem]
          font-black text-base text-(--color-primary)
          hover:bg-(--color-primary)/10
          transition-all border border-(--color-primary)/5 shadow-inner group relative overflow-hidden
        "
      >
        <div className="flex items-center gap-6 relative z-10">
          <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-(--color-primary) flex items-center justify-center shadow-soft transition-transform group-hover:scale-110 group-hover:rotate-3 duration-500">
            <FiChevronDown size={24} className={`transition-transform duration-700 ${openCategories ? "rotate-180" : ""}`} />
          </span>
          <span className="text-xl font-black tracking-tight">{t('admin.view_all_categories')}</span>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <span className="text-[10px] font-black text-(--color-primary)/30 uppercase tracking-[0.3em] hidden sm:inline">{t('admin.total')}</span>
          <span className="bg-(--color-primary) text-white text-xs font-black px-6 py-2.5 rounded-2xl shadow-xl shadow-(--color-primary)/20">
            {categoriesArray.length}
          </span>
        </div>
      </button>

      {/* Accordion List */}
      <AnimatePresence>
        {openCategories && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-10">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={categoriesArray.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {categoriesArray.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        cat={cat}
                        subcategories={subcategories}
                        editingId={editingId}
                        editNameAr={editNameAr}
                        setEditNameAr={setEditNameAr}
                        saveEdit={saveEdit}
                        startEditing={startEditing}
                        toggleCategoryVisibility={toggleCategoryVisibility}
                        toggleSubcategoryVisibility={toggleSubcategoryVisibility}
                        updateCategoryImage={updateCategoryImage}
                        setPopup={setPopup}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySection;

