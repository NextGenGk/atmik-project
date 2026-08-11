import { useCallback, useEffect, useRef, useState } from "react";
import { prepareZXingModule, readBarcodes, type ReaderOptions } from "zxing-wasm";
import zxingWasmUrl from "zxing-wasm/full/zxing_full.wasm?url";

export interface UseCameraScannerOptions {
  onResult: (text: string) => void;
  active?: boolean;
  cooldownMs?: number;
  deviceId?: string;
}

export type ScannerStatus = "starting" | "scanning" | "error";
export type ScannerEngine = "native" | "wasm" | "dual";

export interface UseCameraScannerReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: ScannerStatus;
  engine: ScannerEngine | null;
  error: string | null;
  torch: boolean;
  torchSupported: boolean;
  toggleTorch: () => void;
  lastResult: { text: string; time: number } | null;
  scanCount: number;
  devices: MediaDeviceInfo[];
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: "environment" },
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

const NATIVE_INTERVAL_MS = 60;
const WASM_INTERVAL_MS = 140;
const WASM_CANVAS_WIDTH = 640;
const WASM_CANVAS_HEIGHT = 360;

const WASM_READ_OPTIONS: ReaderOptions = {
  formats: ["AllLinear"],
  tryHarder: true,
  tryRotate: true,
  tryInvert: true,
  tryDownscale: true,
  binarizer: "LocalAverage",
  maxNumberOfSymbols: 1,
};

let zxingReadyPromise: Promise<void> | null = null;

function ensureZXing(): Promise<void> {
  if (!zxingReadyPromise) {
    zxingReadyPromise = prepareZXingModule({
      overrides: {
        locateFile: (path, prefix) => (path.endsWith(".wasm") ? zxingWasmUrl : prefix + path),
      },
      fireImmediately: true,
    }).then(() => undefined);
  }
  return zxingReadyPromise;
}

function describeError(e: unknown): string {
  if (e instanceof DOMException) {
    switch (e.name) {
      case "NotAllowedError":
      case "SecurityError":
        return "Camera permission denied. Allow camera access to scan barcodes.";
      case "NotFoundError":
      case "OverconstrainedError":
        return "No camera found on this device.";
      case "NotReadableError":
      case "AbortError":
        return "The camera is in use by another app. Close it and try again.";
    }
  }
  return "Could not start the camera. Try again or enter the barcode manually.";
}

async function decodeWasmImage(source: CanvasImageSource, width: number, height: number): Promise<string | null> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  await ensureZXing();
  const results = await readBarcodes(imageData, WASM_READ_OPTIONS);
  return results[0]?.text?.trim() ?? null;
}

