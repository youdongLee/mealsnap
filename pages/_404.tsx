import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const Route = createRoute('/_404', { component: NotFoundPage });

function NotFoundPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😔</Text>
      <Text style={styles.title}>페이지를 찾을 수 없어요</Text>
      <Text style={styles.sub}>잠시 후 다시 시도해주세요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: '#8B95A1',
  },
});
