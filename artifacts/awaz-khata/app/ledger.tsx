import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useListCustomers,
  getListCustomersQueryKey,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';

export default function LedgerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const query = useListCustomers({
    query: { queryKey: getListCustomersQueryKey() },
  });

  const customers = query.data?.customers ?? [];
  const webTop = Platform.OS === 'web' ? 67 : 0;
  const webBottom = Platform.OS === 'web' ? 34 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + webTop + 12 }]}>
        <Pressable
          testID="back-button"
          accessibilityLabel="واپس"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>کھاتہ</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {query.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : query.isError ? (
        <View style={styles.centerFill}>
          <Feather name="wifi-off" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            کھاتہ لوڈ نہیں ہو سکا
          </Text>
          <Pressable
            onPress={() => query.refetch()}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={[styles.retryText, { color: colors.primaryForeground }]}>
              دوبارہ کوشش کریں
            </Text>
          </Pressable>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.centerFill}>
          <Feather name="book-open" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            ابھی کھاتہ خالی ہے{'\n'}مائیک دبا کر پہلا ادھار لکھیں
          </Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.customer}
          scrollEnabled={customers.length > 0}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + webBottom + 24,
          }}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => query.refetch()}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            const owes = item.balance > 0;
            return (
              <View style={[styles.row, { borderColor: colors.border }]}>
                <View style={styles.nameWrap}>
                  <Text
                    style={[styles.name, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {item.customer}
                  </Text>
                  <Text style={[styles.count, { color: colors.mutedForeground }]}>
                    {item.transactions.length} اندراج
                  </Text>
                </View>
                <View style={styles.balanceWrap}>
                  <Text
                    style={[
                      styles.balance,
                      { color: owes ? colors.destructive : colors.success },
                    ]}
                  >
                    {Math.abs(item.balance).toLocaleString('en-PK')}
                  </Text>
                  <Text
                    style={[
                      styles.balanceLabel,
                      { color: owes ? colors.destructive : colors.success },
                    ]}
                  >
                    {owes ? 'بقایا' : 'برابر'}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPlaceholder: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    writingDirection: 'rtl',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
    writingDirection: 'rtl',
  },
  retryButton: {
    minHeight: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    writingDirection: 'rtl',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 18,
    gap: 16,
    minHeight: 72,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  count: {
    fontSize: 13,
    marginTop: 3,
    writingDirection: 'rtl',
    textAlign: 'left',
  },
  balanceWrap: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  balanceLabel: {
    fontSize: 12,
    marginTop: 2,
    writingDirection: 'rtl',
  },
});
