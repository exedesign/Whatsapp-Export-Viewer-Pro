'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { SettingsMenu } from '@/components/settings-menu';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface ChatHeaderProps {
  onSearch: (query: string) => void;
  onDateSelect: (date: Date) => void;
  chats?: { id: string; fileName: string; originalZip?: File }[];
}

export function ChatHeader({ onSearch, onDateSelect, chats = [] }: ChatHeaderProps) {
  const [date, setDate] = useState<Date>();
  const { t } = useTranslation('common');

  return (
  <div className="sticky top-0 z-10 bg-[var(--wa-panel)] border-b border-[var(--wa-panel-border)]">
      {/* Header with creator info */}
  <div className="px-4 py-2 bg-[var(--wa-header)] flex items-center justify-between gap-4 transition-colors">
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-[var(--wa-bubble-in-text)]">{t('app.title')}</h1>
          <p className="text-xs text-[var(--wa-bubble-meta)]">{t('app.creator')}</p>
        </div>
        <div className="flex items-center gap-1">
          <SettingsMenu />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--wa-icon-muted)]" />
          <Input
            placeholder={t('search.placeholder')}
            className="pl-9 bg-[var(--wa-search-bg)] border border-[var(--wa-search-border)] text-[var(--wa-bubble-in-text)] placeholder:text-[var(--wa-bubble-meta)] focus-visible:ring-[var(--wa-accent)]"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-[var(--wa-search-bg)] text-[var(--wa-bubble-in-text)] hover:text-[var(--wa-accent)] border border-[var(--wa-search-border)]">
              <CalendarIcon className="h-4 w-4 mr-2" />
              {t('date.goTo')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(date) => {
                setDate(date);
                if (date) onDateSelect(date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        </div>
      </div>
    </div>
  );
}