import { createRoute } from '@granite-js/react-native';
import { InlineAd, loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { grantPromotionReward } from '@apps-in-toss/native-modules';
import { Button } from '@toss/tds-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { launchCamera } from 'react-native-image-picker';
import { useMeals, MealType } from '../stores/MealContext';

export const Route = createRoute('/', { component: HomePage });

const PRIMARY = '#FF6B35';
const PRIMARY_LIGHT = '#FFF0EB';
const PRIMARY_DARK = '#E55A25';

// 개발 중 테스트 ID 사용 (실제 출시 전 콘솔에서 발급받은 ID로 교체)
const REWARD_AD_ID = 'ait-ad-test-rewarded-id';
const BANNER_AD_ID = 'ait-ad-test-banner-id';

// TODO: 앱인토스 콘솔에서 프로모션 코드 등록 후 교체
const PROMOTION_CODES: Record<MealType | 'bonus', string> = {
  breakfast: 'MEALSNAP_BREAKFAST',
  lunch:     'MEALSNAP_LUNCH',
  dinner:    'MEALSNAP_DINNER',
  bonus:     'MEALSNAP_BONUS',
};

const MEAL_INFO: Record<MealType, { label: string; emoji: string; description: string }> = {
  breakfast: { label: '아침',  emoji: '🌅', description: '하루의 시작을 기록해요' },
  lunch:     { label: '점심',  emoji: '☀️', description: '든든한 점심을 기록해요' },
  dinner:    { label: '저녁',  emoji: '🌙', description: '오늘의 마지막 끼니를 기록해요' },
};

function todayLabel(): string {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function HomePage() {
  const navigation = Route.useNavigation();
  const { todayRecord, certifyMeal, claimBonus, allThreeDone, totalEarnedToday } = useMeals();

  const pendingAction = useRef<MealType | 'bonus' | null>(null);
  const adSupported = loadFullScreenAd.isSupported();
  const [adLoaded, setAdLoaded] = useState(!adSupported);

  useEffect(() => {
    if (!adSupported) return;
    const unregister = loadFullScreenAd({
      options: { adGroupId: REWARD_AD_ID },
      onEvent: (event) => { if (event.type === 'loaded') setAdLoaded(true); },
      onError: () => setAdLoaded(false),
    });
    return () => unregister();
  }, [adSupported]);

  const loadNextAd = () => {
    if (!adSupported) return;
    setAdLoaded(false);
    loadFullScreenAd({
      options: { adGroupId: REWARD_AD_ID },
      onEvent: (event) => { if (event.type === 'loaded') setAdLoaded(true); },
      onError: () => setAdLoaded(false),
    });
  };

  const executeReward = async (action: MealType | 'bonus') => {
    const code = PROMOTION_CODES[action];
    if (action === 'bonus') {
      await claimBonus();
      try {
        await grantPromotionReward({ params: { promotionCode: code, amount: 10 } });
        Alert.alert('🎁 보너스 획득!', '3끼 완료 보너스로 토스포인트 10원을 받았어요!');
      } catch {
        Alert.alert('🎁 보너스 완료!', '포인트는 잠시 후 지급돼요.');
      }
    } else {
      await certifyMeal(action);
      const info = MEAL_INFO[action];
      try {
        await grantPromotionReward({ params: { promotionCode: code, amount: 10 } });
        Alert.alert(`${info.emoji} ${info.label} 기록 완료!`, '토스포인트 10원이 지급됐어요!');
      } catch {
        Alert.alert(`${info.emoji} 기록 완료!`, '포인트는 잠시 후 지급돼요.');
      }
    }
  };

  const showRewardAd = (action: MealType | 'bonus') => {
    if (!adSupported) {
      executeReward(action);
      return;
    }
    pendingAction.current = action;
    showFullScreenAd({
      options: { adGroupId: REWARD_AD_ID },
      onEvent: async (event) => {
        if (event.type === 'userEarnedReward') {
          const a = pendingAction.current;
          if (a) await executeReward(a);
        }
        if (event.type === 'dismissed') {
          pendingAction.current = null;
          loadNextAd();
        }
      },
      onError: () => Alert.alert('광고를 불러올 수 없어요', '잠시 후 다시 시도해주세요.'),
    });
  };

  const handleCertify = (meal: MealType) => {
    if (todayRecord[meal] || !adLoaded) return;
    launchCamera({ mediaType: 'photo', saveToPhotos: false }, (response) => {
      if (response.didCancel || response.errorCode) return;
      showRewardAd(meal);
    });
  };

  const handleBonus = () => {
    if (!allThreeDone || todayRecord.bonusClaimed || !adLoaded) return;
    showRewardAd('bonus');
  };

  const completedCount = [todayRecord.breakfast, todayRecord.lunch, todayRecord.dinner].filter(Boolean).length;

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>하루세끼</Text>
          <Text style={styles.headerDate}>{todayLabel()}</Text>
        </View>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => navigation.navigate('/info')}
          activeOpacity={0.7}
        >
          <Text style={styles.infoButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 오늘 획득 요약 */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          오늘 <Text style={styles.summaryHighlight}>{totalEarnedToday}원</Text> 획득했어요
        </Text>
        <Text style={styles.summaryMax}>최대 40원</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 끼니 카드 */}
        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
          const info = MEAL_INFO[meal];
          const done = todayRecord[meal];
          return (
            <View key={meal} style={[styles.mealCard, done && styles.mealCardDone]}>
              <View style={styles.mealCardLeft}>
                <Text style={styles.mealEmoji}>{info.emoji}</Text>
                <View>
                  <Text style={[styles.mealLabel, done && styles.mealLabelDone]}>{info.label}</Text>
                  <Text style={styles.mealDescription}>{info.description}</Text>
                </View>
              </View>
              {done ? (
                <View style={styles.doneTag}>
                  <Text style={styles.doneTagText}>✓ +10원</Text>
                </View>
              ) : (
                <Button
                  type="primary"
                  size="medium"
                  disabled={!adLoaded}
                  onPress={() => handleCertify(meal)}
                >
                  📷 참여하기
                </Button>
              )}
            </View>
          );
        })}

        {/* 보너스 버튼 */}
        <TouchableOpacity
          style={[
            styles.bonusButton,
            (!allThreeDone || todayRecord.bonusClaimed) && styles.bonusButtonDisabled,
          ]}
          onPress={handleBonus}
          activeOpacity={0.7}
          disabled={!allThreeDone || todayRecord.bonusClaimed || !adLoaded}
        >
          {todayRecord.bonusClaimed ? (
            <Text style={styles.bonusButtonTextDisabled}>✓ 오늘 보너스를 모두 받았어요</Text>
          ) : allThreeDone ? (
            <>
              <Text style={styles.bonusButtonTitle}>🎁 3끼 완료 보너스!</Text>
              <Text style={styles.bonusButtonSub}>광고 보고 추가 10원 받기</Text>
            </>
          ) : (
            <>
              <Text style={styles.bonusButtonTitleDisabled}>🎁 3끼 완료 보너스 +10원</Text>
              <Text style={styles.bonusButtonSubDisabled}>{completedCount}/3 완료 — 3끼 모두 기록하면 활성화돼요</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 안내 문구 */}
        <Text style={styles.guideText}>
          식사 사진을 찍고 광고를 시청하면{'\n'}토스포인트를 받을 수 있어요
        </Text>
      </ScrollView>

      {/* 하단 고정 배너 */}
      <View style={styles.bannerWrap}>
        <InlineAd
          adGroupId={BANNER_AD_ID}
          variant="expanded"
          impressFallbackOnMount
        />
      </View>

      {/* 하단 탭 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} activeOpacity={0.7}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>홈</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('/history')}
          activeOpacity={0.7}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>기록</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY,
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 13,
    color: '#8B95A1',
    marginTop: 2,
  },
  infoButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    fontSize: 22,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F6',
  },
  summaryText: {
    fontSize: 14,
    color: '#4E5968',
  },
  summaryHighlight: {
    fontWeight: '700',
    color: PRIMARY,
  },
  summaryMax: {
    fontSize: 12,
    color: '#B0B8C1',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#F2F4F6',
  },
  mealCardDone: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },
  mealCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mealEmoji: {
    fontSize: 32,
    lineHeight: 38,
    width: 38,
    textAlign: 'center',
  },
  mealLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 3,
  },
  mealLabelDone: {
    color: PRIMARY_DARK,
  },
  mealDescription: {
    fontSize: 12,
    color: '#8B95A1',
  },
  doneTag: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  doneTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bonusButton: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  bonusButtonDisabled: {
    backgroundColor: '#F2F4F6',
  },
  bonusButtonTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bonusButtonTitleDisabled: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B95A1',
  },
  bonusButtonTextDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B95A1',
  },
  bonusButtonSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
  },
  bonusButtonSubDisabled: {
    fontSize: 12,
    color: '#8B95A1',
  },
  guideText: {
    fontSize: 12,
    color: '#B0B8C1',
    textAlign: 'center',
    lineHeight: 19,
    paddingVertical: 8,
  },
  bannerWrap: {
    width: '100%',
    height: 96,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  navIcon: {
    fontSize: 22,
    lineHeight: 26,
    opacity: 0.4,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#8B95A1',
  },
  navLabelActive: {
    color: PRIMARY,
    fontWeight: '600',
  },
});
