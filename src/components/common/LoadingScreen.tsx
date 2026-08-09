import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface Props {
  visible: boolean;
  onExited?: () => void;
}

export default function LoadingScreen({ visible, onExited }: Props) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  return (
    <AnimatePresence onExitComplete={onExited}>
      {visible && (
        <motion.div
          key="loading-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top,_rgba(88,117,90,0.45)_0%,_#2A4D35_45%,_#1C3323_100%)] text-[#FDFBD4]"
          dir={isRtl ? "rtl" : "ltr"}
          aria-busy={visible}
          aria-live="polite"
        >
          {/* Ambient Background & Palestinian Heritage Pattern */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.06] bg-repeat bg-[length:320px_320px]"
              style={{ backgroundImage: `url('/palestinian_pattern_ornament_1778819421475.png')` }}
            />
            {/* Top Heritage Glow */}
            <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,_rgba(253,251,212,0.2),_transparent_70%)]" />
            {/* Center Copper Glow */}
            <div className="absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#C68B59]/20 blur-[130px] motion-safe:animate-pulse" />
          </div>

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 text-center">
            {/* Heritage Arch Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex w-full flex-col items-center rounded-t-[140px] rounded-b-[40px] border border-[#C68B59]/30 bg-[#2A4D35]/60 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-md ring-1 ring-white/10"
            >
              {/* Outer Arch Border Accent */}
              <div className="absolute inset-2 rounded-t-[130px] rounded-b-[32px] border border-[#FDFBD4]/15 pointer-events-none" />

              {/* Logo with Dual Rotating Heritage Arc */}
              <div className="relative flex h-52 w-52 items-center justify-center mb-6">
                {/* Outer Clockwise Copper Arc */}
                <svg className="absolute inset-0 h-full w-full motion-safe:animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    stroke="rgba(253, 251, 212, 0.12)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="88"
                    stroke="#C68B59"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="120 380"
                  />
                </svg>

                {/* Inner Counter-Clockwise Cream Arc */}
                <svg className="absolute inset-3 h-[calc(100%-24px)] w-[calc(100%-24px)] motion-safe:animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="#FDFBD4"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="80 340"
                    opacity="0.85"
                  />
                </svg>

                {/* Logo Capsule */}
                <motion.div
                  animate={{ scale: [0.97, 1.03, 0.97] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex h-36 w-36 items-center justify-center rounded-full bg-[#FDFBD4] p-3 shadow-[0_15px_45px_rgba(0,0,0,0.35)] ring-4 ring-[#C68B59]/30"
                >
                  <img
                    src="/logo.png"
                    alt={isRtl ? "شعار مطعم كنعان" : "Kanaan Restaurant Logo"}
                    className="h-28 w-28 object-contain drop-shadow-[0_8px_16px_rgba(90,62,43,0.3)]"
                    loading="eager"
                    decoding="async"
                  />
                </motion.div>
              </div>

              {/* Title & Brand Slogan */}
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-[#C68B59]/25 px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#FDFBD4] border border-[#C68B59]/40">
                  {isRtl ? "مطعم وكافيه كنعان" : "Kanaan Cafe & Restaurant"}
                </span>

                <h1 className="text-2xl font-black tracking-tight text-[#FDFBD4] leading-tight">
                  {isRtl ? "كنعان أصل الحضارة .." : "Kanaan Heritage Menu"}
                </h1>

                <p className="text-xs font-semibold text-[#FDFBD4]/75">
                  {isRtl ? "جاري تحضير قائمة الطعام الشهية..." : "Preparing delicious menu..."}
                </p>

                {/* Animated Shimmer Dots */}
                <div className="flex items-center justify-center gap-1.5 pt-2">
                  <div className="h-2 w-2 rounded-full bg-[#C68B59] motion-safe:animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-[#FDFBD4] motion-safe:animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-[#58755A] motion-safe:animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


