import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollToTopProps {
  /** The scroll container element. Defaults to the main content area. */
  container?: HTMLElement | null;
  /** The scroll threshold in pixels before the button appears. Defaults to 400. */
  threshold?: number;
  /** Additional className for the button */
  className?: string;
}

export function ScrollToTop({
  container,
  threshold = 400,
  className,
}: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollContainer = container ?? document.querySelector("main");
    if (!scrollContainer) return;

    const handleScroll = () => {
      setVisible(scrollContainer.scrollTop > threshold);
    };

    scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [container, threshold]);

  const scrollToTop = useCallback(() => {
    const scrollContainer = container ?? document.querySelector("main");
    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [container]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full",
            "bg-white shadow-lg border border-border/40 text-muted-foreground",
            "transition-colors hover:bg-muted hover:text-foreground",
            "dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700",
            className,
          )}
          title="Retour en haut"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
