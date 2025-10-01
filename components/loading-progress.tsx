'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
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

const stages = (t: (k: string) => string) => ({
  reading: { label: t('loading.reading'), icon: Archive },
  extracting: { label: t('loading.extracting'), icon: FileText },
  parsing: { label: t('loading.parsing'), icon: Clock },
  processing: { label: t('loading.processing'), icon: Loader2 },
  complete: { label: t('loading.completed'), icon: Clock }
});

export function LoadingProgress({ stage, progress, fileName, currentStep, batchIndex, batchTotal, mediaProcessed, mediaTotal, lineProcessed, lineTotal, minimized, onToggleMinimize }: LoadingProgressProps) {
  const { t } = useTranslation('common');
  const map = stages(t);
  const StageIcon = map[stage].icon;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={`w-96 ${minimized ? 'p-3' : 'p-6'} bg-[var(--wa-stat-card-bg)] border-[var(--wa-stat-card-border)] text-[var(--wa-bubble-in-text)] transition-all`}>
        <div className="flex items-center gap-3 mb-4">
          <StageIcon className={`h-6 w-6 ${stage === 'processing' ? 'animate-spin' : ''} text-[var(--wa-accent)]`} />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-[var(--wa-bubble-in-text)]">
              {map[stage].label}
            </h3>
            {currentStep && !minimized && (
              <p className="text-[11px] text-[var(--wa-accent)] mt-0.5">{currentStep}</p>
            )}
          </div>
          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              className="text-xs text-[var(--wa-bubble-meta)] hover:text-[var(--wa-bubble-in-text)] border border-[var(--wa-stat-card-border)] rounded px-2 py-1"
            >{minimized ? '▲' : '—'}</button>
          )}
        </div>
        {!minimized && (fileName || (batchIndex && batchTotal)) && (
          <div className="mb-3 space-y-1">
            {fileName && (
              <p className="text-sm text-[var(--wa-bubble-in-text)]/80 truncate">
                <span className="font-medium text-[var(--wa-bubble-in-text)]">{t('media.file')}:</span> {fileName}
              </p>
            )}
            {(batchIndex && batchTotal) && (
              <p className="text-xs text-[var(--wa-bubble-meta)]">
                {t('hint.bulk')} {batchIndex}/{batchTotal}
              </p>
            )}
          </div>
        )}
        {!minimized && (
          <>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--wa-bubble-in-text)]/80">{t('loading.totalProgress')}</span>
                  <span className="text-[var(--wa-accent)] font-medium">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-[var(--wa-panel-border)]/40 rounded-full h-2">
                  <div
                    className="bg-[var(--wa-accent)] h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {(mediaTotal && mediaTotal > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--wa-bubble-meta)]">
                    <span>{t('loading.media')}</span>
                    <span>{mediaProcessed ?? 0}/{mediaTotal}</span>
                  </div>
                  <div className="w-full bg-[var(--wa-panel-border)]/40 rounded-full h-1.5">
                    <div className="bg-[var(--wa-accent-strong)] h-1.5 rounded-full transition-all" style={{ width: `${((mediaProcessed||0)/mediaTotal)*100}%` }} />
                  </div>
                </div>
              )}
              {(lineTotal && lineTotal > 0) && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[var(--wa-bubble-meta)]">
                    <span>{t('loading.lines')}</span>
                    <span>{lineProcessed ?? 0}/{lineTotal}</span>
                  </div>
                  <div className="w-full bg-[var(--wa-panel-border)]/40 rounded-full h-1.5">
                    <div className="bg-[var(--wa-link)] h-1.5 rounded-full transition-all" style={{ width: `${((lineProcessed||0)/lineTotal)*100}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-[var(--wa-bubble-meta)]">{t('loading.pleaseWait')}</p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}