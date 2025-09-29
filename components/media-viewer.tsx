'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'audio';
  fileName?: string;
}

export function MediaViewer({ isOpen, onClose, mediaUrl, mediaType, fileName }: MediaViewerProps) {
  const [zoom, setZoom] = useState(1);

  // ESC ile kapatma
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = fileName || 'media';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={fileName || 'Medya görüntüleyici'}
    >
      <div className="relative w-full h-full flex items-center justify-center p-4">
        {/* Kontrol Butonları */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {mediaType === 'image' && (
            <>
              <button
                onClick={handleZoomOut}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-2 rounded-lg transition-colors"
                title="Uzaklaştır"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={handleZoomIn}
                className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-2 rounded-lg transition-colors"
                title="Yakınlaştır"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-2 rounded-lg transition-colors"
            title="İndir"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-80 hover:bg-opacity-100 text-black p-2 rounded-lg transition-colors"
            title="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dosya Adı */}
        {fileName && (
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
            {fileName}
          </div>
        )}

        {/* Medya İçeriği */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {mediaType === 'image' && (
            <img
              src={mediaUrl}
              alt={fileName || 'Resim'}
              className="max-w-full max-h-full object-contain cursor-zoom-in"
              style={{ transform: `scale(${zoom})` }}
              onClick={() => setZoom(prev => prev === 1 ? 1.5 : 1)}
            />
          )}
          
          {mediaType === 'video' && (
            <video
              src={mediaUrl}
              controls
              className="max-w-full max-h-full"
              style={{ maxHeight: '90vh', maxWidth: '90vw' }}
            >
              Tarayıcınız bu video formatını desteklemiyor.
            </video>
          )}
          
          {mediaType === 'audio' && (
            <div className="bg-gray-800 p-8 rounded-lg">
              <div className="text-white text-center mb-4">
                <div className="text-lg font-semibold mb-2">Ses Dosyası</div>
                <div className="text-sm text-gray-300">{fileName || 'Bilinmeyen'}</div>
              </div>
              <audio
                src={mediaUrl}
                controls
                className="w-full"
              >
                Tarayıcınız bu ses formatını desteklemiyor.
              </audio>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}