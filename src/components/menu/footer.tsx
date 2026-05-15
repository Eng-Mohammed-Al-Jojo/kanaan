import {
  FaLaptopCode,
  FaMapMarkerAlt,
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
  FaPhoneAlt,
  FaTelegramPlane,
  FaTiktok,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { useTranslation } from "react-i18next";
import { PaymentService } from "../../services/paymentService";
import type { PaymentMethod } from "../../types/payment";
import PaymentModal from "./PaymentModal";
import { FiCreditCard } from "react-icons/fi";
import { motion } from "framer-motion";

const LOCAL_STORAGE_KEY = "footerInfo";

export default function Footer() {
  const { t } = useTranslation();

  const [footer, setFooter] = useState({
    address: "",
    phone: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    telegram: "",
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
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) setFooter(JSON.parse(localData));

    const footerRef = ref(db, "settings/footerInfo");
    const unsubFooter = onValue(footerRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setFooter(data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      }
    });

    return () => unsubFooter();
  }, []);

  const socialIcons = [
    {
      Icon: FaWhatsapp,
      url: footer.whatsapp ? `https://wa.me/${footer.whatsapp}` : undefined,
      label: "WhatsApp",
    },
    { Icon: FaInstagram, url: footer.instagram || undefined, label: "Instagram" },
    { Icon: FaFacebookF, url: footer.facebook || undefined, label: "Facebook" },
    { Icon: FaTiktok, url: footer.tiktok || undefined, label: "TikTok" },
    { Icon: FaTelegramPlane, url: footer.telegram || undefined, label: "Telegram" },
  ].filter((social) => social.url);

  return (
    <footer className="relative w-full bg-primary text-cream overflow-visible">
      {/* Curved Top Transition */}
      <div className="absolute top-0 left-0 w-full h-24 -translate-y-full bg-primary pointer-events-none">
        <div className="absolute bottom-0 w-full h-24 bg-primary shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)]" />
      </div>

      {/* Background Ornament Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden"
        style={{
          backgroundImage: `url('/palestinian_pattern_ornament_1778819421475.png')`,
          backgroundSize: '400px',
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* Left: Contact Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-right gap-6 order-2 md:order-1">

            <div className="space-y-4">
              {footer.address && (
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all duration-500 shrink-0">
                    <FaMapMarkerAlt size={16} />
                  </div>

                  <span className="text-sm font-medium leading-relaxed max-w-[250px] md:max-w-[300px]">
                    {footer.address}
                  </span>
                </div>
              )}
              {footer.phone && (
                <a
                  href={`tel:${footer.phone}`}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-primary transition-all duration-500">
                    <FaPhoneAlt size={16} />
                  </div>

                  <span className="text-sm font-medium">{footer.phone}</span>
                </a>
              )}
            </div>
          </div>

          {/* Center: Brand Identity */}
          <div className="flex flex-col items-center justify-center gap-3 order-1 md:order-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full group-hover:bg-accent/30 transition-all duration-700" />
              <img
                src="/logo.png"
                alt="Kanaan Logo"
                className="w-36 md:w-44 relative z-10 drop-shadow-2xl"
              />
            </motion.div>

          </div>

          {/* Right: Quick Links & Payments */}
          <div className="flex flex-col gap-6 items-center md:items-end order-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-accent/60 ">
            </h3>

            <div className="flex flex-wrap justify-center md:justify-end gap-3">
              {socialIcons.map(({ Icon, url, label }, i) => (
                <motion.a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center bg-accent border border-accent/10 text-primary hover:bg-accent/5 hover:text-accent transition-all duration-300 shadow-lg backdrop-blur-sm"
                  aria-label={label}
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="mt-2 flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-accent/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <FiCreditCard className="text-accent group-hover:scale-110 transition-transform" />
              <span className="text-sm md:text-md font-black uppercase tracking-[0.2em] text-accent/80">
                {t('footer.payment_methods') || "طرق الدفع"}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent/30">
            <span>© {new Date().getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-accent/20" />
            <span>{t('footer.rights_reserved')}</span>
          </div>

          <a
            href="https://engmohammedaljojo.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 group px-4 py-2 rounded-full hover:bg-accent/5 transition-all duration-300"
          >
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-accent/20 uppercase tracking-[0.2em] font-black group-hover:text-accent/40 transition-colors">Developed By</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent/40 group-hover:text-accent transition-colors">Eng. Mohammed El joujo</span>
            </div>
            <div className="p-2 bg-accent/5 rounded-lg text-accent/40 group-hover:text-accent group-hover:bg-accent/10 transition-all">
              <FaLaptopCode size={14} />
            </div>
          </a>
        </div>
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

