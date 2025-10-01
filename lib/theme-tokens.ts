/**
 * Design Token Altyapısı
 * Buraya Figma / XD / Sketch dosyalarından çıkaracağınız renk ve diğer
 * tema değerlerini ekleyebilirsiniz. Mevcut WhatsApp / Deep varyantları
 * başlangıç niteliğinde girildi; tasarım kaynağındaki gerçek değerlerle
 * güncelleyebilirsiniz.
 */

export type Mode = 'light' | 'dark' | 'deep';

export interface ColorTokens {
  /* Zeminler */
  bg: string;              // Genel arka plan
  bgSecondary: string;     // İç panel / chat listesi zemini
  panel: string;           // İç kart/panel
  panelBorder: string;
  header: string;
  /* Mesaj balonları */
  bubbleIn: string;
  bubbleOut: string;
  bubbleInText: string;
  bubbleOutText: string;
  bubbleMeta: string;
  /* Durum & seçim */
  hover: string;
  hoverStrong: string;
  messageSelected: string;
  messageSelectedBorder: string;
  replyBg: string;
  replyBorder: string;
  /* Aksiyon / accent */
  accent: string;
  accentStrong: string;
  link: string;
  focusRing: string;
  /* Menü / overlay */
  menuBg: string;
  menuBorder: string;
  menuHover: string;
  /* Scroll & selection */
  scroll: string;
  selection: string;
  /* Ek bileşenler */
  statCardBg: string;
  statCardBorder: string;
  datePillBg: string;
}

export interface ThemeTokens {
  mode: Mode;
  colors: ColorTokens;
  radius: {
    base: string;
    bubble: string; // mesaj balonu radius
  };
  shadow: {
    panel: string;
    overlay: string;
  };
}

// Mevcut CSS değişkenlerinden türetilmiş başlangıç değerleri
// (globals.css ile senkron tutulmalı). Tasarım dosyanızdan çıkan değerlerle override edin.
export const themePresets: Record<string, ThemeTokens> = {
  'whatsapp-light': {
    mode: 'light',
    colors: {
      bg: '#efeae2',
      bgSecondary: '#f0f2f5',
      panel: '#ffffff',
      panelBorder: '#d1d7db',
      header: '#f0f2f5',
      bubbleIn: '#ffffff',
      bubbleOut: '#d9fdd3',
      bubbleInText: '#111b21',
      bubbleOutText: '#111b21',
      bubbleMeta: '#667781',
      hover: '#e2e6e9',
      hoverStrong: '#dbe0e3',
      messageSelected: '#d1f4cc',
      messageSelectedBorder: '#a1d9a0',
      replyBg: '#f0f2f5',
      replyBorder: '#d1d7db',
      accent: '#008069',
      accentStrong: '#00a884',
      link: '#53bdeb',
      focusRing: '#00a884',
      menuBg: '#ffffff',
      menuBorder: '#d1d7db',
      menuHover: '#f5f6f6',
      scroll: '#ced0d1',
      selection: '#b5ebd0',
      statCardBg: '#ffffff',
      statCardBorder: '#d1d7db',
      datePillBg: '#e9edef'
    },
    radius: {
      base: '8px',
      bubble: '8px'
    },
    shadow: {
      panel: '0 1px 2px rgba(0,0,0,0.08)',
      overlay: '0 4px 24px rgba(0,0,0,0.18)'
    }
  },
  'whatsapp-dark': {
    mode: 'dark',
    colors: {
      bg: '#0b141a',
      bgSecondary: '#111b21',
      panel: '#0b141a',
      panelBorder: '#222d34',
      header: '#202c33',
      bubbleIn: '#202c33',
      bubbleOut: '#005c4b',
      bubbleInText: '#e9edef',
      bubbleOutText: '#e9edef',
      bubbleMeta: '#8696a0',
      hover: '#2a3942',
      hoverStrong: '#233138',
      messageSelected: '#203c33',
      messageSelectedBorder: '#115847',
      replyBg: '#1f2c33',
      replyBorder: '#2a3942',
      accent: '#00a884',
      accentStrong: '#06cf9c',
      link: '#53bdeb',
      focusRing: '#00a884',
      menuBg: '#233138',
      menuBorder: '#2a3942',
      menuHover: '#2f3d45',
      scroll: '#253137',
      selection: '#033c33',
      statCardBg: '#202c33',
      statCardBorder: '#3b4a54',
      datePillBg: '#182229'
    },
    radius: {
      base: '8px',
      bubble: '8px'
    },
    shadow: {
      panel: '0 1px 2px rgba(0,0,0,0.4)',
      overlay: '0 4px 24px rgba(0,0,0,0.6)'
    }
  },
  'deep-dark': {
    mode: 'deep',
    colors: {
      bg: '#050b0f',
      bgSecondary: '#0a1116',
      panel: '#0e171d',
      panelBorder: '#1c272d',
      header: '#0e171d',
      bubbleIn: '#182429',
      bubbleOut: '#053c31',
      bubbleInText: '#e2e8ea',
      bubbleOutText: '#d6ece6',
      bubbleMeta: '#5a6a72',
      hover: '#122027',
      hoverStrong: '#0f1b21',
      messageSelected: '#103a33',
      messageSelectedBorder: '#0c5a48',
      replyBg: '#122027',
      replyBorder: '#1c2d33',
      accent: '#00a884',
      accentStrong: '#06cf9c',
      link: '#53bdeb',
      focusRing: '#00a884',
      menuBg: '#101c22',
      menuBorder: '#1c2d33',
      menuHover: '#18262d',
      scroll: '#1f2c33',
      selection: '#074e41',
      statCardBg: '#101c22',
      statCardBorder: '#1c2d33',
      datePillBg: '#182229'
    },
    radius: {
      base: '8px',
      bubble: '8px'
    },
    shadow: {
      panel: '0 1px 2px rgba(0,0,0,0.55)',
      overlay: '0 4px 28px rgba(0,0,0,0.7)'
    }
  }
};

