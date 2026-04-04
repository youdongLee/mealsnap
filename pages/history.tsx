import { createRoute } from '@granite-js/react-native';
import { InlineAd } from '@apps-in-toss/framework';
import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMeals, todayKey } from '../stores/MealContext';

const BANNER_AD_ID = 'ait-ad-test-banner-id';

export const Route = createRoute('/history', {
  component: HistoryPage,
  screenOptions: { headerShown: false },
});

const PRIMARY = '#FF6B35';
const PRIMARY_LIGHT = '#FFF0EB';

const MEAL_EMOJIS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', bonus: '🎁' } as const;

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number);
  const d = new Date(dateStr);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${month}월 ${day}일 (${days[d.getDay()]})`;
}

function getPast30Days(): string[] {
  const result: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result.push(key);
  }
  return result;
}

function HistoryPage() {
  const navigation = Route.useNavigation();
  const { records } = useMeals();
  const today = todayKey();
  const days = useMemo(() => getPast30Days(), []);

  const totalDaysWithAllThree = useMemo(() =>
    Object.values(records).filter(r => r.breakfast && r.lunch && r.dinner).length,
    [records]
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>식사 기록</Text>
        <View style={styles.backButton} />
      </View>

      {/* 요약 카드 */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{Object.keys(records).length}</Text>
          <Text style={styles.summaryLabel}>인증한 날</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalDaysWithAllThree}</Text>
          <Text style={styles.summaryLabel}>3끼 완료</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {Object.values(records).reduce((sum, r) =>
              sum + [r.breakfast, r.lunch, r.dinner, r.bonusClaimed].filter(Boolean).length * 10, 0
            )}원
          </Text>
          <Text style={styles.summaryLabel}>총 획득</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {days.map((dateStr, index) => {
          const record = records[dateStr];
          const isToday = dateStr === today;
          const hasAny = record && (record.breakfast || record.lunch || record.dinner);
          const earned = record
            ? [record.breakfast, record.lunch, record.dinner, record.bonusClaimed].filter(Boolean).length * 10
            : 0;

          return (
            <React.Fragment key={dateStr}>
              <View style={[styles.dayRow, isToday && styles.dayRowToday]}>
                <View style={styles.dayLeft}>
                  <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                    {formatDateLabel(dateStr)}
                    {isToday && <Text style={styles.todayBadge}> 오늘</Text>}
                  </Text>
                  <View style={styles.mealDots}>
                    {(['breakfast', 'lunch', 'dinner', 'bonus'] as const).map((type) => {
                      const done = type === 'bonus' ? record?.bonusClaimed : record?.[type];
                      return (
                        <View
                          key={type}
                          style={[styles.dot, done ? styles.dotDone : styles.dotEmpty]}
                        >
                          <Text style={[styles.dotEmoji, !done && styles.dotEmojiEmpty]}>
                            {MEAL_EMOJIS[type]}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View style={styles.dayRight}>
                  {hasAny ? (
                    <Text style={styles.earnedText}>+{earned}원</Text>
                  ) : (
                    <Text style={styles.noRecordText}>기록 없음</Text>
                  )}
                </View>
              </View>
              {(index + 1) % 3 === 0 && (
                <View style={styles.bannerWrap}>
                  <InlineAd
                    adGroupId={BANNER_AD_ID}
                    variant="expanded"
                    impressFallbackOnMount
                  />
                </View>
              )}
            </React.Fragment>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: PRIMARY,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8B95A1',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#F2F4F6',
    marginVertical: 4,
  },
  scroll: {
    flex: 1,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F2F4F6',
  },
  dayRowToday: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },
  dayLeft: {
    gap: 8,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191F28',
  },
  dayLabelToday: {
    color: PRIMARY,
  },
  todayBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
  mealDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: PRIMARY,
  },
  dotEmpty: {
    backgroundColor: '#F2F4F6',
  },
  dotEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  dotEmojiEmpty: {
    opacity: 0.3,
  },
  dayRight: {
    alignItems: 'flex-end',
  },
  earnedText: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },
  noRecordText: {
    fontSize: 13,
    color: '#D1D6DB',
  },
  bannerWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
    height: 96,
    overflow: 'hidden',
    borderRadius: 12,
  },
});
