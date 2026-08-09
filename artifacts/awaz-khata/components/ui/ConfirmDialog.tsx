import React from 'react';
import { Modal, View } from 'react-native';
import { TriangleAlert } from 'lucide-react-native';
import { Text } from './Text';
import { Button } from './Button';
import { IconBadge } from './IconBadge';
import { useTheme } from '@/theme';
import { useDirection, useT } from '@/i18n';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Every destructive action goes through this — nothing deletes on one tap. */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors, spacing, radius } = useTheme();
  const dir = useDirection();
  const t = useT();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.scrim,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          accessibilityViewIsModal
          accessibilityRole="alert"
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: colors.surface,
            borderRadius: radius.xl,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.xl,
            gap: spacing.md,
            alignItems: 'center',
          }}
        >
          <IconBadge
            icon={TriangleAlert}
            tone={destructive ? 'danger' : 'warning'}
            size="lg"
          />
          <Text variant="headingSmall" align="center">
            {title}
          </Text>
          {body ? (
            <Text variant="bodySmall" color="textMuted" align="center">
              {body}
            </Text>
          ) : null}

          <View
            style={{
              flexDirection: dir.row,
              gap: spacing.md,
              marginTop: spacing.sm,
              alignSelf: 'stretch',
            }}
          >
            <Button
              label={cancelLabel ?? t('common.cancel')}
              onPress={onCancel}
              variant="ghost"
              style={{ flex: 1 }}
            />
            <Button
              label={confirmLabel ?? t('common.confirm')}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
