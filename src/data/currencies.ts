export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  country: string;
  region: 'Africa' | 'Americas' | 'Europe' | 'Asia' | 'Middle East' | 'Oceania';
  flag: string;
}

export const WORLD_CURRENCIES: CurrencyOption[] = [
  // Africa (Naira at top as default)
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', country: 'Nigeria', region: 'Africa', flag: '🇳🇬' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', country: 'Ghana', region: 'Africa', flag: '🇬🇭' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', country: 'Kenya', region: 'Africa', flag: '🇰🇪' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', country: 'South Africa', region: 'Africa', flag: '🇿🇦' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', country: 'Egypt', region: 'Africa', flag: '🇪🇬' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', country: 'Morocco', region: 'Africa', flag: '🇲🇦' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc', country: 'West Africa (UEMOA)', region: 'Africa', flag: '🌍' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc', country: 'Central Africa (CEMAC)', region: 'Africa', flag: '🌍' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc', country: 'Rwanda', region: 'Africa', flag: '🇷🇼' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', country: 'Tanzania', region: 'Africa', flag: '🇹🇿' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', country: 'Uganda', region: 'Africa', flag: '🇺🇬' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr', country: 'Ethiopia', region: 'Africa', flag: '🇪🇹' },

  // Americas
  { code: 'USD', symbol: '$', name: 'US Dollar', country: 'United States', region: 'Americas', flag: '🇺🇸' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', country: 'Canada', region: 'Americas', flag: '🇨🇦' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', country: 'Brazil', region: 'Americas', flag: '🇧🇷' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso', country: 'Mexico', region: 'Americas', flag: '🇲🇽' },
  { code: 'ARS', symbol: 'ARS$', name: 'Argentine Peso', country: 'Argentina', region: 'Americas', flag: '🇦🇷' },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', country: 'Colombia', region: 'Americas', flag: '🇨🇴' },
  { code: 'CLP', symbol: 'CLP$', name: 'Chilean Peso', country: 'Chile', region: 'Americas', flag: '🇨🇱' },

  // Europe
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', region: 'Europe', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', country: 'United Kingdom', region: 'Europe', flag: '🇬🇧' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', country: 'Switzerland', region: 'Europe', flag: '🇨🇭' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', country: 'Sweden', region: 'Europe', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', country: 'Norway', region: 'Europe', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', country: 'Denmark', region: 'Europe', flag: '🇩🇰' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', country: 'Poland', region: 'Europe', flag: '🇵🇱' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', country: 'Czech Republic', region: 'Europe', flag: '🇨🇿' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', country: 'Hungary', region: 'Europe', flag: '🇭🇺' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', country: 'Turkey', region: 'Europe', flag: '🇹🇷' },

  // Asia & Oceania
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', country: 'Japan', region: 'Asia', flag: '🇯🇵' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China', region: 'Asia', flag: '🇨🇳' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', region: 'Asia', flag: '🇮🇳' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', country: 'Australia', region: 'Oceania', flag: '🇦🇺' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', country: 'New Zealand', region: 'Oceania', flag: '🇳🇿' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', country: 'Singapore', region: 'Asia', flag: '🇸🇬' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', country: 'Hong Kong', region: 'Asia', flag: '🇭🇰' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', country: 'South Korea', region: 'Asia', flag: '🇰🇷' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', country: 'Indonesia', region: 'Asia', flag: '🇮🇩' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', country: 'Malaysia', region: 'Asia', flag: '🇲🇾' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', country: 'Philippines', region: 'Asia', flag: '🇵🇭' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', country: 'Thailand', region: 'Asia', flag: '🇹🇭' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', country: 'Vietnam', region: 'Asia', flag: '🇻🇳' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', country: 'Pakistan', region: 'Asia', flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh', region: 'Asia', flag: '🇧🇩' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar', country: 'Taiwan', region: 'Asia', flag: '🇹🇼' },

  // Middle East
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', country: 'United Arab Emirates', region: 'Middle East', flag: '🇦🇪' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', country: 'Saudi Arabia', region: 'Middle East', flag: '🇸🇦' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', country: 'Qatar', region: 'Middle East', flag: '🇶🇦' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', country: 'Kuwait', region: 'Middle East', flag: '🇰🇼' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', country: 'Israel', region: 'Middle East', flag: '🇮🇱' },
];

export const DEFAULT_CURRENCY = 'NGN';
export const DEFAULT_CURRENCY_SYMBOL = '₦';

export function getCurrencyByCode(code: string): CurrencyOption {
  const match = WORLD_CURRENCIES.find((c) => c.code.toUpperCase() === code?.toUpperCase());
  if (match) return match;
  return {
    code: code || 'NGN',
    symbol: code === 'USD' ? '$' : code === 'EUR' ? '€' : code === 'GBP' ? '£' : '₦',
    name: code || 'Nigerian Naira',
    country: 'International',
    region: 'Africa',
    flag: '🌐',
  };
}

export function formatCurrencyAmount(
  amount: number,
  currencyCodeOrSymbol: string = '₦',
  includeDecimals: boolean = true
): string {
  const isCode = WORLD_CURRENCIES.some((c) => c.code === currencyCodeOrSymbol);
  let symbol = currencyCodeOrSymbol;
  if (isCode) {
    symbol = getCurrencyByCode(currencyCodeOrSymbol).symbol;
  }

  const formattedNum = (amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return `${symbol}${formattedNum}`;
}
