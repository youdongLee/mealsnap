import { Storage } from '@apps-in-toss/framework';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DayRecord {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  bonusClaimed: boolean;
}

const defaultRecord: DayRecord = {
  breakfast: false,
  lunch: false,
  dinner: false,
  bonusClaimed: false,
};

interface MealContextType {
  todayRecord: DayRecord;
  records: Record<string, DayRecord>;
  certifyMeal: (meal: MealType) => Promise<void>;
  claimBonus: () => Promise<void>;
  allThreeDone: boolean;
  totalEarnedToday: number;
}

const MealContext = createContext<MealContextType>({
  todayRecord: defaultRecord,
  records: {},
  certifyMeal: async () => {},
  claimBonus: async () => {},
  allThreeDone: false,
  totalEarnedToday: 0,
});

const STORAGE_KEY = '@mealsnap/records';
const POINTS_PER_ACTION = 3;

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function MealProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<Record<string, DayRecord>>({});

  useEffect(() => {
    Storage.getItem(STORAGE_KEY)
      .then((raw) => { if (raw) setRecords(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  const save = useCallback(async (next: Record<string, DayRecord>) => {
    setRecords(next);
    await Storage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const today = todayKey();
  const todayRecord = records[today] ?? defaultRecord;
  const allThreeDone = todayRecord.breakfast && todayRecord.lunch && todayRecord.dinner;

  const totalEarnedToday =
    ([todayRecord.breakfast, todayRecord.lunch, todayRecord.dinner, todayRecord.bonusClaimed]
      .filter(Boolean).length) * POINTS_PER_ACTION;

  const certifyMeal = useCallback(async (meal: MealType) => {
    const prev = records[today] ?? defaultRecord;
    if (prev[meal]) return;
    await save({ ...records, [today]: { ...prev, [meal]: true } });
  }, [records, today, save]);

  const claimBonus = useCallback(async () => {
    const prev = records[today] ?? defaultRecord;
    if (prev.bonusClaimed) return;
    await save({ ...records, [today]: { ...prev, bonusClaimed: true } });
  }, [records, today, save]);

  return (
    <MealContext.Provider value={{
      todayRecord,
      records,
      certifyMeal,
      claimBonus,
      allThreeDone,
      totalEarnedToday,
    }}>
      {children}
    </MealContext.Provider>
  );
}

export function useMeals() {
  return useContext(MealContext);
}
