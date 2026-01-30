"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { PongGame } from "./PongGame";

interface ScreensaverWrapperProps {
  children: React.ReactNode;
  idleTimeout?: number; // in milliseconds
}

export const ScreensaverWrapper = ({ 
  children, 
  idleTimeout = 2 * 60 * 1000 // 2 minutes default
}: ScreensaverWrapperProps) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [showScreensaver, setShowScreensaver] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const captureScreen = useCallback(async (): Promise<string | null> => {
    try {
      // Capture the entire document body
      const canvas = await html2canvas(document.body, {
        scale: 0.5, // Lower scale for performance and pixelation effect
        useCORS: true,
        allowTaint: false, // Changed to false for Safari compatibility
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 5000, // Add timeout
        removeContainer: true,
        foreignObjectRendering: false, // Disable for Safari compatibility
      });
      
      return canvas.toDataURL("image/jpeg", 0.8);
    } catch (error) {
      console.error("Failed to capture screen:", error);
      return null;
    }
  }, []);

  const startScreensaver = useCallback(async () => {
    setIsCapturing(true);
    
    // Try to capture the current screen, but don't block if it fails
    let image: string | null = null;
    try {
      // Add a timeout for the capture in case it hangs
      const capturePromise = captureScreen();
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 3000)
      );
      image = await Promise.race([capturePromise, timeoutPromise]);
    } catch (error) {
      console.error("Screen capture failed:", error);
    }
    
    setBackgroundImage(image);
    setIsCapturing(false);
    
    // Always show the screensaver, even without background image
    setShowScreensaver(true);
  }, [captureScreen]);

  const resetTimer = useCallback(() => {
    // Don't reset if screensaver is showing or capturing
    if (showScreensaver || isCapturing) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      startScreensaver();
    }, idleTimeout);
  }, [idleTimeout, showScreensaver, isCapturing, startScreensaver]);

  const handleExit = useCallback(() => {
    setShowScreensaver(false);
    setBackgroundImage(null);
    // Reset the timer after exiting
    setTimeout(() => {
      resetTimer();
    }, 100);
  }, [resetTimer]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "wheel",
    ];

    // Handler for any activity
    const handleActivity = () => {
      if (!showScreensaver && !isCapturing) {
        resetTimer();
      }
    };

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer start
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer, showScreensaver, isCapturing]);

  return (
    <>
      <div ref={contentRef}>
        {children}
      </div>
      
      {/* Capturing indicator (brief flash) */}
      {isCapturing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            zIndex: 9997,
            pointerEvents: "none",
          }}
        />
      )}
      
      {/* Screensaver */}
      {showScreensaver && (
        <PongGame 
          onExit={handleExit} 
          backgroundImage={backgroundImage || undefined}
        />
      )}
    </>
  );
};
