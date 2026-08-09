/**
 * Money formatting bound to the active language and the hide-balances
 * preference, so no screen has to remember either.
 */
import { useCallback } from 'react';
import { useI18n } from '@/i18n';
import { usePreferences } from '@/store/preferences';
import { formatAmount, type AmountOptions } from '@/lib/format';

export function useMoney() {
  const { lang, t } = useI18n();
  const { prefs } = usePreferences();

  // English puts the unit first ("Rs. 800"); every other language we support
  // puts it after the number («800 روپے»).
  const currencyPosition = lang === 'en' ? 'prefix' : 'suffix';

  return useCallback(
    (
      value: number,
      options: Omit<AmountOptions, 'currency' | 'currencyPosition'> & {
        withCurrency?: boolean;
        alwaysVisible?: boolean;
      } = {},
    ) => {
      const { withCurrency = true, alwaysVisible = false, ...rest } = options;
      return formatAmount(value, {
        ...rest,
        currency: withCurrency ? t('common.rupees') : undefined,
        currencyPosition,
        hidden: rest.hidden ?? (prefs.hideBalances && !alwaysVisible),
      });
    },
    [t, currencyPosition, prefs.hideBalances],
  );
}
