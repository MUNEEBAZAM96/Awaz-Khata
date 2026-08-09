/**
 * Category presentation.
 *
 * The LLM extracts a free-text category in whatever language the user spoke
 * («پٹرول», "petrol", "khana"), so the stored value is not an enum. This maps
 * the values we actually see onto a known set for icon + label purposes, and
 * falls back to showing the raw string rather than discarding what the user
 * said.
 */
import {
  Banknote,
  Car,
  Fuel,
  GraduationCap,
  HandCoins,
  HeartPulse,
  Receipt,
  ShoppingBag,
  Utensils,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import type { StringKey } from '@/i18n';

export type KnownCategory =
  | 'food'
  | 'transport'
  | 'fuel'
  | 'bills'
  | 'shopping'
  | 'education'
  | 'health'
  | 'other';

/**
 * Lowercased synonyms per category, across Urdu, Roman Urdu, Punjabi,
 * Saraiki, Hindi and English. Matching is substring-based on a normalized
 * string, so "petrol pump" still resolves to fuel.
 */
const SYNONYMS: Record<KnownCategory, string[]> = {
  fuel: ['پٹرول', 'پيٹرول', 'ڈیزل', 'petrol', 'diesel', 'fuel', 'پेट्रोल', 'पेट्रोल', 'tel'],
  food: [
    'کھانا',
    'ماݨی',
    'روٹی',
    'کھاݨا',
    'खाना',
    'food',
    'khana',
    'chai',
    'چائے',
    'nashta',
    'ناشتہ',
    // Stem, so "grocery" and "groceries" both match.
    'grocer',
    'گروسری',
    'سبزی',
    'دودھ',
  ],
  transport: [
    'سفر',
    'کرایہ',
    'رکشہ',
    'بس',
    'ٹیکسی',
    'सफ़र',
    'किराया',
    'transport',
    'rickshaw',
    'bus',
    'taxi',
    'uber',
    'careem',
    'kiraya',
  ],
  bills: [
    'بل',
    'ٻِل',
    'बिल',
    'bill',
    'bijli',
    'بجلی',
    'گیس',
    'پانی',
    'internet',
    'انٹرنیٹ',
    'موبائل',
    'electricity',
  ],
  shopping: [
    'خریداری',
    'ख़रीदारी',
    'खरीदारी',
    'shopping',
    'کپڑے',
    'kapray',
    'clothes',
    'جوتے',
  ],
  education: [
    'تعلیم',
    'پڑھائی',
    'شिक्षा',
    'शिक्षा',
    'education',
    'school',
    'اسکول',
    'سکول',
    'fees',
    'فیس',
    'کتاب',
  ],
  health: [
    'صحت',
    'स्वास्थ्य',
    'health',
    'دوا',
    'dawai',
    'medicine',
    'ڈاکٹر',
    'doctor',
    'ہسپتال',
    'hospital',
  ],
  other: ['دیگر', 'ٻیا', 'ہور', 'अन्य', 'other', 'misc'],
};

const ICONS: Record<KnownCategory, LucideIcon> = {
  food: Utensils,
  transport: Car,
  fuel: Fuel,
  bills: Receipt,
  shopping: ShoppingBag,
  education: GraduationCap,
  health: HeartPulse,
  other: Wallet,
};

/** Resolve a stored category string to a known category, or null. */
export function classifyCategory(raw: string | null | undefined): KnownCategory | null {
  if (!raw) return null;
  const needle = raw.trim().toLowerCase();
  if (!needle) return null;

  for (const [category, synonyms] of Object.entries(SYNONYMS) as [
    KnownCategory,
    string[],
  ][]) {
    if (synonyms.some((s) => needle.includes(s.toLowerCase()))) return category;
  }
  return null;
}

export function categoryIcon(raw: string | null | undefined): LucideIcon {
  const known = classifyCategory(raw);
  return known ? ICONS[known] : Wallet;
}

/**
 * Label for a category: the localized name when we recognise it, otherwise
 * the user's own words verbatim. Returning the raw string matters — the user
 * said «سالن» and should see «سالن», not "Other".
 */
export function categoryLabel(
  raw: string | null | undefined,
  t: (key: StringKey) => string,
): string {
  const known = classifyCategory(raw);
  if (known) return t(`category.${known}` as StringKey);
  const trimmed = raw?.trim();
  return trimmed || t('category.uncategorized');
}

/** Icon for a transaction type, used when there is no category. */
export function typeIcon(type: string): LucideIcon {
  switch (type) {
    case 'income':
      return Banknote;
    case 'given':
    case 'received':
      return HandCoins;
    default:
      return Wallet;
  }
}
