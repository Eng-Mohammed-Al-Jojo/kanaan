import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  /** When true, screen is visible. When false, triggers fade-out. */
  visible: boolean;
  /** Called after fade-out animation completes */
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + (95 - prev) * 0.1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [visible]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black overflow-hidden"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Cover Image Background */}
          <div className="absolute inset-0 z-0">
            <img
              src="cover.jpg"
              alt="Background"
              className="w-full h-full object-fit opacity-40"
            />
            <div className="absolute inset-0 bg-black/40 " />
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 rounded-full blur-[120px]"
            />
          </div>


          <div className="relative z-10 flex flex-col items-center">
            {/* The Loader Centerpiece */}
            <div className="relative w-64 h-64 flex items-center justify-center">

              {/* Circular Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100" cy="100" r={radius}
                  stroke="rgba(255,255,255,0.1)" strokeWidth="2" fill="none"
                />
                <motion.circle
                  cx="100" cy="100" r={radius}
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ strokeDasharray: circumference }}
                />
              </svg>

              {/* Premium Logo Spotlight */}
              <div className="relative w-44 h-44 flex items-center justify-center">

                {/* Outer Glow Ring */}
                <div className="absolute w-64 h-64 rounded-full bg-[#FDFBD4] blur-3xl animate-pulse" />

                {/* Soft Cream Halo */}
                <div className="absolute w-52 h-52 rounded-full bg-[#F2EDE2]/40 blur-2xl" />

                {/* Inner Spotlight Circle */}
                <div className="absolute w-40 h-40 rounded-full bg-white/70 shadow-2xl shadow-white/20" />

                {/* Logo */}
                <motion.div
                  animate={{ scale: [0.95, 1.05, 0.95] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative w-32 h-32"
                >
                  <img
                    src="logo.png"
                    className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                    alt="Logo"
                  />
                </motion.div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
