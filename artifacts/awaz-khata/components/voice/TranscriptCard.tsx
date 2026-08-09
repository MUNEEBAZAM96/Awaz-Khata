import React from 'react';
import { View } from 'react-native';
import { MessageSquareQuote, Sparkles } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Surface } from '@/components/ui/Surface';
import { IconBadge } from '@/components/ui/IconBadge';
import { Amount } from '@/components/ui/Amount';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';
import { categoryIcon, categoryLabel } from '@/lib/categories';
import { directionFor, toneFor } from '@/components/TransactionCard';

/** What the extraction step understood, before anything is saved. */
export interface UnderstoodTransaction {
  type: 'expense' | 'income' | 'given' | 'received';
  amount: number;
  person?: string | null;
  category?: string | null;
  description?: string | null;
}

export interface TranscriptCardProps {
  /** What speech-to-text heard. */
  transcript: string;
  /** Structured intent, when the utterance was a transaction. */
  understood?: UnderstoodTransaction | null;
  /** Shown when the entry needs explicit approval before saving. */
  needsConfirmation?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirming?: boolean;
}

/**
 * "You said" → "I understood".
 *
 * Showing the transcript verbatim alongside the parsed fields is what makes
 * the app trustworthy: the user can see exactly where a wrong number came
 * from before it reaches their ledger.
 */
export function TranscriptCard({
  transcript,
  understood,
  needsConfirmation = false,
  onConfirm,
  onCancel,
  confirming = false,
}: TranscriptCardProps) {
  const { spacing } = useTheme();
  const dir = useDirection();
  const t = useT();

  return (
    <Surface elevation="raised" padding="lg" style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
          <IconBadge icon={MessageSquareQuote} size="sm" tone="neutral" />
          <Text variant="label" color="textMuted">
            {t('voice.youSaid')}
          </Text>
        </View>
        <Text variant="bodyLarge">{transcript}</Text>
      </View>

      {understood ? (
        <>
          <View style={{ height: 1, backgroundColor: 'transparent' }} />
          <View style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.sm }}>
              <IconBadge icon={Sparkles} size="sm" tone="primary" />
              <Text variant="label" color="textMuted">
                {t('voice.iUnderstood')}
              </Text>
            </View>

            <View style={{ flexDirection: dir.row, alignItems: 'center', gap: spacing.md }}>
              <IconBadge
                icon={categoryIcon(understood.category)}
                tone={toneFor(understood.type)}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="bodyLarge">{t(`txType.${understood.type}` as const)}</Text>
                <Text variant="caption" color="textMuted" numberOfLines={1}>
                  {[
                    understood.person?.trim(),
                    understood.category
                      ? categoryLabel(understood.category, t)
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || t('common.today')}
                </Text>
              </View>
              <Amount
                value={understood.amount}
                direction={directionFor(understood.type)}
                variant="numericMedium"
                withArrow
                alwaysVisible
              />
            </View>
          </View>
        </>
      ) : null}

      {needsConfirmation && onConfirm && onCancel ? (
        <View style={{ gap: spacing.md }}>
          <Text variant="bodyMedium" color="textSecondary" align="center">
            {t('voice.isThisCorrect')}
          </Text>
          <View style={{ flexDirection: dir.row, gap: spacing.md }}>
            <Button
              label={t('common.cancel')}
              onPress={onCancel}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <Button
              label={t('common.confirm')}
              onPress={onConfirm}
              loading={confirming}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      ) : null}
    </Surface>
  );
}
