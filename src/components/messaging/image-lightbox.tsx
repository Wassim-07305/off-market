"use client";

import { useEffect, useCallback, useState } from "react";
import { X, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react";

interface ImageLightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") setZoom((z) => Math.min(z + 0.25, 3));
      if (e.key === "-") setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === "r") setRotation((r) => r + 90);
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      {/* Controls */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Zoom +"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Zoom -"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRotation((r) => r + 90)}
          className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <a
          href={src}
          download
          onClick={(e) => e.stopPropagation()}
          className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors"
          title="Telecharger"
        >
          <Download className="w-4 h-4" />
        </a>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors ml-1"
          title="Fermer (Echap)"
        >
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Zoom indicator */}
      {zoom !== 1 && (
        <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm text-white/70 text-xs font-mono z-10">
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt ?? ""}
        className="relative z-[5] max-w-[90vw] max-h-[90vh] object-contain rounded-lg transition-transform duration-200 select-none"
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
        }}
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>
  );
}
