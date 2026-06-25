"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconDownload, IconX, IconShare } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if force showing via query param for debugging
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.get("debug_pwa") === "true";
    if (forceShow) {
      setShowBanner(true);
    }

    // 1. Detect if already in standalone/installed mode
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
      
    if (isStandalone && !forceShow) return;

    // 2. Detect OS
    const userAgent = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /Android/i.test(userAgent);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    let fallbackTimer: NodeJS.Timeout;

    // 3. Listen for browser install prompt (Android, Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Clear the fallback timer if the browser natively supports install prompt
      if (fallbackTimer) clearTimeout(fallbackTimer);
      
      // Only show banner after a short delay so it's not obtrusive
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    };

    // If it's a mobile device, set a fallback timer to show prompt/instructions
    const isMobile = isIOSDevice || isAndroidDevice;
    if (isMobile && !forceShow) {
      fallbackTimer = setTimeout(() => {
        setShowBanner(true);
      }, 5000);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("To install, click the install/download icon in your browser's address bar (or menu -> Install App).");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA install accepted");
    } else {
      console.log("PWA install dismissed");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Optional: save dismissal in sessionStorage to not bug the user again during this session
    sessionStorage.setItem("pwa-prompt-dismissed", "true");
  };

  // Do not show if dismissed in this session
  useEffect(() => {
    if (sessionStorage.getItem("pwa-prompt-dismissed") === "true") {
      setShowBanner(false);
    }
  }, [showBanner]);

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-5 sm:right-5 z-50 max-w-sm mx-auto sm:mx-0 bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl font-outfit"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
                <IconDownload className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-semibold text-zinc-100">
                  Install Vidzara App
                </span>
                <p className="text-xs text-zinc-400 leading-normal">
                  {isIOS
                    ? "Add Vidzara to your home screen for quick access and full-screen workspace."
                    : "Install our app on your device for the best creator experience."}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 cursor-pointer"
            >
              <IconX className="size-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2.5">
            {isIOS ? (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium bg-zinc-900/50 border border-zinc-800/30 px-3 py-2 rounded-xl w-full">
                <IconShare className="size-3.5 text-indigo-400 shrink-0" />
                <span>
                  Tap <strong>Share</strong> then <strong>Add to Home Screen</strong>
                </span>
              </div>
            ) : isAndroid && !deferredPrompt ? (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-medium bg-zinc-900/50 border border-zinc-800/30 px-3 py-2 rounded-xl w-full">
                <IconDownload className="size-3.5 text-indigo-400 shrink-0" />
                <span>
                  Tap browser menu (three dots) & select <strong>Add to Home screen</strong>
                </span>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                  className="text-zinc-400 hover:text-zinc-200 text-xs font-semibold cursor-pointer rounded-xl h-8 px-3"
                >
                  Later
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold cursor-pointer rounded-xl h-8 px-4"
                >
                  Install Now
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
