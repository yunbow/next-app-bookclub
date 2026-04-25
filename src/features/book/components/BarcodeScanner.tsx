'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onError?: (error: Error) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onScan, onError, onClose }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const startScanning = async () => {
      try {
        setIsScanning(true);
        setError(null);

        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('カメラAPIがサポートされていません');
        }

        // Initialize barcode reader
        const codeReader = new BrowserMultiFormatReader();
        readerRef.current = codeReader;

        // Get video devices
        const videoInputDevices = await codeReader.listVideoInputDevices();

        if (videoInputDevices.length === 0) {
          throw new Error('カメラが見つかりません');
        }

        // Prefer back camera on mobile devices
        const backCamera = videoInputDevices.find(
          (device) =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        );

        const selectedDeviceId = backCamera
          ? backCamera.deviceId
          : videoInputDevices[0].deviceId;

        // Start decoding
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current!,
          (result, error) => {
            if (result) {
              const code = result.getText();
              console.log('Barcode detected:', code);
              onScan(code);
              stopScanning();
            }

            if (error && !(error instanceof NotFoundException)) {
              console.error('Barcode scan error:', error);
            }
          }
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'カメラの起動に失敗しました';
        setError(errorMessage);
        if (onError && err instanceof Error) {
          onError(err);
        }
      }
    };

    startScanning();

    return () => {
      stopScanning();
    };
  }, [onScan, onError]);

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
      readerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="relative h-full w-full">
        {/* Video element */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />

        {/* Overlay with scanning frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scanning frame */}
            <div className="h-64 w-64 border-4 border-white rounded-lg opacity-50" />

            {/* Corner markers */}
            <div className="absolute top-0 left-0 h-8 w-8 border-t-4 border-l-4 border-blue-500" />
            <div className="absolute top-0 right-0 h-8 w-8 border-t-4 border-r-4 border-blue-500" />
            <div className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-blue-500" />
            <div className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-blue-500" />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute top-8 left-0 right-0 text-center">
          <p className="text-white text-lg font-semibold bg-black bg-opacity-50 py-2 px-4 inline-block rounded">
            バーコードをフレーム内に収めてください
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="absolute top-20 left-0 right-0 mx-4">
            <div className="bg-red-500 text-white p-4 rounded-lg">
              <p className="font-semibold">エラー</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
          aria-label="閉じる"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Status indicator */}
        {isScanning && !error && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <div className="inline-flex items-center bg-black bg-opacity-50 text-white py-2 px-4 rounded-full">
              <div className="animate-pulse mr-2">
                <div className="h-3 w-3 bg-green-500 rounded-full" />
              </div>
              <span>スキャン中...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook to check if barcode scanner is supported
 */
export function useBarcodeScannerSupport() {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        const hasMediaDevices =
          navigator.mediaDevices && navigator.mediaDevices.getUserMedia;
        setIsSupported(!!hasMediaDevices);
      } catch {
        setIsSupported(false);
      }
    };

    checkSupport();
  }, []);

  return isSupported;
}
