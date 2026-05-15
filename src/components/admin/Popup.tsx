import React from "react";
import { type PopupState } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheck, FiTrash2, FiLogOut, FiKey, FiMail, FiEdit, FiLayers, FiType, FiDollarSign, FiInfo, FiImage } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import FeaturedGallery from "./FeaturedGallery";

interface Props {
  popup: PopupState;
  setPopup: (popup: PopupState) => void;
  deleteItem?: () => void;
  deleteCategory?: (id: string) => void;
  addCategory?: () => void;
  addItem?: () => void;
  updateItem?: () => void;
  updateCategoryImage?: (id: string, image: string) => void;
  updateSubcategoryImage?: (id: string, image: string) => void;
  editItemValues?: {
    itemNameAr: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    selectedSubcategory: string;
    itemIngredientsAr?: string;
  };
  setEditItemValues?: (values: {
    itemNameAr: string;
    itemPrice: string;
    priceTw: string;
    selectedCategory: string;
    selectedSubcategory: string;
    itemIngredientsAr?: string;
  }) => void;
  categories?: any;
  subcategories?: any;
  addSubcategory?: (categoryId: string, nameAr: string, nameEn: string, image?: string) => void;
  updateSubcategory?: (id: string, nameAr: string, nameEn: string, image?: string) => void;
  deleteSubcategory?: (id: string) => void;
  resetPasswordPopup?: boolean;
  setResetPasswordPopup?: (val: boolean) => void;
  resetEmail?: string;
  setResetEmail?: (val: string) => void;
  resetMessage?: string;
  handleResetPassword?: () => void;
  logout?: () => void;
}

