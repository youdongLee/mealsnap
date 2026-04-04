import { createRoute } from '@granite-js/react-native';
import { InlineAd } from '@apps-in-toss/framework';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export const Route = createRoute('/info', {
  component: InfoPage,
  screenOptions: { headerShown: false },
});

const PRIMARY = '#FF6B35';
const PRIMARY_LIGHT = '#FFF0EB';
const BANNER_AD_ID = 'ait-ad-test-banner-id';

const INFO_ITEMS = [
  {
    emoji: '📷',
    title: '식사 사진 기록',
    desc: '아침·점심·저녁 식사를 사진으로 찍어 참여하면 끼니당 토스포인트 10원을 받아요.',
  },
  {
    emoji: '📺',
    title: '광고 시청 후 적립',
    desc: '참여 버튼을 누르면 짧은 광고를 시청하게 돼요. 광고를 끝까지 보면 포인트가 지급돼요.',
  },
  {
    emoji: '🎁',
    title: '3끼 완료 보너스',
    desc: '하루에 3끼를 모두 기록하면 보너스 광고를 볼 수 있어요. 추가로 10원을 더 받을 수 있어요.',
  },
  {
    emoji: '💰',
    title: '하루 최대 40원',
    desc: '아침 10원 + 점심 10원 + 저녁 10원 + 보너스 10원으로 하루 최대 40원을 적립할 수 있어요.',
  },
  {
    emoji: '📋',
    title: '식사 기록',
    desc: '하단 기록 탭에서 지난 30일간의 식사 기록 내역과 누적 적립 금액을 확인할 수 있어요.',
  },
  {
    emoji: '⚠️',
    title: '유의사항',
    desc: '포인트는 참여 직후 또는 잠시 후 토스 계정으로 지급돼요. 하루 기록은 날짜가 바뀌면 초기화돼요.',
  },
];

function InfoPage() {
  const navigation = Route.useNavigation();

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>앱 안내</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 앱 소개 */}
        <View style={styles.heroCard}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={styles.heroTitle}>하루세끼</Text>
          <Text style={styles.heroSub}>식사 인증으로 매일 토스포인트를 받아요</Text>
        </View>

        {/* 안내 항목 */}
        {INFO_ITEMS.map((item) => (
          <View key={item.title} style={styles.infoCard}>
            <Text style={styles.infoEmoji}>{item.emoji}</Text>
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>{item.title}</Text>
              <Text style={styles.infoDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* 하단 배너 */}
      <View style={styles.bannerWrap}>
        <InlineAd
          adGroupId={BANNER_AD_ID}
          variant="expanded"
          impressFallbackOnMount
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 22,
    color: '#191F28',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#191F28',
  },
  scroll: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: PRIMARY,
    margin: 16,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  heroEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 21,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#F2F4F6',
  },
  infoEmoji: {
    fontSize: 24,
    lineHeight: 30,
    width: 30,
    textAlign: 'center',
  },
  infoText: {
    flex: 1,
    gap: 4,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191F28',
  },
  infoDesc: {
    fontSize: 13,
    color: '#4E5968',
    lineHeight: 19,
  },
  bannerWrap: {
    width: '100%',
    height: 96,
    overflow: 'hidden',
  },
});
