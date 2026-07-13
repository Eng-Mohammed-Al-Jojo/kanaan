import { useEffect, useMemo, useState } from "react";
import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
  FaCreditCard,
} from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { db } from "../../firebase";
import { PaymentService } from "../../services/paymentService";
import type { PaymentMethod } from "../../types/payment";
import PaymentModal from "./PaymentModal";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [footer, setFooter] = useState(() => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData);
      }
    } catch {
      // Ignore malformed cache and fall back to empty fields.
    }

    return {
      address: "",
      phone: "",
      whatsapp: "",
      facebook: "",
      instagram: "",
      tiktok: "",
      telegram: "",
    };
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(true);

  useEffect(() => {
    const unsubPayments = PaymentService.subscribeToPaymentMethods((methods) => {
      setPaymentMethods(methods);
      setIsPaymentLoading(false);
    });

    return () => unsubPayments();
  }, []);

  useEffect(() => {
    const footerRef = ref(db, "settings/footerInfo");
    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooter(data);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        } catch {
          // Cache is optional.
        }
      }
    });

    return () => unsubFooter();
  }, []);

  const socialIcons = useMemo(
    () =>
      [
        {
          Icon: FaWhatsapp,
          url: footer.whatsapp ? `https://wa.me/${footer.whatsapp}` : undefined,
          label: "WhatsApp",
        },
        { Icon: FaInstagram, url: footer.instagram || undefined, label: "Instagram" },
        { Icon: FaFacebookF, url: footer.facebook || undefined, label: "Facebook" },
        { Icon: FaTiktok, url: footer.tiktok || undefined, label: "TikTok" },
        { Icon: FaTelegramPlane, url: footer.telegram || undefined, label: "Telegram" },
      ].filter((social) => social.url),
    [footer]
  );

  return (
    <footer
      className="relative w-full overflow-hidden bg-[linear-gradient(180deg,#4b3426_0%,#3c291e_52%,#2b1d15_100%)] text-cream"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div
          className="absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: `url('/palestinian_pattern_ornament_1778819421475.png')`,
            backgroundSize: "360px",
            backgroundRepeat: "repeat",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(253,251,212,0.18),_transparent_70%)]" />
        <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-[#C68B59]/12 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[2rem] border border-white/10 bg-white/5 px-4 py-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:px-8 lg:px-10"
        >
          <div className="flex flex-col items-center gap-8 text-center">
            <div className="flex flex-col items-center gap-3">

              <img
                src="/logo.png"
                alt="Kanaan Logo"
                className="h-24 w-auto drop-shadow-[0_16px_40px_rgba(0,0,0,0.35)] sm:h-28"
                loading="lazy"
                decoding="async"
              />

            </div>

            <div className="grid w-full gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8D1C2]/10 text-[#FDFBD4]">
                  <FaMapMarkerAlt size={18} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cream/45">
                  {t("footer.location") || "Location"}
                </p>
                <p className="mt-2 text-sm font-medium leading-7 text-cream/90">
                  {footer.address || (isRtl ? "العنوان غير متوفر" : "Address not available")}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8D1C2]/10 text-[#FDFBD4]">
                  <FaPhoneAlt size={18} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cream/45">
                  {t("footer.contact") || "Contact"}
                </p>
                <a
                  href={footer.phone ? `tel:${footer.phone}` : undefined}
                  className="mt-2 block text-sm font-semibold leading-7 text-cream/90 transition-colors hover:text-[#FDFBD4]"
                >
                  {footer.phone || (isRtl ? "الهاتف غير متوفر" : "Phone not available")}
                </a>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D8D1C2]/10 text-[#FDFBD4]">
                  <FaCreditCard size={18} />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cream/45">
                  {t("footer.payment_methods") || "Payment"}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="mt-3 inline-flex items-center justify-center rounded-full border border-white/10 bg-cream/10 px-5 py-2.5 text-sm font-bold text-cream transition-all hover:bg-cream/[0.15] hover:text-white"
                >
                  {isPaymentLoading
                    ? (isRtl ? "جارٍ التحميل" : "Loading")
                    : paymentMethods.length > 0
                      ? (isRtl ? "عرض طرق الدفع" : "View payment methods")
                      : (isRtl ? "طرق الدفع غير متاحة" : "No payment methods")}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-cream/45">
                {t("footer.social") || "Follow us"}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {socialIcons.map(({ Icon, url, label }, index) => (
                  <motion.a
                    key={`${label}-${index}`}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -4, scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.08] text-[#FDFBD4] shadow-[0_14px_28px_rgba(0,0,0,0.2)] transition-colors hover:bg-white/[0.12]"
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="flex w-full flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
              <div className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-right">
                <span className="text-[10px] font-black uppercase tracking-[0.28em] text-cream/40">
                  © {new Date().getFullYear()}
                </span>
                <span className="text-sm font-medium text-cream/80">
                  {t("footer.rights_reserved")}
                </span>
              </div>

              <a
                href="https://engmohammedaljojo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center transition-all hover:bg-white/10"
              >
                <span className="flex flex-col items-center sm:items-end">
                  <span className="text-[9px] uppercase tracking-[0.28em] text-cream/40">
                    Developed by
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-cream/75">
                    Eng. Mohammed El Joujo
                  </span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8D1C2]/10 text-[#FDFBD4]">
                  <FaLaptopCode size={15} />
                </span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        methods={paymentMethods}
        isLoading={isPaymentLoading}
      />
    </footer>
  );
}
