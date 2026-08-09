import React, { useEffect, useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { AudioModule } from 'expo-audio';
import { Mic } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { IconBadge } from '@/components/ui/IconBadge';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

/**
 * Explains why the microphone is needed BEFORE triggering the OS prompt.
 *
 * A cold system dialog on first launch is the main reason voice apps get
 * permanently denied; a sentence of context first measurably improves the
 * grant rate, and a denial here is not fatal — the Awaz screen still offers
 * the typed fallback.
 */
export function MicPermissionGate() {
  const { spacing } = useTheme();
  const t = useT();

  const [visible, setVisible] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AudioModule.getRecordingPermissionsAsync()
      .then((status) => {
        if (cancelled) return;
        // `canAskAgain === false` means the OS will no longer show a prompt,
        // so explaining and re-asking would do nothing.
        if (!status.granted && status.canAskAgain) setVisible(true);
        else if (!status.granted) setDenied(true);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const request = async () => {
    setVisible(false);
    try {
      const result = await AudioModule.requestRecordingPermissionsAsync();
      if (!result.granted) setDenied(true);
    } catch {
      setDenied(true);
    }
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={() => setVisible(false)} scrollable={false}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon={Mic} tone="primary" size="lg" />
          <Text variant="headingMedium" align="center">
            {t('permission.title')}
          </Text>
          <Text variant="bodyMedium" color="textSecondary" align="center">
            {t('permission.body')}
          </Text>
          <Button
            label={t('permission.continue')}
            onPress={() => void request()}
            fullWidth
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={denied} onClose={() => setDenied(false)} scrollable={false}>
        <View style={{ alignItems: 'center', gap: spacing.md }}>
          <IconBadge icon={Mic} tone="warning" size="lg" />
          <Text variant="headingMedium" align="center">
            {t('permission.deniedTitle')}
          </Text>
          <Text variant="bodyMedium" color="textSecondary" align="center">
            {t('permission.deniedBody')}
          </Text>
          <View style={{ gap: spacing.sm, alignSelf: 'stretch', marginTop: spacing.sm }}>
            {Platform.OS !== 'web' ? (
              <Button
                label={t('permission.openSettings')}
                onPress={() => void Linking.openSettings()}
                fullWidth
              />
            ) : null}
            <Button
              label={t('common.close')}
              variant="ghost"
              onPress={() => setDenied(false)}
              fullWidth
            />
          </View>
        </View>
      </BottomSheet>
    </>
  );
}
