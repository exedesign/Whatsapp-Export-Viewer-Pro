'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Search } from 'lucide-react';
import { useState } from 'react';

interface ChatHeaderProps {
  onSearch: (query: string) => void;
  onDateSelect: (date: Date) => void;
}

export function ChatHeader({ onSearch, onDateSelect }: ChatHeaderProps) {
  const [date, setDate] = useState<Date>();

  return (
    <div className="sticky top-0 z-10 bg-[#202C33] p-4 border-b border-[#313D45]">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            className="pl-9 bg-[#2A3942] border-none text-white"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-[#2A3942] border-none text-white">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Jump to date
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
  );
}