const Popup: React.FC<Props> = ({
  popup,
  setPopup,
  deleteItem,
  deleteCategory,
  addCategory,
  updateItem,
  updateCategoryImage,
  editItemValues,
  setEditItemValues,
  categories,
  subcategories,
  addSubcategory,
  updateSubcategory,
  deleteSubcategory,
  updateSubcategoryImage,
  resetPasswordPopup,
  setResetPasswordPopup,
  resetEmail,
  setResetEmail,
  resetMessage,
  handleResetPassword,
  logout,
}) => {
  const { t } = useTranslation();
  const [subNameAr, setSubNameAr] = React.useState("");
  const [subNameEn, setSubNameEn] = React.useState("");
  const [selectedImg, setSelectedImg] = React.useState("");
  const [showGallery, setShowGallery] = React.useState(false);
  const isRtl = true;
  const isOpen = popup.type !== null || resetPasswordPopup;

  React.useEffect(() => {
    if (popup.type === "editSubcategory" && popup.id && subcategories[popup.id]) {
      const sub = subcategories[popup.id];
      setSubNameAr(sub.nameAr || "");
      setSubNameEn(sub.nameEn || "");
      setSelectedImg(sub.image || "");
    } else if (popup.type === "addSubcategory") {
      setSubNameAr("");
      setSubNameEn("");
      setSelectedImg("");
    }
  }, [popup.type, popup.id, subcategories]);

  if (!isOpen) return null;

  const closePopup = () => {
    setPopup({ type: null });
    setResetPasswordPopup && setResetPasswordPopup(false);
  };


  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePopup}
          className="absolute inset-0 bg-(--color-primary)/30 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[3.5rem] border border-white/50 overflow-hidden z-10 shadow-premium"
        >
          {/* Design accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-(--color-primary)/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-(--color-secondary)/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
          {/* Close Button */}
          <button
            onClick={closePopup}
            className="absolute top-8 left-10 w-12 h-12 flex items-center justify-center rounded-2xl bg-white text-(--color-primary)/20 hover:text-(--color-secondary) hover:bg-(--color-secondary)/10 transition-all border border-(--color-primary)/5 shadow-soft z-20 active:scale-90"
          >
            <FiX size={28} />
          </button>

          <div className="p-10">
            {/* ===== Logout ===== */}
            {popup.type === "logout" && (
              <div className="text-center space-y-10 py-4">
                <div className="w-28 h-28 bg-(--color-secondary)/5 text-(--color-secondary) rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-inner border border-(--color-secondary)/10">
                  <FiLogOut />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">{t('admin.logout_confirm')}</h2>
                  <p className="text-(--color-primary)/30 font-black mt-4 uppercase tracking-[0.3em] text-[10px] leading-loose">{t('admin.logout_desc')}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => { logout && logout(); closePopup(); }}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-secondary) text-white font-black shadow-xl shadow-(--color-secondary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('admin.logout')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Add/Edit/Delete Subcategory ===== */}
            {(popup.type === "addSubcategory" || popup.type === "editSubcategory" || popup.type === "deleteSubcategory") && (
              <div className="text-center space-y-10 py-4">
                <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-inner border ${popup.type === 'deleteSubcategory' ? 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/10' : 'bg-(--color-primary)/5 text-(--color-primary) border-(--color-primary)/10'}`}>
                  {popup.type === 'deleteSubcategory' ? <FiTrash2 /> : (popup.type === 'editSubcategory' ? <FiEdit /> : <FiLayers />)}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">
                    {popup.type === "addSubcategory" ? t('admin.add_subcategory') : (popup.type === "editSubcategory" ? t('admin.edit_subcategory') : t('admin.delete_subcategory'))}
                  </h2>
                </div>

                {(popup.type === "addSubcategory" || popup.type === "editSubcategory") && (
                  <div className="space-y-6">
                    <div className="relative group/field">
                      <FiType className={`right-8 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-2xl`} />
                      <input
                        className="w-full h-18 bg-white border border-transparent rounded-[1.5rem] py-4 pr-20 pl-8 text-right text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-(--color-primary) placeholder:text-(--color-primary)/10 shadow-premium uppercase tracking-widest"
                        placeholder={t('admin.subcategory_name_ar')}
                        value={subNameAr}
                        onChange={(e) => setSubNameAr(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={() => setShowGallery(true)}
                      className="w-full h-28 rounded-[1.5rem] bg-white border border-transparent text-(--color-primary)/20 font-black flex items-center justify-center gap-6 hover:shadow-premium transition-all overflow-hidden px-8 shadow-soft active:scale-95 group/btn"
                    >
                      {selectedImg ? (
                        <div className="flex items-center gap-6 w-full">
                          <img src={selectedImg.startsWith('/') ? selectedImg : `/images/${selectedImg}`} className="w-20 h-20 rounded-2xl object-cover shadow-premium border border-white" />
                          <span className="truncate text-(--color-primary) text-sm font-black text-right flex-1 uppercase tracking-widest">{selectedImg.split('/').pop()}</span>
                        </div>
                      ) : (
                        <><FiImage size={32} className="group-hover/btn:scale-110 transition-transform" /> <span className="text-[11px] uppercase tracking-[0.3em]">{t('admin.select_image')}</span></>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "addSubcategory") {
                        addSubcategory && addSubcategory(popup.parentId!, subNameAr, subNameEn, selectedImg);
                      } else if (popup.type === "editSubcategory") {
                        updateSubcategory && updateSubcategory(popup.id!, subNameAr, subNameEn, selectedImg);
                      } else {
                        deleteSubcategory && deleteSubcategory(popup.id!);
                      }
                      closePopup();
                    }}
                    className={`w-full h-18 rounded-[1.5rem] text-white font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm ${popup.type === 'deleteSubcategory' ? 'bg-(--color-secondary) shadow-(--color-secondary)/30' : 'bg-(--color-primary) shadow-(--color-primary)/30'}`}
                  >
                    {popup.type === "deleteSubcategory" ? t('common.delete') : t('common.save')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Add/Delete Category ===== */}
            {(popup.type === "addCategory" || popup.type === "deleteCategory") && (
              <div className="text-center space-y-10 py-4">
                <div className={`w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto text-5xl shadow-inner border ${popup.type === 'deleteCategory' ? 'bg-(--color-secondary)/5 text-(--color-secondary) border-(--color-secondary)/10' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                  {popup.type === 'deleteCategory' ? <FiTrash2 /> : <FiLayers />}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">
                    {popup.type === "addCategory" ? t('admin.add_category_title') : t('admin.delete_category_title')}
                  </h2>
                  <p className="text-(--color-primary)/30 font-black mt-4 uppercase tracking-[0.3em] text-[10px] leading-loose">{t('admin.delete_confirm_desc')}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "addCategory") addCategory && addCategory();
                      else deleteCategory && deleteCategory(popup.id!);
                      closePopup();
                    }}
                    className={`w-full h-18 rounded-[1.5rem] text-white font-black shadow-xl transition-all hover:scale-[1.02] active:scale-95 uppercase tracking-widest text-sm ${popup.type === 'deleteCategory' ? 'bg-(--color-secondary) shadow-(--color-secondary)/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}
                  >
                    {popup.type === "addCategory" ? t('common.save') : t('common.delete')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Category/Subcategory Image Selection ===== */}
            {(popup.type === "categoryImage" || popup.type === "subcategoryImage") && (
              <div className="text-center space-y-10 py-4">
                <div className="w-28 h-28 bg-(--color-primary)/5 text-(--color-primary) rounded-[2.5rem] border border-(--color-primary)/10 flex items-center justify-center mx-auto text-5xl shadow-inner">
                  <FiImage />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">{t('admin.select_image')}</h2>
                  <p className="text-(--color-primary)/30 font-black mt-3 uppercase tracking-[0.3em] text-[10px]">{t('admin.image_gallery_desc')}</p>
                </div>
                <div className="space-y-6">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="w-full h-32 rounded-[1.5rem] bg-white border border-transparent text-(--color-primary)/20 font-black flex items-center justify-center gap-6 hover:shadow-premium transition-all overflow-hidden px-10 shadow-soft active:scale-95 group/btn"
                  >
                    {selectedImg ? (
                      <div className="flex items-center gap-8 w-full">
                        <img src={selectedImg.startsWith('/') ? selectedImg : `/images/${selectedImg}`} className="w-24 h-24 rounded-2xl object-cover shadow-premium border border-white" />
                        <span className="truncate text-(--color-primary) text-sm font-black text-right flex-1 uppercase tracking-widest">{selectedImg.split('/').pop()}</span>
                      </div>
                    ) : (
                      <><FiImage size={40} className="group-hover/btn:scale-110 transition-transform" /> <span className="text-[11px] uppercase tracking-[0.3em]">{t('admin.select_image')}</span></>
                    )}
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => {
                      if (popup.type === "categoryImage") {
                        updateCategoryImage && popup.id && updateCategoryImage(popup.id, selectedImg);
                      } else {
                        updateSubcategoryImage && popup.id && updateSubcategoryImage(popup.id, selectedImg);
                      }
                      closePopup();
                      setSelectedImg("");
                    }}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary) text-white font-black shadow-xl shadow-(--color-primary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Delete Item ===== */}
            {popup.type === "deleteItem" && (
              <div className="text-center space-y-10 py-4">
                <div className="w-28 h-28 bg-(--color-secondary)/5 text-(--color-secondary) rounded-[2.5rem] border border-(--color-secondary)/10 flex items-center justify-center mx-auto text-5xl shadow-inner">
                  <FiTrash2 />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">{t('admin.delete_item_title')}</h2>
                  <p className="text-(--color-primary)/30 font-black mt-4 uppercase tracking-[0.3em] text-[10px] leading-loose">{t('admin.delete_item_confirm')}</p>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => { deleteItem && deleteItem(); closePopup(); }}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-secondary) text-white font-black shadow-xl shadow-(--color-secondary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.delete')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Edit Item ===== */}
            {popup.type === "editItem" && editItemValues && setEditItemValues && categories && (
              <div className="space-y-10 py-2">
                <div className="flex items-center gap-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-(--color-secondary)/5 text-(--color-secondary) flex items-center justify-center text-5xl shadow-inner border border-(--color-secondary)/10 transition-transform hover:scale-110 duration-500">
                    <FiEdit />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">{t('admin.edit_product_title')}</h2>
                    <p className="text-(--color-primary)/30 font-black text-[11px] uppercase tracking-[0.3em] mt-3">{t('admin.edit_product_desc')}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.categories')}</label>
                      <div className="relative group/field">
                        <FiLayers className="right-6 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-xl" />
                        <select
                          className="w-full h-16 bg-white border border-transparent px-16 rounded-[1.2rem] text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) appearance-none shadow-premium uppercase tracking-widest"
                          value={editItemValues.selectedCategory}
                          onChange={(e) => setEditItemValues({ ...editItemValues, selectedCategory: e.target.value, selectedSubcategory: "" })}
                        >
                          {Object.keys(categories).map((id) => (
                            <option key={id} value={id}>{categories[id].nameAr}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.subcategories')}</label>
                      <div className="relative group/field">
                        <FiLayers className="right-6 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-xl" />
                        <select
                          className="w-full h-16 bg-white border border-transparent px-16 rounded-[1.2rem] text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) appearance-none shadow-premium uppercase tracking-widest"
                          value={editItemValues.selectedSubcategory}
                          onChange={(e) => setEditItemValues({ ...editItemValues, selectedSubcategory: e.target.value })}
                        >
                          <option value="">{t('admin.no_subcategory')}</option>
                          {Object.entries(subcategories)
                            .filter(([, s]: any) => s.categoryId === editItemValues.selectedCategory)
                            .map(([id, s]: any) => (
                              <option key={id} value={id}>{s.nameAr}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('common.name')}</label>
                    <div className="relative group/field">
                      <FiType className="right-6 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-xl" />
                      <input
                        className="w-full h-16 bg-white border border-transparent px-16 rounded-[1.2rem] text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) placeholder:text-(--color-primary)/10 shadow-premium uppercase tracking-widest"
                        value={editItemValues.itemNameAr}
                        onChange={(e) => setEditItemValues({ ...editItemValues, itemNameAr: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('admin.ingredients_label')}</label>
                    <div className="relative group/field">
                      <FiInfo className="right-6 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-xl" />
                      <input
                        className="w-full h-16 bg-white border border-transparent px-16 rounded-[1.2rem] text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) placeholder:text-(--color-primary)/10 shadow-premium uppercase tracking-widest"
                        value={editItemValues.itemIngredientsAr || ""}
                        onChange={(e) => setEditItemValues({ ...editItemValues, itemIngredientsAr: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-(--color-primary)/30 px-2">{t('common.total')}</label>
                    <div className="relative group/field">
                      <FiDollarSign className="right-6 absolute top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-xl" />
                      <input
                        className="w-full h-16 bg-white border border-transparent px-16 rounded-[1.2rem] text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-right text-(--color-primary) placeholder:text-(--color-primary)/10 shadow-premium uppercase tracking-widest"
                        value={editItemValues.itemPrice}
                        onChange={(e) => setEditItemValues({ ...editItemValues, itemPrice: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-6">
                  <button
                    onClick={() => { updateItem && updateItem(); closePopup(); }}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary) text-white font-black shadow-xl shadow-(--color-primary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-4"
                  >
                    <FiCheck size={24} /> {t('admin.save_edits')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* ===== Reset Password ===== */}
            {resetPasswordPopup && (
              <div className="space-y-10 py-4">
                <div className="text-center space-y-8">
                  <div className="w-28 h-28 bg-blue-500/5 text-blue-500 rounded-[2.5rem] border border-blue-500/10 flex items-center justify-center mx-auto text-5xl shadow-inner transition-transform hover:scale-110 duration-500">
                    <FiKey />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-(--color-primary) tracking-tight">{t('admin.account_reset_title')}</h2>
                    <p className="text-(--color-primary)/30 font-black mt-4 uppercase tracking-[0.3em] text-[10px] leading-loose">{t('admin.account_reset_desc')}</p>
                  </div>
                </div>

                <div className="relative group/field">
                  <FiMail className={`absolute ${isRtl ? 'right-8' : 'left-8'} top-1/2 -translate-y-1/2 text-(--color-primary)/20 transition-all group-focus-within/field:text-(--color-primary) group-focus-within/field:scale-125 text-2xl`} />
                  <input
                    type="email"
                    placeholder={t('admin.email_placeholder')}
                    className="w-full h-18 bg-white border border-transparent rounded-[1.5rem] py-4 pr-20 pl-8 text-right text-sm font-black outline-none focus:ring-10 focus:ring-(--color-primary)/5 transition-all text-(--color-primary) placeholder:text-(--color-primary)/10 shadow-premium uppercase tracking-widest"
                    value={resetEmail}
                    onChange={(e) => setResetEmail && setResetEmail(e.target.value)}
                  />
                </div>

                <AnimatePresence>
                  {resetMessage && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-xs text-center text-emerald-600 font-black bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-soft">
                      {resetMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={handleResetPassword}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary) text-white font-black shadow-xl shadow-(--color-primary)/30 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('admin.send_reset_link')}
                  </button>
                  <button
                    onClick={closePopup}
                    className="w-full h-18 rounded-[1.5rem] bg-(--color-primary)/5 text-(--color-primary)/40 font-black hover:bg-(--color-primary)/10 transition-all uppercase tracking-widest text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div >

      <FeaturedGallery
        visible={showGallery}
        onClose={() => setShowGallery(false)}
        onSelect={(img) => { setSelectedImg(img); setShowGallery(false); }}
        galleryImages={Object.keys(import.meta.glob("/images/*", {
          eager: true,
          query: "?url",
          import: 'default'

        })).map(p => p.replace("/images/", ""))}
        selectedImage={selectedImg}
      />
    </AnimatePresence >
  );
};

export default Popup;
