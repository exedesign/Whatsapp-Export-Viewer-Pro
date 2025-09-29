'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FileText, Archive, Clock } from 'lucide-react';

interface LoadingProgressProps {
  stage: 'reading' | 'extracting' | 'parsing' | 'processing' | 'complete';
  progress: number;
  fileName?: string;
  currentStep?: string;
  batchIndex?: number; // 1-based
  batchTotal?: number;
  mediaProcessed?: number;
  mediaTotal?: number;
  lineProcessed?: number;
  lineTotal?: number;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

const stages = {
  reading: { label: 'ZIP dosyası okunuyor...', icon: Archive },
  extracting: { label: 'Dosyalar çıkarılıyor...', icon: FileText },
  parsing: { label: 'Mesajlar ayrıştırılıyor...', icon: Clock },
  processing: { label: 'İşleniyor...', icon: Loader2 },
  complete: { label: 'Tamamlandı!', icon: Clock }
};

export function LoadingProgress({ stage, progress, fileName, currentStep, batchIndex, batchTotal, mediaProcessed, mediaTotal, lineProcessed, lineTotal, minimized, onToggleMinimize }: LoadingProgressProps) {
  const StageIcon = stages[stage].icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={`w-96 ${minimized ? 'p-3' : 'p-6'} bg-[#202C33] border-[#3B4A54] text-white transition-all`}>
        <div className="flex items-center gap-3 mb-4">
          <StageIcon className={`h-6 w-6 ${stage === 'processing' ? 'animate-spin' : ''} text-[#00A884]`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {stages[stage].label}
            </h3>
            {currentStep && !minimized && (
              <p className="text-[11px] text-[#00A884] mt-0.5">{currentStep}</p>
            )}
          </div>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-xs text-gray-400 hover:text-white border border-[#3B4A54] rounded px-2 py-1"
            >{minimized ? '▲' : '—'}</button>
          )}
        </div>
        {!minimized && (fileName || (batchIndex && batchTotal)) && (
          <div className="mb-3 space-y-1">
            {fileName && (
              <p className="text-sm text-gray-300 truncate">
                <span className="font-medium">Dosya:</span> {fileName}
              </p>
            )}
            {(batchIndex && batchTotal) && (
              <p className="text-xs text-gray-400">
                Toplu işlem: {batchIndex}/{batchTotal}
              </p>
            )}
          </div>
        )}
        {!minimized && (
          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Toplam İlerleme</span>
                  <span className="text-[#00A884] font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-[#3B4A54] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#00A884] to-[#26D366] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {(mediaTotal && mediaTotal > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Medya</span>
                    <span>{mediaProcessed ?? 0}/{mediaTotal}</span>
                  </div>
                  <div className="w-full bg-[#3B4A54] rounded-full h-1.5">
                    <div className="bg-[#2ECC71] h-1.5 rounded-full transition-all" style={{ width: `${((mediaProcessed||0)/mediaTotal)*100}%` }} />
                  </div>
                </div>
              )}
              {(lineTotal && lineTotal > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span>Satır</span>
                    <span>{lineProcessed ?? 0}/{lineTotal}</span>
                  </div>
                  <div className="w-full bg-[#3B4A54] rounded-full h-1.5">
                    <div className="bg-[#1D9BF0] h-1.5 rounded-full transition-all" style={{ width: `${((lineProcessed||0)/lineTotal)*100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-400">
                Lütfen bekleyin, işlem devam ediyor...
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}