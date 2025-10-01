import { format } from 'date-fns';
import { enUS, tr, ru, fr, es, ptBR, hi, id as idLocale } from 'date-fns/locale';

const localeMap: Record<string, Locale> = {
  en: enUS,
  'en-US': enUS,
  tr,
  'tr-TR': tr,
  ru,
  fr,
  es,
  'es-ES': es,
  'pt-BR': ptBR,
  pt: ptBR,
  hi,
  id: idLocale,
  'id-ID': idLocale,
};

export function getDateFnsLocale(i18nLang: string): Locale {
  return localeMap[i18nLang] || localeMap[i18nLang.split('-')[0]] || enUS;
}

export function formatDate(date: Date | string | number | null | undefined, pattern: string, i18nLang: string): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    return format(d, pattern, { locale: getDateFnsLocale(i18nLang) });
  } catch {
    return '';
  }
}

export const DATE_PATTERNS = {
  full: 'dd MMMM yyyy',
  dateTime: 'dd.MM.yyyy HH:mm',
  pill: 'PPP',
};
