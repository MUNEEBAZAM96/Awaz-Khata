import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react-native';
import {
  deleteTransaction,
  getListTransactionsQueryKey,
  type Transaction,
} from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { IconBadge } from '@/components/ui/IconBadge';
import { Amount } from '@/components/ui/Amount';
import { useTheme } from '@/theme';
import { useDirection, useI18n, useT } from '@/i18n';
import { categoryIcon, categoryLabel } from '@/lib/categories';
import { dayLabel, timeLabel } from '@/lib/format';
import { directionFor, toneFor } from './TransactionCard';

export interface TransactionDetailSheetProps {
  transaction: Transaction | null;
  onClose: () => void;
}

/**
 * Detail view with real edit and delete.
 *
 * Both operations go through the backend (`PATCH`/`DELETE /transactions/{id}`)
 * — nothing is mutated locally and no success is reported before the server
 * confirms it.
 */
export function TransactionDetailSheet({
  transaction,
  onClose,
}: TransactionDetailSheetProps) {
  const { colors, spacing } = useTheme();
  const dir = useDirection();
  const { lang } = useI18n();
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removal = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['person'] });
      setConfirmingDelete(false);
      onClose();
    },
    onError: (err: unknown) => {
      const data = (err as { data?: { error?: string } } | null)?.data;
      setError(data?.error ?? t('error.generic'));
      setConfirmingDelete(false);
    },
  });

  if (!transaction) {
    return <BottomSheet visible={false} onClose={onClose} />;
  }

  const person = transaction.person?.trim();
  const rows: { label: string; value: string }[] = [
    { label: t('detail.type'), value: t(`txType.${transaction.type}` as const) },
    ...(transaction.category
      ? [{ label: t('detail.category'), value: categoryLabel(transaction.category, t) }]
      : []),
    ...(person ? [{ label: t('detail.person'), value: person }] : []),
    ...(transaction.description?.trim()
      ? [{ label: t('detail.note'), value: transaction.description.trim() }]
      : []),
    {
      label: t('detail.date'),
      value: `${dayLabel(transaction.timestamp, { today: t('common.today'), yesterday: t('common.yesterday') }, lang)} · ${timeLabel(transaction.timestamp, lang)}`,
    },
  ];

  return (
    <>
      <BottomSheet
        visible={!!transaction}
        onClose={onClose}
        title={t('detail.title')}
        scrollable={false}
      >
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <IconBadge
            icon={categoryIcon(transaction.category)}
            tone={toneFor(transaction.type)}
            size="lg"
          />
          <Amount
            value={transaction.amount}
            direction={directionFor(transaction.type)}
            variant="numericLarge"
            withArrow
            alwaysVisible
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          {rows.map((row) => (
            <View
              key={row.label}
              style={{
                flexDirection: dir.row,
                justifyContent: 'space-between',
                gap: spacing.lg,
                paddingVertical: spacing.sm,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text variant="bodySmall" color="textMuted">
                {row.label}
              </Text>
              <Text variant="bodyMedium" style={{ flexShrink: 1 }} align={dir.textAlignOpposite}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {error ? (
          <Text variant="bodySmall" color="danger" accessibilityRole="alert">
            {error}
          </Text>
        ) : null}

        <View style={{ flexDirection: dir.row, gap: spacing.md }}>
          <Button
            label={t('common.edit')}
            icon={Pencil}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => {
              onClose();
              router.push({
                pathname: '/entry/new',
                params: { id: transaction.id },
              });
            }}
          />
          <Button
            label={t('common.delete')}
            icon={Trash2}
            variant="danger"
            style={{ flex: 1 }}
            onPress={() => setConfirmingDelete(true)}
          />
        </View>
      </BottomSheet>

      <ConfirmDialog
        visible={confirmingDelete}
        title={t('detail.deleteTitle')}
        body={t('detail.deleteBody')}
        confirmLabel={t('common.delete')}
        destructive
        loading={removal.isPending}
        onConfirm={() => removal.mutate(transaction.id)}
        onCancel={() => setConfirmingDelete(false)}
      />
    </>
  );
}
