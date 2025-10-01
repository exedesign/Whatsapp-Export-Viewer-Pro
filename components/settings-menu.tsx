"use client";
import { useState } from 'react';
import { useTheme } from '@/context/theme';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SettingsMenu() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation('common');
  // Dil kodlarını alfabetik (kod bazlı) sıralı göster: en, es, fr, hi, id, pt-BR, ru, tr
  const languages = ['en','es','fr','hi','id','pt-BR','ru','tr'] as const;
  const [lang, setLang] = useState(i18n.language);
  const [open, setOpen] = useState(false);
  // Custom Google Client ID desteği kaldırıldı: env üzerinden tek bir client id kullanılacak.

  const changeLang = (lng: string) => {
    setLang(lng);
    void i18n.changeLanguage(lng);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('settings')} className="text-[var(--wa-bubble-meta)] hover:text-[var(--wa-accent)]">
          <Settings className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="end">
        <h3 className="text-sm font-semibold mb-2">{t('settings')}</h3>
        <div className="space-y-4">
          <div>
            <span className="text-xs font-medium text-[var(--wa-bubble-meta)] uppercase tracking-wide">{t('settings.theme')}</span>
            <div className="mt-2 flex flex-col gap-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="accent-[var(--wa-accent)]"
                />
                {t('theme.light', { defaultValue: t('theme.whatsapp') })}
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="deep-dark"
                  checked={theme === 'deep-dark'}
                  onChange={() => setTheme('deep-dark')}
                  className="accent-[var(--wa-accent)]"
                />
                {t('theme.deep')}
              </label>
            </div>
          </div>
          <Separator />
          <div>
            <span className="text-xs font-medium text-[var(--wa-bubble-meta)] uppercase tracking-wide">{t('settings.language')}</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {languages.map(code => {
                const label = t(`language.${code}` as any);
                const display = code.toUpperCase();
                return (
                  <Button
                    key={code}
                    size="sm"
                    variant={lang===code ? 'default':'outline'}
                    onClick={() => changeLang(code)}
                    className="text-xs"
                    title={label}
                    aria-label={label}
                  >
                    {display}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>{t('close')}</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}