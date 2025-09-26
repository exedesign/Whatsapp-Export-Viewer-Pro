'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Loader2, FileText, Archive, Clock } from 'lucide-react';

interface LoadingProgressProps {
  stage: 'reading' | 'extracting' | 'parsing' | 'processing' | 'complete';
  progress: number;
  fileName?: string;
  currentStep?: string;
}

const stages = {
  reading: { label: 'ZIP dosyası okunuyor...', icon: Archive },
  extracting: { label: 'Dosyalar çıkarılıyor...', icon: FileText },
  parsing: { label: 'Mesajlar ayrıştırılıyor...', icon: Clock },
  processing: { label: 'İşleniyor...', icon: Loader2 },
  complete: { label: 'Tamamlandı!', icon: Clock }
};

export function LoadingProgress({ stage, progress, fileName, currentStep }: LoadingProgressProps) {
  const StageIcon = stages[stage].icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 p-6 bg-[#202C33] border-[#3B4A54] text-white">
        <div className="flex items-center gap-3 mb-4">
          <StageIcon className={`h-6 w-6 ${stage === 'processing' ? 'animate-spin' : ''} text-[#00A884]`} />
          <h3 className="text-lg font-semibold text-white">
            {stages[stage].label}
          </h3>
        </div>
        
        {fileName && (
          <p className="text-sm text-gray-300 mb-3 truncate">
            <span className="font-medium">Dosya:</span> {fileName}
          </p>
        )}
        
        {currentStep && (
          <p className="text-sm text-[#00A884] mb-3">
            {currentStep}
          </p>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">İlerleme</span>
            <span className="text-[#00A884] font-medium">{Math.round(progress)}%</span>
          </div>
          
          <div className="w-full bg-[#3B4A54] rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-[#00A884] to-[#26D366] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Lütfen bekleyin, işlem devam ediyor...
          </p>
        </div>
      </Card>
    </div>
  );
}