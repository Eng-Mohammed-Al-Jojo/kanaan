import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      return;
    }

    setProgress(12);
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(96, current + Math.max(1, (96 - current) * 0.08)));
    }, 120);

    return () => window.clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.01 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_45%),linear-gradient(180deg,#3f2a1f_0%,#2f2017_45%,#221710_100%)] text-cream"
          dir={isRtl ? "rtl" : "ltr"}
          aria-busy="true"
          aria-live="polite"
        >
          <div className="absolute inset-0 pointer-events-none opacity-60">
            <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(253,251,212,0.18),_transparent_65%)]" />
            <div className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C68B59]/10 blur-[140px]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_25%,transparent_75%,rgba(255,255,255,0.03)_100%)]" />
          </div>

          <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6 text-center">
            <div className="relative flex h-60 w-60 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="88"
                  stroke="rgba(253,251,212,0.12)"
                  strokeWidth="2"
                  fill="none"
                />
                <motion.circle
                  cx="110"
                  cy="110"
                  r="88"
                  stroke="rgba(253,251,212,0.95)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 88}
                  initial={false}
                  animate={{
                    strokeDashoffset: (2 * Math.PI * 88) - (progress / 100) * (2 * Math.PI * 88),
                  }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                />
              </svg>

              <div className="absolute inset-4 rounded-full bg-white/5 blur-2xl" />
              <div className="absolute inset-7 rounded-full border border-white/10 bg-white/[0.08] backdrop-blur-xl" />

              <motion.div
                animate={{ scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#FDFBD4]/80 shadow-[0_20px_70px_rgba(0,0,0,0.28)]"
              >
                <img
                  src="/logo.png"
                  alt="Kanaan Logo"
                  className="h-28 w-28 object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                  loading="eager"
                  decoding="async"
                />
              </motion.div>
            </div>

            <div className="mt-8 space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.38em] text-cream/60">
                Kanaan Cafe & Restaurant
              </p>
              <h1 className="text-2xl font-black tracking-tight text-cream">
                {isRtl ? "كنعان أصل الحضارة .." : "Preparing the menu"}
              </h1>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
