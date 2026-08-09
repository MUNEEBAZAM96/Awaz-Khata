/**
 * Display formatting only.
 *
 * Nothing in this file computes a financial result. Totals, balances and
 * period buckets all come from the backend finance engine — the UI's job is
 * to render the numbers it is given, never to derive new ones.
 *
 * Dates are formatted in Pakistan Standard Time (UTC+5, no DST) to match the
 * backend's day boundaries. If the UI grouped by device-local days, a user
 * abroad would see "today" disagree with the spoken answer.
 */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

/** Y/M/D of an ISO timestamp, in PKT. */
function pktParts(iso: string): { y: number; m: number; d: number } {
  const shifted = new Date(new Date(iso).getTime() + PKT_OFFSET_MS);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
  };
}

/** Stable key for grouping transactions into day sections. */
export function pktDayKey(iso: string): string {
  const { y, m, d } = pktParts(iso);
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function isSamePktDay(a: string, b: string): boolean {
  return pktDayKey(a) === pktDayKey(b);
}

/** Days between two timestamps, counted in PKT calendar days. */
function pktDayDelta(iso: string, referenceIso: string): number {
  const a = new Date(`${pktDayKey(iso)}T00:00:00Z`).getTime();
  const b = new Date(`${pktDayKey(referenceIso)}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/**
 * Group label for a transaction date: "Today", "Yesterday", or a date.
 * The caller supplies the localized today/yesterday words so this stays
 * language-agnostic.
 */
export function dayLabel(
  iso: string,
  labels: { today: string; yesterday: string },
  locale: string,
  now: string = new Date().toISOString(),
): string {
  const delta = pktDayDelta(iso, now);
  if (delta === 0) return labels.today;
  if (delta === 1) return labels.yesterday;

  const shifted = new Date(new Date(iso).getTime() + PKT_OFFSET_MS);
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: pktParts(iso).y === pktParts(now).y ? undefined : 'numeric',
      timeZone: 'UTC', // already shifted into PKT
    }).format(shifted);
  } catch {
    return shifted.toISOString().slice(0, 10);
  }
}

/** Clock time in PKT, e.g. "8:42 PM". */
export function timeLabel(iso: string, locale: string): string {
  const shifted = new Date(new Date(iso).getTime() + PKT_OFFSET_MS);
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'UTC',
    }).format(shifted);
  } catch {
    return shifted.toISOString().slice(11, 16);
  }
}

/** Hour of day in PKT — used only to pick a greeting. */
export function pktHour(iso: string = new Date().toISOString()): number {
  return new Date(new Date(iso).getTime() + PKT_OFFSET_MS).getUTCHours();
}

/**
 * Group digits for display. Always Western Arabic numerals with comma
 * grouping: this is how amounts appear on Pakistani receipts and banking
 * apps, and it keeps Inter's tabular figures aligned in a column.
 */
export function formatNumber(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const hasFraction = rounded % 1 !== 0;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** Placeholder shown in place of an amount when balances are hidden. */
export const MASKED_AMOUNT = '••••';

export interface AmountOptions {
  /** Currency word, e.g. "Rs." or «روپے», from the string catalogue. */
  currency?: string;
  /**
   * Where the currency word sits relative to the number.
   *
   * English writes "Rs. 800"; Urdu, Punjabi, Saraiki and Hindi all write the
   * unit after the number («800 روپے»), which is also how the app's spoken
   * confirmations phrase it. Getting this wrong makes every amount in the app
   * read like a translation.
   */
  currencyPosition?: 'prefix' | 'suffix';
  hidden?: boolean;
  /** Prepend an explicit +/- sign. */
  signed?: 'positive' | 'negative' | false;
}

/**
 * Render an amount for display.
 *
 * The sign is passed explicitly rather than inferred, because direction is a
 * property of the transaction type (an `expense` of 800 is stored as +800),
 * and guessing it here is exactly the kind of client-side financial logic
 * this app keeps on the server.
 */
export function formatAmount(value: number, options: AmountOptions = {}): string {
  const { currency, currencyPosition = 'prefix', hidden, signed = false } = options;
  if (hidden) return MASKED_AMOUNT;

  const sign = signed === 'positive' ? '+ ' : signed === 'negative' ? '- ' : '';
  const body = formatNumber(Math.abs(value));
  if (!currency) return `${sign}${body}`;
  return currencyPosition === 'suffix'
    ? `${sign}${body} ${currency}`
    : `${sign}${currency} ${body}`;
}
