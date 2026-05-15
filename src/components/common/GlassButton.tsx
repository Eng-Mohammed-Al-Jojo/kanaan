import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  onClick: () => void;
  icon: ReactNode;
  label?: string;
  variant?: "primary" | "secondary" | "featured" | "theme";
  className?: string;
  title?: string;
}

export default function GlassButton({ onClick, icon, label, variant = "primary", className = "", title }: Props) {
  const variants = {
    primary: `
    bg-primary/10 text-primary border-primary/20
    hover:bg-secondary hover:text-white
    transition-all duration-300
  `,

    secondary: `
    bg-secondary/10 text-secondary border-secondary/20
    hover:bg-secondary hover:text-black
    transition-all duration-300
  `,

    featured: `
    bg-linear-to-tr from-primary/80 via-primary/40 to-primary-hover
    text-black
    border-white/40
    hover:scale-110 active:scale-95
    transition-all duration-500
  `,

    theme: `
    text-white
    border-white/20
    shadow-lg shadow-primary/30
    hover:shadow-primary/50
    hover:scale-105 active:scale-95
    transition-all duration-300
  `,
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      style={{ willChange: "transform" }}
      onClick={onClick}
      title={title}
      className={`
        relative overflow-hidden
        flex items-center justify-center gap-2
        w-12 h-12 rounded-2xl sm:rounded-2xl
        backdrop-blur-xl border
        transition-all duration-300
        ${variants[variant]}
        ${className}
      `}
    >
      <span className="relative z-10">{icon}</span>

      {label && <span className="relative z-10 font-bold text-sm hidden sm:inline">{label}</span>}
    </motion.button>
  );
}