export async function decodeImageFromFile(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("image load failed"));
      img.src = url;
    });
    const NativeDetector = typeof window !== "undefined" ? window.BarcodeDetector : undefined;
    if (NativeDetector) {
      try {
        const codes = await new NativeDetector().detect(img);
        if (codes[0]?.rawValue) return codes[0].rawValue.trim();
      } catch {
        // Fall through to the WASM engine.
      }
    }
    return await decodeWasmImage(img, img.naturalWidth, img.naturalHeight);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function useCameraScanner({
  onResult,
  active = true,
  cooldownMs = 2500,
  deviceId,
}: UseCameraScannerOptions): UseCameraScannerReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nativeTimerRef = useRef<number | null>(null);
  const wasmTimerRef = useRef<number | null>(null);
  const disposedRef = useRef(false);
  const lastCodeRef = useRef({ text: "", at: 0 });
  const torchRef = useRef(false);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const [status, setStatus] = useState<ScannerStatus>("starting");
  const [engine, setEngine] = useState<ScannerEngine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [lastResult, setLastResult] = useState<{ text: string; time: number } | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const emit = useCallback(
    (text: string) => {
      const now = Date.now();
      const last = lastCodeRef.current;
      if (text === last.text && now - last.at < cooldownMs) return;
      lastCodeRef.current = { text, at: now };
      setLastResult({ text, time: now });
      setScanCount((c) => c + 1);
      onResultRef.current(text);
    },
    [cooldownMs]
  );

  const clearTimers = useCallback(() => {
    if (nativeTimerRef.current !== null) {
      window.clearTimeout(nativeTimerRef.current);
      nativeTimerRef.current = null;
    }
    if (wasmTimerRef.current !== null) {
      window.clearTimeout(wasmTimerRef.current);
      wasmTimerRef.current = null;
    }
  }, []);

  const stopNative = useCallback(() => {
    clearTimers();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [clearTimers]);

  const openStream = useCallback(async (): Promise<MediaStream> => {
    const base: MediaStreamConstraints = { video: VIDEO_CONSTRAINTS, audio: false };
    const device: MediaStreamConstraints = {
      video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    };
    const bare: MediaStreamConstraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: { ideal: "environment" } },
      audio: false,
    };
    try {
      return await navigator.mediaDevices.getUserMedia(deviceId ? device : base);
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      if (name === "OverconstrainedError" || name === "NotFoundError" || name === "NotReadableError") {
        return navigator.mediaDevices.getUserMedia(bare);
      }
      throw e;
    }
  }, [deviceId]);

  const attachAndPlay = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;
    const video = videoRef.current;
    if (video) {
      video.srcObject = stream;
      await video.play().catch(() => undefined);
    }
    const videoTrack = stream.getVideoTracks()[0];
    const caps = videoTrack?.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
    if (videoTrack && caps?.torch) {
      setTorchSupported(true);
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      if (!disposedRef.current) {
        setDevices(list.filter((d) => d.kind === "videoinput"));
      }
    } catch {
      // Enumeration is best-effort.
    }
  }, []);

  const start = useCallback(async () => {
    if (disposedRef.current || !videoRef.current) return;
    stopNative();
    setError(null);
    setStatus("starting");
    setEngine(null);
    setTorch(false);
    torchRef.current = false;
    setTorchSupported(false);
    setLastResult(null);
    setScanCount(0);

    let stream: MediaStream;
    try {
      stream = await openStream();
    } catch (e) {
      setError(describeError(e));
      setStatus("error");
      return;
    }
    if (disposedRef.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    try {
      await attachAndPlay(stream);
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      setError("Could not start the camera. Try again or enter the barcode manually.");
      setStatus("error");
      return;
    }
    if (disposedRef.current) return;

    const NativeDetector = typeof window !== "undefined" ? window.BarcodeDetector : undefined;
    let nativeActive = false;
    if (NativeDetector) {
      try {
        const detector = new NativeDetector();
        nativeActive = true;
        const loop = async () => {
          if (disposedRef.current) return;
          const video = videoRef.current;
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            try {
              const codes = await detector.detect(video);
              if (!disposedRef.current && codes.length > 0 && codes[0].rawValue) {
                emit(codes[0].rawValue.trim());
              }
            } catch {
              // A frame occasionally fails to decode; keep scanning.
            }
          }
          if (!disposedRef.current) {
            nativeTimerRef.current = window.setTimeout(() => void loop(), NATIVE_INTERVAL_MS);
          }
        };
        void loop();
      } catch {
        nativeActive = false;
      }
    }

    void ensureZXing().catch(() => {
      // WASM module download failed; the native engine (if any) still runs.
    });

    const canvas = document.createElement("canvas");
    canvas.width = WASM_CANVAS_WIDTH;
    canvas.height = WASM_CANVAS_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx && !nativeActive) {
      setError("Camera decoding is unavailable in this browser.");
      setStatus("error");
      return;
    }
    if (ctx) {
      const loop = async () => {
        if (disposedRef.current) return;
        const video = videoRef.current;
        if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            ctx.drawImage(video, 0, 0, WASM_CANVAS_WIDTH, WASM_CANVAS_HEIGHT);
            const imageData = ctx.getImageData(0, 0, WASM_CANVAS_WIDTH, WASM_CANVAS_HEIGHT);
            const results = await readBarcodes(imageData, WASM_READ_OPTIONS);
            if (!disposedRef.current && results[0]?.text) {
              emit(results[0].text.trim());
            }
          } catch {
            // No barcode in this frame (or WASM not ready yet); keep scanning.
          }
        }
        if (!disposedRef.current) {
          wasmTimerRef.current = window.setTimeout(() => void loop(), WASM_INTERVAL_MS);
        }
      };
      void loop();
    }

    setEngine(nativeActive ? (ctx ? "dual" : "native") : "wasm");
    setStatus("scanning");
  }, [openStream, attachAndPlay, emit, stopNative]);

  const stop = useCallback(() => {
    disposedRef.current = true;
    stopNative();
    setTorch(false);
    torchRef.current = false;
    setTorchSupported(false);
    setStatus("starting");
  }, [stopNative]);

  useEffect(() => {
    if (active) {
      disposedRef.current = false;
      void start();
    } else {
      stop();
    }
    return () => {
      disposedRef.current = true;
      stopNative();
    };
  }, [active, deviceId, start, stop, stopNative]);

  const toggleTorch = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torchRef.current;
    void track
      .applyConstraints({ advanced: [{ torch: next }] } as unknown as MediaTrackConstraints)
      .then(() => {
        torchRef.current = next;
        setTorch(next);
      })
      .catch(() => undefined);
  }, []);

  return {
    videoRef,
    status,
    engine,
    error,
    torch,
    torchSupported,
    toggleTorch,
    lastResult,
    scanCount,
    devices,
  };
}