/**
 * Belirli bir preset'i CSS custom property map'ine çevirir.
 * İsterseniz runtime'da dynamic tema geçişi için kullanılabilir.
 */
export function tokensToCssVars(presetKey: keyof typeof themePresets): Record<string,string> {
  const { colors, radius } = themePresets[presetKey];
  return {
    '--wa-bg': colors.bg,
    '--wa-bg-secondary': colors.bgSecondary,
    '--wa-panel': colors.panel,
    '--wa-panel-border': colors.panelBorder,
    '--wa-header': colors.header,
    '--wa-bubble-in': colors.bubbleIn,
    '--wa-bubble-out': colors.bubbleOut,
    '--wa-bubble-in-text': colors.bubbleInText,
    '--wa-bubble-out-text': colors.bubbleOutText,
    '--wa-bubble-meta': colors.bubbleMeta,
    '--wa-hover': colors.hover,
    '--wa-hover-strong': colors.hoverStrong,
    '--wa-message-selected': colors.messageSelected,
    '--wa-message-selected-border': colors.messageSelectedBorder,
    '--wa-reply-bg': colors.replyBg,
    '--wa-reply-border': colors.replyBorder,
    '--wa-accent': colors.accent,
    '--wa-accent-strong': colors.accentStrong,
    '--wa-link': colors.link,
    '--wa-focus-ring': colors.focusRing,
    '--wa-menu-bg': colors.menuBg,
    '--wa-menu-border': colors.menuBorder,
    '--wa-menu-hover': colors.menuHover,
    '--wa-scroll': colors.scroll,
    '--wa-selection': colors.selection,
    '--wa-stat-card-bg': colors.statCardBg,
    '--wa-stat-card-border': colors.statCardBorder,
    '--wa-date-pill-bg': colors.datePillBg,
    '--wa-radius-base': radius.base,
    '--wa-radius-bubble': radius.bubble
  };
}

/**
 * Root elemente (veya istediğiniz node'a) inline style ile değişkenleri uygular.
 */
export function applyThemePreset(presetKey: keyof typeof themePresets, root: HTMLElement = document.documentElement) {
  const map = tokensToCssVars(presetKey);
  for (const [k,v] of Object.entries(map)) {
    root.style.setProperty(k, v);
  }
}
