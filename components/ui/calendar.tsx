'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { useTranslation } from 'react-i18next';
import { getDateFnsLocale } from '@/lib/date-format';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const { i18n } = useTranslation();
  const locale = React.useMemo(() => getDateFnsLocale(i18n.language), [i18n.language]);
  return (
    <DayPicker
      locale={locale as any}
      showOutsideDays={showOutsideDays}
      className={cn('p-3 bg-[var(--wa-panel)] text-[var(--wa-bubble-in-text)]', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-[var(--wa-bubble-in-text)]',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell:
          'text-[var(--wa-bubble-meta)] rounded-md w-9 font-normal text-[0.7rem] tracking-wide',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-[var(--wa-bubble-in-text)] hover:bg-[var(--wa-accent)]/10'
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-[var(--wa-accent)] text-white hover:bg-[var(--wa-accent-strong)] focus:bg-[var(--wa-accent)]',
        day_today: 'bg-[var(--wa-accent)]/20 text-[var(--wa-bubble-in-text)] font-semibold',
        day_outside:
          'day-outside text-[var(--wa-bubble-meta)] opacity-40 aria-selected:bg-[var(--wa-accent)]/30 aria-selected:text-[var(--wa-bubble-in-text)] aria-selected:opacity-30',
        day_disabled: 'text-[var(--wa-bubble-meta)] opacity-40',
        day_range_middle:
          'aria-selected:bg-accent aria-selected:text-accent-foreground',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
