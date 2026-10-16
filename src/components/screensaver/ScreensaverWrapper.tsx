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
  const [snapshot, setSnapshot] = useState<HTMLCanvasElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const captureScreen = useCallback(async (scale: number): Promise<HTMLCanvasElement | null> => {
    // html2canvas scrolls its cloned page to the current position; with the site's smooth
    // scrolling that scroll animates and the capture comes out offset, so make it instant.
    const root = document.documentElement;
    const prevScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    try {
      // Capture only what is on screen right now: the game breaks this "frozen screen" apart
      const canvas = await html2canvas(document.body, {
        x: window.scrollX,
        y: window.scrollY,
        width: window.innerWidth,
        height: window.innerHeight,
        scale,
        ignoreElements: (el) => el.hasAttribute("data-screensaver-ignore"),
        useCORS: true,
        allowTaint: false, // Changed to false for Safari compatibility
        backgroundColor: "#ffffff",
        logging: false,
        // Don't wait long for images that are still loading: a slow image used to push the
        // whole capture past the time limit, and phones then got no screenshot at all
        imageTimeout: 1500,
        removeContainer: true,
        foreignObjectRendering: false, // Disable for Safari compatibility
      });

      return canvas.width > 0 && canvas.height > 0 ? canvas : null;
    } catch (error) {
      console.error("Failed to capture screen:", error);
      return null;
    } finally {
      root.style.scrollBehavior = prevScrollBehavior;
    }
  }, []);

  const startScreensaver = useCallback(async () => {
    setIsCapturing(true);

    // Phones are slower and have tighter canvas limits: capture at 1x and allow more time
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const TIMED_OUT = "timeout" as const;
    const withTimeout = (p: Promise<HTMLCanvasElement | null>, ms: number) =>
      Promise.race([p, new Promise<typeof TIMED_OUT>((resolve) => setTimeout(() => resolve(TIMED_OUT), ms))]);

    // Try to capture the current screen, but don't block if it fails
    let image: HTMLCanvasElement | null = null;
    try {
      const first = await withTimeout(captureScreen(touch ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)), touch ? 7000 : 5000);
      if (first !== TIMED_OUT) image = first;
      // If it failed outright (not just slow, which would still be running), retry once lighter
      if (first === null) {
        const second = await withTimeout(captureScreen(0.6), 4000);
        if (second !== TIMED_OUT) image = second;
      }
    } catch (error) {
      console.error("Screen capture failed:", error);
    }
    
    setSnapshot(image);
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
    setSnapshot((prev) => {
      // Free the capture's pixels now instead of waiting for GC (iOS canvas memory cap)
      if (prev) {
        prev.width = 0;
        prev.height = 0;
      }
      return null;
    });
    // Reset the timer after exiting
    setTimeout(() => {
      resetTimer();
    }, 100);
  }, [resetTimer]);

  // Shortcut for trying the game without waiting for the idle timeout: add ?pong to any URL
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("pong")) return;
    // Wait for the page (and its images) to finish loading so there's something to capture
    let t: ReturnType<typeof setTimeout> | undefined;
    const go = () => {
      t = setTimeout(() => startScreensaver(), 800);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", go);
    };
  }, [startScreensaver]);

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
      {/* inert while the game is up: no scrolling, tabbing or screen-reader focus behind it */}
      <div ref={contentRef} inert={showScreensaver}>
        {children}
      </div>
      
      {/* Capturing indicator (brief flash) */}
      {isCapturing && (
        <div
          data-screensaver-ignore
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
        <PongGame onExit={handleExit} snapshot={snapshot} />
      )}
    </>
  );
};
