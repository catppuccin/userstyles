import { ctpM3 } from "./color-index";

const ltrLocale = new Intl.Locale('en-US');
const rtlLocale = new Intl.Locale('ar-US');

const siteList = [
  // Default
  'https://www.google.com/webhp',
  // Example search page
  'https://www.google.com/search?q=%22catppuccin%22',
  // Images
  'https://www.google.com/imghp',
  // Videos
  'https://www.google.com/videohp',
  // AI Mode
  'https://www.google.com/search?&udm=50',
  // Shopping
  'https://www.google.com/shopping?udm=28',
  // Travel
  'https://www.google.com/travel',
  // Advanced Search
  'https://www.google.com/advanced_search',
  // Settings
  'https://www.google.com/preferences',
];

function getSitesToScrape(locale: Intl.Locale) {
  const hl = `${locale.language}-${locale.region}`;
  return siteList.map((site) => {
    const url = new URL(site);
    url.searchParams.set('hl', hl);
    return url;
  })
};

function name(params:type) {
  
}
