"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface Props {
  onScan: (code: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let stopped = false;

    async function start() {
      try {
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, err) => {
            if (stopped) return;
            if (result) {
              stopped = true;
              setScanning(false);
              controls.stop();
              onScan(result.getText());
            } else if (err && err.name !== "NotFoundException") {
              console.error(err);
            }
          }
        );
        controlsRef.current = controls;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("Permission") || msg.includes("permission")) {
          setError("Camera permission denied. Please allow camera access and try again.");
        } else if (msg.includes("Requested device not found") || msg.includes("no camera")) {
          setError("No camera found on this device.");
        } else {
          setError("Could not start camera. " + msg);
        }
      }
    }

    start();

    return () => {
      stopped = true;
      controlsRef.current?.stop();
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0">
        <div>
          <h2 className="text-white font-bold text-lg">Scan Barcode</h2>
          <p className="text-gray-400 text-xs mt-0.5">Point camera at the barcode on the product</p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center active:scale-95 transition-all"
        >
          ✕
        </button>
      </div>

      {/* Camera / Error */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
        {error ? (
          <div className="text-center space-y-4 max-w-xs">
            <span className="text-5xl">📷</span>
            <p className="text-white font-semibold">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-2xl bg-white text-gray-800 font-bold text-sm active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="relative w-full max-w-sm aspect-[3/4] rounded-3xl overflow-hidden bg-gray-900">
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-32">
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                {/* Scan line */}
                {scanning && (
                  <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-400 opacity-80 animate-pulse" />
                )}
              </div>
            </div>
            {/* Dim edges */}
            <div className="absolute inset-0 bg-black/30" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 12% 25%, 12% 75%, 88% 75%, 88% 25%, 12% 25%)" }} />
          </div>
        )}
      </div>

      <div className="shrink-0 py-6 text-center">
        <p className="text-gray-500 text-sm">
          {scanning && !error ? "Align the barcode within the frame" : ""}
        </p>
      </div>
    </div>
  );
}
