/**
 * Compatibility re-export.
 *
 * The typography system now lives in `@/theme/typography`, where font family
 * and line height are resolved per script and per user text-size preference.
 * This file remains so preserved components (the advisor chat, the welcome
 * intro) keep compiling against the original import path.
 *
 * @deprecated Import from `@/theme/typography`, or use `useTheme().text(variant)`.
 */
export { fonts } from '@/theme/typography';
import { lineHeightFor } from '@/theme/typography';

/** Line height that keeps Nastaliq ascenders/descenders from clipping. */
export const urduLine = (fontSize: number): number =>
  lineHeightFor('nastaliq', fontSize);
