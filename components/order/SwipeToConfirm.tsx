"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type SwipeToConfirmProps = {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
};

export function SwipeToConfirm({
  onConfirm,
  disabled = false,
  label = "Swipe to confirm payment",
}: SwipeToConfirmProps) {
  const [swiping, setSwiping] = useState(false);
  const [offset, setOffset] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [maxOffset, setMaxOffset] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      // Max swipe is container width minus thumb width (60px)
      setMaxOffset(containerRef.current.offsetWidth - 60);
    }
  }, []);

  const handleTouchStart = () => {
    if (disabled || confirmed) return;
    setSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!swiping || disabled || confirmed) return;
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newOffset = Math.max(0, Math.min(maxOffset, touch.clientX - rect.left - 30));
    setOffset(newOffset);

    // If swiped past threshold (80%), trigger confirmation
    if (newOffset > maxOffset * 0.8) {
      setConfirmed(true);
      setSwiping(false);
      setOffset(maxOffset);
      onConfirm();
    }
  };

  const handleTouchEnd = () => {
    if (!confirmed) {
      // Snap back if not completed
      setOffset(0);
    }
    setSwiping(false);
  };

  const handleMouseDown = () => {
    if (disabled || confirmed) return;
    setSwiping(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!swiping || disabled || confirmed) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const newOffset = Math.max(0, Math.min(maxOffset, e.clientX - rect.left - 30));
    setOffset(newOffset);

    if (newOffset > maxOffset * 0.8) {
      setConfirmed(true);
      setSwiping(false);
      setOffset(maxOffset);
      onConfirm();
    }
  };

  const handleMouseUp = () => {
    if (!confirmed) {
      setOffset(0);
    }
    setSwiping(false);
  };

  useEffect(() => {
    if (swiping) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const newOffset = Math.max(0, Math.min(maxOffset, e.clientX - rect.left - 30));
        setOffset(newOffset);

        if (newOffset > maxOffset * 0.8) {
          setConfirmed(true);
          setSwiping(false);
          setOffset(maxOffset);
          onConfirm();
        }
      };

      const handleGlobalMouseUp = () => {
        if (!confirmed) {
          setOffset(0);
        }
        setSwiping(false);
      };

      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleGlobalMouseMove);
        document.removeEventListener("mouseup", handleGlobalMouseUp);
      };
    }
  }, [swiping, maxOffset, confirmed, onConfirm]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-14 overflow-hidden rounded-full bg-charcoal/60 backdrop-blur-sm",
        "border border-angie-orange/30",
        disabled && "opacity-50",
        confirmed && "bg-agave",
      )}
    >
      {/* Track */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-sm font-medium uppercase tracking-editorial transition-colors",
          confirmed ? "text-charcoal" : "text-cream/60",
        )}
      >
        {confirmed ? "Confirmed!" : label}
      </div>

      {/* Progress fill */}
      <div
        className="absolute left-0 top-0 h-full bg-angie-orange/20 transition-all"
        style={{ width: `${(offset / maxOffset) * 100}%` }}
      />

      {/* Swipeable thumb */}
      <div
        className={cn(
          "absolute left-0 top-1 flex h-12 w-12 cursor-grab items-center justify-center rounded-full transition-all",
          swiping && "cursor-grabbing",
          confirmed ? "bg-charcoal shadow-lg" : "bg-angie-orange shadow-lg shadow-angie-orange/30",
        )}
        style={{
          left: `${offset}px`,
          transition: swiping || confirmed ? "none" : "left 0.2s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <ChevronRight
          className={cn("h-6 w-6", confirmed ? "text-agave" : "text-charcoal")}
          strokeWidth={3}
        />
      </div>
    </div>
  );
}
