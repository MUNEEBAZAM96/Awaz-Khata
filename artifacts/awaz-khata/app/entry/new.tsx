import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import {
  createTransaction,
  getListTransactionsQueryKey,
  updateTransaction,
  useListTransactions,
  type TransactionInputType,
} from '@workspace/api-client-react';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Pressable } from '@/components/ui/Pressable';
import { TextField } from '@/components/ui/TextField';
import { Segmented } from '@/components/ui/Segmented';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

type EntryType = 'expense' | 'income' | 'given' | 'received';

/**
 * Manual entry and correction.
 *
 * Reuses the same endpoints as the voice pipeline — `POST /transactions` to
 * create and `PATCH /transactions/{id}` to correct — so there is exactly one
 * place in the system where a transaction is written.
 */
export default function EntryFormScreen() {
  const { colors, spacing, iconSize, iconStroke, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const dir = useDirection();
  const t = useT();
  const router = useRouter();
  const queryClient = useQueryClient();

  const params = useLocalSearchParams<{ id?: string; person?: string }>();
  const editingId = typeof params.id === 'string' ? params.id : null;

  // When editing, seed from the cached list rather than adding an endpoint
  // for a single record.
  const list = useListTransactions({
    query: { queryKey: getListTransactionsQueryKey() },
  });
  const existing = useMemo(
    () => list.data?.transactions.find((item) => item.id === editingId) ?? null,
    [list.data, editingId],
  );

  const [type, setType] = useState<EntryType>(
    (existing?.type as EntryType | undefined) ?? 'expense',
  );
  const [amount, setAmount] = useState(existing ? String(existing.amount) : '');
  const [person, setPerson] = useState(
    existing?.person ?? (typeof params.person === 'string' ? params.person : ''),
  );
  const [category, setCategory] = useState(existing?.category ?? '');
  const [note, setNote] = useState(existing?.description ?? '');
  const [seeded, setSeeded] = useState(!editingId);
  const [errors, setErrors] = useState<{ amount?: string; person?: string; form?: string }>(
    {},
  );

  // The cached record may arrive after first render when deep-linked.
  if (editingId && existing && !seeded) {
    setType(existing.type as EntryType);
    setAmount(String(existing.amount));
    setPerson(existing.person ?? '');
    setCategory(existing.category ?? '');
    setNote(existing.description ?? '');
    setSeeded(true);
  }

  const needsPerson = type === 'given' || type === 'received';

  const save = useMutation({
    mutationFn: async () => {
      const parsed = Number(amount.replace(/[^0-9.]/g, ''));
      const payload = {
        amount: parsed,
        type: type as TransactionInputType,
        person: person.trim() || null,
        category: category.trim() || null,
        description: note.trim() || null,
      };
      if (editingId) {
        return updateTransaction(editingId, payload);
      }
      return createTransaction(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      queryClient.invalidateQueries({ queryKey: ['person'] });
      router.back();
    },
    onError: (err: unknown) => {
      const data = (err as { data?: { error?: string } } | null)?.data;
      setErrors({ form: data?.error ?? t('error.generic') });
    },
  });

  const submit = () => {
    const parsed = Number(amount.replace(/[^0-9.]/g, ''));
    const next: typeof errors = {};
    if (!Number.isFinite(parsed) || parsed <= 0) next.amount = t('manual.errorAmount');
    if (needsPerson && !person.trim()) next.person = t('manual.errorPerson');
    setErrors(next);
    if (Object.keys(next).length) return;
    save.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + spacing.lg,
          paddingHorizontal: spacing.xl,
          paddingBottom: spacing['4xl'],
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.md }}>
          <Text variant="headingLarge" style={{ flex: 1 }}>
            {editingId ? t('manual.editTitle') : t('manual.title')}
          </Text>
          <Pressable
            accessibilityLabel={t('a11y.close')}
            onPress={() => router.back()}
            visualSize={40}
            style={{
              width: 40,
              height: 40,
              borderRadius: radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceSunken,
            }}
          >
            <X size={iconSize.md} color={colors.textPrimary} strokeWidth={iconStroke} />
          </Pressable>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text variant="label" color="textSecondary">
            {t('manual.type')}
          </Text>
          <Segmented<EntryType>
            options={[
              { value: 'expense', label: t('txType.expense') },
              { value: 'income', label: t('txType.income') },
              { value: 'given', label: t('txType.given') },
              { value: 'received', label: t('txType.received') },
            ]}
            value={type}
            onChange={setType}
            accessibilityLabel={t('manual.type')}
          />
        </View>

        <TextField
          label={t('manual.amount')}
          value={amount}
          onChangeText={setAmount}
          placeholder={t('manual.amountPlaceholder')}
          keyboardType="decimal-pad"
          numeric
          error={errors.amount}
          autoFocus={!editingId}
        />

        {needsPerson ? (
          <TextField
            label={t('manual.person')}
            value={person}
            onChangeText={setPerson}
            placeholder={t('manual.personPlaceholder')}
            error={errors.person}
          />
        ) : null}

        <TextField
          label={t('manual.category')}
          value={category}
          onChangeText={setCategory}
          placeholder={t('common.optional')}
        />

        <TextField
          label={t('manual.note')}
          value={note}
          onChangeText={setNote}
          placeholder={t('manual.notePlaceholder')}
          multiline
        />

        {errors.form ? (
          <Text variant="bodySmall" color="danger" accessibilityRole="alert">
            {errors.form}
          </Text>
        ) : null}

        <Button
          label={t('common.save')}
          onPress={submit}
          loading={save.isPending}
          fullWidth
          size="lg"
        />
      </ScrollView>
    </View>
  );
}
